'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Play, Pause, CheckCircle2, AlertCircle, HelpCircle, Lightbulb, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface BatchQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinished?: () => void;
}

export default function BatchQuestionModal({ isOpen, onClose, onFinished }: BatchQuestionModalProps) {
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [lastQuestion, setLastQuestion] = useState('');
  const [lastAnswer, setLastAnswer] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isRunningRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      fetchProgress();
    }
  }, [isOpen]);

  const fetchProgress = async () => {
    try {
      const res = await fetch('/api/questions/batch-answer');
      const data = await res.json();
      if (data.success) {
        setTotalQuestions(data.total || 0);
        setCurrentIndex(data.currentIndex || 0);
        setProgress(data.progress || 0);
        setIsDone(data.completed || false);
      }
    } catch (err) {
      console.error('Failed to fetch batch progress:', err);
    }
  };

  const startBatchProcess = async () => {
    if (isRunning) return;
    setIsRunning(true);
    isRunningRef.current = true;
    setErrorMsg(null);

    let nextIdx = currentIndex;

    try {
      while (isRunningRef.current) {
        const res = await fetch('/api/questions/batch-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ startIndex: nextIdx, chunkSize: 20 }),
        });

        const data = await res.json();

        if (!data.success) {
          throw new Error(data.error || 'Terjadi kesalahan saat memproses pertanyaan');
        }

        setCurrentIndex(data.nextIndex);
        setProgress(data.progress);
        setTotalQuestions(data.total);

        if (data.currentSampleQuestion) {
          setLastQuestion(data.currentSampleQuestion);
          setLastAnswer(data.currentSampleAnswer || '');
        }

        if (data.completed || data.nextIndex >= data.total) {
          setIsDone(true);
          setIsRunning(false);
          isRunningRef.current = false;
          toast.success('Seluruh 1.000 pertanyaan berhasil dipersonalisasi dengan profil Anda!');
          if (onFinished) onFinished();
          break;
        }

        nextIdx = data.nextIndex;

        // Jeda kecil antar chunk agar browser lancar dan aman dari rate limit API
        await new Promise(r => setTimeout(r, 600));
      }
    } catch (err: any) {
      console.error('Batch Answer Error:', err);
      setErrorMsg(err.message || String(err));
      setIsRunning(false);
      isRunningRef.current = false;
      toast.error(`Gagal di pertanyaan ke-${nextIdx}: ${err.message || err}`);
    }
  };

  const pauseBatchProcess = () => {
    setIsRunning(false);
    isRunningRef.current = false;
    toast.info('Proses dihentikan sementara (Paused). Anda bisa melanjutkannya kapan saja.');
  };

  const resetProcess = () => {
    setIsRunning(false);
    isRunningRef.current = false;
    setCurrentIndex(0);
    setProgress(0);
    setIsDone(false);
    setErrorMsg(null);
    setLastQuestion('');
    setLastAnswer('');
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          if (isRunning) pauseBatchProcess();
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-2xl p-6">
        <DialogHeader className="pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand/10 text-brand">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-foreground">
                Personalisasi 1.000 Pertanyaan Bank (Batch AI)
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                AI akan membaca profil CV Anda dan menyiapkan jawaban presisi secara offline di memori bot.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Body Content */}
        <div className="space-y-5 my-2">
          {/* Progress Bar & Percent */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-muted-foreground flex items-center gap-1.5">
                Progres Pengisian
                {isRunning && (
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                )}
              </span>
              <span className="text-brand font-mono text-sm">
                {progress}% ({currentIndex} / {totalQuestions})
              </span>
            </div>
            <Progress value={progress} className="h-2.5" />
          </div>

          {/* Real-time Processing Card */}
          <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>PERTANYAAN TERAKHIR YANG DIJAWAB AI</span>
              <span className="text-[11px] font-mono">Chunk per 20 soal</span>
            </div>

            {lastQuestion ? (
              <div className="space-y-1.5 animate-in fade-in duration-150">
                <div className="flex items-start gap-1.5 text-xs font-medium text-foreground line-clamp-2">
                  <HelpCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>&ldquo;{lastQuestion}&rdquo;</span>
                </div>
                <div className="p-2.5 rounded-lg bg-background border border-border text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                  <span className="line-clamp-2">Jawaban Anda: {lastAnswer || 'Dipilih opsi terdekat'}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                {isRunning
                  ? 'Sedang menghubungi AI untuk batch pertama...'
                  : 'Klik tombol "Mulai Proses AI" di bawah untuk memulai penjawab otomatis.'}
              </p>
            )}
          </div>

          {/* Info Card */}
          <div className="p-3.5 rounded-xl bg-brand/5 border border-brand/20 text-xs text-foreground space-y-1 leading-relaxed">
            <p className="font-semibold flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-brand shrink-0" />
              <span>Keuntungan Pre-Answer:</span>
            </p>
            <p className="text-[11px] text-muted-foreground">
              Begitu bank soal selesai dijawab, bot saat melamar di <strong>Glints, LinkedIn, JobStreet, &amp; Indeed</strong> akan merespons dalam <strong>0 detik</strong> tanpa jeda panggilan AI live!
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <DialogFooter className="pt-3 border-t border-border flex sm:justify-between items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={resetProcess}
            disabled={isRunning}
            className="text-xs text-muted-foreground hover:text-foreground gap-1.5 rounded-md"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset dari Awal</span>
          </Button>

          <div className="flex items-center gap-2">
            {isRunning ? (
              <Button
                type="button"
                size="sm"
                onClick={pauseBatchProcess}
                className="bg-amber-500 hover:bg-amber-600 text-white text-xs gap-1.5 rounded-md"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Jeda (Pause)</span>
              </Button>
            ) : isDone ? (
              <Button
                type="button"
                size="sm"
                onClick={onClose}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 rounded-md"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Selesai (Tutup)</span>
              </Button>
            ) : (
              <Button
                type="button"
                variant="brand"
                size="sm"
                onClick={startBatchProcess}
                className="text-xs gap-1.5 rounded-md shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{currentIndex > 0 ? 'Lanjutkan Proses AI' : 'Mulai Proses AI'}</span>
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
