'use client';

import React, { useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Terminal, Copy, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface TerminalLogViewerProps {
  logs: string[];
  onClearLogs: () => void;
}

export const TerminalLogViewer: React.FC<TerminalLogViewerProps> = ({ logs, onClearLogs }) => {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCopyLogs = () => {
    if (logs.length === 0) {
      toast.info('Belum ada log untuk disalin');
      return;
    }
    navigator.clipboard.writeText(logs.join('\n'));
    toast.success(`${logs.length} baris log berhasil disalin ke clipboard!`);
  };

  return (
    <Card id="tour-terminal-logs" className="p-6 md:p-8 shadow-xs space-y-4 border-border rounded-xl">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-4 h-4 text-brand" />
          <h2 className="text-sm font-semibold text-foreground">Log Aktivitas Mesin Otomasi</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyLogs}
            className="text-xs gap-1.5 h-8 rounded-md text-muted-foreground hover:text-foreground"
            title="Salin seluruh log aktivitas ke clipboard"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Salin Log</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearLogs}
            className="text-xs h-8 rounded-md text-muted-foreground hover:text-foreground"
          >
            Bersihkan Layar
          </Button>
        </div>
      </div>

      <div
        ref={terminalRef}
        className="h-[460px] bg-zinc-950 text-zinc-200 rounded-xl border border-zinc-800 p-4 font-mono text-xs overflow-y-auto space-y-1.5 shadow-inner"
      >
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-zinc-500 italic">
            Belum ada riwayat aktivitas. Silakan jalankan bot untuk mulai memantau.
          </div>
        ) : (
          logs.map((log, index) => {
            let textClass = 'text-zinc-300';
            if (log.includes('✅') || log.includes('berhasil') || log.includes('success')) {
              textClass = 'text-emerald-400';
            } else if (log.includes('❌') || log.includes('error') || log.includes('gagal')) {
              textClass = 'text-rose-400';
            } else if (log.includes('⚠️') || log.includes('warning')) {
              textClass = 'text-amber-400';
            } else if (log.includes('🚀') || log.includes('Starting')) {
              textClass = 'text-brand font-medium';
            }

            return (
              <div key={index} className={textClass}>
                {log}
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};
