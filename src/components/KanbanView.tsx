import React, { useState } from 'react';
import {
  Plus,
  Star,
  Search,
} from 'lucide-react';
import type { AppSettings, JobApplication } from '../types';
import {
  PRIORITY_META,
  STAGE_COLOR_STYLES,
  formatDateID,
  formatSalarySummary,
  getStageMeta,
  needsFollowUp,
} from '../utils/format';

interface KanbanViewProps {
  jobs: JobApplication[];
  settings: AppSettings;
  onSelectJob: (job: JobApplication) => void;
  onMoveStage: (jobId: string, newStage: string) => void;
  onTogglePin: (job: JobApplication) => void;
  onAddJobAtStage: (stageId: string) => void;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  jobs,
  settings,
  onSelectJob,
  onMoveStage,
  onTogglePin,
  onAddJobAtStage,
}) => {
  const [search, setSearch] = useState('');
  const [workModeFilter, setWorkModeFilter] = useState('ALL');
  const [mobileActiveStage, setMobileActiveStage] = useState<string>('ALL');
  const [draggedJobId, setDraggedJobId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const sortedStages = [...settings.stages].sort((a, b) => a.order - b.order);
  const compact = settings.preferences.density === 'compact';

  const filteredJobs = jobs.filter((job) => {
    if (workModeFilter !== 'ALL' && job.workMode !== workModeFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      job.company.toLowerCase().includes(q) ||
      job.position.toLowerCase().includes(q) ||
      job.location.toLowerCase().includes(q) ||
      job.platform.toLowerCase().includes(q) ||
      job.skills.some((s) => s.toLowerCase().includes(q))
    );
  });

  const renderCard = (job: JobApplication, indexNum: number) => {
    const followUp = needsFollowUp(
      job,
      settings.stages,
      settings.preferences.followUpDays
    );
    const doneTasks = job.checklist.filter((c) => c.done).length;
    const upcomingIv = job.interviews.find((iv) => iv.status === 'scheduled');
    const stageMeta = getStageMeta(settings.stages, job.stage);
    const stageStyle = STAGE_COLOR_STYLES[stageMeta.color] || STAGE_COLOR_STYLES.slate;

    return (
      <article
        key={job.id}
        draggable
        onDragStart={(e) => {
          setDraggedJobId(job.id);
          e.dataTransfer.setData('text/plain', job.id);
        }}
        onDragEnd={() => {
          setDraggedJobId(null);
          setDragOverStage(null);
        }}
        className={`group rounded-xl border border-[#D6CFC2] bg-white transition hover:border-[#1C1917] dark:border-[#38332E] dark:bg-[#211E1B] dark:hover:border-[#A8A29E] ${
          compact ? 'p-3.5' : 'p-4'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <button
            type="button"
            onClick={() => onSelectJob(job)}
            className="min-w-0 flex-1 text-left"
          >
            <div className="flex items-center gap-2">
              <span className="font-mono-num rounded bg-[#F3EDE2] px-1.5 py-0.5 text-[11px] font-bold text-[#44403C] dark:bg-[#2E2925] dark:text-[#D6D3D1]">
                #{String(indexNum + 1).padStart(2, '0')}
              </span>
              <span className="truncate text-xs font-bold uppercase tracking-wide text-[#C2410C] dark:text-[#FB923C]">
                {job.company}
              </span>
            </div>
            <h3 className="font-editorial mt-1.5 line-clamp-2 text-base font-bold text-[#1C1917] group-hover:underline dark:text-[#F5F5F4]">
              {job.position}
            </h3>
          </button>

          <button
            type="button"
            onClick={() => onTogglePin(job)}
            aria-label={
              job.pinned ? `Lepas favorit ${job.company}` : `Sematkan favorit ${job.company}`
            }
            className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg border border-transparent text-[#57534E] hover:border-[#D6CFC2] hover:bg-[#FAF6F0] dark:text-[#A8A29E] dark:hover:border-[#38332E] dark:hover:bg-[#161412]"
          >
            <Star
              className={`h-4 w-4 ${
                job.pinned ? 'fill-[#D97706] text-[#B45309]' : ''
              }`}
              aria-hidden="true"
            />
          </button>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span
            className={`rounded border px-2 py-0.5 text-[11px] font-bold ${
              PRIORITY_META[job.priority].badge
            }`}
          >
            {PRIORITY_META[job.priority].label}
          </span>
          <span className="rounded border border-[#D6CFC2] bg-[#FAF6F0] px-2 py-0.5 text-[11px] font-semibold text-[#44403C] dark:border-[#38332E] dark:bg-[#161412] dark:text-[#D6D3D1]">
            {job.workMode}
          </span>
          <span className="rounded border border-[#D6CFC2] bg-[#FAF6F0] px-2 py-0.5 text-[11px] font-semibold text-[#44403C] dark:border-[#38332E] dark:bg-[#161412] dark:text-[#D6D3D1]">
            {job.platform}
          </span>
        </div>

        <div className="mt-3 space-y-1 border-t border-dashed border-[#D6CFC2] pt-2.5 text-xs dark:border-[#38332E]">
          <p className="font-mono-num font-bold text-[#1C1917] dark:text-[#F5F5F4]">
            {formatSalarySummary(job, true)}
          </p>
          {job.location && (
            <p className="truncate text-[#44403C] dark:text-[#D6D3D1]">
              Lokasi: {job.location}
            </p>
          )}
        </div>

        {(upcomingIv || followUp.needed || job.checklist.length > 0) && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {upcomingIv && (
              <span className="font-mono-num rounded border border-[#6D28D9] bg-[#F3E8FF] px-2 py-0.5 text-[11px] font-bold text-[#3B0764] dark:border-[#9333EA] dark:bg-[#3B0764] dark:text-[#F3E8FF]">
                Jadwal: {formatDateID(upcomingIv.date, true)} {upcomingIv.time}
              </span>
            )}
            {followUp.needed && (
              <span className="font-mono-num rounded border border-[#B45309] bg-[#FEF3C7] px-2 py-0.5 text-[11px] font-bold text-[#451A03] dark:bg-[#451A03] dark:text-[#FEF3C7]">
                Perlu Follow-Up
              </span>
            )}
            {job.checklist.length > 0 && (
              <span className="font-mono-num rounded border border-[#A8A29E] bg-[#FAF6F0] px-2 py-0.5 text-[11px] font-semibold text-[#44403C] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#D6D3D1]">
                Tugas {doneTasks}/{job.checklist.length}
              </span>
            )}
          </div>
        )}

        {/* Accessible Stage Control (min-h-44px tap target) */}
        <div className="mt-3 border-t border-[#E6DFD3] pt-2.5 dark:border-[#38332E]">
          <label
            htmlFor={`stage-sel-${job.id}`}
            className="mb-1 block text-[11px] font-semibold text-[#57534E] dark:text-[#A8A29E]"
          >
             {job.appliedDate ? `Apply ${formatDateID(job.appliedDate, true)}` : 'Belum dikirim'} • Pindahkan Tahap:
          </label>
          <select
            id={`stage-sel-${job.id}`}
            value={job.stage}
            onChange={(e) => onMoveStage(job.id, e.target.value)}
            className={`min-h-[44px] w-full rounded-lg border px-3 py-2 text-xs font-bold ${stageStyle.badge}`}
          >
            {sortedStages.map((s) => (
              <option
                key={s.id}
                value={s.id}
                className="bg-white text-[#1C1917] dark:bg-[#1A1715] dark:text-[#F5F5F4]"
              >
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </article>
    );
  };

  return (
    <div className="flex h-full flex-col space-y-4">
      {/* Search & Work Mode Filter Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#D6CFC2] bg-white p-4 dark:border-[#38332E] dark:bg-[#211E1B] sm:flex-row sm:items-end sm:justify-between">
        <div className="flex-1">
          <label
            htmlFor="kanban-search-input"
            className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]"
          >
            Cari Berkas Lamaran
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#57534E] dark:text-[#A8A29E]"
              aria-hidden="true"
            />
            <input
              id="kanban-search-input"
              type="search"
              placeholder="Ketik perusahaan, posisi, lokasi, atau skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="min-h-[44px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] py-2 pr-4 pl-10 text-sm text-[#1C1917] placeholder:text-[#57534E] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4] dark:placeholder:text-[#A8A29E]"
            />
          </div>
        </div>

        <div className="sm:w-56">
          <label
            htmlFor="kanban-workmode-filter"
            className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]"
          >
            Filter Sistem Kerja
          </label>
          <select
            id="kanban-workmode-filter"
            value={workModeFilter}
            onChange={(e) => setWorkModeFilter(e.target.value)}
            className="min-h-[44px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-xs font-bold text-[#1C1917] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
          >
            <option value="ALL">Semua Sistem Kerja</option>
            {settings.workModes.map((wm) => (
              <option key={wm} value={wm}>
                {wm}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* MOBILE & TABLET REFLOW (< lg): Stage Filter Pills + 1-col Phone / 2-col Tablet Stack */}
      <div className="space-y-4 lg:hidden">
        <div
          role="tablist"
          aria-label="Pilih tahapan seleksi"
          className="flex flex-wrap gap-2 rounded-xl border border-[#D6CFC2] bg-[#F3EDE2] p-2.5 dark:border-[#38332E] dark:bg-[#24201D]"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mobileActiveStage === 'ALL'}
            onClick={() => setMobileActiveStage('ALL')}
            className={`min-h-[44px] rounded-lg px-3 py-2 text-xs font-bold transition ${
              mobileActiveStage === 'ALL'
                ? 'bg-[#1C1917] text-[#FAF6F0] dark:bg-[#F5F5F4] dark:text-[#161412]'
                : 'bg-white text-[#44403C] hover:bg-[#EFE8DC] dark:bg-[#161412] dark:text-[#D6D3D1]'
            }`}
          >
            Semua ({filteredJobs.length})
          </button>
          {sortedStages.map((st) => {
            const count = filteredJobs.filter((j) => j.stage === st.id).length;
            const isSelected = mobileActiveStage === st.id;
            return (
              <button
                key={st.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setMobileActiveStage(st.id)}
                className={`min-h-[44px] rounded-lg px-3 py-2 text-xs font-bold transition ${
                  isSelected
                    ? 'bg-[#C2410C] text-white'
                    : 'bg-white text-[#44403C] hover:bg-[#EFE8DC] dark:bg-[#161412] dark:text-[#D6D3D1]'
                }`}
              >
                {st.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Phone: 1 col, Tablet (md): 2 cols */}
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
          {filteredJobs
            .filter((j) => mobileActiveStage === 'ALL' || j.stage === mobileActiveStage)
            .map((job, idx) => renderCard(job, idx))}
        </div>

        {filteredJobs.filter(
          (j) => mobileActiveStage === 'ALL' || j.stage === mobileActiveStage
        ).length === 0 && (
          <div className="rounded-xl border border-dashed border-[#A8A29E] bg-white p-6 text-center dark:border-[#57534E] dark:bg-[#211E1B]">
            <p className="text-sm font-bold text-[#1C1917] dark:text-[#F5F5F4]">
              Belum ada loker pada tahapan ini
            </p>
            <button
              type="button"
              onClick={() =>
                onAddJobAtStage(
                  mobileActiveStage === 'ALL' ? 'applied' : mobileActiveStage
                )
              }
              className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-[#C2410C] px-4 py-2 text-xs font-bold text-white"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Tambah Loker di Tahap Ini</span>
            </button>
          </div>
        )}
      </div>

      {/* DESKTOP BOARD (lg+): Full Multi-Column Drag & Drop */}
      <div className="hidden flex-1 gap-4 overflow-x-auto pb-4 lg:flex">
        {sortedStages.map((stage, sIdx) => {
          const stageJobs = filteredJobs.filter((j) => j.stage === stage.id);
          const colorStyle = STAGE_COLOR_STYLES[stage.color] || STAGE_COLOR_STYLES.slate;
          const isDropTarget = dragOverStage === stage.id;

          return (
            <section
              key={stage.id}
              aria-label={`Kolom ${stage.label}`}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragOverStage !== stage.id) setDragOverStage(stage.id);
              }}
              onDragLeave={() => {
                if (dragOverStage === stage.id) setDragOverStage(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverStage(null);
                const jobId = e.dataTransfer.getData('text/plain') || draggedJobId;
                if (jobId) {
                  onMoveStage(jobId, stage.id);
                }
                setDraggedJobId(null);
              }}
              className={`flex w-80 shrink-0 flex-col rounded-xl border border-t-4 bg-[#F3EDE2] transition dark:bg-[#24201D] ${
                colorStyle.border
              } ${
                isDropTarget
                  ? 'border-[#C2410C] ring-2 ring-[#C2410C]/30'
                  : 'border-[#D6CFC2] dark:border-[#38332E]'
              }`}
            >
              <div
                className={`flex items-center justify-between border-b border-[#D6CFC2] px-3.5 py-2.5 dark:border-[#38332E] ${colorStyle.headerBg}`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono-num text-xs font-bold text-[#57534E] dark:text-[#A8A29E]">
                    0{sIdx + 1}
                  </span>
                  <h2 className="text-sm font-bold text-[#1C1917] dark:text-[#F5F5F4]">
                    {stage.label}
                  </h2>
                  <span className="font-mono-num rounded border border-[#A8A29E] bg-white px-2 py-0.5 text-xs font-bold text-[#1C1917] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]">
                    {stageJobs.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onAddJobAtStage(stage.id)}
                  aria-label={`Tambah loker di kolom ${stage.label}`}
                  className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-transparent text-[#1C1917] transition hover:border-[#A8A29E] hover:bg-white dark:text-[#F5F5F4] dark:hover:bg-[#161412]"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto p-3">
                {stageJobs.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-[#A8A29E] p-5 text-center text-xs font-medium text-[#57534E] dark:border-[#57534E] dark:text-[#A8A29E]">
                    Tarik kartu ke kolom ini atau klik tombol + di atas
                  </div>
                ) : (
                  stageJobs.map((job, idx) => renderCard(job, idx))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
