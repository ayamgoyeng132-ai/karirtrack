import type {
  JobApplication,
  PriorityLevel,
  StageColor,
  StageConfig,
  UserProfile,
} from '../types';

export const STAGE_COLOR_STYLES: Record<
  StageColor,
  { badge: string; bar: string; border: string; headerBg: string }
> = {
  slate: {
    badge:
      'bg-[#EFECE6] text-[#292524] border-[#A8A29E] dark:bg-[#292524] dark:text-[#E7E5E4] dark:border-[#57534E]',
    bar: 'bg-[#57534E] dark:bg-[#A8A29E]',
    border: 'border-t-[#57534E]',
    headerBg: 'bg-[#EFECE6] dark:bg-[#262320]',
  },
  blue: {
    badge:
      'bg-[#E0F2FE] text-[#0C4A6E] border-[#7DD3FC] dark:bg-[#082F49] dark:text-[#E0F2FE] dark:border-[#0284C7]',
    bar: 'bg-[#0369A1] dark:bg-[#38BDF8]',
    border: 'border-t-[#0369A1]',
    headerBg: 'bg-[#E0F2FE]/70 dark:bg-[#082F49]/60',
  },
  indigo: {
    badge:
      'bg-[#E0E7FF] text-[#1E1B4B] border-[#A5B4FC] dark:bg-[#1E1B4B] dark:text-[#E0E7FF] dark:border-[#6366F1]',
    bar: 'bg-[#4338CA] dark:bg-[#818CF8]',
    border: 'border-t-[#4338CA]',
    headerBg: 'bg-[#E0E7FF]/70 dark:bg-[#1E1B4B]/60',
  },
  violet: {
    badge:
      'bg-[#F3E8FF] text-[#3B0764] border-[#D8B4FE] dark:bg-[#3B0764] dark:text-[#F3E8FF] dark:border-[#9333EA]',
    bar: 'bg-[#6D28D9] dark:bg-[#C084FC]',
    border: 'border-t-[#6D28D9]',
    headerBg: 'bg-[#F3E8FF]/70 dark:bg-[#3B0764]/50',
  },
  amber: {
    badge:
      'bg-[#FEF3C7] text-[#451A03] border-[#F59E0B] dark:bg-[#451A03] dark:text-[#FEF3C7] dark:border-[#D97706]',
    bar: 'bg-[#B45309] dark:bg-[#FBBF24]',
    border: 'border-t-[#B45309]',
    headerBg: 'bg-[#FEF3C7]/80 dark:bg-[#451A03]/60',
  },
  emerald: {
    badge:
      'bg-[#D1FAE5] text-[#064E3B] border-[#6EE7B7] dark:bg-[#064E3B] dark:text-[#D1FAE5] dark:border-[#059669]',
    bar: 'bg-[#047857] dark:bg-[#34D399]',
    border: 'border-t-[#047857]',
    headerBg: 'bg-[#D1FAE5]/70 dark:bg-[#064E3B]/60',
  },
  teal: {
    badge:
      'bg-[#CCFBF1] text-[#134E4A] border-[#5EEAD4] dark:bg-[#134E4A] dark:text-[#CCFBF1] dark:border-[#0D9488]',
    bar: 'bg-[#0F766E] dark:bg-[#2DD4BF]',
    border: 'border-t-[#0F766E]',
    headerBg: 'bg-[#CCFBF1]/70 dark:bg-[#134E4A]/60',
  },
  rose: {
    badge:
      'bg-[#FFE4E6] text-[#4C0519] border-[#FDA4AF] dark:bg-[#4C0519] dark:text-[#FFE4E6] dark:border-[#E11D48]',
    bar: 'bg-[#BE123C] dark:bg-[#FB7185]',
    border: 'border-t-[#BE123C]',
    headerBg: 'bg-[#FFE4E6]/70 dark:bg-[#4C0519]/60',
  },
  cyan: {
    badge:
      'bg-[#CFFAFE] text-[#164E63] border-[#67E8F9] dark:bg-[#164E63] dark:text-[#CFFAFE] dark:border-[#0891B2]',
    bar: 'bg-[#0E7490] dark:bg-[#22D3EE]',
    border: 'border-t-[#0E7490]',
    headerBg: 'bg-[#CFFAFE]/70 dark:bg-[#164E63]/60',
  },
  orange: {
    badge:
      'bg-[#FFEDD5] text-[#431407] border-[#FDBA74] dark:bg-[#431407] dark:text-[#FFEDD5] dark:border-[#EA580C]',
    bar: 'bg-[#C2410C] dark:bg-[#FB923C]',
    border: 'border-t-[#C2410C]',
    headerBg: 'bg-[#FFEDD5]/80 dark:bg-[#431407]/60',
  },
};

export const PRIORITY_META: Record<
  PriorityLevel,
  { label: string; badge: string }
> = {
  high: {
    label: 'Prioritas Tinggi',
    badge:
      'bg-[#FFEDD5] text-[#7C2D12] border-[#EA580C] dark:bg-[#431407] dark:text-[#FFEDD5] dark:border-[#EA580C]',
  },
  medium: {
    label: 'Prioritas Sedang',
    badge:
      'bg-[#FEF3C7] text-[#78350F] border-[#D97706] dark:bg-[#451A03] dark:text-[#FEF3C7] dark:border-[#D97706]',
  },
  low: {
    label: 'Prioritas Rendah',
    badge:
      'bg-[#EFECE6] text-[#44403C] border-[#A8A29E] dark:bg-[#292524] dark:text-[#D6D3D1] dark:border-[#57534E]',
  },
};

export function getStageMeta(stages: StageConfig[], stageId: string): StageConfig {
  return (
    stages.find((s) => s.id === stageId) || {
      id: stageId,
      label: stageId,
      color: 'slate',
      category: 'active',
      order: 99,
    }
  );
}

export function formatCurrency(amount: number | null | undefined, currency = 'IDR', compact = false): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return '-';
  if (currency === 'IDR') {
    if (compact) {
      if (amount >= 1_000_000_000) {
        return `Rp ${(amount / 1_000_000_000).toFixed(1).replace(/\.0$/, '')} M`;
      }
      if (amount >= 1_000_000) {
        return `Rp ${(amount / 1_000_000).toFixed(1).replace(/\.0$/, '')} jt`;
      }
      if (amount >= 1_000) {
        return `Rp ${Math.round(amount / 1_000)} rb`;
      }
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatSalarySummary(job: JobApplication, compact = true): string {
  if (job.salaryOffered) {
    return `Offer: ${formatCurrency(job.salaryOffered, job.currency, compact)}`;
  }
  if (job.salaryMin && job.salaryMax) {
    return `${formatCurrency(job.salaryMin, job.currency, compact)} s/d ${formatCurrency(job.salaryMax, job.currency, compact)}`;
  }
  if (job.salaryExpected) {
    return `Ekspektasi: ${formatCurrency(job.salaryExpected, job.currency, compact)}`;
  }
  if (job.salaryMin) {
    return `Mulai ${formatCurrency(job.salaryMin, job.currency, compact)}`;
  }
  return 'Gaji belum dicatat';
}

export function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function formatDateID(dateStr?: string, short = false): string {
  if (!dateStr) return '-';
  const parts = dateStr.slice(0, 10).split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return dateStr;
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: short ? 'short' : 'long',
    year: 'numeric',
  }).format(d);
}

export function diffDaysFromToday(dateStr?: string): number | null {
  if (!dateStr) return null;
  const parts = dateStr.slice(0, 10).split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  const target = new Date(parts[0], parts[1] - 1, parts[2]);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function needsFollowUp(
  job: JobApplication,
  stages: StageConfig[],
  followUpDays: number
): { needed: boolean; reason: string } {
  const stageMeta = getStageMeta(stages, job.stage);
  if (
    stageMeta.category === 'rejected' ||
    stageMeta.category === 'accepted' ||
    stageMeta.category === 'wishlist'
  ) {
    return { needed: false, reason: '' };
  }

  if (job.followUpDate) {
    const diff = diffDaysFromToday(job.followUpDate);
    if (diff !== null && diff <= 0) {
      return {
        needed: true,
        reason: diff === 0 ? 'Jadwal follow-up hari ini' : `Jadwal follow-up lewat ${Math.abs(diff)} hari`,
      };
    }
  }

  if (stageMeta.category === 'active' && job.appliedDate) {
    const diffApplied = diffDaysFromToday(job.appliedDate);
    if (diffApplied !== null && Math.abs(diffApplied) >= followUpDays && diffApplied < 0) {
      return {
        needed: true,
        reason: `${Math.abs(diffApplied)} hari sejak melamar belum ada kabar`,
      };
    }
  }

  return { needed: false, reason: '' };
}

export function renderMessageTemplate(
  text: string,
  job: JobApplication | null,
  profile: UserProfile
): string {
  return text
    .replaceAll('{perusahaan}', job?.company || '[Nama Perusahaan]')
    .replaceAll('{posisi}', job?.position || '[Posisi yang Dilamar]')
    .replaceAll('{nama_hr}', job?.hrName || 'Tim Rekrutmen / HR')
    .replaceAll('{nama_saya}', profile.name || '[Nama Lengkap Anda]')
    .replaceAll('{tanggal_apply}', job?.appliedDate ? formatDateID(job.appliedDate) : '[Tanggal Apply]')
    .replaceAll('{platform}', job?.platform || 'portal rekrutmen')
    .replaceAll('{portofolio}', profile.portfolioUrl || '[Link Portofolio]');
}

export function exportJobsToCSV(jobs: JobApplication[], stages: StageConfig[]) {
  const headers = [
    'Perusahaan',
    'Posisi',
    'Tahapan',
    'Prioritas',
    'Sistem Kerja',
    'Tipe Kerja',
    'Lokasi',
    'Sumber Platform',
    'Tanggal Apply',
    'Tanggal Follow-Up',
    'Deadline',
    'Mata Uang',
    'Gaji Min',
    'Gaji Max',
    'Ekspektasi Gaji',
    'Offering Gaji',
    'Kontak HR',
    'Email/WA HR',
    'Link Loker',
    'Skills',
    'Catatan',
  ];

  const escapeCsv = (val: unknown) => {
    const str = val === null || val === undefined ? '' : String(val);
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = jobs.map((j) => [
    j.company,
    j.position,
    getStageMeta(stages, j.stage).label,
    PRIORITY_META[j.priority]?.label || j.priority,
    j.workMode,
    j.employmentType,
    j.location,
    j.platform,
    j.appliedDate,
    j.followUpDate,
    j.deadlineDate,
    j.currency,
    j.salaryMin ?? '',
    j.salaryMax ?? '',
    j.salaryExpected ?? '',
    j.salaryOffered ?? '',
    j.hrName,
    j.hrContact,
    j.jobUrl,
    j.skills.join(', '),
    j.notes,
  ]);

  const csvContent =
    '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows.map((r) => r.map(escapeCsv).join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `karirtrack-lamaran-${todayISO()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportFullBackupJSON(data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `karirtrack-backup-${todayISO()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
