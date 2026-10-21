'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UserCheck,
  Globe,
  Database,
  History,
  Terminal,
  Users,
  Settings2,
  ChevronRight,
  DatabaseZap,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AppSidebarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  isBotRunning?: boolean;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  isBotRunning = false,
}) => {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/',
      label: 'Dashboard Analytics',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: '/profile',
      label: 'Profil & Dokumen CV',
      icon: UserCheck,
    },
    {
      href: '/connection',
      label: 'Koneksi Portal & EEO',
      icon: Globe,
    },
    {
      href: '/questions',
      label: 'Bank Soal Kuesioner',
      icon: Database,
    },
    {
      href: '/applications',
      label: 'Riwayat Lamaran',
      icon: History,
    },
    {
      href: '/automation',
      label: 'Automasi Bot',
      icon: Terminal,
      badge: isBotRunning ? 'RUNNING' : undefined,
    },
    {
      href: '/talents',
      label: 'Reverse Talent Scout',
      icon: Users,
    },
    {
      href: '/settings',
      label: 'Pengaturan & AI',
      icon: Settings2,
    },
  ];

  const renderNav = (isMobile: boolean) => (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => {
              if (isMobile) setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              isActive
                ? 'bg-secondary text-foreground font-semibold shadow-xs border border-border/40'
                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
            }`}
          >
            <Icon
              className={`w-4 h-4 shrink-0 transition-colors ${
                isActive ? 'text-brand' : 'text-muted-foreground'
              }`}
            />
            <span className="truncate">{item.label}</span>

            {item.badge ? (
              <Badge
                variant="outline"
                className="ml-auto text-[9px] px-1.5 py-0 bg-brand-subtle text-brand border-brand/30 animate-pulse font-mono font-semibold"
              >
                {item.badge}
              </Badge>
            ) : isActive ? (
              <ChevronRight className="w-3.5 h-3.5 ml-auto text-brand shrink-0" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed 240px width per design token) */}
      <aside className="hidden md:flex flex-col w-60 border-r border-border bg-card/60 backdrop-blur-md shrink-0 h-screen sticky top-0 z-30 select-none">
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-border flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center shadow-xs group-hover:border-brand/40 transition-colors">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/icon-dark.svg"
                alt="AutoApply Logo"
                className="w-5 h-5 dark:block hidden"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/icon-light.svg"
                alt="AutoApply Logo"
                className="w-5 h-5 dark:hidden block"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-foreground">
                Auto<span className="text-muted-foreground font-medium">Apply</span>
              </span>
              <span className="text-[10px] text-muted-foreground tracking-wider uppercase font-mono">
                PostgreSQL Core
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <p className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              Menu Utama
            </p>
            {renderNav(false)}
          </div>
        </div>

        {/* Database Health Footer */}
        <div className="p-3 border-t border-border bg-secondary/30">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border text-[11px] text-muted-foreground">
            <DatabaseZap className="w-3.5 h-3.5 text-success shrink-0" />
            <span className="truncate font-medium">PostgreSQL 16: Active</span>
            <span className="ml-auto w-2 h-2 rounded-full bg-success animate-pulse" />
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="relative flex flex-col w-4/5 max-w-xs bg-card border-r border-border h-full shadow-xl z-50 p-4">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  Auto<span className="text-muted-foreground">Apply</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary"
                aria-label="Tutup Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">{renderNav(true)}</div>
          </aside>
        </div>
      ) : null}
    </>
  );
};
