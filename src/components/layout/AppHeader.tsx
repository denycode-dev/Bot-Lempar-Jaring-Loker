'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, Moon, Sun, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface AppHeaderProps {
  setIsMobileMenuOpen: (open: boolean) => void;
  isBotRunning?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  setIsMobileMenuOpen,
  isBotRunning = false,
}) => {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
      const isDark =
        document.documentElement.classList.contains('dark') ||
        localStorage.getItem('theme') === 'dark';
      setTheme(isDark ? 'dark' : 'light');
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const getPageInfo = () => {
    if (pathname === '/') return { title: 'Dashboard Analytics', subtitle: 'Metrik kinerja dan status eksekusi lamaran' };
    if (pathname.startsWith('/profile')) return { title: 'Profil & Dokumen CV', subtitle: 'Informasi pelamar dan analisis kecocokan resume AI' };
    if (pathname.startsWith('/connection')) return { title: 'Koneksi Portal & EEO', subtitle: 'Status sesi portal kerja dan preferensi kepatuhan kerja' };
    if (pathname.startsWith('/questions')) return { title: 'Bank Soal Kuesioner', subtitle: 'Basis pengetahuan jawaban otomatis screening portal' };
    if (pathname.startsWith('/applications')) return { title: 'Riwayat Lamaran', subtitle: 'Daftar lowongan yang sudah dilamar beserta log audit Q&A' };
    if (pathname.startsWith('/automation')) return { title: 'Automasi Bot', subtitle: 'Peluncur bot pencari kerja dan pemantau log langsung SSE' };
    if (pathname.startsWith('/talents')) return { title: 'Reverse Talent Scout', subtitle: 'Penelusuran talenta kandidat melalui Google X-Ray Search' };
    if (pathname.startsWith('/settings')) return { title: 'Pengaturan & AI', subtitle: 'Konfigurasi provider AI terenkripsi dan parameter sistem' };
    return { title: 'AutoApply', subtitle: 'Platform automasi lamaran kerja multi-portal' };
  };

  const { title, subtitle } = getPageInfo();

  return (
    <header className="h-16 px-4 md:px-8 border-b border-border bg-card/60 backdrop-blur-md flex items-center justify-between sticky top-0 z-20 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden rounded-lg h-9 w-9 shrink-0"
          aria-label="Buka Menu"
        >
          <Menu className="w-4 h-4 text-foreground" />
        </Button>

        <div className="flex flex-col min-w-0">
          <h1 className="text-sm md:text-base font-semibold text-foreground tracking-tight truncate">
            {title}
          </h1>
          <p className="text-[11px] text-muted-foreground hidden sm:block truncate">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <Link href="/automation">
          <Button
            size="sm"
            className={`text-xs gap-1.5 h-8 font-medium ${
              isBotRunning
                ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse'
                : 'bg-brand hover:bg-brand-hover text-brand-foreground shadow-xs'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{isBotRunning ? 'Bot Berjalan' : 'Jalankan Automasi'}</span>
          </Button>
        </Link>

        {isMounted ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
            aria-label="Ganti Tema"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        ) : (
          <div className="w-8 h-8" />
        )}
      </div>
    </header>
  );
};
