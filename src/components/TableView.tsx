import React, { useMemo, useState } from 'react';
import {
  Search,
  Star,
  ArrowUpDown,
  Trash2,
  Download,
  ExternalLink,
  Pencil,
} from 'lucide-react';
import type { AppSettings, JobApplication } from '../types';
import {
  PRIORITY_META,
  STAGE_COLOR_STYLES,
  exportJobsToCSV,
  formatDateID,
  formatSalarySummary,
  getStageMeta,
} from '../utils/format';

interface TableViewProps {
  jobs: JobApplication[];
  settings: AppSettings;
  onSelectJob: (job: JobApplication) => void;
  onEditJob: (job: JobApplication) => void;
  onMoveStage: (jobId: string, stageId: string) => void;
  onTogglePin: (job: JobApplication) => void;
  onBulkStage: (ids: string[], stageId: string) => void;
  onBulkDelete: (ids: string[]) => void;
}

type SortField = 'updatedAt' | 'appliedDate' | 'company' | 'position' | 'salary';

export const TableView: React.FC<TableViewProps> = ({
  jobs,
  settings,
  onSelectJob,
  onEditJob,
  onMoveStage,
  onTogglePin,
  onBulkStage,
  onBulkDelete,
}) => {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [workModeFilter, setWorkModeFilter] = useState('ALL');
  const [platformFilter, setPlatformFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [pinnedOnly, setPinnedOnly] = useState(false);

  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const sortedStages = [...settings.stages].sort((a, b) => a.order - b.order);

  const filteredAndSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = jobs.filter((job) => {
      if (stageFilter !== 'ALL' && job.stage !== stageFilter) return false;
      if (workModeFilter !== 'ALL' && job.workMode !== workModeFilter) return false;
      if (platformFilter !== 'ALL' && job.platform !== platformFilter) return false;
      if (priorityFilter !== 'ALL' && job.priority !== priorityFilter) return false;
      if (pinnedOnly && !job.pinned) return false;
      if (!q) return true;
      return (
        job.company.toLowerCase().includes(q) ||
        job.position.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.hrName.toLowerCase().includes(q) ||
        job.notes.toLowerCase().includes(q) ||
        job.skills.some((s) => s.toLowerCase().includes(q))
      );
    });

    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'company') {
        cmp = a.company.localeCompare(b.company);
      } else if (sortField === 'position') {
        cmp = a.position.localeCompare(b.position);
      } else if (sortField === 'appliedDate') {
        cmp = (a.appliedDate || '').localeCompare(b.appliedDate || '');
      } else if (sortField === 'salary') {
        const sa = a.salaryOffered ?? a.salaryExpected ?? a.salaryMax ?? a.salaryMin ?? 0;
        const sb = b.salaryOffered ?? b.salaryExpected ?? b.salaryMax ?? b.salaryMin ?? 0;
        cmp = sa - sb;
      } else {
        cmp = a.updatedAt.localeCompare(b.updatedAt);
      }
      return sortAsc ? cmp : -cmp;
    });

    return list;
  }, [
    jobs,
    search,
    stageFilter,
    workModeFilter,
    platformFilter,
    priorityFilter,
    pinnedOnly,
    sortField,
    sortAsc,
  ]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === 'company' || field === 'position');
    }
  };

  const allVisibleSelected =
    filteredAndSorted.length > 0 &&
    filteredAndSorted.every((j) => selectedIds.includes(j.id));

  const handleToggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAndSorted.map((j) => j.id));
    }
  };

  const handleToggleOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4">
      {/* Multi-Filter Panel */}
      <div className="space-y-3 rounded-xl border border-[#D6CFC2] bg-white p-4 dark:border-[#38332E] dark:bg-[#211E1B]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label
              htmlFor="tbl-search-input"
              className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]"
            >
              Cari di Daftar Lamaran
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#57534E] dark:text-[#A8A29E]"
                aria-hidden="true"
              />
              <input
                id="tbl-search-input"
                type="search"
                placeholder="Perusahaan, posisi, lokasi, nama HR, skill, catatan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="min-h-[44px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] py-2 pr-4 pl-10 text-sm text-[#1C1917] placeholder:text-[#57534E] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4] dark:placeholder:text-[#A8A29E]"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPinnedOnly(!pinnedOnly)}
            aria-pressed={pinnedOnly}
            className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border px-4 py-2 text-xs font-bold transition ${
              pinnedOnly
                ? 'border-[#B45309] bg-[#FEF3C7] text-[#451A03] dark:border-[#F59E0B] dark:bg-[#451A03] dark:text-[#FEF3C7]'
                : 'border-[#A8A29E] bg-[#FAF6F0] text-[#1C1917] hover:bg-[#EFE8DC] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]'
            }`}
          >
            <Star
              className={`h-4 w-4 ${pinnedOnly ? 'fill-[#D97706] text-[#B45309]' : ''}`}
              aria-hidden="true"
            />
            <span>Favorit Saja</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label
              htmlFor="tbl-stage-filter"
              className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]"
            >
              Tahapan Seleksi
            </label>
            <select
              id="tbl-stage-filter"
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="min-h-[44px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-xs font-bold text-[#1C1917] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
            >
              <option value="ALL">Semua Tahapan ({jobs.length})</option>
              {sortedStages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="tbl-workmode-filter"
              className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]"
            >
              Sistem Kerja
            </label>
            <select
              id="tbl-workmode-filter"
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

          <div>
            <label
              htmlFor="tbl-platform-filter"
              className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]"
            >
              Sumber Platform
            </label>
            <select
              id="tbl-platform-filter"
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="min-h-[44px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-xs font-bold text-[#1C1917] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
            >
              <option value="ALL">Semua Platform</option>
              {settings.platforms.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="tbl-priority-filter"
              className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]"
            >
              Prioritas
            </label>
            <select
              id="tbl-priority-filter"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="min-h-[44px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-xs font-bold text-[#1C1917] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
            >
              <option value="ALL">Semua Prioritas</option>
              <option value="high">Prioritas Tinggi</option>
              <option value="medium">Prioritas Sedang</option>
              <option value="low">Prioritas Rendah</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#C2410C] bg-[#FFEDD5] px-4 py-3 dark:border-[#FB923C] dark:bg-[#431407]">
          <span className="font-mono-num text-xs font-bold text-[#431407] dark:text-[#FFEDD5]">
            {selectedIds.length} berkas dipilih
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="bulk-stage-select" className="sr-only">
              Ubah tahapan massal
            </label>
            <select
              id="bulk-stage-select"
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  onBulkStage(selectedIds, e.target.value);
                  setSelectedIds([]);
                  e.target.value = '';
                }
              }}
              className="min-h-[44px] rounded-lg border border-[#9A3412] bg-white px-3 py-2 text-xs font-bold text-[#1C1917] dark:bg-[#161412] dark:text-[#F5F5F4]"
            >
              <option value="" disabled>
                Pindahkan Tahapan Massal...
              </option>
              {sortedStages.map((s) => (
                <option key={s.id} value={s.id}>
                  Pindah ke: {s.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() =>
                exportJobsToCSV(
                  jobs.filter((j) => selectedIds.includes(j.id)),
                  settings.stages
                )
              }
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-[#A8A29E] bg-white px-3.5 py-2 text-xs font-bold text-[#1C1917] hover:bg-[#FAF6F0] dark:bg-[#161412] dark:text-[#F5F5F4]"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span>Unduh Pilihan</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onBulkDelete(selectedIds);
                setSelectedIds([]);
              }}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-[#BE123C] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#9F1239]"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              <span>Hapus ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* MOBILE & TABLET REFLOW (< lg): 1-col Phone / 2-col Tablet Dossier Cards (Zero horizontal scroll leak!) */}
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:hidden">
        {filteredAndSorted.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#A8A29E] bg-white p-8 text-center md:col-span-2 dark:border-[#57534E] dark:bg-[#211E1B]">
            <p className="text-sm font-bold text-[#1C1917] dark:text-[#F5F5F4]">
              Tidak ada lamaran yang cocok dengan pencarian atau filter ini
            </p>
            <p className="mt-1 text-xs text-[#44403C] dark:text-[#D6D3D1]">
              Ubah kata kunci pencarian atau atur ulang filter tahapan di atas.
            </p>
          </div>
        ) : (
          filteredAndSorted.map((job, idx) => {
            const stageMeta = getStageMeta(settings.stages, job.stage);
            const stageStyle =
              STAGE_COLOR_STYLES[stageMeta.color] || STAGE_COLOR_STYLES.slate;

            return (
              <article
                key={job.id}
                className="flex flex-col justify-between rounded-xl border border-[#D6CFC2] bg-white p-4 dark:border-[#38332E] dark:bg-[#211E1B]"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <label className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-[#D6CFC2] bg-[#FAF6F0] dark:border-[#38332E] dark:bg-[#161412]">
                        <input
                          type="checkbox"
                          aria-label={`Pilih ${job.position} di ${job.company}`}
                          checked={selectedIds.includes(job.id)}
                          onChange={() => handleToggleOne(job.id)}
                          className="h-4 w-4 rounded"
                        />
                      </label>
                      <div>
                        <span className="font-mono-num text-xs font-bold uppercase text-[#C2410C] dark:text-[#FB923C]">
                          #{String(idx + 1).padStart(2, '0')} • {job.company}
                        </span>
                        <button
                          type="button"
                          onClick={() => onSelectJob(job)}
                          className="font-editorial mt-0.5 block text-left text-base font-bold text-[#1C1917] hover:underline dark:text-[#F5F5F4]"
                        >
                          {job.position}
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onTogglePin(job)}
                      aria-label={job.pinned ? `Lepas favorit ${job.company}` : `Favoritkan ${job.company}`}
                      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-[#57534E] hover:bg-[#FAF6F0] dark:text-[#A8A29E]"
                    >
                      <Star
                        className={`h-4 w-4 ${job.pinned ? 'fill-[#D97706] text-[#B45309]' : ''}`}
                        aria-hidden="true"
                      />
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                    <span className={`rounded border px-2 py-0.5 font-bold ${PRIORITY_META[job.priority].badge}`}>
                      {PRIORITY_META[job.priority].label}
                    </span>
                    <span className="rounded border border-[#D6CFC2] bg-[#FAF6F0] px-2 py-0.5 font-semibold text-[#44403C] dark:border-[#38332E] dark:bg-[#161412] dark:text-[#D6D3D1]">
                      {job.workMode} • {job.location || '-'}
                    </span>
                    <span className="font-mono-num rounded border border-[#D6CFC2] bg-[#FAF6F0] px-2 py-0.5 font-bold text-[#1C1917] dark:border-[#38332E] dark:bg-[#161412] dark:text-[#F5F5F4]">
                      {formatSalarySummary(job, true)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-2 border-t border-[#E6DFD3] pt-3 dark:border-[#38332E]">
                  <div>
                    <label
                      htmlFor={`mob-tbl-stage-${job.id}`}
                      className="mb-1 block text-[11px] font-semibold text-[#57534E] dark:text-[#A8A29E]"
                    >
                      Tahapan Seleksi ({job.platform} • Apply {formatDateID(job.appliedDate, true)})
                    </label>
                    <select
                      id={`mob-tbl-stage-${job.id}`}
                      value={job.stage}
                      onChange={(e) => onMoveStage(job.id, e.target.value)}
                      className={`min-h-[44px] w-full rounded-lg border px-3 py-2 text-xs font-bold ${stageStyle.badge}`}
                    >
                      {sortedStages.map((s) => (
                        <option
                          key={s.id}
                          value={s.id}
                          className="bg-white text-[#1C1917] dark:bg-[#161412] dark:text-[#F5F5F4]"
                        >
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEditJob(job)}
                      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3.5 py-2 text-xs font-bold text-[#1C1917] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Edit</span>
                    </button>
                    {job.jobUrl && (
                      <a
                        href={job.jobUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-[#A8A29E] bg-white px-3.5 py-2 text-xs font-bold text-[#1C1917] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                      >
                        <span>Iklan</span>
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* DESKTOP TABLE (lg+): Architectural Editorial Ledger */}
      <div className="hidden overflow-hidden rounded-xl border border-[#D6CFC2] bg-white dark:border-[#38332E] dark:bg-[#211E1B] lg:block">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#D6CFC2] bg-[#F3EDE2] text-xs font-bold uppercase tracking-wider text-[#44403C] dark:border-[#38332E] dark:bg-[#24201D] dark:text-[#D6D3D1]">
                <th className="w-12 px-3 py-3">
                  <label className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center">
                    <input
                      type="checkbox"
                      aria-label="Pilih semua baris yang tampil"
                      checked={allVisibleSelected}
                      onChange={handleToggleSelectAll}
                      className="h-4 w-4 rounded"
                    />
                  </label>
                </th>
                <th className="px-3 py-3">
                  <button
                    type="button"
                    onClick={() => toggleSort('company')}
                    className="inline-flex min-h-[44px] items-center gap-1.5 font-bold text-[#1C1917] hover:underline dark:text-[#F5F5F4]"
                  >
                    <span>Perusahaan & Posisi</span>
                    <ArrowUpDown className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </th>
                <th className="px-3 py-3">Tahapan Seleksi</th>
                <th className="px-3 py-3">
                  <button
                    type="button"
                    onClick={() => toggleSort('salary')}
                    className="inline-flex min-h-[44px] items-center gap-1.5 font-bold text-[#1C1917] hover:underline dark:text-[#F5F5F4]"
                  >
                    <span>Kompensasi & Sistem</span>
                    <ArrowUpDown className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </th>
                <th className="px-3 py-3">Kanal</th>
                <th className="px-3 py-3">
                  <button
                    type="button"
                    onClick={() => toggleSort('appliedDate')}
                    className="inline-flex min-h-[44px] items-center gap-1.5 font-bold text-[#1C1917] hover:underline dark:text-[#F5F5F4]"
                  >
                    <span>Tgl Apply</span>
                    <ArrowUpDown className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6DFD3] dark:divide-[#38332E]">
              {filteredAndSorted.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-sm font-medium text-[#44403C] dark:text-[#D6D3D1]"
                  >
                    Tidak ada lamaran yang cocok dengan pencarian atau filter saat ini.
                  </td>
                </tr>
              ) : (
                filteredAndSorted.map((job) => {
                  const stageMeta = getStageMeta(settings.stages, job.stage);
                  const stageStyle =
                    STAGE_COLOR_STYLES[stageMeta.color] || STAGE_COLOR_STYLES.slate;

                  return (
                    <tr
                      key={job.id}
                      className="transition hover:bg-[#FAF6F0] dark:hover:bg-[#1A1715]"
                    >
                      <td className="px-3 py-3">
                        <label className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center">
                          <input
                            type="checkbox"
                            aria-label={`Pilih ${job.position} di ${job.company}`}
                            checked={selectedIds.includes(job.id)}
                            onChange={() => handleToggleOne(job.id)}
                            className="h-4 w-4 rounded"
                          />
                        </label>
                      </td>

                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onTogglePin(job)}
                            aria-label={
                              job.pinned
                                ? `Lepas sematan ${job.company}`
                                : `Sematkan ${job.company}`
                            }
                            className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg text-[#57534E] hover:bg-[#EFE8DC] dark:text-[#A8A29E] dark:hover:bg-[#2A2622]"
                          >
                            <Star
                              className={`h-4 w-4 ${
                                job.pinned ? 'fill-[#D97706] text-[#B45309]' : ''
                              }`}
                              aria-hidden="true"
                            />
                          </button>
                          <div>
                            <button
                              type="button"
                              onClick={() => onSelectJob(job)}
                              className="font-editorial text-left text-base font-bold text-[#1C1917] hover:underline dark:text-[#F5F5F4]"
                            >
                              {job.position}
                            </button>
                            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-[#44403C] dark:text-[#D6D3D1]">
                              <span className="font-bold text-[#C2410C] dark:text-[#FB923C]">
                                {job.company}
                              </span>
                              <span
                                className={`rounded border px-1.5 py-0.5 text-[10px] font-bold ${
                                  PRIORITY_META[job.priority].badge
                                }`}
                              >
                                {PRIORITY_META[job.priority].label}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <select
                          aria-label={`Tahapan lamaran ${job.company}`}
                          value={job.stage}
                          onChange={(e) => onMoveStage(job.id, e.target.value)}
                          className={`min-h-[44px] rounded-lg border px-3 py-2 text-xs font-bold ${stageStyle.badge}`}
                        >
                          {sortedStages.map((s) => (
                            <option
                              key={s.id}
                              value={s.id}
                              className="bg-white text-[#1C1917] dark:bg-[#161412] dark:text-[#F5F5F4]"
                            >
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-3 py-3 text-xs">
                        <span className="font-mono-num block font-bold text-[#1C1917] dark:text-[#F5F5F4]">
                          {formatSalarySummary(job, true)}
                        </span>
                        <span className="text-[#44403C] dark:text-[#D6D3D1]">
                          {job.workMode} • {job.location || '-'}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-xs font-semibold text-[#44403C] dark:text-[#D6D3D1]">
                        {job.platform}
                      </td>

                      <td className="font-mono-num px-3 py-3 text-xs font-semibold text-[#44403C] dark:text-[#D6D3D1]">
                        {formatDateID(job.appliedDate, true)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEditJob(job)}
                            aria-label={`Edit data loker ${job.company}`}
                            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-[#D6CFC2] text-[#1C1917] hover:bg-[#EFE8DC] dark:border-[#38332E] dark:text-[#F5F5F4] dark:hover:bg-[#2A2622]"
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          </button>
                          {job.jobUrl && (
                            <a
                              href={job.jobUrl}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`Buka link lowongan ${job.company}`}
                              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-[#D6CFC2] text-[#1C1917] hover:bg-[#EFE8DC] dark:border-[#38332E] dark:text-[#F5F5F4] dark:hover:bg-[#2A2622]"
                            >
                              <ExternalLink className="h-4 w-4" aria-hidden="true" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
