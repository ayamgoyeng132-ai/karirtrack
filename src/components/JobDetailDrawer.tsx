import React, { useEffect, useState } from 'react';
import {
  X,
  Pencil,
  Trash2,
  ExternalLink,
  Plus,
  Check,
  Copy,
  Star,
} from 'lucide-react';
import type {
  AppSettings,
  ChecklistItem,
  DocumentItem,
  InterviewItem,
  JobApplication,
  MessageTemplate,
} from '../types';
import {
  PRIORITY_META,
  STAGE_COLOR_STYLES,
  formatCurrency,
  formatDateID,
  getStageMeta,
  renderMessageTemplate,
  todayISO,
} from '../utils/format';

interface JobDetailDrawerProps {
  job: JobApplication | null;
  initialTab?: 'overview' | 'interviews' | 'followup' | 'history';
  settings: AppSettings;
  documents: DocumentItem[];
  templates: MessageTemplate[];
  onClose: () => void;
  onEdit: (job: JobApplication) => void;
  onDelete: (id: string) => Promise<void>;
  onUpdateJob: (id: string, patch: Partial<JobApplication>) => Promise<void>;
}

export const JobDetailDrawer: React.FC<JobDetailDrawerProps> = ({
  job,
  initialTab = 'overview',
  settings,
  documents,
  templates,
  onClose,
  onEdit,
  onDelete,
  onUpdateJob,
}) => {
  const [tab, setTab] = useState<'overview' | 'interviews' | 'followup' | 'history'>(
    initialTab
  );
  const [newTaskText, setNewTaskText] = useState('');
  const [notesDraft, setNotesDraft] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);

  const [addingIv, setAddingIv] = useState(false);
  const [ivTitle, setIvTitle] = useState('');
  const [ivType, setIvType] = useState('HR Interview');
  const [ivDate, setIvDate] = useState(todayISO());
  const [ivTime, setIvTime] = useState('10:00');
  const [ivLink, setIvLink] = useState('');
  const [ivInterviewer, setIvInterviewer] = useState('');
  const [ivNotes, setIvNotes] = useState('');

  const [selectedTplId, setSelectedTplId] = useState('');
  const [copiedFollowUp, setCopiedFollowUp] = useState(false);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab, job?.id]);

  useEffect(() => {
    if (job) {
      setNotesDraft(job.notes);
      if (!selectedTplId && templates.length > 0) {
        setSelectedTplId(templates[0].id);
      }
    }
  }, [job, templates, selectedTplId]);

  useEffect(() => {
    if (!job) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [job, onClose]);

  if (!job) return null;

  const sortedStages = [...settings.stages].sort((a, b) => a.order - b.order);
  const stageMeta = getStageMeta(settings.stages, job.stage);
  const stageStyle = STAGE_COLOR_STYLES[stageMeta.color] || STAGE_COLOR_STYLES.slate;
  const usedDoc = documents.find((d) => d.id === job.documentId);
  const activeTemplate =
    templates.find((t) => t.id === selectedTplId) || templates[0] || null;

  const addChecklistItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = newTaskText.trim();
    if (!text) return;
    const next: ChecklistItem[] = [
      ...job.checklist,
      { id: `chk-${Date.now()}`, text, done: false },
    ];
    setNewTaskText('');
    await onUpdateJob(job.id, { checklist: next });
  };

  const toggleChecklist = async (id: string) => {
    const next = job.checklist.map((c) =>
      c.id === id ? { ...c, done: !c.done } : c
    );
    await onUpdateJob(job.id, { checklist: next });
  };

  const removeChecklist = async (id: string) => {
    const next = job.checklist.filter((c) => c.id !== id);
    await onUpdateJob(job.id, { checklist: next });
  };

  const handleSaveNotes = async () => {
    await onUpdateJob(job.id, { notes: notesDraft });
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  };

  const handleAddInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ivTitle.trim()) return;
    const newIv: InterviewItem = {
      id: `iv-${Date.now()}`,
      title: ivTitle.trim(),
      type: ivType,
      date: ivDate,
      time: ivTime,
      locationOrLink: ivLink.trim(),
      interviewer: ivInterviewer.trim(),
      status: 'scheduled',
      notes: ivNotes.trim(),
    };
    await onUpdateJob(job.id, { interviews: [...job.interviews, newIv] });
    setAddingIv(false);
    setIvTitle('');
    setIvLink('');
    setIvInterviewer('');
    setIvNotes('');
  };

  const toggleInterviewStatus = async (ivId: string) => {
    const next = job.interviews.map((iv) =>
      iv.id === ivId
        ? { ...iv, status: (iv.status === 'done' ? 'scheduled' : 'done') as 'done' | 'scheduled' }
        : iv
    );
    await onUpdateJob(job.id, { interviews: next });
  };

  const deleteInterview = async (ivId: string) => {
    const next = job.interviews.filter((iv) => iv.id !== ivId);
    await onUpdateJob(job.id, { interviews: next });
  };

  const shiftFollowUpDays = async (days: number | null) => {
    if (days === null) {
      await onUpdateJob(job.id, { followUpDate: '' });
      return;
    }
    const d = new Date();
    d.setDate(d.getDate() + days);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    await onUpdateJob(job.id, { followUpDate: `${yyyy}-${mm}-${dd}` });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#1C1917]/60 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-job-title"
        className="flex h-full w-full max-w-2xl flex-col border-l border-[#D6CFC2] bg-[#FAF6F0] shadow-2xl dark:border-[#38332E] dark:bg-[#1A1715]"
      >
        {/* Top Bar */}
        <div className="border-b border-[#D6CFC2] bg-white px-5 py-4 dark:border-[#38332E] dark:bg-[#211E1B]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono-num text-xs font-bold uppercase tracking-wider text-[#C2410C] dark:text-[#FB923C]">
                  {job.company}
                </span>
                <span
                  className={`rounded border px-2 py-0.5 text-[11px] font-bold ${
                    PRIORITY_META[job.priority].badge
                  }`}
                >
                  {PRIORITY_META[job.priority].label}
                </span>
              </div>
              <h2
                id="drawer-job-title"
                className="font-editorial mt-1 text-xl font-bold text-[#1C1917] dark:text-[#F5F5F4]"
              >
                {job.position}
              </h2>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => onUpdateJob(job.id, { pinned: !job.pinned })}
                aria-label={job.pinned ? 'Lepas favorit' : 'Jadikan favorit'}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-[#A8A29E] bg-[#FAF6F0] text-[#44403C] hover:bg-[#EFE8DC] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#D6D3D1]"
              >
                <Star
                  className={`h-4 w-4 ${job.pinned ? 'fill-[#D97706] text-[#B45309]' : ''}`}
                  aria-hidden="true"
                />
              </button>
              <button
                type="button"
                onClick={() => onEdit(job)}
                aria-label="Edit semua data loker"
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-xs font-bold text-[#1C1917] hover:bg-[#EFE8DC] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={async () => {
                  await onDelete(job.id);
                  onClose();
                }}
                aria-label="Hapus loker ini"
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-[#FDA4AF] bg-[#FFE4E6] text-[#BE123C] hover:bg-[#FECDD3] dark:border-[#9F1239] dark:bg-[#4C0519] dark:text-[#FFE4E6]"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup panel detail"
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-[#A8A29E] bg-[#FAF6F0] text-[#1C1917] hover:bg-[#EFE8DC] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <label
                htmlFor="drawer-stage-select"
                className="text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]"
              >
                Tahapan:
              </label>
              <select
                id="drawer-stage-select"
                value={job.stage}
                onChange={(e) => onUpdateJob(job.id, { stage: e.target.value })}
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
            </div>

            {job.jobUrl && (
              <a
                href={job.jobUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3.5 py-2 text-xs font-bold text-[#1C1917] hover:bg-[#EFE8DC] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
              >
                <span>Buka Iklan Loker</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}
          </div>

          <div
            role="tablist"
            aria-label="Bagian rincian lamaran"
            className="mt-4 grid grid-cols-2 gap-1.5 border-t border-[#E6DFD3] pt-2.5 sm:flex sm:overflow-x-auto dark:border-[#38332E]"
          >
            {[
              { id: 'overview', label: `01. Ringkasan (${job.checklist.length})` },
              { id: 'interviews', label: `02. Jadwal (${job.interviews.length})` },
              { id: 'followup', label: '03. Follow-Up HR' },
              { id: 'history', label: `04. Riwayat (${job.history.length})` },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() =>
                  setTab(t.id as 'overview' | 'interviews' | 'followup' | 'history')
                }
                className={`min-h-[44px] rounded-lg border px-3 py-2 text-xs font-bold transition sm:shrink-0 ${
                  tab === t.id
                    ? 'border-[#1C1917] bg-[#1C1917] text-[#FAF6F0] dark:border-[#F5F5F4] dark:bg-[#F5F5F4] dark:text-[#161412]'
                    : 'border-[#D6CFC2] bg-[#FAF6F0] text-[#44403C] hover:bg-[#EFE8DC] dark:border-[#38332E] dark:bg-[#161412] dark:text-[#D6D3D1]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 space-y-6 overflow-y-auto p-5 pb-12 sm:p-6">
          {tab === 'overview' && (
            <>
              <div className="grid grid-cols-1 gap-3 rounded-xl border border-[#D6CFC2] bg-white p-4 text-xs dark:border-[#38332E] dark:bg-[#211E1B] sm:grid-cols-2">
                <div>
                  <span className="font-mono-num text-[11px] font-bold uppercase text-[#57534E] dark:text-[#A8A29E]">
                    SISTEM & LOKASI
                  </span>
                  <p className="mt-0.5 font-bold text-[#1C1917] dark:text-[#F5F5F4]">
                    {job.workMode} • {job.employmentType}
                    {job.location ? ` (${job.location})` : ''}
                  </p>
                </div>

                <div>
                  <span className="font-mono-num text-[11px] font-bold uppercase text-[#57534E] dark:text-[#A8A29E]">
                    TANGGAL ({job.platform})
                  </span>
                  <p className="font-mono-num mt-0.5 font-bold text-[#1C1917] dark:text-[#F5F5F4]">
                    Apply: {formatDateID(job.appliedDate, true)}
                    {job.deadlineDate
                      ? ` • Batas: ${formatDateID(job.deadlineDate, true)}`
                      : ''}
                  </p>
                </div>

                <div>
                  <span className="font-mono-num text-[11px] font-bold uppercase text-[#57534E] dark:text-[#A8A29E]">
                    KOMPENSASI ({job.currency})
                  </span>
                  <p className="font-mono-num mt-0.5 font-bold text-[#1C1917] dark:text-[#F5F5F4]">
                    Rentang:{' '}
                    {job.salaryMin || job.salaryMax
                      ? `${formatCurrency(job.salaryMin, job.currency, true)} s/d ${formatCurrency(job.salaryMax, job.currency, true)}`
                      : '-'}
                  </p>
                  <p className="font-mono-num text-[#44403C] dark:text-[#D6D3D1]">
                    Ekspektasi: {formatCurrency(job.salaryExpected, job.currency, true)}
                    {job.salaryOffered
                      ? ` • Offer: ${formatCurrency(job.salaryOffered, job.currency, true)}`
                      : ''}
                  </p>
                </div>

                <div>
                  <span className="font-mono-num text-[11px] font-bold uppercase text-[#57534E] dark:text-[#A8A29E]">
                    DOKUMEN & KONTAK HR
                  </span>
                  <p className="mt-0.5 font-bold text-[#1C1917] dark:text-[#F5F5F4]">
                    {usedDoc ? usedDoc.title : 'CV belum dipilih'}
                  </p>
                  {job.hrName && (
                    <p className="text-[#44403C] dark:text-[#D6D3D1]">
                      HR: {job.hrName} {job.hrContact ? `(${job.hrContact})` : ''}
                    </p>
                  )}
                </div>
              </div>

              {job.benefits && (
                <div className="rounded-lg border border-[#059669] bg-[#D1FAE5]/60 px-4 py-3 text-xs dark:bg-[#064E3B]/40">
                  <span className="font-bold text-[#064E3B] dark:text-[#D1FAE5]">
                    Benefit & Fasilitas:{' '}
                  </span>
                  <span className="text-[#064E3B] dark:text-[#D1FAE5]">
                    {job.benefits}
                  </span>
                </div>
              )}

              {job.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded border border-[#D6CFC2] bg-white px-2.5 py-1 text-xs font-bold text-[#1C1917] dark:border-[#38332E] dark:bg-[#211E1B] dark:text-[#F5F5F4]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {/* Checklist Persiapan */}
              <section className="rounded-xl border border-[#D6CFC2] bg-white p-4 dark:border-[#38332E] dark:bg-[#211E1B]">
                <h3 className="font-editorial text-base font-bold text-[#1C1917] dark:text-[#F5F5F4]">
                  Checklist Persiapan & Tugas Loker Ini
                </h3>
                <div className="mt-3 space-y-2">
                  {job.checklist.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-[#E6DFD3] bg-[#FAF6F0] px-3 py-1.5 dark:border-[#38332E] dark:bg-[#161412]"
                    >
                      <label className="flex min-h-[40px] flex-1 items-center gap-2.5 text-xs">
                        <input
                          type="checkbox"
                          checked={item.done}
                          onChange={() => toggleChecklist(item.id)}
                          className="h-4 w-4 rounded"
                        />
                        <span
                          className={
                            item.done
                              ? 'line-through text-[#57534E] dark:text-[#A8A29E]'
                              : 'font-bold text-[#1C1917] dark:text-[#F5F5F4]'
                          }
                        >
                          {item.text}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => removeChecklist(item.id)}
                        aria-label={`Hapus tugas ${item.text}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded text-sm font-bold text-[#57534E] hover:bg-[#FFE4E6] hover:text-[#BE123C]"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <form onSubmit={addChecklistItem} className="mt-3">
                  <label
                    htmlFor="drawer-new-task"
                    className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]"
                  >
                    Tambah Tugas Persiapan
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="drawer-new-task"
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      placeholder="Contoh: Pelajari produk perusahaan, kirim tugas teknis..."
                      className="min-h-[44px] flex-1 rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-xs text-[#1C1917] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                    />
                    <button
                      type="submit"
                      className="inline-flex min-h-[44px] items-center gap-1 rounded-lg bg-[#1C1917] px-4 py-2 text-xs font-bold text-[#FAF6F0] hover:bg-[#292524] dark:bg-[#C2410C] dark:text-white"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      <span>Tambah</span>
                    </button>
                  </div>
                </form>
              </section>

              {/* Catatan Cepat */}
              <section className="space-y-2 rounded-xl border border-[#D6CFC2] bg-white p-4 dark:border-[#38332E] dark:bg-[#211E1B]">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="drawer-notes"
                    className="font-editorial text-base font-bold text-[#1C1917] dark:text-[#F5F5F4]"
                  >
                    Catatan Pribadi & Evaluasi Interview
                  </label>
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-[#C2410C] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#9A3412]"
                  >
                    {notesSaved ? (
                      <>
                        <Check className="h-4 w-4" aria-hidden="true" />
                        <span>Tersimpan</span>
                      </>
                    ) : (
                      <span>Simpan Catatan</span>
                    )}
                  </button>
                </div>
                <textarea
                  id="drawer-notes"
                  rows={4}
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  placeholder="Tulis poin hasil diskusi HR/User, pertanyaan yang muncul, atau strategi negosiasi..."
                  className="w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] p-3 text-xs leading-relaxed text-[#1C1917] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                />
              </section>

              {job.jobDescription && (
                <section className="space-y-1.5 rounded-xl border border-[#D6CFC2] bg-white p-4 dark:border-[#38332E] dark:bg-[#211E1B]">
                  <h3 className="font-editorial text-base font-bold text-[#1C1917] dark:text-[#F5F5F4]">
                    Arsip Job Description & Kualifikasi
                  </h3>
                  <div className="whitespace-pre-wrap rounded-lg border border-[#E6DFD3] bg-[#FAF6F0] p-3.5 text-xs leading-relaxed text-[#44403C] dark:border-[#38332E] dark:bg-[#161412] dark:text-[#D6D3D1]">
                    {job.jobDescription}
                  </div>
                </section>
              )}
            </>
          )}

          {tab === 'interviews' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-editorial text-base font-bold text-[#1C1917] dark:text-[#F5F5F4]">
                    Jadwal Interview, Psikotes & Technical Test
                  </h3>
                  <p className="text-xs text-[#44403C] dark:text-[#D6D3D1]">
                    Otomatis tampil di menu Kalender dan pengingat Meja Fokus.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAddingIv(!addingIv)}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-[#C2410C] px-4 py-2 text-xs font-bold text-white hover:bg-[#9A3412]"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>Tambah Jadwal</span>
                </button>
              </div>

              {addingIv && (
                <form
                  onSubmit={handleAddInterview}
                  className="space-y-3 rounded-xl border-2 border-[#C2410C] bg-white p-4 dark:border-[#FB923C] dark:bg-[#211E1B]"
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="iv-title" className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]">
                        Nama Sesi *
                      </label>
                      <input
                        id="iv-title"
                        required
                        value={ivTitle}
                        onChange={(e) => setIvTitle(e.target.value)}
                        placeholder="Contoh: User Interview bersama Tech Lead"
                        className="min-h-[44px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-xs text-[#1C1917] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                      />
                    </div>
                    <div>
                      <label htmlFor="iv-type" className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]">
                        Jenis Tahap
                      </label>
                      <select
                        id="iv-type"
                        value={ivType}
                        onChange={(e) => setIvType(e.target.value)}
                        className="min-h-[44px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-xs font-bold text-[#1C1917] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                      >
                        <option value="HR Interview">HR Interview</option>
                        <option value="Psikotes / Online Test">Psikotes / Online Test</option>
                        <option value="Technical Test">Technical Test / Live Coding</option>
                        <option value="User Interview">User Interview</option>
                        <option value="Director / C-Level">Director / C-Level Interview</option>
                        <option value="Offering Call">Offering Discussion</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="iv-date" className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]">
                        Tanggal
                      </label>
                      <input
                        id="iv-date"
                        type="date"
                        value={ivDate}
                        onChange={(e) => setIvDate(e.target.value)}
                        className="font-mono-num min-h-[44px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-xs text-[#1C1917] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                      />
                    </div>
                    <div>
                      <label htmlFor="iv-time" className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]">
                        Jam (WIB)
                      </label>
                      <input
                        id="iv-time"
                        type="time"
                        value={ivTime}
                        onChange={(e) => setIvTime(e.target.value)}
                        className="font-mono-num min-h-[44px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-xs text-[#1C1917] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                      />
                    </div>
                    <div>
                      <label htmlFor="iv-link" className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]">
                        Tautan Meeting / Lokasi Kantor
                      </label>
                      <input
                        id="iv-link"
                        value={ivLink}
                        onChange={(e) => setIvLink(e.target.value)}
                        placeholder="https://meet.google.com/... atau Gedung X"
                        className="min-h-[44px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-xs text-[#1C1917] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                      />
                    </div>
                    <div>
                      <label htmlFor="iv-who" className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]">
                        Nama Pewawancara
                      </label>
                      <input
                        id="iv-who"
                        value={ivInterviewer}
                        onChange={(e) => setIvInterviewer(e.target.value)}
                        placeholder="Nama Pewawancara"
                        className="min-h-[44px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-xs text-[#1C1917] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="iv-notes" className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]">
                      Catatan Persiapan / Kisi-kisi
                    </label>
                    <input
                      id="iv-notes"
                      value={ivNotes}
                      onChange={(e) => setIvNotes(e.target.value)}
                      placeholder="Durasi 60 menit, siapkan studi kasus portofolio..."
                      className="min-h-[44px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-xs text-[#1C1917] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setAddingIv(false)}
                      className="min-h-[44px] rounded-lg border border-[#A8A29E] px-4 py-2 text-xs font-bold text-[#1C1917] dark:border-[#57534E] dark:text-[#F5F5F4]"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="min-h-[44px] rounded-lg bg-[#C2410C] px-4 py-2 text-xs font-bold text-white hover:bg-[#9A3412]"
                    >
                      Simpan Jadwal
                    </button>
                  </div>
                </form>
              )}

              {job.interviews.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#A8A29E] bg-white p-8 text-center text-xs font-semibold text-[#44403C] dark:border-[#57534E] dark:bg-[#211E1B] dark:text-[#D6D3D1]">
                  Belum ada sesi interview atau tes yang dicatat untuk lamaran ini. Klik tombol Tambah Jadwal di atas saat Anda menerima undangan seleksi.
                </div>
              ) : (
                <div className="space-y-3">
                  {job.interviews.map((iv) => (
                    <div
                      key={iv.id}
                      className="rounded-xl border border-[#D6CFC2] bg-white p-4 dark:border-[#38332E] dark:bg-[#211E1B]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span
                            className={`inline-block rounded border px-2 py-0.5 text-[11px] font-bold ${
                              iv.status === 'done'
                                ? 'border-[#059669] bg-[#D1FAE5] text-[#064E3B] dark:bg-[#064E3B] dark:text-[#D1FAE5]'
                                : 'border-[#9333EA] bg-[#F3E8FF] text-[#3B0764] dark:bg-[#3B0764] dark:text-[#F3E8FF]'
                            }`}
                          >
                            {iv.status === 'done' ? 'SELESAI' : 'TERJADWAL'} • {iv.type}
                          </span>
                          <h4 className="font-editorial mt-1.5 text-base font-bold text-[#1C1917] dark:text-[#F5F5F4]">
                            {iv.title}
                          </h4>
                          <p className="font-mono-num mt-0.5 text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]">
                            {formatDateID(iv.date)} • Pukul {iv.time}
                            {iv.interviewer ? ` • Pewawancara: ${iv.interviewer}` : ''}
                          </p>
                          {iv.locationOrLink && (
                            <p className="mt-1 text-xs font-bold text-[#C2410C] dark:text-[#FB923C]">
                              Lokasi / Tautan: {iv.locationOrLink}
                            </p>
                          )}
                          {iv.notes && (
                            <p className="mt-1.5 text-xs text-[#44403C] dark:text-[#D6D3D1]">
                              {iv.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex shrink-0 items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => toggleInterviewStatus(iv.id)}
                            className="min-h-[44px] rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-1.5 text-xs font-bold text-[#1C1917] hover:bg-[#EFE8DC] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                          >
                            {iv.status === 'done' ? 'Tandai Belum' : 'Tandai Selesai'}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteInterview(iv.id)}
                            aria-label={`Hapus jadwal ${iv.title}`}
                            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-[#BE123C] hover:bg-[#FFE4E6]"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'followup' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#D6CFC2] bg-white p-4 dark:border-[#38332E] dark:bg-[#211E1B]">
                <h3 className="font-mono-num text-xs font-bold uppercase tracking-wider text-[#57534E] dark:text-[#A8A29E]">
                  KONTAK RECRUITER & JADWAL FOLLOW-UP
                </h3>
                <p className="mt-1.5 text-xs text-[#1C1917] dark:text-[#F5F5F4]">
                  Perekrut:{' '}
                  <strong>{job.hrName || 'Belum diisi (klik Edit untuk menambah)'}</strong>
                  {job.hrContact ? ` • ${job.hrContact}` : ''}
                </p>
                <p className="mt-1 text-xs text-[#1C1917] dark:text-[#F5F5F4]">
                  Jadwal Follow-Up saat ini:{' '}
                  <strong className="font-mono-num">{formatDateID(job.followUpDate)}</strong>
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => shiftFollowUpDays(3)}
                    className="min-h-[44px] rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3.5 py-2 text-xs font-bold text-[#1C1917] hover:bg-[#EFE8DC] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                  >
                    Ingatkan +3 Hari Lagi
                  </button>
                  <button
                    type="button"
                    onClick={() => shiftFollowUpDays(7)}
                    className="min-h-[44px] rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3.5 py-2 text-xs font-bold text-[#1C1917] hover:bg-[#EFE8DC] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                  >
                    Sudah Follow-Up (Ingatkan +7 Hari)
                  </button>
                  {job.followUpDate && (
                    <button
                      type="button"
                      onClick={() => shiftFollowUpDays(null)}
                      className="min-h-[44px] rounded-lg border border-[#A8A29E] bg-white px-3.5 py-2 text-xs font-bold text-[#44403C] hover:bg-[#EFE8DC] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#D6D3D1]"
                    >
                      Hapus Pengingat
                    </button>
                  )}
                </div>
              </div>

              {activeTemplate ? (
                <div className="space-y-3 rounded-xl border border-[#D6CFC2] bg-white p-4 dark:border-[#38332E] dark:bg-[#211E1B]">
                  <div>
                    <label
                      htmlFor="drawer-tpl-select"
                      className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]"
                    >
                      Pilih Template Pesan
                    </label>
                    <select
                      id="drawer-tpl-select"
                      value={activeTemplate.id}
                      onChange={(e) => setSelectedTplId(e.target.value)}
                      className="min-h-[44px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-xs font-bold text-[#1C1917] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                    >
                      {templates.map((t) => (
                        <option key={t.id} value={t.id}>
                          [{t.category}] {t.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {activeTemplate.subject && (
                    <div className="rounded-lg border border-[#E6DFD3] bg-[#FAF6F0] px-3.5 py-2 text-xs font-bold text-[#1C1917] dark:border-[#38332E] dark:bg-[#161412] dark:text-[#F5F5F4]">
                      Subjek:{' '}
                      {renderMessageTemplate(
                        activeTemplate.subject,
                        job,
                        settings.profile
                      )}
                    </div>
                  )}

                  <pre className="whitespace-pre-wrap rounded-lg border border-[#E6DFD3] bg-[#FAF6F0] p-4 font-sans text-xs leading-relaxed text-[#1C1917] dark:border-[#38332E] dark:bg-[#161412] dark:text-[#F5F5F4]">
                    {renderMessageTemplate(activeTemplate.body, job, settings.profile)}
                  </pre>

                  <button
                    type="button"
                    onClick={async () => {
                      const subj = renderMessageTemplate(
                        activeTemplate.subject,
                        job,
                        settings.profile
                      );
                      const body = renderMessageTemplate(
                        activeTemplate.body,
                        job,
                        settings.profile
                      );
                      await navigator.clipboard.writeText(
                        subj ? `${subj}\n\n${body}` : body
                      );
                      setCopiedFollowUp(true);
                      setTimeout(() => setCopiedFollowUp(false), 2000);
                    }}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#C2410C] px-4 py-2 text-xs font-bold text-white hover:bg-[#9A3412]"
                  >
                    {copiedFollowUp ? (
                      <>
                        <Check className="h-4 w-4" aria-hidden="true" />
                        <span>Pesan Tersalin ke Clipboard</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" aria-hidden="true" />
                        <span>Salin Pesan untuk {job.company}</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <p className="text-xs text-[#44403C] dark:text-[#D6D3D1]">
                  Belum ada template pesan. Buat template di menu Master CV & Pesan HR.
                </p>
              )}
            </div>
          )}

          {tab === 'history' && (
            <div className="space-y-3 rounded-xl border border-[#D6CFC2] bg-white p-5 dark:border-[#38332E] dark:bg-[#211E1B]">
              <h3 className="font-editorial text-base font-bold text-[#1C1917] dark:text-[#F5F5F4]">
                Jejak Progres Lamaran
              </h3>
              <ol className="relative ml-3 space-y-4 border-l-2 border-[#D6CFC2] pl-5 dark:border-[#38332E]">
                {job.history.map((h) => {
                  const st = getStageMeta(settings.stages, h.stage);
                  return (
                    <li key={h.id} className="relative">
                      <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white bg-[#C2410C] dark:border-[#211E1B] dark:bg-[#FB923C]" />
                      <p className="text-xs font-bold text-[#1C1917] dark:text-[#F5F5F4]">
                        {st.label}
                      </p>
                      <p className="text-xs text-[#44403C] dark:text-[#D6D3D1]">
                        {h.note}
                      </p>
                      <span className="font-mono-num mt-0.5 block text-[11px] font-semibold text-[#57534E] dark:text-[#A8A29E]">
                        {formatDateID(h.timestamp)}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
