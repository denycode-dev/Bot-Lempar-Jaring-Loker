'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Play,
  Square,
  Save,
  Sliders,
} from 'lucide-react';
import { toast } from 'sonner';
import { TerminalLogViewer } from '@/components/logs/TerminalLogViewer';

export default function AutomationPage() {
  const [config, setConfig] = useState({
    searchKeywords: '',
    location: 'Jakarta',
    minSalary: '8000000',
    limitPerDay: 50,
    enableGlints: true,
    enableJobstreet: true,
    enableLinkedin: true,
    enableIndeed: true,
    browserMode: 'headless' as 'headless' | 'headful',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isBotRunning, setIsBotRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      if (data.success && data.config) {
        setConfig((prev) => ({
          ...prev,
          searchKeywords: data.config.searchKeywords || 'Frontend Developer',
          location: data.config.location || 'Jakarta',
          minSalary: String(data.config.minSalary || '8000000'),
          limitPerDay: data.config.limitPerDay || 50,
          enableGlints: data.config.enableGlints ?? true,
          enableJobstreet: data.config.enableJobstreet ?? true,
          enableLinkedin: data.config.enableLinkedin ?? true,
          enableIndeed: data.config.enableIndeed ?? true,
        }));
      }
    } catch (err: any) {
      toast.error('Gagal memuat kriteria: ' + err.message);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchConfig();
    }, 0);
    return () => {
      clearTimeout(timer);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [fetchConfig]);

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Kriteria pencarian berhasil disimpan ke PostgreSQL!');
      } else {
        toast.error(data.error || 'Gagal menyimpan kriteria');
      }
    } catch {
      toast.error('Terjadi kesalahan saat menyimpan kriteria');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartBot = (platform: string = 'all') => {
    if (!config.searchKeywords.trim()) {
      toast.error('Kata kunci pencarian pekerjaan wajib diisi');
      return;
    }

    if (isBotRunning) {
      toast.warning('Bot sedang berjalan');
      return;
    }

    setIsBotRunning(true);
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString('id-ID')}] 🚀 Memulai sesi AutoApply (${config.browserMode.toUpperCase()})...`,
    ]);

    const params = new URLSearchParams({
      mode: config.browserMode,
      platform,
      limit: String(config.limitPerDay),
    });

    const es = new EventSource(`/api/run-bot?${params.toString()}`);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.message) {
          setLogs((prev) => [...prev, payload.message]);
        }
      } catch {
        setLogs((prev) => [...prev, event.data]);
      }
    };

    es.onerror = () => {
      es.close();
      eventSourceRef.current = null;
      setIsBotRunning(false);
      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString('id-ID')}] ⏹️ Sesi bot selesai atau koneksi tertutup.`,
      ]);
    };
  };

  const handleStopBot = async () => {
    try {
      await fetch('/api/run-bot', { method: 'POST' });
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsBotRunning(false);
      toast.info('Sinyal penghentian bot dikirim!');
      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString('id-ID')}] 🛑 Bot dihentikan oleh pengguna.`,
      ]);
    } catch (err: any) {
      toast.error('Gagal menghentikan bot: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Criteria & Launch Control Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Criteria Form */}
        <Card className="lg:col-span-2 p-6 rounded-xl border border-border bg-card shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Target Kriteria Lowongan</h2>
                <p className="text-xs text-muted-foreground">Parameter filter pencarian di portal kerja</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveConfig}
              disabled={isSaving}
              className="text-xs h-8 gap-1.5 border-border"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Kriteria</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-foreground">Kata Kunci Posisi / Job Title *</label>
              <Input
                value={config.searchKeywords}
                onChange={(e) => setConfig({ ...config, searchKeywords: e.target.value })}
                placeholder="Contoh: Frontend Developer, React Engineer"
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Lokasi / Domisili Target</label>
              <Input
                value={config.location}
                onChange={(e) => setConfig({ ...config, location: e.target.value })}
                placeholder="Jakarta / Remote / Indonesia"
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Gaji Minimal (IDR / Bulan)</label>
              <Input
                type="number"
                value={config.minSalary}
                onChange={(e) => setConfig({ ...config, minSalary: e.target.value })}
                className="text-xs h-9 tabular-nums"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Batas Kuota Sesi (Maks Lamaran)</label>
              <Input
                type="number"
                value={config.limitPerDay}
                onChange={(e) => setConfig({ ...config, limitPerDay: Number(e.target.value) })}
                className="text-xs h-9 tabular-nums"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Mode Tampilan Browser</label>
              <select
                value={config.browserMode}
                onChange={(e) => setConfig({ ...config, browserMode: e.target.value as any })}
                className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-brand"
              >
                <option value="headless">Headless (Latar Belakang / Cepat)</option>
                <option value="headful">Headful (Jendela Terbuka / Monitoring Visual)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Right Column: Execution Control Center */}
        <Card className="p-6 rounded-xl border border-border bg-card shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="border-b border-border pb-3">
              <h3 className="text-sm font-semibold text-foreground">Status Mesin Automasi</h3>
              <p className="text-xs text-muted-foreground">Kendalikan eksekusi bot secara real-time</p>
            </div>

            <div className="p-4 rounded-xl bg-secondary/50 border border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-3 h-3 rounded-full ${
                    isBotRunning ? 'bg-emerald-500 animate-ping' : 'bg-muted-foreground'
                  }`}
                />
                <span className="text-xs font-semibold text-foreground">
                  {isBotRunning ? 'Bot Aktif Berjalan' : 'Bot Siaga (Idle)'}
                </span>
              </div>
              <Badge variant={isBotRunning ? 'default' : 'outline'} className="text-[10px]">
                {isBotRunning ? 'RUNNING' : 'STANDBY'}
              </Badge>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Bot akan mencari lowongan baru yang belum pernah dilamar di PostgreSQL, mengisi jawaban kuesioner dari
              screening bank, dan mencatat log eksekusi.
            </p>
          </div>

          <div className="space-y-2">
            {isBotRunning ? (
              <Button
                type="button"
                onClick={handleStopBot}
                className="w-full text-xs h-10 font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground gap-2 shadow-xs"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Hentikan Automasi</span>
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => handleStartBot('all')}
                className="w-full text-xs h-10 font-semibold bg-brand hover:bg-brand-hover text-brand-foreground gap-2 shadow-xs"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Mulai AutoApply (Semua Portal)</span>
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Live SSE Terminal Monitor */}
      <TerminalLogViewer logs={logs} onClearLogs={() => setLogs([])} />
    </div>
  );
}
