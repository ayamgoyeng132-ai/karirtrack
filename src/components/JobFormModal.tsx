import React, { useEffect, useState } from 'react';
import {
  X,
  Star,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Check,
} from 'lucide-react';
import type {
  AppSettings,
  DocumentItem,
  JobApplication,
  PriorityLevel,
} from '../types';
import { formatCurrency, todayISO } from '../utils/format';

interface JobFormModalProps {
  open: boolean;
  initialJob: JobApplication | null;
  defaultStage?: string;
  settings: AppSettings;
  documents: DocumentItem[];
  onClose: () => void;
  onSubmit: (payload: Partial<JobApplication>) => Promise<void>;
}

function offsetDateISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const QUICK_IDR_AMOUNTS = [
  { label: '6 jt', value: 6000000 },
  { label: '8 jt', value: 8000000 },
  { label: '10 jt', value: 10000000 },
  { label: '12 jt', value: 12000000 },
  { label: '15 jt', value: 15000000 },
  { label: '20 jt', value: 20000000 },
  { label: '25 jt', value: 25000000 },
];

export const JobFormModal: React.FC<JobFormModalProps> = ({
  open,
  initialJob,
  defaultStage,
  settings,
  documents,
  onClose,
  onSubmit,
}) => {
  const sortedStages = [...settings.stages].sort((a, b) => a.order - b.order);
  const defaultDoc = documents.find((d) => d.isDefault)?.id || '';

  const [saving, setSaving] = useState(false);
  const [showCompSection, setShowCompSection] = useState(true);
  const [showHrSection, setShowHrSection] = useState(false);

  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [workMode, setWorkMode] = useState(settings.workModes[0] || 'Hybrid');
  const [employmentType, setEmploymentType] = useState(
    settings.employmentTypes[0] || 'Full-time'
  );
  const [stage, setStage] = useState(defaultStage || sortedStages[1]?.id || 'applied');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [pinned, setPinned] = useState(false);
  const [platform, setPlatform] = useState(settings.platforms[0] || 'LinkedIn');
  const [jobUrl, setJobUrl] = useState('');
  const [appliedDate, setAppliedDate] = useState(todayISO());
  const [deadlineDate, setDeadlineDate] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  const [currency, setCurrency] = useState(settings.preferences.defaultCurrency || 'IDR');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [salaryExpected, setSalaryExpected] = useState('');
  const [salaryOffered, setSalaryOffered] = useState('');
  const [benefits, setBenefits] = useState('');
  const [documentId, setDocumentId] = useState(defaultDoc);
  const [coverLetterUsed, setCoverLetterUsed] = useState(false);

  const [hrName, setHrName] = useState('');
  const [hrRole, setHrRole] = useState('');
  const [hrContact, setHrContact] = useState('');
  const [referrerName, setReferrerName] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!open) return;
    if (initialJob) {
      setShowCompSection(true);
      setShowHrSection(
        Boolean(
          initialJob.hrName ||
            initialJob.hrContact ||
            initialJob.jobDescription ||
            initialJob.skills.length > 0
        )
      );
      setCompany(initialJob.company);
      setPosition(initialJob.position);
      setDepartment(initialJob.department);
      setLocation(initialJob.location);
      setWorkMode(initialJob.workMode);
      setEmploymentType(initialJob.employmentType);
      setStage(initialJob.stage);
      setPriority(initialJob.priority);
      setPinned(initialJob.pinned);
      setPlatform(initialJob.platform);
      setJobUrl(initialJob.jobUrl);
      setAppliedDate(initialJob.appliedDate);
      setDeadlineDate(initialJob.deadlineDate);
      setFollowUpDate(initialJob.followUpDate);
      setCurrency(initialJob.currency || settings.preferences.defaultCurrency);
      setSalaryMin(initialJob.salaryMin !== null ? String(initialJob.salaryMin) : '');
      setSalaryMax(initialJob.salaryMax !== null ? String(initialJob.salaryMax) : '');
      setSalaryExpected(
        initialJob.salaryExpected !== null ? String(initialJob.salaryExpected) : ''
      );
      setSalaryOffered(
        initialJob.salaryOffered !== null ? String(initialJob.salaryOffered) : ''
      );
      setBenefits(initialJob.benefits);
      setDocumentId(initialJob.documentId);
      setCoverLetterUsed(initialJob.coverLetterUsed);
      setHrName(initialJob.hrName);
      setHrRole(initialJob.hrRole);
      setHrContact(initialJob.hrContact);
      setReferrerName(initialJob.referrerName);
      setSkillsInput(initialJob.skills.join(', '));
      setJobDescription(initialJob.jobDescription);
      setNotes(initialJob.notes);
    } else {
      const initStage = defaultStage || 'applied';
      setShowCompSection(true);
      setShowHrSection(false);
      setCompany('');
      setPosition('');
      setDepartment('');
      setLocation('');
      setWorkMode(settings.workModes[1] || settings.workModes[0] || 'Hybrid');
      setEmploymentType(settings.employmentTypes[0] || 'Full-time');
      setStage(initStage);
      setPriority('medium');
      setPinned(false);
      setPlatform(settings.platforms[0] || 'LinkedIn');
      setJobUrl('');
      setAppliedDate(initStage === 'wishlist' ? '' : todayISO());
      setDeadlineDate('');
      setFollowUpDate(initStage === 'wishlist' ? '' : offsetDateISO(settings.preferences.followUpDays || 7));
      setCurrency(settings.preferences.defaultCurrency || 'IDR');
      setSalaryMin('');
      setSalaryMax('');
      setSalaryExpected('');
      setSalaryOffered('');
      setBenefits('');
      setDocumentId(defaultDoc);
      setCoverLetterUsed(false);
      setHrName('');
      setHrRole('');
      setHrContact('');
      setReferrerName('');
      setSkillsInput('');
      setJobDescription('');
      setNotes('');
    }
  }, [open, initialJob, defaultStage, settings, defaultDoc]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !position.trim()) {
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        company: company.trim(),
        position: position.trim(),
        department: department.trim(),
        location: location.trim(),
        workMode,
        employmentType,
        stage,
        priority,
        pinned,
        platform,
        jobUrl: jobUrl.trim(),
        appliedDate,
        deadlineDate,
        followUpDate,
        currency,
        salaryMin: salaryMin ? Number(salaryMin) : null,
        salaryMax: salaryMax ? Number(salaryMax) : null,
        salaryExpected: salaryExpected ? Number(salaryExpected) : null,
        salaryOffered: salaryOffered ? Number(salaryOffered) : null,
        benefits: benefits.trim(),
        documentId,
        coverLetterUsed,
        hrName: hrName.trim(),
        hrRole: hrRole.trim(),
        hrContact: hrContact.trim(),
        referrerName: referrerName.trim(),
        skills: skillsInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        jobDescription: jobDescription.trim(),
        notes: notes.trim(),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-[#1C1917]/60 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-modal-title"
        className="flex h-[100dvh] w-full max-w-3xl flex-col overflow-hidden bg-[#FAF6F0] sm:h-auto sm:max-h-[92dvh] sm:rounded-xl sm:border sm:border-[#D6CFC2] sm:shadow-2xl dark:bg-[#161412] dark:sm:border-[#38332E]"
      >
        {/* Sticky Mobile-First Top Bar: Back/Close on left, Title in middle, Save & Pin on right */}
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#D6CFC2] bg-white px-3 py-2.5 sm:px-6 sm:py-4 dark:border-[#38332E] dark:bg-[#211E1B]">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              aria-label="Kembali dan tutup formulir"
              className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg border border-[#A8A29E] bg-[#FAF6F0] text-[#1C1917] hover:bg-[#EFE8DC] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
            >
              <ArrowLeft className="h-5 w-5 sm:hidden" aria-hidden="true" />
              <X className="hidden h-5 w-5 sm:block" aria-hidden="true" />
            </button>
            <div className="min-w-0">
              <h2
                id="job-modal-title"
                className="font-editorial text-sm font-bold leading-tight text-[#1C1917] sm:text-xl dark:text-[#F5F5F4]"
              >
                {initialJob ? 'Edit Lamaran Kerja' : 'Catat Loker Baru'}
              </h2>
              <p className="hidden text-xs text-[#44403C] sm:block dark:text-[#D6D3D1]">
                Isi Perusahaan dan Posisi untuk simpan cepat, atau gulir ke bawah untuk rincian lengkap.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setPinned(!pinned)}
              aria-label="Tandai sebagai favorit"
              aria-pressed={pinned}
              className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border transition ${
                pinned
                  ? 'border-[#B45309] bg-[#FEF3C7] text-[#B45309] dark:border-[#F59E0B] dark:bg-[#451A03]'
                  : 'border-[#A8A29E] bg-[#FAF6F0] text-[#57534E] hover:bg-[#EFE8DC] dark:border-[#57534E] dark:bg-[#161412]'
              }`}
            >
              <Star
                className={`h-4 w-4 ${pinned ? 'fill-[#D97706] text-[#B45309]' : ''}`}
                aria-hidden="true"
              />
            </button>

            <button
              type="submit"
              form="karirtrack-job-form"
              disabled={saving}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-[#C2410C] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#9A3412] active:bg-[#7C2D12] disabled:opacity-50 sm:px-4"
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              <span>{saving ? 'Menyimpan...' : 'Simpan'}</span>
            </button>
          </div>
        </div>

        {/* Single-Page Progressive Scrollable Form (No hidden tabs that lose context on mobile) */}
        <form
          id="karirtrack-job-form"
          onSubmit={handleSubmit}
          className="flex-1 space-y-5 overflow-y-auto p-4 pb-28 sm:p-6 sm:pb-8"
        >
          {/* SECTION 1: Data Inti Lamaran (Always Open, 1-Tap Touch Controls) */}
          <section
            aria-label="Informasi Utama Lowongan"
            className="space-y-4 rounded-xl border border-[#D6CFC2] bg-white p-4 sm:p-5 dark:border-[#38332E] dark:bg-[#211E1B]"
          >
            <div className="flex items-center justify-between border-b border-[#E6DFD3] pb-2.5 dark:border-[#38332E]">
              <span className="font-mono-num text-xs font-bold uppercase tracking-wider text-[#C2410C] dark:text-[#FB923C]">
                01 / DATA UTAMA (WAJIB)
              </span>
              <span className="text-[11px] font-semibold text-[#57534E] dark:text-[#A8A29E]">
                Cukup 2 kolom ini untuk simpan cepat
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="jf-company"
                  className="mb-1.5 block text-xs font-bold text-[#1C1917] dark:text-[#F5F5F4]"
                >
                  Nama Perusahaan *
                </label>
                <input
                  id="jf-company"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Contoh: PT Bank Central Asia / GoTo"
                  className="min-h-[48px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3.5 py-2.5 text-base font-semibold text-[#1C1917] placeholder:font-normal placeholder:text-[#57534E] sm:text-sm dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4] dark:placeholder:text-[#A8A29E]"
                />
              </div>

              <div>
                <label
                  htmlFor="jf-position"
                  className="mb-1.5 block text-xs font-bold text-[#1C1917] dark:text-[#F5F5F4]"
                >
                  Posisi yang Dilamar *
                </label>
                <input
                  id="jf-position"
                  required
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Contoh: Frontend Engineer / Admin"
                  className="min-h-[48px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3.5 py-2.5 text-base font-semibold text-[#1C1917] placeholder:font-normal placeholder:text-[#57534E] sm:text-sm dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4] dark:placeholder:text-[#A8A29E]"
                />
              </div>
            </div>

            {/* 1-Tap Touch Pills for Tahapan Seleksi */}
            <div>
              <label
                htmlFor="jf-stage"
                className="mb-1.5 block text-xs font-bold text-[#1C1917] dark:text-[#F5F5F4]"
              >
                Tahapan Saat Ini
              </label>
              <div
                role="radiogroup"
                aria-label="Pilih tahapan saat ini"
                className="grid grid-cols-2 gap-2 sm:grid-cols-4"
              >
                {sortedStages.map((s) => {
                  const active = stage === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => {
                        setStage(s.id);
                        if (s.id !== 'wishlist' && !appliedDate) {
                          setAppliedDate(todayISO());
                        }
                      }}
                      className={`min-h-[48px] rounded-lg border px-2.5 py-2 text-left text-xs font-bold leading-snug transition ${
                        active
                          ? 'border-2 border-[#C2410C] bg-[#FFEDD5] text-[#431407] dark:border-[#FB923C] dark:bg-[#431407] dark:text-[#FFEDD5]'
                          : 'border-[#D6CFC2] bg-[#FAF6F0] text-[#44403C] hover:bg-[#EFE8DC] dark:border-[#38332E] dark:bg-[#161412] dark:text-[#D6D3D1]'
                      }`}
                    >
                      <span>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 1-Tap Segmented Buttons for Sistem Kerja & Prioritas */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <span className="mb-1.5 block text-xs font-bold text-[#1C1917] dark:text-[#F5F5F4]">
                  Sistem Kerja
                </span>
                <div
                  role="radiogroup"
                  aria-label="Pilih sistem kerja"
                  className="grid grid-cols-3 gap-2"
                >
                  {settings.workModes.map((wm) => {
                    const active = workMode === wm;
                    return (
                      <button
                        key={wm}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setWorkMode(wm)}
                        className={`min-h-[44px] rounded-lg border px-2 py-2 text-center text-xs font-bold transition ${
                          active
                            ? 'border-[#1C1917] bg-[#1C1917] text-[#FAF6F0] dark:border-[#F5F5F4] dark:bg-[#F5F5F4] dark:text-[#161412]'
                            : 'border-[#D6CFC2] bg-[#FAF6F0] text-[#44403C] hover:bg-[#EFE8DC] dark:border-[#38332E] dark:bg-[#161412] dark:text-[#D6D3D1]'
                        }`}
                      >
                        {wm.replace(' (On-site)', '')}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="mb-1.5 block text-xs font-bold text-[#1C1917] dark:text-[#F5F5F4]">
                  Prioritas Lamaran
                </span>
                <div
                  role="radiogroup"
                  aria-label="Pilih prioritas lamaran"
                  className="grid grid-cols-3 gap-2"
                >
                  {(
                    [
                      { id: 'high', label: 'Tinggi' },
                      { id: 'medium', label: 'Sedang' },
                      { id: 'low', label: 'Rendah' },
                    ] as const
                  ).map((p) => {
                    const active = priority === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setPriority(p.id)}
                        className={`min-h-[44px] rounded-lg border px-2 py-2 text-center text-xs font-bold transition ${
                          active
                            ? 'border-[#1C1917] bg-[#1C1917] text-[#FAF6F0] dark:border-[#F5F5F4] dark:bg-[#F5F5F4] dark:text-[#161412]'
                            : 'border-[#D6CFC2] bg-[#FAF6F0] text-[#44403C] hover:bg-[#EFE8DC] dark:border-[#38332E] dark:bg-[#161412] dark:text-[#D6D3D1]'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Platform, Lokasi, Tipe Kontrak */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="jf-platform"
                  className="mb-1.5 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]"
                >
                  Sumber Platform Loker
                </label>
                <select
                  id="jf-platform"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="min-h-[48px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-base font-bold text-[#1C1917] sm:text-sm dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                >
                  {settings.platforms.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="jf-emptype"
                  className="mb-1.5 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]"
                >
                  Tipe Kontrak Kerja
                </label>
                <select
                  id="jf-emptype"
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="min-h-[48px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-base font-bold text-[#1C1917] sm:text-sm dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                >
                  {settings.employmentTypes.map((et) => (
                    <option key={et} value={et}>
                      {et}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="jf-location"
                  className="mb-1.5 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]"
                >
                  Lokasi Kota / Negara
                </label>
                <input
                  id="jf-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Contoh: Jakarta / Remote"
                  className="min-h-[48px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3.5 py-2 text-base text-[#1C1917] sm:text-sm dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                />
              </div>
            </div>

            {/* Tanggal Apply & Jadwal Follow-Up with 1-Tap Quick Chips */}
            <div className="grid grid-cols-1 gap-4 border-t border-[#E6DFD3] pt-4 sm:grid-cols-3 dark:border-[#38332E]">
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="jf-applied"
                    className="text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]"
                  >
                    Tanggal Apply
                  </label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setAppliedDate(todayISO())}
                      className="rounded border border-[#A8A29E] bg-[#F3EDE2] px-2 py-0.5 text-[11px] font-bold text-[#1C1917] dark:border-[#57534E] dark:bg-[#2A2622] dark:text-[#F5F5F4]"
                    >
                      Hari Ini
                    </button>
                    <button
                      type="button"
                      onClick={() => setAppliedDate(offsetDateISO(-1))}
                      className="rounded border border-[#A8A29E] bg-[#F3EDE2] px-2 py-0.5 text-[11px] font-bold text-[#1C1917] dark:border-[#57534E] dark:bg-[#2A2622] dark:text-[#F5F5F4]"
                    >
                      Kemarin
                    </button>
                  </div>
                </div>
                <input
                  id="jf-applied"
                  type="date"
                  value={appliedDate}
                  onChange={(e) => setAppliedDate(e.target.value)}
                  className="font-mono-num min-h-[48px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-base text-[#1C1917] sm:text-sm dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="jf-followup"
                    className="text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]"
                  >
                    Jadwal Follow-Up
                  </label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setFollowUpDate(offsetDateISO(3))}
                      className="rounded border border-[#A8A29E] bg-[#F3EDE2] px-2 py-0.5 text-[11px] font-bold text-[#1C1917] dark:border-[#57534E] dark:bg-[#2A2622] dark:text-[#F5F5F4]"
                    >
                      +3 Hr
                    </button>
                    <button
                      type="button"
                      onClick={() => setFollowUpDate(offsetDateISO(7))}
                      className="rounded border border-[#A8A29E] bg-[#F3EDE2] px-2 py-0.5 text-[11px] font-bold text-[#1C1917] dark:border-[#57534E] dark:bg-[#2A2622] dark:text-[#F5F5F4]"
                    >
                      +7 Hr
                    </button>
                  </div>
                </div>
                <input
                  id="jf-followup"
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="font-mono-num min-h-[48px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-base text-[#1C1917] sm:text-sm dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                />
              </div>

              <div>
                <label
                  htmlFor="jf-deadline"
                  className="mb-1.5 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]"
                >
                  Batas Waktu / Tes (Opsional)
                </label>
                <input
                  id="jf-deadline"
                  type="date"
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  className="font-mono-num min-h-[48px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-base text-[#1C1917] sm:text-sm dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="jf-url"
                className="mb-1.5 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]"
              >
                Tautan Iklan Loker (URL Opsional)
              </label>
              <input
                id="jf-url"
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://..."
                className="min-h-[48px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3.5 py-2 text-base text-[#1C1917] sm:text-sm dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
              />
            </div>
          </section>

          {/* SECTION 2: Gaji, Benefit & Versi CV (Collapsible, with 1-Tap IDR Quick Chips!) */}
          <section
            aria-label="Kompensasi Gaji dan Dokumen CV"
            className="rounded-xl border border-[#D6CFC2] bg-white dark:border-[#38332E] dark:bg-[#211E1B]"
          >
            <button
              type="button"
              onClick={() => setShowCompSection(!showCompSection)}
              aria-expanded={showCompSection}
              className="flex min-h-[52px] w-full items-center justify-between px-4 py-3 text-left sm:px-5"
            >
              <div>
                <span className="font-mono-num block text-xs font-bold uppercase tracking-wider text-[#57534E] dark:text-[#A8A29E]">
                  02 / GAJI, BENEFIT & DOKUMEN CV (OPSIONAL)
                </span>
                <span className="text-sm font-bold text-[#1C1917] dark:text-[#F5F5F4]">
                  Ekspektasi Gaji, Range Iklan, & Versi CV yang Dikirim
                </span>
              </div>
              {showCompSection ? (
                <ChevronUp className="h-5 w-5 shrink-0 text-[#44403C] dark:text-[#D6D3D1]" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-5 w-5 shrink-0 text-[#44403C] dark:text-[#D6D3D1]" aria-hidden="true" />
              )}
            </button>

            {showCompSection && (
              <div className="space-y-4 border-t border-[#E6DFD3] p-4 sm:p-5 dark:border-[#38332E]">
                {/* Quick Nominal Chips for Ekspektasi Gaji (so mobile users don't have to count 7 zeros!) */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label
                      htmlFor="jf-sexp"
                      className="text-xs font-bold text-[#1C1917] dark:text-[#F5F5F4]"
                    >
                      Ekspektasi Gaji Diajukan ({currency})
                    </label>
                    {salaryExpected && (
                      <span className="font-mono-num text-xs font-bold text-[#047857] dark:text-[#34D399]">
                        = {formatCurrency(Number(salaryExpected), currency, false)}
                      </span>
                    )}
                  </div>

                  {currency === 'IDR' && (
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {QUICK_IDR_AMOUNTS.map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setSalaryExpected(String(item.value))}
                          className={`min-h-[38px] rounded-lg border px-2.5 py-1 text-xs font-bold transition ${
                            Number(salaryExpected) === item.value
                              ? 'border-[#C2410C] bg-[#C2410C] text-white'
                              : 'border-[#D6CFC2] bg-[#FAF6F0] text-[#44403C] hover:bg-[#EFE8DC] dark:border-[#38332E] dark:bg-[#161412] dark:text-[#D6D3D1]'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <input
                    id="jf-sexp"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={salaryExpected}
                    onChange={(e) => setSalaryExpected(e.target.value)}
                    placeholder={currency === 'IDR' ? 'Ketik angka atau ketuk tombol di atas (misal: 15000000)' : '3800'}
                    className="font-mono-num min-h-[48px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3.5 py-2 text-base font-bold text-[#1C1917] sm:text-sm dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label
                      htmlFor="jf-smin"
                      className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]"
                    >
                      Gaji Min Iklan ({currency})
                    </label>
                    <input
                      id="jf-smin"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={salaryMin}
                      onChange={(e) => setSalaryMin(e.target.value)}
                      placeholder={currency === 'IDR' ? '12000000' : '3000'}
                      className="font-mono-num min-h-[48px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-base text-[#1C1917] sm:text-sm dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                    />
                    {salaryMin && (
                      <span className="font-mono-num mt-0.5 block text-[11px] font-semibold text-[#57534E] dark:text-[#A8A29E]">
                        {formatCurrency(Number(salaryMin), currency, true)}
                      </span>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="jf-smax"
                      className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]"
                    >
                      Gaji Max Iklan ({currency})
                    </label>
                    <input
                      id="jf-smax"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={salaryMax}
                      onChange={(e) => setSalaryMax(e.target.value)}
                      placeholder={currency === 'IDR' ? '18000000' : '4500'}
                      className="font-mono-num min-h-[48px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-base text-[#1C1917] sm:text-sm dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                    />
                    {salaryMax && (
                      <span className="font-mono-num mt-0.5 block text-[11px] font-semibold text-[#57534E] dark:text-[#A8A29E]">
                        {formatCurrency(Number(salaryMax), currency, true)}
                      </span>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="jf-soff"
                      className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]"
                    >
                      Nominal Offering ({currency})
                    </label>
                    <input
                      id="jf-soff"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={salaryOffered}
                      onChange={(e) => setSalaryOffered(e.target.value)}
                      placeholder="Saat dapat Offer"
                      className="font-mono-num min-h-[48px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-base text-[#1C1917] sm:text-sm dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="jf-curr"
                      className="mb-1.5 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]"
                    >
                      Mata Uang
                    </label>
                    <select
                      id="jf-curr"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="min-h-[48px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-base font-bold text-[#1C1917] sm:text-sm dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                    >
                      <option value="IDR">IDR (Rupiah)</option>
                      <option value="SGD">SGD (Singapore Dollar)</option>
                      <option value="USD">USD (US Dollar)</option>
                      <option value="MYR">MYR (Ringgit)</option>
                      <option value="EUR">EUR (Euro)</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="jf-doc"
                      className="mb-1.5 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]"
                    >
                      Versi CV yang Dikirim
                    </label>
                    <select
                      id="jf-doc"
                      value={documentId}
                      onChange={(e) => setDocumentId(e.target.value)}
                      className="min-h-[48px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-base font-bold text-[#1C1917] sm:text-sm dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                    >
                      <option value="">Belum dipilih</option>
                      {documents.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.title} {d.version ? `(${d.version})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="jf-benefits"
                    className="mb-1.5 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]"
                  >
                    Benefit & Fasilitas
                  </label>
                  <input
                    id="jf-benefits"
                    value={benefits}
                    onChange={(e) => setBenefits(e.target.value)}
                    placeholder="BPJS, Asuransi Swasta, THR, Laptop, Tunjangan..."
                    className="min-h-[48px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3.5 py-2 text-base text-[#1C1917] sm:text-sm dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                  />
                </div>

                <label className="inline-flex min-h-[44px] items-center gap-2.5 text-xs font-bold text-[#1C1917] dark:text-[#F5F5F4]">
                  <input
                    type="checkbox"
                    checked={coverLetterUsed}
                    onChange={(e) => setCoverLetterUsed(e.target.checked)}
                    className="h-5 w-5 rounded"
                  />
                  <span>Menyertakan Cover Letter saat melamar</span>
                </label>
              </div>
            )}
          </section>

          {/* SECTION 3: Catatan Cepat (Always easy to reach!) */}
          <section
            aria-label="Catatan Pribadi"
            className="rounded-xl border border-[#D6CFC2] bg-white p-4 sm:p-5 dark:border-[#38332E] dark:bg-[#211E1B]"
          >
            <label
              htmlFor="jf-notes"
              className="mb-1.5 block text-xs font-bold text-[#1C1917] dark:text-[#F5F5F4]"
            >
              Catatan Pribadi / Pengingat Singkat
            </label>
            <textarea
              id="jf-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan persiapan, poin diskusi, atau hal yang perlu ditanyakan ke HR..."
              className="w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] p-3 text-base text-[#1C1917] sm:text-sm dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
            />
          </section>

          {/* SECTION 4: Kontak HR, Skill & Arsip Jobdesc (Collapsible Accordion) */}
          <section
            aria-label="Kontak HR dan Arsip Jobdesc"
            className="rounded-xl border border-[#D6CFC2] bg-white dark:border-[#38332E] dark:bg-[#211E1B]"
          >
            <button
              type="button"
              onClick={() => setShowHrSection(!showHrSection)}
              aria-expanded={showHrSection}
              className="flex min-h-[52px] w-full items-center justify-between px-4 py-3 text-left sm:px-5"
            >
              <div>
                <span className="font-mono-num block text-xs font-bold uppercase tracking-wider text-[#57534E] dark:text-[#A8A29E]">
                  03 / KONTAK HR, SKILL & ARSIP JOBDESC (OPSIONAL)
                </span>
                <span className="text-sm font-bold text-[#1C1917] dark:text-[#F5F5F4]">
                  Simpan Nama Recruiter, Tag Keahlian, & Syarat Lowongan
                </span>
              </div>
              {showHrSection ? (
                <ChevronUp className="h-5 w-5 shrink-0 text-[#44403C] dark:text-[#D6D3D1]" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-5 w-5 shrink-0 text-[#44403C] dark:text-[#D6D3D1]" aria-hidden="true" />
              )}
            </button>

            {showHrSection && (
              <div className="grid grid-cols-1 gap-4 border-t border-[#E6DFD3] p-4 sm:grid-cols-2 sm:p-5 dark:border-[#38332E]">
                <div>
                  <label
                    htmlFor="jf-hrname"
                    className="mb-1.5 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]"
                  >
                    Nama HR / Recruiter
                  </label>
                  <input
                    id="jf-hrname"
                    value={hrName}
                    onChange={(e) => setHrName(e.target.value)}
                    placeholder="Nama Perekrut"
                    className="min-h-[48px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3.5 py-2 text-base text-[#1C1917] sm:text-sm dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="jf-hrcontact"
                    className="mb-1.5 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]"
                  >
                    Email / WhatsApp / LinkedIn HR
                  </label>
                  <input
                    id="jf-hrcontact"
                    value={hrContact}
                    onChange={(e) => setHrContact(e.target.value)}
                    placeholder="hr@perusahaan.com / +628..."
                    className="min-h-[48px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3.5 py-2 text-base text-[#1C1917] sm:text-sm dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="jf-dept"
                    className="mb-1.5 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]"
                  >
                    Divisi / Tim
                  </label>
                  <input
                    id="jf-dept"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Contoh: Core Platform"
                    className="min-h-[48px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3.5 py-2 text-base text-[#1C1917] sm:text-sm dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="jf-ref"
                    className="mb-1.5 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]"
                  >
                    Nama Pemberi Referral
                  </label>
                  <input
                    id="jf-ref"
                    value={referrerName}
                    onChange={(e) => setReferrerName(e.target.value)}
                    placeholder="Opsional jika lewat referral"
                    className="min-h-[48px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3.5 py-2 text-base text-[#1C1917] sm:text-sm dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="jf-skills"
                    className="mb-1.5 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]"
                  >
                    Tag Keahlian Utama (pisahkan dengan koma)
                  </label>
                  <input
                    id="jf-skills"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    placeholder="React, TypeScript, SQL, Bahasa Inggris"
                    className="min-h-[48px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3.5 py-2 text-base text-[#1C1917] sm:text-sm dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="jf-jd"
                    className="mb-1.5 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]"
                  >
                    Arsip Kualifikasi & Jobdesc (Penting disimpan sebelum iklan loker ditutup)
                  </label>
                  <textarea
                    id="jf-jd"
                    rows={4}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Salin syarat utama lowongan ke sini untuk bahan persiapan interview..."
                    className="w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] p-3 text-base text-[#1C1917] sm:text-sm dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                  />
                </div>
              </div>
            )}
          </section>

          {/* Full-Width Bottom Submit Button inside scroll flow for easy thumb reach */}
          <div className="flex flex-col gap-2.5 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] w-full rounded-xl border border-[#A8A29E] bg-white px-5 py-3 text-sm font-bold text-[#1C1917] hover:bg-[#EFE8DC] sm:w-auto dark:border-[#57534E] dark:bg-[#211E1B] dark:text-[#F5F5F4]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="min-h-[48px] w-full rounded-xl bg-[#C2410C] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#9A3412] active:bg-[#7C2D12] disabled:opacity-50 sm:w-auto"
            >
              {saving
                ? 'Menyimpan...'
                : initialJob
                  ? 'Simpan Perubahan Lamaran'
                  : 'Simpan Loker Sekarang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
