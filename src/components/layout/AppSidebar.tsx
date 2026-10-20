'use client';

import React from 'react';
import {
  LayoutDashboard,
  Terminal,
  Database,
  History,
  Briefcase,
  UserCheck,
  Bookmark,
  Settings2,
  ChevronRight,
  KeyRound,
  RefreshCw,
  X,
} from 'lucide-react';
import { NavTab } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AppSidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  appliedJobsCount: number;
  questionsCount: number;
  configPresetsCount: number;
  isBotRunning: boolean;
  isSetupBrowserRunning: boolean;
  isSetupBrowserLoading: boolean;
  handleToggleSetupBrowser: () => Promise<void>;
  onOpenPresetsModal: () => void;
  fetchQuestions: () => void;
  fetchAppliedHistory: () => void;
  resolvedTheme?: 'dark' | 'light';
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  activeTab,
  setActiveTab,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  appliedJobsCount,
  questionsCount,
  configPresetsCount,
  isBotRunning,
  isSetupBrowserRunning,
  isSetupBrowserLoading,
  handleToggleSetupBrowser,
  onOpenPresetsModal,
  fetchQuestions,
  fetchAppliedHistory,
  resolvedTheme = 'dark',
}) => {
  const renderNavLinks = (isMobile: boolean) => (
    <nav className="space-y-1">
      {/* 1. Setup & Target */}
      <button
        onClick={() => {
          setActiveTab('wizard');
          if (isMobile) setIsMobileMenuOpen(false);
        }}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
          activeTab === 'wizard' ? 'sidebar-nav-active' : 'sidebar-nav-idle'
        }`}
      >
        <LayoutDashboard className={`w-4 h-4 shrink-0 ${activeTab === 'wizard' ? 'text-primary' : 'text-muted-foreground'}`} />
        <span>Setup &amp; Target</span>
        {activeTab === 'wizard' && <ChevronRight className="w-3.5 h-3.5 ml-auto text-primary" />}
      </button>

      {/* 2. Live Monitor */}
      <button
        onClick={() => {
          setActiveTab('logs');
          if (isMobile) setIsMobileMenuOpen(false);
        }}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
          activeTab === 'logs' ? 'sidebar-nav-active' : 'sidebar-nav-idle'
        }`}
      >
        <Terminal className={`w-4 h-4 shrink-0 ${activeTab === 'logs' ? 'text-primary' : 'text-muted-foreground'}`} />
        <span>Live Monitor</span>
        {isBotRunning && <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
      </button>

      {/* 3. Pertanyaan CSV */}
      <button
        onClick={() => {
          setActiveTab('questions');
          fetchQuestions();
          if (isMobile) setIsMobileMenuOpen(false);
        }}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
          activeTab === 'questions' ? 'sidebar-nav-active' : 'sidebar-nav-idle'
        }`}
      >
        <Database className={`w-4 h-4 shrink-0 ${activeTab === 'questions' ? 'text-primary' : 'text-muted-foreground'}`} />
        <span>Pertanyaan CSV</span>
        <Badge variant="secondary" className="ml-auto text-[10px] font-medium font-mono tabular-nums">
          {questionsCount}
        </Badge>
      </button>

      {/* 4. Riwayat Lamaran */}
      <button
        onClick={() => {
          setActiveTab('history');
          fetchAppliedHistory();
          if (isMobile) setIsMobileMenuOpen(false);
        }}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
          activeTab === 'history' ? 'sidebar-nav-active' : 'sidebar-nav-idle'
        }`}
      >
        <History className={`w-4 h-4 shrink-0 ${activeTab === 'history' ? 'text-primary' : 'text-muted-foreground'}`} />
        <span className="truncate whitespace-nowrap">Riwayat Lamaran</span>
        <Badge variant="secondary" className="ml-auto text-[10px] font-medium font-mono tabular-nums">
          {appliedJobsCount}
        </Badge>
      </button>

      {/* 5. Kartu Lowongan */}
      <button
        onClick={() => {
          setActiveTab('jobs');
          fetchAppliedHistory();
          if (isMobile) setIsMobileMenuOpen(false);
        }}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
          activeTab === 'jobs' ? 'sidebar-nav-active' : 'sidebar-nav-idle'
        }`}
      >
        <Briefcase className={`w-4 h-4 shrink-0 ${activeTab === 'jobs' ? 'text-primary' : 'text-muted-foreground'}`} />
        <span className="truncate whitespace-nowrap">Kartu Lowongan</span>
        {appliedJobsCount > 0 && (
          <Badge variant="secondary" className="ml-auto text-[10px] font-medium font-mono tabular-nums">
            {appliedJobsCount}
          </Badge>
        )}
      </button>

      {/* MODUL 2: OUTSOURCING & TALENT SCOUT */}
      <div className="pt-3 pb-1 px-1">
        <div className="h-[1px] bg-border my-1" />
        <div className="flex items-center justify-between px-2 pt-1 pb-0.5">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Outsourcing / HR
          </span>
          <span className="text-[9px] font-semibold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded font-mono tracking-wider">
            MODUL 2
          </span>
        </div>
      </div>

      <button
        onClick={() => {
          setActiveTab('talent');
          if (isMobile) setIsMobileMenuOpen(false);
        }}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
          activeTab === 'talent' ? 'sidebar-nav-active' : 'sidebar-nav-idle'
        }`}
      >
        <UserCheck className={`w-4 h-4 shrink-0 ${activeTab === 'talent' ? 'text-primary' : 'text-muted-foreground'}`} />
        <span>Talent Scout</span>
        <Badge variant="outline" className="ml-auto text-[9px] font-medium font-mono">
          OpenToWork
        </Badge>
      </button>

      {/* Preset Konfigurasi */}
      <button
        onClick={() => {
          onOpenPresetsModal();
          if (isMobile) setIsMobileMenuOpen(false);
        }}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all sidebar-nav-idle"
      >
        <Bookmark className="w-4 h-4 shrink-0 text-muted-foreground" />
        <span>Preset Konfigurasi</span>
        {configPresetsCount > 0 && (
          <Badge variant="secondary" className="ml-auto text-[10px] font-medium font-mono tabular-nums">
            {configPresetsCount}
          </Badge>
        )}
      </button>

      {/* Pengaturan Sistem */}
      <button
        onClick={() => {
          setActiveTab('settings');
          if (isMobile) setIsMobileMenuOpen(false);
        }}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
          activeTab === 'settings' ? 'sidebar-nav-active' : 'sidebar-nav-idle'
        }`}
      >
        <Settings2 className={`w-4 h-4 shrink-0 ${activeTab === 'settings' ? 'text-primary' : 'text-muted-foreground'}`} />
        <span>Pengaturan</span>
        {activeTab === 'settings' && <ChevronRight className="w-3.5 h-3.5 ml-auto text-primary" />}
      </button>
    </nav>
  );

  const renderStatusCard = () => (
    <div className="mt-6 p-4 rounded-xl sidebar-card-theme border space-y-3 transition-colors shrink-0">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Status Mesin</span>
        <span
          className={`w-2 h-2 rounded-full ${
            isBotRunning ? 'bg-emerald-500 animate-ping' : 'bg-muted-foreground/40'
          }`}
        />
      </div>

      <div className="text-xs space-y-1.5">
        <div className="flex justify-between text-muted-foreground">
          <span>Automation Bot</span>
          <span className={isBotRunning ? 'text-emerald-500 font-semibold' : 'text-muted-foreground'}>
            {isBotRunning ? 'Sedang Aktif' : 'Standby'}
          </span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Setup Browser</span>
          <span className={isSetupBrowserRunning ? 'text-amber-500 font-semibold' : 'text-muted-foreground'}>
            {isSetupBrowserRunning ? 'Terbuka' : 'Tertutup'}
          </span>
        </div>
      </div>

      <button
        onClick={() => handleToggleSetupBrowser()}
        disabled={isSetupBrowserLoading || isBotRunning}
        className={`w-full mt-2 py-2 px-3 rounded-md text-xs font-medium flex items-center justify-center gap-2 transition ${
          isSetupBrowserLoading
            ? 'opacity-60 cursor-not-allowed card-theme border text-muted-foreground'
            : isSetupBrowserRunning
            ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30'
            : 'card-theme border text-foreground hover:opacity-90 shadow-xs'
        }`}
      >
        {isSetupBrowserLoading ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
        ) : (
          <KeyRound className="w-3.5 h-3.5" />
        )}
        <span>
          {isSetupBrowserLoading
            ? 'Membuka Browser...'
            : isSetupBrowserRunning
            ? 'Tutup Browser'
            : 'Buka Browser Setup'}
        </span>
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Backdrop & Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <aside className="relative w-72 max-w-[85vw] h-full sidebar-theme border-r p-5 flex flex-col justify-between shrink-0 shadow-2xl z-10 overflow-y-auto animate-in slide-in-from-left duration-200">
            <div className="space-y-6">
              <div className="px-1 py-1 flex items-center justify-between">
                {/* Mobile Drawer Logo */}
                <div className="flex items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/brand/header-light.svg"
                    alt="AutoApply"
                    className="logo-theme-light dark:hidden h-7 w-auto object-contain select-none"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/brand/header-dark.svg"
                    alt="AutoApply"
                    className="logo-theme-dark hidden dark:block h-7 w-auto object-contain select-none"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-md h-8 w-8 text-muted-foreground hover:text-foreground"
                  aria-label="Tutup Menu"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {renderNavLinks(true)}
            </div>

            {renderStatusCard()}
          </aside>
        </div>
      )}

      {/* Desktop Sticky Sidebar */}
      <aside className="hidden md:flex md:w-64 h-full sidebar-theme border-r p-5 flex-col justify-between shrink-0 transition-colors overflow-y-auto">
        <div className="space-y-6">
          <div className="px-1 py-1 flex items-center">
            {/* Desktop Sidebar Logo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/header-light.svg"
              alt="AutoApply"
              className="logo-theme-light dark:hidden h-8 w-auto max-w-[180px] object-contain select-none"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/header-dark.svg"
              alt="AutoApply"
              className="logo-theme-dark hidden dark:block h-8 w-auto max-w-[180px] object-contain select-none"
            />
          </div>

          {renderNavLinks(false)}
        </div>

        {renderStatusCard()}
      </aside>
    </>
  );
};
