import React, { useRef, useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  Check,
} from 'lucide-react';
import type {
  AppSettings,
  AppState,
  StageCategory,
  StageColor,
  StageConfig,
} from '../types';
import {
  STAGE_COLOR_STYLES,
  exportFullBackupJSON,
  exportJobsToCSV,
} from '../utils/format';

interface SettingsViewProps {
  state: AppState;
  onSaveSettings: (partial: Partial<AppSettings>) => Promise<void>;
  onResetAllJobs: () => Promise<void>;
  onLoadSampleData: () => Promise<void>;
  onImportBackup: (data: unknown) => Promise<void>;
}

const COLOR_OPTIONS: StageColor[] = [
  'slate',
  'blue',
  'indigo',
  'violet',
  'amber',
  'emerald',
  'teal',
  'rose',
  'cyan',
  'orange',
];

const CATEGORY_LABELS: Record<StageCategory, string> = {
  wishlist: 'Wishlist (Belum Dikirim)',
  active: 'Aktif Diproses (Apply/Screening)',
  interview: 'Tahap Tes / Interview',
  offer: 'Offering / Negosiasi',
  accepted: 'Diterima (Joined)',
  rejected: 'Ditolak / Ghosted',
};

export const SettingsView: React.FC<SettingsViewProps> = ({
  state,
  onSaveSettings,
  onResetAllJobs,
  onLoadSampleData,
  onImportBackup,
}) => {
  const { settings, jobs } = state;
  const [profile, setProfile] = useState(settings.profile);
  const [prefs, setPrefs] = useState(settings.preferences);
  const [stages, setStages] = useState<StageConfig[]>(
    [...settings.stages].sort((a, b) => a.order - b.order)
  );
  const [newStageLabel, setNewStageLabel] = useState('');
  const [newStageColor, setNewStageColor] = useState<StageColor>('cyan');
  const [newStageCategory, setNewStageCategory] = useState<StageCategory>('active');

  const [newPlatform, setNewPlatform] = useState('');
  const [newWorkMode, setNewWorkMode] = useState('');
  const [newEmpType, setNewEmpType] = useState('');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const flashSaved = (msg: string) => {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(null), 2500);
  };

  const handleSaveProfileAndPrefs = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveSettings({ profile, preferences: prefs });
    flashSaved('Profil dan preferensi berhasil disimpan.');
  };

  const persistStages = async (next: StageConfig[]) => {
    const normalized = next.map((s, idx) => ({ ...s, order: idx }));
    setStages(normalized);
    await onSaveSettings({ stages: normalized });
    flashSaved('Urutan dan konfigurasi tahapan diperbarui.');
  };

  const handleAddStage = async (e: React.FormEvent) => {
    e.preventDefault();
    const label = newStageLabel.trim();
    if (!label) return;
    const slug =
      label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') +
      '-' +
      Math.random().toString(36).slice(2, 5);

    const next: StageConfig[] = [
      ...stages,
      {
        id: slug,
        label,
        color: newStageColor,
        category: newStageCategory,
        order: stages.length,
      },
    ];
    setNewStageLabel('');
    await persistStages(next);
  };

  const moveStage = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= stages.length) return;
    const copy = [...stages];
    const [removed] = copy.splice(index, 1);
    copy.splice(target, 0, removed);
    await persistStages(copy);
  };

  const updateStageItem = async (index: number, patch: Partial<StageConfig>) => {
    const copy = stages.map((s, i) => (i === index ? { ...s, ...patch } : s));
    await persistStages(copy);
  };

  const deleteStageItem = async (index: number) => {
    if (stages.length <= 2) return;
    const copy = stages.filter((_, i) => i !== index);
    await persistStages(copy);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const parsed = JSON.parse(text);
      await onImportBackup(parsed);
      flashSaved('Cadangan JSON berhasil dipulihkan.');
    } catch {
      alert('Format berkas JSON tidak valid.');
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-6 pb-8">
      {savedNotice && (
        <div
          role="status"
          className="fixed right-4 bottom-20 z-50 flex items-center gap-2 rounded-lg border border-[#1C1917] bg-[#1C1917] px-4 py-3 text-xs font-bold text-[#FAF6F0] lg:bottom-6 dark:border-[#F5F5F4] dark:bg-[#F5F5F4] dark:text-[#161412]"
        >
          <Check className="h-4 w-4 text-[#34D399] dark:text-[#047857]" aria-hidden="true" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* 1. Profil & Preferensi */}
      <form
        onSubmit={handleSaveProfileAndPrefs}
        className="rounded-xl border border-[#D6CFC2] bg-white p-5 sm:p-6 dark:border-[#38332E] dark:bg-[#211E1B]"
      >
        <div className="border-b border-[#E6DFD3] pb-3 dark:border-[#38332E]">
          <span className="font-mono-num text-xs font-bold uppercase tracking-wider text-[#57534E] dark:text-[#A8A29E]">
            01 / IDENTITAS & TARGET KERJA
          </span>
          <h2 className="font-editorial mt-0.5 text-xl font-bold text-[#1C1917] dark:text-[#F5F5F4]">
            Profil Pelamar & Pengingat Otomatis
          </h2>
          <p className="mt-0.5 text-xs text-[#44403C] dark:text-[#D6D3D1]">
            Digunakan untuk mengisi otomatis variabel nama dan portofolio pada template pesan HR.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label htmlFor="prof-name" className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]">
              Nama Lengkap Anda
            </label>
            <input
              id="prof-name"
              value={profile.name}
              placeholder="Nama Lengkap Anda"
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="min-h-[44px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-sm text-[#1C1917] placeholder:text-[#57534E] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4] dark:placeholder:text-[#A8A29E]"
            />
          </div>

          <div>
            <label htmlFor="prof-role" className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]">
              Fokus / Target Posisi
            </label>
            <input
              id="prof-role"
              value={profile.roleTarget}
              placeholder="Contoh: Frontend Engineer"
              onChange={(e) => setProfile({ ...profile, roleTarget: e.target.value })}
              className="min-h-[44px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-sm text-[#1C1917] placeholder:text-[#57534E] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4] dark:placeholder:text-[#A8A29E]"
            />
          </div>

          <div>
            <label htmlFor="prof-email" className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]">
              Alamat Email
            </label>
            <input
              id="prof-email"
              type="email"
              value={profile.email}
              placeholder="email@domain.com"
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="min-h-[44px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-sm text-[#1C1917] placeholder:text-[#57534E] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4] dark:placeholder:text-[#A8A29E]"
            />
          </div>

          <div>
            <label htmlFor="prof-phone" className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]">
              Nomor WhatsApp / Telepon
            </label>
            <input
              id="prof-phone"
              value={profile.phone}
              placeholder="+62 8..."
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="min-h-[44px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-sm text-[#1C1917] placeholder:text-[#57534E] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4] dark:placeholder:text-[#A8A29E]"
            />
          </div>

          <div>
            <label htmlFor="prof-port" className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]">
              Tautan Portofolio Utama
            </label>
            <input
              id="prof-port"
              value={profile.portfolioUrl}
              placeholder="https://portofolio-anda.com"
              onChange={(e) => setProfile({ ...profile, portfolioUrl: e.target.value })}
              className="min-h-[44px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-sm text-[#1C1917] placeholder:text-[#57534E] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4] dark:placeholder:text-[#A8A29E]"
            />
          </div>

          <div>
            <label htmlFor="prof-li" className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]">
              Tautan Profil LinkedIn
            </label>
            <input
              id="prof-li"
              value={profile.linkedinUrl}
              placeholder="https://linkedin.com/in/username"
              onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
              className="min-h-[44px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-sm text-[#1C1917] placeholder:text-[#57534E] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4] dark:placeholder:text-[#A8A29E]"
            />
          </div>
        </div>

        <div className="mt-6 border-t border-[#E6DFD3] pt-5 dark:border-[#38332E]">
          <h3 className="font-editorial text-base font-bold text-[#1C1917] dark:text-[#F5F5F4]">
            Target Mingguan, Aturan Follow-Up & Kerapatan Kartu
          </h3>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="pref-goal" className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]">
                Target Apply per Minggu
              </label>
              <input
                id="pref-goal"
                type="number"
                min={1}
                max={100}
                value={prefs.weeklyGoal}
                onChange={(e) =>
                  setPrefs({ ...prefs, weeklyGoal: Number(e.target.value) || 5 })
                }
                className="font-mono-num min-h-[44px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-sm font-bold text-[#1C1917] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
              />
            </div>

            <div>
              <label htmlFor="pref-fup" className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]">
                Ingatkan Follow-Up Setelah (Hari)
              </label>
              <input
                id="pref-fup"
                type="number"
                min={1}
                max={60}
                value={prefs.followUpDays}
                onChange={(e) =>
                  setPrefs({ ...prefs, followUpDays: Number(e.target.value) || 7 })
                }
                className="font-mono-num min-h-[44px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-sm font-bold text-[#1C1917] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
              />
            </div>

            <div>
              <label htmlFor="pref-curr" className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]">
                Mata Uang Default
              </label>
              <select
                id="pref-curr"
                value={prefs.defaultCurrency}
                onChange={(e) =>
                  setPrefs({ ...prefs, defaultCurrency: e.target.value })
                }
                className="min-h-[44px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-sm font-bold text-[#1C1917] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
              >
                <option value="IDR">IDR (Rupiah)</option>
                <option value="USD">USD (US Dollar)</option>
                <option value="SGD">SGD (Singapore Dollar)</option>
                <option value="MYR">MYR (Ringgit)</option>
                <option value="EUR">EUR (Euro)</option>
              </select>
            </div>

            <div>
              <label htmlFor="pref-dens" className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]">
                Kerapatan Tampilan Kartu
              </label>
              <select
                id="pref-dens"
                value={prefs.density}
                onChange={(e) =>
                  setPrefs({
                    ...prefs,
                    density: e.target.value as 'comfortable' | 'compact',
                  })
                }
                className="min-h-[44px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-sm font-bold text-[#1C1917] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
              >
                <option value="comfortable">Lega (Comfortable)</option>
                <option value="compact">Rapat (Compact)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            className="min-h-[44px] rounded-lg bg-[#C2410C] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#9A3412]"
          >
            Simpan Profil & Preferensi
          </button>
        </div>
      </form>

      {/* 2. Kustomisasi Tahapan Pipeline */}
      <section
        aria-label="Kustomisasi Tahapan Pipeline"
        className="rounded-xl border border-[#D6CFC2] bg-white p-5 sm:p-6 dark:border-[#38332E] dark:bg-[#211E1B]"
      >
        <div className="border-b border-[#E6DFD3] pb-3 dark:border-[#38332E]">
          <span className="font-mono-num text-xs font-bold uppercase tracking-wider text-[#57534E] dark:text-[#A8A29E]">
            02 / ALUR REKRUTMEN KUSTOM
          </span>
          <h2 className="font-editorial mt-0.5 text-xl font-bold text-[#1C1917] dark:text-[#F5F5F4]">
            Atur Tahapan Seleksi (Custom Stages)
          </h2>
          <p className="mt-0.5 text-xs text-[#44403C] dark:text-[#D6D3D1]">
            Ubah nama tahapan, warna label, kategori perhitungan rasio, urutan kolom Kanban, atau tambah tahapan baru.
          </p>
        </div>

        <div className="mt-4 space-y-2.5">
          {stages.map((st, idx) => {
            const colorStyle = STAGE_COLOR_STYLES[st.color] || STAGE_COLOR_STYLES.slate;
            const countInStage = jobs.filter((j) => j.stage === st.id).length;

            return (
              <div
                key={st.id}
                className="flex flex-col gap-3 rounded-lg border border-[#D6CFC2] bg-[#FAF6F0] p-3.5 dark:border-[#38332E] dark:bg-[#161412] lg:flex-row lg:items-center"
              >
                <div className="flex items-center gap-2.5 lg:flex-1">
                  <span className="font-mono-num rounded bg-[#E6DFD3] px-2 py-1 text-xs font-bold text-[#1C1917] dark:bg-[#2A2622] dark:text-[#F5F5F4]">
                    0{idx + 1}
                  </span>
                  <span className={`h-3.5 w-3.5 shrink-0 rounded ${colorStyle.bar}`} />
                  <label htmlFor={`st-name-${st.id}`} className="sr-only">
                    Nama tahapan {st.label}
                  </label>
                  <input
                    id={`st-name-${st.id}`}
                    value={st.label}
                    onChange={(e) => {
                      const copy = stages.map((x, i) =>
                        i === idx ? { ...x, label: e.target.value } : x
                      );
                      setStages(copy);
                    }}
                    onBlur={() => persistStages(stages)}
                    className="min-h-[44px] flex-1 rounded-lg border border-[#A8A29E] bg-white px-3 py-1.5 text-xs font-bold text-[#1C1917] dark:border-[#57534E] dark:bg-[#211E1B] dark:text-[#F5F5F4]"
                  />
                  <span className="font-mono-num shrink-0 rounded border border-[#A8A29E] bg-white px-2.5 py-1.5 text-xs font-bold text-[#44403C] dark:border-[#57534E] dark:bg-[#211E1B] dark:text-[#D6D3D1]">
                    {countInStage} loker
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label htmlFor={`st-col-${st.id}`} className="sr-only">
                    Warna tahapan {st.label}
                  </label>
                  <select
                    id={`st-col-${st.id}`}
                    value={st.color}
                    onChange={(e) =>
                      updateStageItem(idx, { color: e.target.value as StageColor })
                    }
                    className="min-h-[44px] rounded-lg border border-[#A8A29E] bg-white px-3 py-1.5 text-xs font-bold text-[#1C1917] dark:border-[#57534E] dark:bg-[#211E1B] dark:text-[#F5F5F4]"
                  >
                    {COLOR_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        Warna: {c}
                      </option>
                    ))}
                  </select>

                  <label htmlFor={`st-cat-${st.id}`} className="sr-only">
                    Kategori tahapan {st.label}
                  </label>
                  <select
                    id={`st-cat-${st.id}`}
                    value={st.category}
                    onChange={(e) =>
                      updateStageItem(idx, {
                        category: e.target.value as StageCategory,
                      })
                    }
                    className="min-h-[44px] rounded-lg border border-[#A8A29E] bg-white px-3 py-1.5 text-xs font-bold text-[#1C1917] dark:border-[#57534E] dark:bg-[#211E1B] dark:text-[#F5F5F4]"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveStage(idx, -1)}
                      aria-label={`Naikkan urutan ${st.label}`}
                      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-[#A8A29E] bg-white text-[#1C1917] hover:bg-[#EFE8DC] disabled:opacity-40 dark:border-[#57534E] dark:bg-[#211E1B] dark:text-[#F5F5F4]"
                    >
                      <ArrowUp className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === stages.length - 1}
                      onClick={() => moveStage(idx, 1)}
                      aria-label={`Turunkan urutan ${st.label}`}
                      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-[#A8A29E] bg-white text-[#1C1917] hover:bg-[#EFE8DC] disabled:opacity-40 dark:border-[#57534E] dark:bg-[#211E1B] dark:text-[#F5F5F4]"
                    >
                      <ArrowDown className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      disabled={stages.length <= 2 || countInStage > 0}
                      onClick={() => deleteStageItem(idx)}
                      title={
                        countInStage > 0
                          ? 'Pindahkan loker dari tahapan ini sebelum menghapus'
                          : 'Hapus tahapan'
                      }
                      aria-label={`Hapus tahapan ${st.label}`}
                      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-[#FDA4AF] bg-white text-[#BE123C] hover:bg-[#FFE4E6] disabled:opacity-40 dark:border-[#9F1239] dark:bg-[#211E1B] dark:text-[#FB7185]"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <form
          onSubmit={handleAddStage}
          className="mt-4 flex flex-col gap-2.5 border-t border-[#E6DFD3] pt-4 dark:border-[#38332E] sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label htmlFor="new-stage-name" className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]">
              Nama Tahapan Baru
            </label>
            <input
              id="new-stage-name"
              placeholder="Contoh: Psikotes / Medical Check-Up"
              value={newStageLabel}
              onChange={(e) => setNewStageLabel(e.target.value)}
              className="min-h-[44px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-xs text-[#1C1917] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
            />
          </div>
          <div>
            <label htmlFor="new-stage-color" className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]">
              Warna
            </label>
            <select
              id="new-stage-color"
              value={newStageColor}
              onChange={(e) => setNewStageColor(e.target.value as StageColor)}
              className="min-h-[44px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-xs font-bold text-[#1C1917] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
            >
              {COLOR_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  Warna: {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="new-stage-cat" className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]">
              Kategori
            </label>
            <select
              id="new-stage-cat"
              value={newStageCategory}
              onChange={(e) => setNewStageCategory(e.target.value as StageCategory)}
              className="min-h-[44px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-xs font-bold text-[#1C1917] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
            >
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-[#1C1917] px-4 py-2 text-xs font-bold text-[#FAF6F0] hover:bg-[#292524] dark:bg-[#C2410C] dark:text-white"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Tambah Tahap</span>
          </button>
        </form>
      </section>

      {/* 3. Kustomisasi Daftar Pilihan */}
      <section
        aria-label="Kustomisasi Daftar Pilihan"
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
      >
        <OptionListCard
          idPrefix="opt-plat"
          title="Sumber Platform Loker"
          subtitle="Portal kerja yang sering Anda gunakan"
          items={settings.platforms}
          inputValue={newPlatform}
          onInputChange={setNewPlatform}
          placeholder="Contoh: KitaLulus / CakeResume"
          onAdd={async () => {
            const val = newPlatform.trim();
            if (!val || settings.platforms.includes(val)) return;
            await onSaveSettings({ platforms: [...settings.platforms, val] });
            setNewPlatform('');
            flashSaved('Platform ditambahkan.');
          }}
          onRemove={async (item) => {
            await onSaveSettings({
              platforms: settings.platforms.filter((p) => p !== item),
            });
            flashSaved('Platform dihapus.');
          }}
        />

        <OptionListCard
          idPrefix="opt-wm"
          title="Sistem Kerja"
          subtitle="Pilihan WFO, Hybrid, Remote, dll."
          items={settings.workModes}
          inputValue={newWorkMode}
          onInputChange={setNewWorkMode}
          placeholder="Contoh: WFA (Work From Anywhere)"
          onAdd={async () => {
            const val = newWorkMode.trim();
            if (!val || settings.workModes.includes(val)) return;
            await onSaveSettings({ workModes: [...settings.workModes, val] });
            setNewWorkMode('');
            flashSaved('Sistem kerja ditambahkan.');
          }}
          onRemove={async (item) => {
            if (settings.workModes.length <= 1) return;
            await onSaveSettings({
              workModes: settings.workModes.filter((w) => w !== item),
            });
          }}
        />

        <OptionListCard
          idPrefix="opt-emp"
          title="Tipe Kontrak Kerja"
          subtitle="Full-time, Kontrak PKWT, Magang, dll."
          items={settings.employmentTypes}
          inputValue={newEmpType}
          onInputChange={setNewEmpType}
          placeholder="Contoh: Management Trainee (MT)"
          onAdd={async () => {
            const val = newEmpType.trim();
            if (!val || settings.employmentTypes.includes(val)) return;
            await onSaveSettings({
              employmentTypes: [...settings.employmentTypes, val],
            });
            setNewEmpType('');
            flashSaved('Tipe kerja ditambahkan.');
          }}
          onRemove={async (item) => {
            if (settings.employmentTypes.length <= 1) return;
            await onSaveSettings({
              employmentTypes: settings.employmentTypes.filter((t) => t !== item),
            });
          }}
        />
      </section>

      {/* 4. Manajemen Data & Backup */}
      <section
        aria-label="Manajemen Data dan Backup"
        className="rounded-xl border border-[#D6CFC2] bg-white p-5 sm:p-6 dark:border-[#38332E] dark:bg-[#211E1B]"
      >
        <span className="font-mono-num text-xs font-bold uppercase tracking-wider text-[#57534E] dark:text-[#A8A29E]">
          04 / CADANGAN & PENYIMPANAN LOKAL
        </span>
        <h2 className="font-editorial mt-0.5 text-xl font-bold text-[#1C1917] dark:text-[#F5F5F4]">
          Unduh Spreadsheet, Backup JSON & Reset Data
        </h2>
        <p className="mt-0.5 text-xs text-[#44403C] dark:text-[#D6D3D1]">
          Seluruh catatan tersimpan secara lokal di berkas database SQLite (`data/karirtrack.sqlite`).
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => exportJobsToCSV(state.jobs, state.settings.stages)}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-4 py-2 text-xs font-bold text-[#1C1917] hover:bg-[#EFE8DC] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>Unduh CSV (Excel / Sheets)</span>
          </button>

          <button
            type="button"
            onClick={() => exportFullBackupJSON(state)}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-4 py-2 text-xs font-bold text-[#1C1917] hover:bg-[#EFE8DC] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>Unduh Backup Lengkap (.JSON)</span>
          </button>

          <input
            ref={fileInputRef}
            id="backup-file-upload"
            type="file"
            accept=".json,application/json"
            onChange={handleImportFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[#A8A29E] bg-white px-4 py-2 text-xs font-bold text-[#1C1917] hover:bg-[#FAF6F0] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            <span>Pulihkan Backup (.JSON)</span>
          </button>

          <button
            type="button"
            onClick={async () => {
              await onLoadSampleData();
              flashSaved('Data contoh berhasil dimuat ulang.');
            }}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[#A8A29E] bg-white px-4 py-2 text-xs font-bold text-[#44403C] hover:bg-[#FAF6F0] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#D6D3D1]"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>Muat Ulang Data Contoh</span>
          </button>

          <button
            type="button"
            onClick={async () => {
              await onResetAllJobs();
              flashSaved('Semua daftar loker telah dikosongkan.');
            }}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[#BE123C] bg-[#FFE4E6] px-4 py-2 text-xs font-bold text-[#881337] hover:bg-[#FECDD3] dark:border-[#FB7185] dark:bg-[#4C0519] dark:text-[#FFE4E6]"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            <span>Kosongkan Semua Loker</span>
          </button>
        </div>
      </section>
    </div>
  );
};

const OptionListCard: React.FC<{
  idPrefix: string;
  title: string;
  subtitle: string;
  items: string[];
  inputValue: string;
  onInputChange: (v: string) => void;
  placeholder: string;
  onAdd: () => void;
  onRemove: (item: string) => void;
}> = ({
  idPrefix,
  title,
  subtitle,
  items,
  inputValue,
  onInputChange,
  placeholder,
  onAdd,
  onRemove,
}) => (
  <div className="flex flex-col justify-between rounded-xl border border-[#D6CFC2] bg-white p-5 dark:border-[#38332E] dark:bg-[#211E1B]">
    <div>
      <h3 className="font-editorial text-base font-bold text-[#1C1917] dark:text-[#F5F5F4]">
        {title}
      </h3>
      <p className="mt-0.5 text-xs text-[#44403C] dark:text-[#D6D3D1]">{subtitle}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#D6CFC2] bg-[#FAF6F0] py-1 pr-1.5 pl-3 text-xs font-bold text-[#1C1917] dark:border-[#38332E] dark:bg-[#161412] dark:text-[#F5F5F4]"
          >
            <span>{item}</span>
            <button
              type="button"
              onClick={() => onRemove(item)}
              aria-label={`Hapus opsi ${item}`}
              className="inline-flex h-7 w-7 items-center justify-center rounded text-sm font-bold text-[#57534E] hover:bg-[#FFE4E6] hover:text-[#BE123C] dark:text-[#A8A29E]"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>

    <form
      onSubmit={(e) => {
        e.preventDefault();
        onAdd();
      }}
      className="mt-4 border-t border-[#E6DFD3] pt-3 dark:border-[#38332E]"
    >
      <label
        htmlFor={`${idPrefix}-input`}
        className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]"
      >
        Tambah {title}
      </label>
      <div className="flex gap-2">
        <input
          id={`${idPrefix}-input`}
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[44px] flex-1 rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-1.5 text-xs text-[#1C1917] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
        />
        <button
          type="submit"
          className="min-h-[44px] rounded-lg bg-[#1C1917] px-3.5 py-1.5 text-xs font-bold text-[#FAF6F0] hover:bg-[#292524] dark:bg-[#C2410C] dark:text-white"
        >
          Tambah
        </button>
      </div>
    </form>
  </div>
);
