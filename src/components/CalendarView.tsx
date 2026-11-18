import React, { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { AppSettings, JobApplication } from '../types';
import { formatDateID, getStageMeta, todayISO } from '../utils/format';

interface CalendarViewProps {
  jobs: JobApplication[];
  settings: AppSettings;
  onSelectJob: (job: JobApplication, tab?: 'overview' | 'interviews' | 'followup') => void;
}

interface CalendarEvent {
  id: string;
  date: string;
  time: string;
  kind: 'interview' | 'deadline' | 'followup';
  title: string;
  subtitle: string;
  job: JobApplication;
}

const DAY_NAMES = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export const CalendarView: React.FC<CalendarViewProps> = ({
  jobs,
  settings,
  onSelectJob,
}) => {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());

  const allEvents = useMemo<CalendarEvent[]>(() => {
    const list: CalendarEvent[] = [];
    for (const job of jobs) {
      const cat = getStageMeta(settings.stages, job.stage).category;
      for (const iv of job.interviews) {
        if (iv.date && iv.status !== 'cancelled') {
          list.push({
            id: `iv-${iv.id}`,
            date: iv.date,
            time: iv.time || '09:00',
            kind: 'interview',
            title: `${iv.title} (${job.company})`,
            subtitle: `${job.position} • ${iv.locationOrLink || iv.type}`,
            job,
          });
        }
      }
      if (job.deadlineDate && cat !== 'rejected' && cat !== 'accepted') {
        list.push({
          id: `dl-${job.id}`,
          date: job.deadlineDate,
          time: '23:59',
          kind: 'deadline',
          title: `Batas Waktu Loker/Tes: ${job.company}`,
          subtitle: job.position,
          job,
        });
      }
      if (job.followUpDate && cat !== 'rejected' && cat !== 'accepted') {
        list.push({
          id: `fu-${job.id}`,
          date: job.followUpDate,
          time: '10:00',
          kind: 'followup',
          title: `Follow-Up HR: ${job.company}`,
          subtitle: `${job.position}${job.hrName ? ` • ${job.hrName}` : ''}`,
          job,
        });
      }
    }
    return list.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  }, [jobs, settings.stages]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const ev of allEvents) {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    }
    return map;
  }, [allEvents]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const startWeekday = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const cells: { dateStr: string; dayNum: number; inMonth: boolean }[] = [];
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
    for (let i = startWeekday - 1; i >= 0; i--) {
      const d = new Date(viewYear, viewMonth - 1, prevMonthDays - i);
      cells.push({
        dateStr: toDateStr(d),
        dayNum: d.getDate(),
        inMonth: false,
      });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(viewYear, viewMonth, day);
      cells.push({
        dateStr: toDateStr(d),
        dayNum: day,
        inMonth: true,
      });
    }
    while (cells.length % 7 !== 0) {
      const nextDay = cells.length - (startWeekday + daysInMonth) + 1;
      const d = new Date(viewYear, viewMonth + 1, nextDay);
      cells.push({
        dateStr: toDateStr(d),
        dayNum: d.getDate(),
        inMonth: false,
      });
    }
    return cells;
  }, [viewYear, viewMonth]);

  const monthTitle = new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(viewYear, viewMonth, 1));

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const goToday = () => {
    const t = new Date();
    setViewYear(t.getFullYear());
    setViewMonth(t.getMonth());
    setSelectedDate(todayISO());
  };

  const today = todayISO();
  const selectedDayEvents = eventsByDate[selectedDate] || [];

  const kindStyles = {
    interview:
      'bg-[#F3E8FF] text-[#3B0764] border-[#9333EA] dark:bg-[#3B0764] dark:text-[#F3E8FF] dark:border-[#C084FC]',
    deadline:
      'bg-[#FFE4E6] text-[#4C0519] border-[#E11D48] dark:bg-[#4C0519] dark:text-[#FFE4E6] dark:border-[#FB7185]',
    followup:
      'bg-[#FEF3C7] text-[#451A03] border-[#D97706] dark:bg-[#451A03] dark:text-[#FEF3C7] dark:border-[#FBBF24]',
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
      {/* Monthly Grid (8 cols on desktop) */}
      <section
        aria-label="Kalender Bulanan"
        className="rounded-xl border border-[#D6CFC2] bg-white p-4 sm:p-6 dark:border-[#38332E] dark:bg-[#211E1B] xl:col-span-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6DFD3] pb-4 dark:border-[#38332E]">
          <div>
            <span className="font-mono-num text-xs font-bold uppercase tracking-wider text-[#57534E] dark:text-[#A8A29E]">
              KALENDER SELEKSI
            </span>
            <h2 className="font-editorial mt-0.5 text-xl font-bold capitalize text-[#1C1917] dark:text-[#F5F5F4]">
              {monthTitle}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goPrevMonth}
              aria-label="Bulan sebelumnya"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-[#A8A29E] bg-[#FAF6F0] text-[#1C1917] hover:bg-[#EFE8DC] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={goToday}
              className="min-h-[44px] rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3.5 py-2 text-xs font-bold text-[#1C1917] hover:bg-[#EFE8DC] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={goNextMonth}
              aria-label="Bulan berikutnya"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-[#A8A29E] bg-[#FAF6F0] text-[#1C1917] hover:bg-[#EFE8DC] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs font-bold uppercase text-[#57534E] dark:text-[#A8A29E]">
          {DAY_NAMES.map((day) => (
            <div key={day} className="py-1.5">
              {day}
            </div>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1 sm:gap-1.5">
          {calendarDays.map((cell) => {
            const dayEvs = eventsByDate[cell.dateStr] || [];
            const isToday = cell.dateStr === today;
            const isSelected = cell.dateStr === selectedDate;

            return (
              <button
                key={cell.dateStr}
                type="button"
                onClick={() => setSelectedDate(cell.dateStr)}
                aria-label={`${formatDateID(cell.dateStr)}${dayEvs.length > 0 ? `, ${dayEvs.length} agenda` : ''}`}
                className={`flex min-h-[52px] flex-col items-start justify-between rounded-lg border p-1.5 text-left transition sm:min-h-[92px] sm:p-2 ${
                  isSelected
                    ? 'border-2 border-[#C2410C] bg-[#FFEDD5]/50 dark:border-[#FB923C] dark:bg-[#431407]/40'
                    : cell.inMonth
                      ? 'border-[#D6CFC2] bg-[#FAF6F0] hover:border-[#1C1917] dark:border-[#38332E] dark:bg-[#161412] dark:hover:border-[#A8A29E]'
                      : 'border-[#E6DFD3] bg-[#F3EDE2]/50 text-[#57534E] dark:border-[#2A2622] dark:bg-[#1A1715] dark:text-[#A8A29E]'
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span
                    className={`font-mono-num inline-flex h-6 w-6 items-center justify-center rounded text-xs font-bold ${
                      isToday
                        ? 'bg-[#C2410C] text-white'
                        : cell.inMonth
                          ? 'text-[#1C1917] dark:text-[#F5F5F4]'
                          : 'text-[#57534E] dark:text-[#A8A29E]'
                    }`}
                  >
                    {cell.dayNum}
                  </span>

                  {/* Compact count indicator on mobile so cells never overflow */}
                  {dayEvs.length > 0 && (
                    <span className="font-mono-num rounded bg-[#1C1917] px-1.5 py-0.2 text-[10px] font-bold text-[#FAF6F0] sm:hidden dark:bg-[#F5F5F4] dark:text-[#161412]">
                      {dayEvs.length}
                    </span>
                  )}
                </div>

                {/* Event labels on tablet & desktop (sm+) */}
                <div className="mt-1 hidden w-full space-y-1 sm:block">
                  {dayEvs.slice(0, 2).map((ev) => (
                    <span
                      key={ev.id}
                      className={`block truncate rounded border px-1.5 py-0.5 text-[10px] font-bold ${
                        kindStyles[ev.kind]
                      }`}
                    >
                      {ev.time !== '23:59' ? `${ev.time} ` : ''}
                      {ev.job.company}
                    </span>
                  ))}
                  {dayEvs.length > 2 && (
                    <span className="font-mono-num block text-[10px] font-bold text-[#C2410C] dark:text-[#FB923C]">
                      +{dayEvs.length - 2} lagi
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-[#E6DFD3] pt-3 text-xs font-semibold text-[#44403C] dark:border-[#38332E] dark:text-[#D6D3D1]">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded border border-[#6D28D9] bg-[#F3E8FF]" />
            Interview / Tes
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded border border-[#E11D48] bg-[#FFE4E6]" />
            Batas Waktu
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded border border-[#D97706] bg-[#FEF3C7]" />
            Pengingat Follow-Up
          </span>
        </div>
      </section>

      {/* Selected Day & Upcoming Agenda (4 cols on desktop) */}
      <div className="space-y-6 xl:col-span-4">
        <section
          aria-label="Rincian Tanggal Terpilih"
          className="rounded-xl border border-[#D6CFC2] bg-white p-5 dark:border-[#38332E] dark:bg-[#211E1B]"
        >
          <span className="font-mono-num text-xs font-bold uppercase tracking-wider text-[#57534E] dark:text-[#A8A29E]">
            RINCIAN TANGGAL
          </span>
          <h2 className="font-editorial mt-0.5 text-lg font-bold text-[#1C1917] dark:text-[#F5F5F4]">
            {formatDateID(selectedDate)}
          </h2>

          <div className="mt-3 space-y-2.5">
            {selectedDayEvents.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[#A8A29E] p-5 text-center dark:border-[#57534E]">
                <p className="text-xs font-semibold text-[#44403C] dark:text-[#D6D3D1]">
                  Tidak ada jadwal pada tanggal ini. Pilih tanggal bertanda angka atau tambahkan jadwal interview dari detail loker.
                </p>
              </div>
            ) : (
              selectedDayEvents.map((ev) => (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() =>
                    onSelectJob(
                      ev.job,
                      ev.kind === 'followup' ? 'followup' : 'interviews'
                    )
                  }
                  className="block min-h-[56px] w-full rounded-lg border border-[#D6CFC2] bg-[#FAF6F0] p-3.5 text-left transition hover:border-[#1C1917] dark:border-[#38332E] dark:bg-[#161412] dark:hover:border-[#A8A29E]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`rounded border px-2 py-0.5 text-[11px] font-bold ${
                        kindStyles[ev.kind]
                      }`}
                    >
                      {ev.kind === 'interview'
                        ? 'INTERVIEW / TES'
                        : ev.kind === 'deadline'
                          ? 'BATAS WAKTU'
                          : 'FOLLOW-UP'}
                    </span>
                    <span className="font-mono-num text-xs font-bold text-[#1C1917] dark:text-[#F5F5F4]">
                      {ev.time}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-bold text-[#1C1917] dark:text-[#F5F5F4]">
                    {ev.title}
                  </p>
                  <p className="mt-0.5 text-xs text-[#44403C] dark:text-[#D6D3D1]">
                    {ev.subtitle}
                  </p>
                </button>
              ))
            )}
          </div>
        </section>

        <section
          aria-label="Daftar Semua Agenda Mendatang"
          className="rounded-xl border border-[#D6CFC2] bg-white p-5 dark:border-[#38332E] dark:bg-[#211E1B]"
        >
          <span className="font-mono-num text-xs font-bold uppercase tracking-wider text-[#57534E] dark:text-[#A8A29E]">
            DAFTAR ANTREAN
          </span>
          <h2 className="font-editorial mt-0.5 text-lg font-bold text-[#1C1917] dark:text-[#F5F5F4]">
            Semua Agenda Mendatang
          </h2>

          <div className="mt-3 space-y-2.5">
            {allEvents.filter((e) => e.date >= today).length === 0 ? (
              <p className="text-xs text-[#44403C] dark:text-[#D6D3D1]">
                Belum ada agenda mendatang yang terjadwal.
              </p>
            ) : (
              allEvents
                .filter((e) => e.date >= today)
                .slice(0, 8)
                .map((ev) => (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() =>
                      onSelectJob(
                        ev.job,
                        ev.kind === 'followup' ? 'followup' : 'interviews'
                      )
                    }
                    className="flex min-h-[52px] w-full items-center justify-between gap-2 rounded-lg border border-[#D6CFC2] bg-[#FAF6F0] p-3 text-left text-xs transition hover:border-[#1C1917] dark:border-[#38332E] dark:bg-[#161412]"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-bold text-[#1C1917] dark:text-[#F5F5F4]">
                        {ev.title}
                      </p>
                      <p className="font-mono-num mt-0.5 text-[#44403C] dark:text-[#D6D3D1]">
                        {formatDateID(ev.date, true)} • {ev.time}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded border px-2 py-0.5 text-[10px] font-bold ${
                        kindStyles[ev.kind]
                      }`}
                    >
                      {ev.kind === 'interview'
                        ? 'Jadwal'
                        : ev.kind === 'deadline'
                          ? 'Batas'
                          : 'Follow-Up'}
                    </span>
                  </button>
                ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

function toDateStr(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
