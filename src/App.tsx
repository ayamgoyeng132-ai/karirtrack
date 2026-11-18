import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Menu, Plus, RefreshCw } from 'lucide-react';
import { api } from './api';
import type {
  AppSettings,
  AppState,
  DocumentItem,
  JobApplication,
  MessageTemplate,
  NavTab,
} from './types';
import {
  diffDaysFromToday,
  exportJobsToCSV,
  getStageMeta,
  needsFollowUp,
} from './utils/format';
import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { KanbanView } from './components/KanbanView';
import { TableView } from './components/TableView';
import { CalendarView } from './components/CalendarView';
import { DocumentsView } from './components/DocumentsView';
import { SettingsView } from './components/SettingsView';
import { JobFormModal } from './components/JobFormModal';
import { JobDetailDrawer } from './components/JobDetailDrawer';

const TAB_TITLES: Record<NavTab, { code: string; title: string; subtitle: string }> = {
  dashboard: {
    code: 'BAGIAN 01 / MEJA UTAMA',
    title: 'Jurnal & Tindak Lanjut Lamaran',
    subtitle: 'Prioritas hari ini, jadwal interview terdekat, dan evaluasi konversi lamaran Anda',
  },
  kanban: {
    code: 'BAGIAN 02 / PAPAN SELEKSI',
    title: 'Papan Alur Seleksi (Kanban)',
    subtitle: 'Pindahkan berkas lamaran antar tahapan seleksi sesuai perkembangan terbaru',
  },
  table: {
    code: 'BAGIAN 03 / ARSIP LENGKAP',
    title: 'Daftar Lengkap Semua Loker',
    subtitle: 'Pencarian mendalam, penyaringan multi-kriteria, aksi massal, dan unduh spreadsheet',
  },
  calendar: {
    code: 'BAGIAN 04 / AGENDA WAKTU',
    title: 'Kalender Interview & Batas Waktu',
    subtitle: 'Jadwal bulanan sesi interview, batas pengumpulan tes teknis, dan pengingat follow-up',
  },
  documents: {
    code: 'BAGIAN 05 / BERKAS & SURAT',
    title: 'Master CV & Template Pesan HR',
    subtitle: 'Kelola versi CV/Portofolio dan salin draf pesan rekrutmen siap kirim',
  },
  settings: {
    code: 'BAGIAN 06 / KONFIGURASI',
    title: 'Pengaturan Lengkap: Atur Semuanya',
    subtitle: 'Kustomisasi tahapan seleksi, daftar platform, target mingguan, profil, dan cadangan data',
  },
};

export const App: React.FC = () => {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      api.getAuthStatus().then((status) => {
        if (!status.hasAuth) {
          setAuthenticated(false);
        } else {
          setAuthenticated(false);
        }
      }).catch(() => {
        setAuthenticated(false);
      });
    } else {
      api.getAuthStatus().then((status) => {
        setAuthenticated(status.authenticated);
      }).catch(() => {
        setAuthenticated(false);
      });
    }
  }, []);

  if (authenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF6F0] dark:bg-[#161412]">
        <div
          role="status"
          className="flex items-center gap-3 rounded-xl border border-[#D6CFC2] bg-white px-6 py-4 dark:border-[#38332E] dark:bg-[#211E1B]"
        >
          <RefreshCw className="h-5 w-5 animate-spin text-[#C2410C]" aria-hidden="true" />
          <span className="text-sm font-bold text-[#1C1917] dark:text-[#F5F5F4]">
            Memuat...
          </span>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <LoginPage onAuthenticated={() => setAuthenticated(true)} />;
  }

  return <MainApp onLogout={() => setAuthenticated(false)} />;
};

const MainApp: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [defaultFormStage, setDefaultFormStage] = useState<string | undefined>(undefined);

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [drawerTab, setDrawerTab] = useState<
    'overview' | 'interviews' | 'followup' | 'history'
  >('overview');

  const fetchState = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getState();
      setState(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data aplikasi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  useEffect(() => {
    const isDark = state?.settings.preferences.theme === 'dark';
    document.documentElement.classList.toggle('dark', Boolean(isDark));
  }, [state?.settings.preferences.theme]);

  const selectedJob = useMemo(
    () => state?.jobs.find((j) => j.id === selectedJobId) || null,
    [state?.jobs, selectedJobId]
  );

  const counts = useMemo(() => {
    if (!state) {
      return { totalJobs: 0, activeJobs: 0, upcomingAgenda: 0, followUps: 0 };
    }
    const { jobs, settings } = state;
    const activeJobs = jobs.filter((j) => {
      const cat = getStageMeta(settings.stages, j.stage).category;
      return cat === 'active' || cat === 'interview' || cat === 'offer';
    }).length;

    const followUps = jobs.filter(
      (j) => needsFollowUp(j, settings.stages, settings.preferences.followUpDays).needed
    ).length;

    const upcomingAgenda = jobs.reduce((acc, j) => {
      const ivCount = j.interviews.filter((iv) => {
        if (iv.status !== 'scheduled' || !iv.date) return false;
        const diff = diffDaysFromToday(iv.date);
        return diff !== null && diff >= 0;
      }).length;
      return acc + ivCount;
    }, 0);

    return {
      totalJobs: jobs.length,
      activeJobs,
      upcomingAgenda,
      followUps,
    };
  }, [state]);

  const handleSaveSettings = async (partial: Partial<AppSettings>) => {
    const { settings } = await api.saveSettings(partial);
    setState((prev) => (prev ? { ...prev, settings } : prev));
  };

  const handleToggleTheme = async () => {
    if (!state) return;
    const nextTheme = state.settings.preferences.theme === 'dark' ? 'light' : 'dark';
    await handleSaveSettings({
      preferences: { ...state.settings.preferences, theme: nextTheme },
    });
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore logout errors
    }
    api.setToken('');
    onLogout();
  };

  const handleOpenAddJob = (stageId?: string) => {
    setEditingJob(null);
    setDefaultFormStage(stageId);
    setFormOpen(true);
  };

  const handleOpenEditJob = (job: JobApplication) => {
    setEditingJob(job);
    setDefaultFormStage(undefined);
    setFormOpen(true);
  };

  const handleSubmitJobForm = async (payload: Partial<JobApplication>) => {
    if (editingJob) {
      const { job } = await api.updateJob(editingJob.id, payload);
      setState((prev) =>
        prev
          ? {
              ...prev,
              jobs: prev.jobs.map((j) => (j.id === job.id ? job : j)),
            }
          : prev
      );
    } else {
      const { job } = await api.createJob(payload);
      setState((prev) => (prev ? { ...prev, jobs: [job, ...prev.jobs] } : prev));
    }
  };

  const handleUpdateJob = async (id: string, patch: Partial<JobApplication>) => {
    const { job } = await api.updateJob(id, patch);
    setState((prev) =>
      prev
        ? {
            ...prev,
            jobs: prev.jobs.map((j) => (j.id === job.id ? job : j)),
          }
        : prev
    );
  };

  const handleDeleteJob = async (id: string) => {
    await api.deleteJob(id);
    setState((prev) =>
      prev ? { ...prev, jobs: prev.jobs.filter((j) => j.id !== id) } : prev
    );
  };

  const handleBulkStage = async (ids: string[], stageId: string) => {
    const { jobs } = await api.bulkJobs('stage', ids, stageId);
    setState((prev) => (prev ? { ...prev, jobs } : prev));
  };

  const handleBulkDelete = async (ids: string[]) => {
    const { jobs } = await api.bulkJobs('delete', ids);
    setState((prev) => (prev ? { ...prev, jobs } : prev));
  };

  const handleSaveDocument = async (doc: Partial<DocumentItem>) => {
    const { documents } = await api.saveDocument(doc);
    setState((prev) => (prev ? { ...prev, documents } : prev));
  };

  const handleDeleteDocument = async (id: string) => {
    const { documents } = await api.deleteDocument(id);
    setState((prev) => (prev ? { ...prev, documents } : prev));
  };

  const handleSaveTemplate = async (tpl: Partial<MessageTemplate>) => {
    const { templates } = await api.saveTemplate(tpl);
    setState((prev) => (prev ? { ...prev, templates } : prev));
  };

  const handleDeleteTemplate = async (id: string) => {
    const { templates } = await api.deleteTemplate(id);
    setState((prev) => (prev ? { ...prev, templates } : prev));
  };

  if (loading && !state) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF6F0] dark:bg-[#161412]">
        <div
          role="status"
          className="flex items-center gap-3 rounded-xl border border-[#D6CFC2] bg-white px-6 py-4 dark:border-[#38332E] dark:bg-[#211E1B]"
        >
          <RefreshCw className="h-5 w-5 animate-spin text-[#C2410C]" aria-hidden="true" />
          <span className="text-sm font-bold text-[#1C1917] dark:text-[#F5F5F4]">
            Memuat Jurnal Lamaran KarirTrack...
          </span>
        </div>
      </div>
    );
  }

  if (error || !state) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF6F0] p-6 dark:bg-[#161412]">
        <div
          role="alert"
          className="max-w-md rounded-xl border border-[#BE123C] bg-white p-6 text-center dark:border-[#FB7185] dark:bg-[#211E1B]"
        >
          <h1 className="font-editorial text-lg font-bold text-[#1C1917] dark:text-[#F5F5F4]">
            Gagal memuat penyimpanan lokal SQLite
          </h1>
          <p className="mt-2 text-xs text-[#44403C] dark:text-[#D6D3D1]">
            Penyebab: {error || 'Koneksi ke server lokal terputus.'} Pastikan proses server berjalan lalu muat ulang.
          </p>
          <button
            type="button"
            onClick={fetchState}
            className="mt-4 min-h-[44px] rounded-lg bg-[#C2410C] px-4 py-2 text-xs font-bold text-white hover:bg-[#9A3412]"
          >
            Muat Ulang Data
          </button>
        </div>
      </div>
    );
  }

  const headerInfo = TAB_TITLES[activeTab];

  return (
    <div className="flex min-h-screen bg-[#FAF6F0] text-[#1C1917] dark:bg-[#161412] dark:text-[#F5F5F4]">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onAddJob={() => handleOpenAddJob()}
        onExportCSV={() => exportJobsToCSV(state.jobs, state.settings.stages)}
        theme={state.settings.preferences.theme}
        onToggleTheme={handleToggleTheme}
        onLogout={handleLogout}
        counts={counts}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header: Single visible H1 across all viewports (R-39), zero truncation on 375px mobile (R-03) */}
        <header className="sticky top-0 z-30 border-b border-[#D6CFC2] bg-[#FAF6F0]/95 px-4 py-3 backdrop-blur-xs dark:border-[#38332E] dark:bg-[#161412]/95 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-between gap-2 sm:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-expanded={mobileMenuOpen}
                aria-label="Buka menu navigasi lengkap"
                className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-lg border border-[#A8A29E] bg-white px-3 py-2 text-xs font-bold text-[#1C1917] hover:bg-[#EFE8DC] dark:border-[#57534E] dark:bg-[#211E1B] dark:text-[#F5F5F4]"
              >
                <Menu className="h-4 w-4" aria-hidden="true" />
                <span>Menu</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenAddJob()}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-[#C2410C] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#9A3412] active:bg-[#7C2D12]"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>Catat Loker</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-expanded={mobileMenuOpen}
                aria-label="Buka menu navigasi lengkap"
                className="hidden min-h-[44px] shrink-0 items-center gap-1.5 rounded-lg border border-[#A8A29E] bg-white px-3 py-2 text-xs font-bold text-[#1C1917] hover:bg-[#EFE8DC] sm:inline-flex lg:hidden dark:border-[#57534E] dark:bg-[#211E1B] dark:text-[#F5F5F4]"
              >
                <Menu className="h-4 w-4" aria-hidden="true" />
                <span>Menu</span>
              </button>

              <div className="min-w-0">
                <span className="font-mono-num block text-[10px] font-bold uppercase tracking-wider text-[#57534E] sm:text-[11px] dark:text-[#A8A29E]">
                  {headerInfo.code}
                </span>
                <h1 className="font-editorial text-lg font-bold leading-snug text-[#1C1917] sm:text-2xl dark:text-[#F5F5F4]">
                  {headerInfo.title}
                </h1>
                <p className="hidden text-xs text-[#44403C] md:block dark:text-[#D6D3D1]">
                  {headerInfo.subtitle}
                </p>
              </div>
            </div>

            <div className="hidden shrink-0 items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={() => handleOpenAddJob()}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-[#C2410C] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#9A3412] active:bg-[#7C2D12]"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>Catat Loker</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Workspace (reserves pb-24 on mobile so bottom nav bar never covers content!) */}
        <main className="flex-1 p-4 pb-24 sm:p-6 sm:pb-24 lg:pb-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              jobs={state.jobs}
              settings={state.settings}
              documents={state.documents}
              onSelectJob={(job, initialTab) => {
                setSelectedJobId(job.id);
                setDrawerTab(initialTab || 'overview');
              }}
              onNavigate={setActiveTab}
              onAddJob={() => handleOpenAddJob()}
              onUpdateWeeklyGoal={(goal) =>
                handleSaveSettings({
                  preferences: { ...state.settings.preferences, weeklyGoal: goal },
                })
              }
              onDismissSampleBanner={() =>
                handleSaveSettings({
                  preferences: {
                    ...state.settings.preferences,
                    showSampleBanner: false,
                  },
                })
              }
              onClearSampleData={async () => {
                const next = await api.resetAllJobs();
                setState(next);
              }}
            />
          )}

          {activeTab === 'kanban' && (
            <KanbanView
              jobs={state.jobs}
              settings={state.settings}
              onSelectJob={(job) => {
                setSelectedJobId(job.id);
                setDrawerTab('overview');
              }}
              onMoveStage={(jobId, newStage) =>
                handleUpdateJob(jobId, { stage: newStage })
              }
              onTogglePin={(job) => handleUpdateJob(job.id, { pinned: !job.pinned })}
              onAddJobAtStage={(stageId) => handleOpenAddJob(stageId)}
            />
          )}

          {activeTab === 'table' && (
            <TableView
              jobs={state.jobs}
              settings={state.settings}
              onSelectJob={(job) => {
                setSelectedJobId(job.id);
                setDrawerTab('overview');
              }}
              onEditJob={handleOpenEditJob}
              onMoveStage={(jobId, stageId) =>
                handleUpdateJob(jobId, { stage: stageId })
              }
              onTogglePin={(job) => handleUpdateJob(job.id, { pinned: !job.pinned })}
              onBulkStage={handleBulkStage}
              onBulkDelete={handleBulkDelete}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              jobs={state.jobs}
              settings={state.settings}
              onSelectJob={(job, tab) => {
                setSelectedJobId(job.id);
                setDrawerTab(tab || 'interviews');
              }}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsView
              documents={state.documents}
              templates={state.templates}
              jobs={state.jobs}
              settings={state.settings}
              onSaveDocument={handleSaveDocument}
              onDeleteDocument={handleDeleteDocument}
              onSaveTemplate={handleSaveTemplate}
              onDeleteTemplate={handleDeleteTemplate}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              state={state}
              onSaveSettings={handleSaveSettings}
              onResetAllJobs={async () => {
                const next = await api.resetAllJobs();
                setState(next);
              }}
              onLoadSampleData={async () => {
                const next = await api.loadSampleData();
                setState(next);
              }}
              onImportBackup={async (backup) => {
                const next = await api.importBackup(backup);
                setState(next);
              }}
            />
          )}
        </main>

        {/* Semantic Footer Landmark (R-39 whole document requirement, single compact line) */}
        <footer className="hidden border-t border-[#D6CFC2] bg-[#F3EDE2] px-6 py-3 text-xs text-[#44403C] lg:flex lg:items-center lg:justify-between dark:border-[#38332E] dark:bg-[#1A1715] dark:text-[#D6D3D1]">
          <span>
            KarirTrack: Jurnal Lamaran Kerja Lokal (SQLite Aktif)
          </span>
          <span className="font-mono-num">
            {counts.totalJobs} berkas tercatat • {counts.activeJobs} aktif diseleksi
          </span>
        </footer>
      </div>

      {/* Add / Edit Modal */}
      <JobFormModal
        open={formOpen}
        initialJob={editingJob}
        defaultStage={defaultFormStage}
        settings={state.settings}
        documents={state.documents}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmitJobForm}
      />

      {/* Detail Slide-over Drawer */}
      <JobDetailDrawer
        job={selectedJob}
        initialTab={drawerTab}
        settings={state.settings}
        documents={state.documents}
        templates={state.templates}
        onClose={() => setSelectedJobId(null)}
        onEdit={(job) => handleOpenEditJob(job)}
        onDelete={handleDeleteJob}
        onUpdateJob={handleUpdateJob}
      />
    </div>
  );
};

export default App;
