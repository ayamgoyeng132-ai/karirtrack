import React from 'react';
import {
  Trash2,
  X,
  ExternalLink,
  Plus,
} from 'lucide-react';
import type {
  AppSettings,
  DocumentItem,
  JobApplication,
  NavTab,
} from '../types';
import {
  STAGE_COLOR_STYLES,
  diffDaysFromToday,
  formatDateID,
  formatSalarySummary,
  getStageMeta,
  needsFollowUp,
} from '../utils/format';

interface DashboardViewProps {
  jobs: JobApplication[];
  settings: AppSettings;
  documents: DocumentItem[];
  onSelectJob: (job: JobApplication, initialTab?: 'overview' | 'interviews' | 'followup') => void;
  onNavigate: (tab: NavTab) => void;
  onAddJob: () => void;
  onUpdateWeeklyGoal: (goal: number) => void;
  onDismissSampleBanner: () => void;
  onClearSampleData: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  jobs,
  settings,
  documents,
  onSelectJob,
  onNavigate,
  onAddJob,
  onUpdateWeeklyGoal,
  onDismissSampleBanner,
  onClearSampleData,
}) => {
  const { stages, preferences } = settings;
  const sortedStages = [...stages].sort((a, b) => a.order - b.order);

  const submittedJobs = jobs.filter(
    (j) => getStageMeta(stages, j.stage).category !== 'wishlist'
  );
  const activeJobs = jobs.filter((j) => {
    const cat = getStageMeta(stages, j.stage).category;
    return cat === 'active' || cat === 'interview' || cat === 'offer';
  });
  const interviewStageJobs = jobs.filter((j) => {
    const cat = getStageMeta(stages, j.stage).category;
    return cat === 'interview' || cat === 'offer' || cat === 'accepted';
  });
  const offerOrAcceptedJobs = jobs.filter((j) => {
    const cat = getStageMeta(stages, j.stage).category;
    return cat === 'offer' || cat === 'accepted';
  });

  const interviewRate =
    submittedJobs.length > 0
      ? Math.round((interviewStageJobs.length / submittedJobs.length) * 100)
      : 0;

  const appliedThisWeek = jobs.filter((j) => {
    if (!j.appliedDate) return false;
    const diff = diffDaysFromToday(j.appliedDate);
    return diff !== null && diff <= 0 && diff >= -6;
  }).length;

  const weeklyProgressPct = Math.min(
    100,
    Math.round((appliedThisWeek / Math.max(1, preferences.weeklyGoal)) * 100)
  );

  const followUpList = jobs
    .map((job) => ({
      job,
      check: needsFollowUp(job, stages, preferences.followUpDays),
    }))
    .filter((item) => item.check.needed);

  const upcomingEvents = jobs
    .flatMap((job) => {
      const items: {
        id: string;
        date: string;
        time: string;
        title: string;
        subtitle: string;
        badge: string;
        job: JobApplication;
      }[] = [];

      for (const iv of job.interviews) {
        if (iv.status === 'scheduled' && iv.date) {
          const diff = diffDaysFromToday(iv.date);
          if (diff !== null && diff >= -1) {
            items.push({
              id: `iv-${iv.id}`,
              date: iv.date,
              time: iv.time || '09:00',
              title: `${iv.title} di ${job.company}`,
              subtitle: `${job.position} • ${iv.locationOrLink || iv.type}`,
              badge:
                diff === 0
                  ? 'Hari Ini'
                  : diff === 1
                    ? 'Besok'
                    : diff < 0
                      ? 'Kemarin'
                      : `${diff} hari lagi`,
              job,
            });
          }
        }
      }

      if (job.deadlineDate) {
        const diff = diffDaysFromToday(job.deadlineDate);
        const cat = getStageMeta(stages, job.stage).category;
        if (diff !== null && diff >= 0 && cat !== 'rejected' && cat !== 'accepted') {
          items.push({
            id: `dl-${job.id}`,
            date: job.deadlineDate,
            time: '23:59',
            title: `Batas Waktu: ${job.company}`,
            subtitle: job.position,
            badge: diff === 0 ? 'Hari Ini' : `${diff} hari lagi`,
            job,
          });
        }
      }
      return items;
    })
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
    .slice(0, 6);

  const platformStats = Object.entries(
    jobs.reduce<Record<string, { total: number; interviewed: number }>>((acc, job) => {
      const key = job.platform || 'Lainnya';
      if (!acc[key]) acc[key] = { total: 0, interviewed: 0 };
      acc[key].total += 1;
      const cat = getStageMeta(stages, job.stage).category;
      if (cat === 'interview' || cat === 'offer' || cat === 'accepted') {
        acc[key].interviewed += 1;
      }
      return acc;
    }, {})
  )
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5);

  const primaryFocusEvent = upcomingEvents[0] || null;
  const primaryFocusFollowUp = followUpList[0] || null;

  return (
    <div className="space-y-8">
      {/* Sample Data Notice (R-38: Honest placeholder/sample disclosure) */}
      {preferences.showSampleBanner && jobs.length > 0 && (
        <section
          aria-label="Status Data Contoh"
          className="flex flex-col justify-between gap-4 rounded-xl border border-[#D6CFC2] bg-[#F3EDE2] p-4 dark:border-[#38332E] dark:bg-[#24201D] sm:flex-row sm:items-center"
        >
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono-num rounded border border-[#78350F] bg-[#FEF3C7] px-2 py-0.5 text-[11px] font-bold uppercase text-[#451A03] dark:border-[#F59E0B] dark:bg-[#451A03] dark:text-[#FEF3C7]">
                [DATA CONTOH]
              </span>
              <h2 className="text-sm font-bold text-[#1C1917] dark:text-[#F5F5F4]">
                Jurnal ini menampilkan data simulasi agar seluruh fitur dapat langsung diuji
              </h2>
            </div>
            <p className="mt-1 text-xs text-[#44403C] dark:text-[#D6D3D1]">
              Anda dapat mencoba mengubah tahapan, membuka jadwal interview, atau langsung mengosongkan daftar untuk mulai mencatat lamaran asli Anda.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onClearSampleData}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-[#BE123C] bg-white px-3.5 py-2 text-xs font-bold text-[#9F1239] transition hover:bg-[#FFE4E6] active:bg-[#FECDD3] dark:border-[#FB7185] dark:bg-[#1A1715] dark:text-[#FFE4E6] dark:hover:bg-[#4C0519]"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Kosongkan & Mulai dari 0</span>
            </button>
            <button
              type="button"
              onClick={onDismissSampleBanner}
              aria-label="Sembunyikan info data contoh"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-[#A8A29E] bg-white px-3.5 py-2 text-xs font-bold text-[#1C1917] transition hover:bg-[#EFE8DC] dark:border-[#57534E] dark:bg-[#1A1715] dark:text-[#F5F5F4]"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Tutup Info</span>
            </button>
          </div>
        </section>
      )}

      {/* SECTION 01 (RHYTHM 3 Asymmetric 7:5 Split): Focal Action Desk + Editorial Career Ledger */}
      <section
        aria-label="Meja Fokus Hari Ini dan Ringkasan Karir"
        className="grid grid-cols-1 gap-6 lg:grid-cols-12"
      >
        {/* Left 7 cols: Focal Point per Screen (Prioritas Tindakan Hari Ini) */}
        <div className="flex flex-col justify-between rounded-xl border border-[#D6CFC2] bg-white p-5 sm:p-6 dark:border-[#38332E] dark:bg-[#211E1B] lg:col-span-7">
          <div>
            <div className="flex items-center justify-between gap-2 border-b border-[#E6DFD3] pb-3 dark:border-[#38332E]">
              <span className="font-mono-num text-xs font-bold uppercase tracking-wider text-[#57534E] dark:text-[#A8A29E]">
                01 / PRIORITAS TINDAKAN HARI INI
              </span>
              <span className="font-mono-num rounded border border-[#D6CFC2] bg-[#FAF6F0] px-2 py-0.5 text-xs font-semibold text-[#44403C] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#D6D3D1]">
                {followUpList.length} follow-up • {upcomingEvents.length} agenda
              </span>
            </div>

            {primaryFocusEvent ? (
              <div className="mt-4">
                <span className="inline-block rounded border border-[#D97706] bg-[#FEF3C7] px-2.5 py-0.5 text-xs font-bold text-[#451A03] dark:border-[#F59E0B] dark:bg-[#451A03] dark:text-[#FEF3C7]">
                  Agenda Terdekat: {primaryFocusEvent.badge} ({formatDateID(primaryFocusEvent.date, true)} pukul {primaryFocusEvent.time})
                </span>
                <h2 className="font-editorial mt-2.5 text-xl font-bold text-[#1C1917] sm:text-2xl dark:text-[#F5F5F4]">
                  {primaryFocusEvent.title}
                </h2>
                <p className="mt-1 text-sm text-[#44403C] dark:text-[#D6D3D1]">
                  {primaryFocusEvent.subtitle} • {formatSalarySummary(primaryFocusEvent.job, true)}
                </p>
                {primaryFocusEvent.job.notes && (
                  <p className="mt-3 rounded-lg border border-[#E6DFD3] bg-[#FAF6F0] p-3 text-xs leading-relaxed text-[#44403C] dark:border-[#38332E] dark:bg-[#161412] dark:text-[#D6D3D1]">
                    Catatan: {primaryFocusEvent.job.notes}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => onSelectJob(primaryFocusEvent.job, 'interviews')}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#C2410C] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#9A3412] active:bg-[#7C2D12]"
                  >
                    <span>Buka Persiapan & Jadwal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectJob(primaryFocusEvent.job, 'overview')}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[#D6CFC2] bg-[#FAF6F0] px-4 py-2 text-xs font-bold text-[#1C1917] transition hover:bg-[#EFE8DC] dark:border-[#38332E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                  >
                    <span>Lihat Checklist Tugas</span>
                  </button>
                </div>
              </div>
            ) : primaryFocusFollowUp ? (
              <div className="mt-4">
                <span className="inline-block rounded border border-[#D97706] bg-[#FEF3C7] px-2.5 py-0.5 text-xs font-bold text-[#451A03] dark:border-[#F59E0B] dark:bg-[#451A03] dark:text-[#FEF3C7]">
                  Waktunya Follow-Up HR
                </span>
                <h2 className="font-editorial mt-2.5 text-xl font-bold text-[#1C1917] sm:text-2xl dark:text-[#F5F5F4]">
                  {primaryFocusFollowUp.job.position} di {primaryFocusFollowUp.job.company}
                </h2>
                <p className="mt-1 text-sm text-[#44403C] dark:text-[#D6D3D1]">
                  {primaryFocusFollowUp.check.reason}. Kirim pesan singkat ke perekrut untuk menanyakan pembaruan seleksi.
                </p>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => onSelectJob(primaryFocusFollowUp.job, 'followup')}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#C2410C] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#9A3412]"
                  >
                    <span>Siapkan Pesan Follow-Up</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <h2 className="font-editorial text-xl font-bold text-[#1C1917] sm:text-2xl dark:text-[#F5F5F4]">
                  Tidak ada jadwal mendesak hari ini
                </h2>
                <p className="mt-1 text-sm text-[#44403C] dark:text-[#D6D3D1]">
                  Seluruh lamaran aktif masih dalam rentang waktu aman. Gunakan waktu ini untuk menambah loker baru atau memperbarui portofolio.
                </p>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={onAddJob}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#C2410C] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#9A3412]"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    <span>Catat Loker Baru</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Target Mingguan Bar inside Focal Desk Footer */}
          <div className="mt-6 border-t border-[#E6DFD3] pt-4 dark:border-[#38332E]">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-bold text-[#1C1917] dark:text-[#F5F5F4]">
                  Target Lamaran 7 Hari Terakhir:{' '}
                  <span className="font-mono-num text-sm">
                    {appliedThisWeek} / {preferences.weeklyGoal}
                  </span>{' '}
                  terkirim ({weeklyProgressPct}%)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="weekly-goal-input"
                  className="text-xs font-semibold text-[#44403C] dark:text-[#D6D3D1]"
                >
                  Target/Minggu:
                </label>
                <input
                  id="weekly-goal-input"
                  type="number"
                  min={1}
                  max={100}
                  value={preferences.weeklyGoal}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (v >= 1 && v <= 100) onUpdateWeeklyGoal(v);
                  }}
                  className="font-mono-num min-h-[44px] w-20 rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-1.5 text-center text-sm font-bold text-[#1C1917] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                />
              </div>
            </div>
            <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded bg-[#E6DFD3] dark:bg-[#2E2925]">
              <div
                className="h-full bg-[#C2410C] transition-all duration-300 dark:bg-[#FB923C]"
                style={{ width: `${weeklyProgressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right 5 cols: Architectural Typographic Ledger (Not floating icon cards) */}
        <div className="grid grid-cols-2 divide-x divide-y divide-[#D6CFC2] overflow-hidden rounded-xl border border-[#D6CFC2] bg-[#F3EDE2] dark:divide-[#38332E] dark:border-[#38332E] dark:bg-[#24201D] lg:col-span-5">
          <div className="flex flex-col justify-between p-5">
            <span className="font-mono-num text-[11px] font-bold uppercase tracking-wider text-[#57534E] dark:text-[#A8A29E]">
              M.01 / TOTAL ARSIP
            </span>
            <div className="mt-3">
              <p className="font-editorial text-3xl font-bold text-[#1C1917] sm:text-4xl dark:text-[#F5F5F4]">
                {jobs.length}
              </p>
              <p className="mt-1 text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                {submittedJobs.length} sudah dikirim, {jobs.length - submittedJobs.length} disimpan
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between p-5">
            <span className="font-mono-num text-[11px] font-bold uppercase tracking-wider text-[#57534E] dark:text-[#A8A29E]">
              M.02 / AKTIF SELEKSI
            </span>
            <div className="mt-3">
              <p className="font-editorial text-3xl font-bold text-[#1C1917] sm:text-4xl dark:text-[#F5F5F4]">
                {activeJobs.length}
              </p>
              <p className="mt-1 text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                Sedang berjalan di HR, tes, atau user
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between p-5">
            <span className="font-mono-num text-[11px] font-bold uppercase tracking-wider text-[#57534E] dark:text-[#A8A29E]">
              M.03 / TEMBUS TES & INTERVIEW
            </span>
            <div className="mt-3">
              <p className="font-editorial text-3xl font-bold text-[#1C1917] sm:text-4xl dark:text-[#F5F5F4]">
                {interviewRate}%
              </p>
              <p className="mt-1 text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                {interviewStageJobs.length} dari {submittedJobs.length} lamaran terkirim
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between p-5">
            <span className="font-mono-num text-[11px] font-bold uppercase tracking-wider text-[#57534E] dark:text-[#A8A29E]">
              M.04 / OFFERING & DITERIMA
            </span>
            <div className="mt-3">
              <p className="font-editorial text-3xl font-bold text-[#047857] sm:text-4xl dark:text-[#34D399]">
                {offerOrAcceptedJobs.length}
              </p>
              <p className="mt-1 text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                Penawaran kerja atau diterima bergabung
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 02 (RHYTHM 3 Full-Width Strip): Pita Alur Tahapan Seleksi */}
      <section
        aria-label="Proporsi Tahapan Lamaran"
        className="rounded-xl border border-[#D6CFC2] bg-white p-5 sm:p-6 dark:border-[#38332E] dark:bg-[#211E1B]"
      >
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <span className="font-mono-num text-xs font-bold uppercase tracking-wider text-[#57534E] dark:text-[#A8A29E]">
              02 / PETA ALUR SELEKSI
            </span>
            <h2 className="font-editorial mt-1 text-lg font-bold text-[#1C1917] sm:text-xl dark:text-[#F5F5F4]">
              Di tahap mana lamaran Anda berada saat ini?
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('kanban')}
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-[#D6CFC2] bg-[#FAF6F0] px-3.5 py-2 text-xs font-bold text-[#1C1917] transition hover:bg-[#EFE8DC] dark:border-[#38332E] dark:bg-[#161412] dark:text-[#F5F5F4]"
          >
            Buka Papan Kanban
          </button>
        </div>

        {/* Multi-column responsive stage breakdown (2 cols phone, 4 cols tablet & desktop so stage labels never clip) */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {sortedStages.map((st, idx) => {
            const count = jobs.filter((j) => j.stage === st.id).length;
            const pct = jobs.length > 0 ? Math.round((count / jobs.length) * 100) : 0;
            const style = STAGE_COLOR_STYLES[st.color] || STAGE_COLOR_STYLES.slate;

            return (
              <button
                key={st.id}
                type="button"
                onClick={() => onNavigate('kanban')}
                className={`flex min-h-[88px] flex-col justify-between rounded-lg border border-t-4 border-[#D6CFC2] bg-[#FAF6F0] p-3.5 text-left transition hover:bg-[#F3EDE2] dark:border-[#38332E] dark:bg-[#161412] dark:hover:bg-[#2A2622] ${style.border}`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono-num text-[11px] font-semibold text-[#57534E] dark:text-[#A8A29E]">
                    0{idx + 1}
                  </span>
                  <span className="font-mono-num text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]">
                    {pct}%
                  </span>
                </div>
                <div className="mt-2">
                  <p className="font-editorial text-2xl font-bold text-[#1C1917] dark:text-[#F5F5F4]">
                    {count}
                  </p>
                  <p className="mt-0.5 text-xs font-bold leading-snug text-[#44403C] dark:text-[#D6D3D1]">
                    {st.label}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* SECTION 03 (RHYTHM 3 Two-Column Split): Daftar Agenda/Follow-Up & Bukti Konversi */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Agenda & Follow-up List (6 cols) */}
        <section
          aria-label="Jadwal dan Pengingat Tindak Lanjut"
          className="flex flex-col rounded-xl border border-[#D6CFC2] bg-white p-5 sm:p-6 dark:border-[#38332E] dark:bg-[#211E1B] lg:col-span-6"
        >
          <div className="flex items-center justify-between gap-2 border-b border-[#E6DFD3] pb-3 dark:border-[#38332E]">
            <div>
              <span className="font-mono-num text-xs font-bold uppercase tracking-wider text-[#57534E] dark:text-[#A8A29E]">
                03 / AGENDA & PENGINGAT FOLLOW-UP
              </span>
              <h2 className="font-editorial mt-0.5 text-lg font-bold text-[#1C1917] dark:text-[#F5F5F4]">
                Jadwal Interview & Lamaran Perlu Dihubungi
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('calendar')}
              className="min-h-[44px] shrink-0 rounded-lg border border-[#D6CFC2] px-3 py-1.5 text-xs font-bold text-[#1C1917] hover:bg-[#F3EDE2] dark:border-[#38332E] dark:text-[#F5F5F4] dark:hover:bg-[#2A2622]"
            >
              Kalender
            </button>
          </div>

          <div className="mt-4 space-y-2.5">
            {upcomingEvents.map((ev) => (
              <button
                key={ev.id}
                type="button"
                onClick={() => onSelectJob(ev.job, 'interviews')}
                className="flex min-h-[56px] w-full items-center justify-between gap-3 rounded-lg border border-[#D6CFC2] bg-[#FAF6F0] p-3.5 text-left transition hover:border-[#1C1917] hover:bg-[#F3EDE2] dark:border-[#38332E] dark:bg-[#161412] dark:hover:border-[#A8A29E]"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono-num rounded border border-[#6D28D9] bg-[#F3E8FF] px-2 py-0.5 text-[11px] font-bold text-[#3B0764] dark:border-[#9333EA] dark:bg-[#3B0764] dark:text-[#F3E8FF]">
                      JADWAL • {ev.badge}
                    </span>
                    <span className="truncate text-sm font-bold text-[#1C1917] dark:text-[#F5F5F4]">
                      {ev.title}
                    </span>
                  </div>
                  <p className="font-mono-num mt-1 truncate text-xs text-[#44403C] dark:text-[#D6D3D1]">
                    {formatDateID(ev.date, true)} • {ev.time} • {ev.subtitle}
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 shrink-0 text-[#57534E] dark:text-[#A8A29E]" aria-hidden="true" />
              </button>
            ))}

            {followUpList.map(({ job, check }) => (
              <button
                key={`fup-${job.id}`}
                type="button"
                onClick={() => onSelectJob(job, 'followup')}
                className="flex min-h-[56px] w-full items-center justify-between gap-3 rounded-lg border border-[#D97706] bg-[#FEF3C7]/40 p-3.5 text-left transition hover:bg-[#FEF3C7]/80 dark:border-[#D97706] dark:bg-[#451A03]/30 dark:hover:bg-[#451A03]/50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono-num rounded border border-[#B45309] bg-[#FEF3C7] px-2 py-0.5 text-[11px] font-bold text-[#451A03] dark:bg-[#451A03] dark:text-[#FEF3C7]">
                      FOLLOW-UP H+{preferences.followUpDays}
                    </span>
                    <span className="truncate text-sm font-bold text-[#1C1917] dark:text-[#F5F5F4]">
                      {job.position} di {job.company}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                    {check.reason} {job.hrName ? `• Kontak: ${job.hrName}` : ''}
                  </p>
                </div>
                <span className="shrink-0 rounded border border-[#78350F] bg-white px-2.5 py-1 text-xs font-bold text-[#451A03] dark:border-[#F59E0B] dark:bg-[#161412] dark:text-[#FEF3C7]">
                  Kirim Pesan
                </span>
              </button>
            ))}

            {upcomingEvents.length === 0 && followUpList.length === 0 && (
              <div className="rounded-lg border border-dashed border-[#D6CFC2] p-6 text-center dark:border-[#38332E]">
                <p className="text-sm font-bold text-[#1C1917] dark:text-[#F5F5F4]">
                  Tidak ada jadwal interview atau pengingat follow-up yang tertunda
                </p>
                <p className="mt-1 text-xs text-[#44403C] dark:text-[#D6D3D1]">
                  Tambahkan jadwal baru pada detail loker saat Anda mendapat panggilan HR.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Channel & CV Conversion Evidence (6 cols) */}
        <section
          aria-label="Efektivitas Kanal dan Dokumen CV"
          className="flex flex-col rounded-xl border border-[#D6CFC2] bg-white p-5 sm:p-6 dark:border-[#38332E] dark:bg-[#211E1B] lg:col-span-6"
        >
          <div className="border-b border-[#E6DFD3] pb-3 dark:border-[#38332E]">
            <span className="font-mono-num text-xs font-bold uppercase tracking-wider text-[#57534E] dark:text-[#A8A29E]">
              04 / EVALUASI KANAL & DOKUMEN
            </span>
            <h2 className="font-editorial mt-0.5 text-lg font-bold text-[#1C1917] dark:text-[#F5F5F4]">
              Platform & versi CV mana yang menghasilkan panggilan interview?
            </h2>
          </div>

          <div className="mt-4 space-y-5">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#44403C] dark:text-[#D6D3D1]">
                Konversi Sumber Lowongan
              </h3>
              {platformStats.length === 0 ? (
                <p className="mt-2 text-xs text-[#57534E] dark:text-[#A8A29E]">
                  Belum ada lamaran tercatat. Tambahkan loker untuk melihat perbandingan platform.
                </p>
              ) : (
                <div className="mt-2 divide-y divide-[#E6DFD3] rounded-lg border border-[#D6CFC2] bg-[#FAF6F0] dark:divide-[#38332E] dark:border-[#38332E] dark:bg-[#161412]">
                  {platformStats.map(([platform, stat]) => (
                    <div
                      key={platform}
                      className="flex items-center justify-between px-3.5 py-2.5 text-xs"
                    >
                      <span className="font-bold text-[#1C1917] dark:text-[#F5F5F4]">
                        {platform}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono-num text-[#44403C] dark:text-[#D6D3D1]">
                          {stat.total} lamaran
                        </span>
                        <span className="font-mono-num rounded border border-[#059669] bg-[#D1FAE5] px-2 py-0.5 font-bold text-[#064E3B] dark:bg-[#064E3B] dark:text-[#D1FAE5]">
                          {stat.interviewed} lanjut tes/interview
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#44403C] dark:text-[#D6D3D1]">
                  Rasio Panggilan per Versi CV
                </h3>
                <button
                  type="button"
                  onClick={() => onNavigate('documents')}
                  className="min-h-[44px] px-2 text-xs font-bold text-[#C2410C] underline-offset-4 hover:underline dark:text-[#FB923C]"
                >
                  Kelola CV & Template
                </button>
              </div>
              {documents.filter((d) => d.type === 'CV / Resume').length === 0 ? (
                <p className="mt-1 text-xs text-[#57534E] dark:text-[#A8A29E]">
                  Belum ada versi CV yang didaftarkan di menu Berkas.
                </p>
              ) : (
                <div className="mt-1 divide-y divide-[#E6DFD3] rounded-lg border border-[#D6CFC2] bg-[#FAF6F0] dark:divide-[#38332E] dark:border-[#38332E] dark:bg-[#161412]">
                  {documents
                    .filter((d) => d.type === 'CV / Resume')
                    .map((doc) => {
                      const usedJobs = jobs.filter((j) => j.documentId === doc.id);
                      const successJobs = usedJobs.filter((j) => {
                        const cat = getStageMeta(stages, j.stage).category;
                        return cat === 'interview' || cat === 'offer' || cat === 'accepted';
                      });
                      return (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between gap-2 px-3.5 py-2.5 text-xs"
                        >
                          <span className="truncate font-bold text-[#1C1917] dark:text-[#F5F5F4]">
                            {doc.title} {doc.version ? `(${doc.version})` : ''}
                          </span>
                          <span className="font-mono-num shrink-0 font-bold text-[#44403C] dark:text-[#D6D3D1]">
                            Dipakai {usedJobs.length}x • {successJobs.length} tembus
                          </span>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Explicit Empty State when 0 jobs (R-27) */}
      {jobs.length === 0 && (
        <section className="rounded-xl border-2 border-dashed border-[#A8A29E] bg-white p-8 text-center dark:border-[#57534E] dark:bg-[#211E1B]">
          <h2 className="font-editorial text-xl font-bold text-[#1C1917] dark:text-[#F5F5F4]">
            Jurnal lamaran Anda masih kosong
          </h2>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-[#44403C] dark:text-[#D6D3D1]">
            Belum ada loker yang dicatat. Tambahkan lamaran kerja pertama Anda untuk mulai memantau tahapan seleksi, jadwal interview, dan pengingat follow-up HR.
          </p>
          <button
            type="button"
            onClick={onAddJob}
            className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#C2410C] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#9A3412]"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Catat Loker Pertama</span>
          </button>
        </section>
      )}
    </div>
  );
};
