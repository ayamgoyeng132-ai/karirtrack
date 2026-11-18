import React, { useEffect } from 'react';
import {
  Plus,
  Sun,
  Moon,
  Download,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
} from 'lucide-react';
import type { NavTab } from '../types';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onAddJob: () => void;
  onExportCSV: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLogout: () => void;
  counts: {
    totalJobs: number;
    activeJobs: number;
    upcomingAgenda: number;
    followUps: number;
  };
  mobileOpen: boolean;
  onCloseMobile: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItemConfig {
  id: NavTab;
  indexCode: string;
  shortLabel: string;
  label: string;
  group: 'workspace' | 'system';
  badge?: number;
  badgeTone?: 'default' | 'alert';
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onAddJob,
  onExportCSV,
  theme,
  onToggleTheme,
  onLogout,
  counts,
  mobileOpen,
  onCloseMobile,
  collapsed,
  onToggleCollapse,
}) => {
  const navItems: NavItemConfig[] = [
    {
      id: 'dashboard',
      indexCode: '01',
      shortLabel: 'Jurnal',
      label: 'Jurnal & Tindak Lanjut',
      group: 'workspace',
      badge: counts.followUps > 0 ? counts.followUps : undefined,
      badgeTone: 'alert',
    },
    {
      id: 'kanban',
      indexCode: '02',
      shortLabel: 'Kanban',
      label: 'Papan Alur Seleksi',
      group: 'workspace',
      badge: counts.activeJobs,
    },
    {
      id: 'table',
      indexCode: '03',
      shortLabel: 'Arsip',
      label: 'Daftar Lengkap Loker',
      group: 'workspace',
      badge: counts.totalJobs,
    },
    {
      id: 'calendar',
      indexCode: '04',
      shortLabel: 'Jadwal',
      label: 'Kalender & Interview',
      group: 'workspace',
      badge: counts.upcomingAgenda > 0 ? counts.upcomingAgenda : undefined,
    },
    {
      id: 'documents',
      indexCode: '05',
      shortLabel: 'Berkas',
      label: 'Master CV & Pesan HR',
      group: 'system',
    },
    {
      id: 'settings',
      indexCode: '06',
      shortLabel: 'Atur',
      label: 'Atur Semuanya',
      group: 'system',
    },
  ];

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseMobile();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen, onCloseMobile]);

  const handleNav = (id: NavTab) => {
    onSelectTab(id);
    onCloseMobile();
  };

  const workspaceItems = navItems.filter((i) => i.group === 'workspace');
  const systemItems = navItems.filter((i) => i.group === 'system');

  const renderNavButton = (item: NavItemConfig) => {
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => handleNav(item.id)}
        aria-current={isActive ? 'page' : undefined}
        aria-label={collapsed ? `${item.label}${item.badge !== undefined ? ` (${item.badge})` : ''}` : undefined}
        title={collapsed ? item.label : undefined}
        className={`group relative flex min-h-[44px] w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
          isActive
            ? 'border-l-4 border-[#C2410C] bg-[#EFE8DC] font-bold text-[#1C1917] dark:border-[#FB923C] dark:bg-[#2A2622] dark:text-[#F5F5F4]'
            : 'border-l-4 border-transparent font-medium text-[#44403C] hover:bg-[#F3EDE2] hover:text-[#1C1917] active:bg-[#E7DFD2] dark:text-[#D6D3D1] dark:hover:bg-[#24201D] dark:hover:text-[#F5F5F4]'
        }`}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span
            className={`font-mono-num shrink-0 rounded px-1.5 py-0.5 text-xs font-semibold ${
              isActive
                ? 'bg-[#1C1917] text-[#FAF6F0] dark:bg-[#F5F5F4] dark:text-[#161412]'
                : 'bg-[#E6DFD3] text-[#44403C] dark:bg-[#2E2925] dark:text-[#D6D3D1]'
            }`}
          >
            {item.indexCode}
          </span>
          {!collapsed && <span className="truncate">{item.label}</span>}
        </span>

        {!collapsed && item.badge !== undefined && (
          <span
            className={`font-mono-num ml-2 shrink-0 rounded border px-1.5 py-0.5 text-xs font-semibold ${
              item.badgeTone === 'alert'
                ? 'border-[#D97706] bg-[#FEF3C7] text-[#78350F] dark:border-[#F59E0B] dark:bg-[#451A03] dark:text-[#FEF3C7]'
                : 'border-[#A8A29E] bg-[#FAF6F0] text-[#292524] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#E7E5E4]'
            }`}
          >
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#1C1917]/60 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Navigasi Jurnal Karir"
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[#D6CFC2] bg-[#FAF6F0] transition-transform duration-200 dark:border-[#38332E] dark:bg-[#1A1715] lg:static lg:translate-x-0 ${
          collapsed ? 'w-72 lg:w-20' : 'w-72'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Brand Wordmark (R-23: typographic wordmark, no assumed icon logo) */}
        <div className="flex items-center justify-between border-b border-[#D6CFC2] px-4 py-4 dark:border-[#38332E]">
          {!collapsed ? (
            <div>
              <span className="font-editorial block text-xl font-bold tracking-tight text-[#1C1917] dark:text-[#F5F5F4]">
                KarirTrack<span className="text-[#C2410C] dark:text-[#FB923C]">.</span>
              </span>
              <span className="font-mono-num mt-0.5 block text-[11px] font-semibold uppercase tracking-wider text-[#57534E] dark:text-[#A8A29E]">
                Jurnal Lamaran Kerja
              </span>
            </div>
          ) : (
            <span
              className="font-editorial mx-auto text-xl font-bold text-[#1C1917] dark:text-[#F5F5F4]"
              title="KarirTrack"
            >
              KT<span className="text-[#C2410C] dark:text-[#FB923C]">.</span>
            </span>
          )}

          <button
            type="button"
            onClick={onToggleCollapse}
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Perlebar bilah navigasi' : 'Ringkas bilah navigasi'}
            className="hidden min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-[#D6CFC2] text-[#44403C] hover:bg-[#EFE8DC] active:bg-[#E5DDD0] dark:border-[#38332E] dark:text-[#D6D3D1] dark:hover:bg-[#2A2622] lg:inline-flex"
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
            ) : (
              <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Tutup menu navigasi"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-[#D6CFC2] text-[#44403C] hover:bg-[#EFE8DC] dark:border-[#38332E] dark:text-[#D6D3D1] lg:hidden"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Primary Action (1 Deliberate Accent: Terracotta #C2410C) */}
        <div className="p-3.5">
          <button
            type="button"
            onClick={() => {
              onCloseMobile();
              onAddJob();
            }}
            aria-label="Catat Loker Baru"
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-[#C2410C] px-3.5 py-2.5 text-sm font-bold text-white transition hover:bg-[#9A3412] active:bg-[#7C2D12]"
          >
            <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
            {!collapsed && <span>Catat Loker Baru</span>}
          </button>
        </div>

        {/* Grouped Navigation */}
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-2" aria-label="Menu Utama">
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-[#57534E] dark:text-[#A8A29E]">
                Ruang Kerja
              </p>
            )}
            {workspaceItems.map(renderNavButton)}
          </div>

          <div className="space-y-1 border-t border-[#D6CFC2] pt-4 dark:border-[#38332E]">
            {!collapsed && (
              <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-[#57534E] dark:text-[#A8A29E]">
                Berkas & Sistem
              </p>
            )}
            {systemItems.map(renderNavButton)}
          </div>
        </nav>

        {/* Footer Controls */}
        <div className="space-y-2 border-t border-[#D6CFC2] p-3.5 dark:border-[#38332E]">
          <button
            type="button"
            onClick={onExportCSV}
            aria-label="Unduh data lamaran ke CSV"
            title="Unduh CSV"
            className="flex min-h-[44px] w-full items-center justify-center gap-2.5 rounded-lg border border-[#D6CFC2] bg-[#F3EDE2] px-3 py-2 text-xs font-bold text-[#1C1917] transition hover:bg-[#E7DFD2] active:bg-[#DDD3C2] dark:border-[#38332E] dark:bg-[#24201D] dark:text-[#F5F5F4] dark:hover:bg-[#2E2925]"
          >
            <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
            {!collapsed && <span>Unduh Spreadsheet (.CSV)</span>}
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Ganti ke Mode Kertas Terang' : 'Ganti ke Mode Gelap'}
            title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
            className="flex min-h-[44px] w-full items-center justify-between rounded-lg border border-[#D6CFC2] bg-white px-3 py-2 text-xs font-bold text-[#1C1917] transition hover:bg-[#F3EDE2] active:bg-[#E7DFD2] dark:border-[#38332E] dark:bg-[#211E1B] dark:text-[#F5F5F4] dark:hover:bg-[#2A2622]"
          >
            <span className="flex items-center gap-2.5">
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 shrink-0 text-[#FBBF24]" aria-hidden="true" />
              ) : (
                <Moon className="h-4 w-4 shrink-0 text-[#44403C]" aria-hidden="true" />
              )}
              {!collapsed && (
                <span>{theme === 'dark' ? 'Kertas Terang' : 'Mode Malam'}</span>
              )}
            </span>
            {!collapsed && (
              <span className="font-mono-num rounded border border-[#A8A29E] px-1.5 py-0.5 text-[11px] text-[#44403C] dark:border-[#57534E] dark:text-[#D6D3D1]">
                {theme === 'dark' ? 'ON' : 'OFF'}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onLogout}
            aria-label="Keluar dari KarirTrack"
            title="Keluar"
            className="flex min-h-[44px] w-full items-center justify-center gap-2.5 rounded-lg border border-[#D6CFC2] bg-white px-3 py-2 text-xs font-bold text-[#44403C] transition hover:bg-[#FFF1F2] hover:text-[#9F1239] active:bg-[#FFE4E6] dark:border-[#38332E] dark:bg-[#211E1B] dark:text-[#D6D3D1] dark:hover:bg-[#2A1215] dark:hover:text-[#FDA4AF]"
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
            {!collapsed && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (< lg): 44px+ tap targets, safe space reserved in main */}
      <nav
        aria-label="Navigasi Cepat Mobile"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-[#D6CFC2] bg-[#FAF6F0]/95 px-2 py-1.5 backdrop-blur-xs dark:border-[#38332E] dark:bg-[#1A1715]/95 lg:hidden"
      >
        <div className="mx-auto grid max-w-lg grid-cols-6 gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex min-h-[48px] flex-col items-center justify-center rounded-lg px-1 py-1 text-center transition ${
                  isActive
                    ? 'bg-[#1C1917] font-bold text-[#FAF6F0] dark:bg-[#F5F5F4] dark:text-[#161412]'
                    : 'font-medium text-[#44403C] hover:bg-[#EFE8DC] dark:text-[#D6D3D1] dark:hover:bg-[#2A2622]'
                }`}
              >
                <span className="font-mono-num text-[11px] leading-none opacity-80">
                  {item.indexCode}
                </span>
                <span className="mt-1 truncate text-[11px] leading-none">
                  {item.shortLabel}
                </span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`font-mono-num absolute top-1 right-1 rounded px-1 text-[9px] font-bold ${
                      item.badgeTone === 'alert'
                        ? 'bg-[#C2410C] text-white'
                        : isActive
                          ? 'bg-[#C2410C] text-white'
                          : 'bg-[#D6CFC2] text-[#1C1917] dark:bg-[#38332E] dark:text-[#F5F5F4]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
