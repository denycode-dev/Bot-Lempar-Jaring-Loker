'use client';

import React from 'react';
import { ExternalLink, FileText, Building2, MapPin, Banknote, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AppliedJobCard } from '@/components/JobCard';

interface JobDetailDialogProps {
  job: AppliedJobCard | null;
  onClose: () => void;
}

export function JobDetailDialog({ job, onClose }: JobDetailDialogProps) {
  if (!job) return null;

  return (
    <Dialog open={Boolean(job)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={(job.platform?.toLowerCase() as any) || 'default'}>
              {job.platform}
            </Badge>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {job.date}
            </span>
          </div>
          <DialogTitle className="text-base font-semibold">
            {job.title}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-1.5 text-xs">
            <Building2 className="h-3.5 w-3.5" />
            <span>{job.company}</span>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 p-5 max-h-[60vh]">
          <div className="space-y-4">
            {/* Meta Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="rounded-xl border border-border bg-muted/40 p-3">
                <span className="text-[10px] text-muted-foreground block">
                  Status Lamaran
                </span>
                <span className="font-semibold text-brand mt-0.5 block capitalize">
                  {job.status}
                </span>
              </div>
              <div className="rounded-xl border border-border bg-muted/40 p-3">
                <span className="text-[10px] text-muted-foreground block flex items-center gap-1">
                  <Banknote className="h-3 w-3" />
                  Gaji Ditampilkan
                </span>
                <span className="font-semibold text-foreground mt-0.5 block truncate tabular-nums">
                  {job.salary || 'Tidak Dicantumkan'}
                </span>
              </div>
              <div className="rounded-xl border border-border bg-muted/40 p-3 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-muted-foreground block flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Lokasi Kerja
                </span>
                <span className="font-semibold text-foreground mt-0.5 block truncate">
                  {job.location || '-'}
                </span>
              </div>
            </div>

            {/* Questions & Answers Section */}
            <div>
              <h4 className="font-semibold text-foreground mb-2.5 flex items-center gap-1.5 text-xs">
                <FileText className="h-3.5 w-3.5 text-brand" />
                <span>Pertanyaan &amp; Jawaban yang Dikirim ke HRD:</span>
              </h4>

              {job.questionsAndAnswers && job.questionsAndAnswers.length > 0 ? (
                <div className="space-y-2.5">
                  {job.questionsAndAnswers.map((qa, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-border bg-muted/30 p-3 space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-foreground text-xs">
                          {i + 1}. {qa.question}
                        </p>
                        {qa.type && (
                          <Badge variant="outline" className="text-[9px] uppercase shrink-0">
                            {qa.type}
                          </Badge>
                        )}
                      </div>
                      <div className="rounded-lg border border-brand/20 bg-brand/5 p-2.5 text-xs text-foreground">
                        <span className="font-semibold text-[10px] uppercase text-brand block mb-0.5">
                          Jawaban Bot:
                        </span>
                        <p className="whitespace-pre-wrap">{qa.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-muted/20 p-6 text-center text-xs text-muted-foreground italic">
                  Lamaran ini menggunakan formulir standar (Profil &amp; CV default). Tidak ada kuesioner kustom tambahan yang perlu dijawab.
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-4 border-t border-border bg-muted/20 flex items-center justify-between">
          {job.jobUrl ? (
            <Button
              asChild
              variant="brand"
              size="sm"
              className="gap-1.5 rounded-md"
            >
              <a
                href={job.jobUrl}
                target="_blank"
                rel="noreferrer"
              >
                <span>Buka Lowongan</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          ) : <div />}
          <Button variant="outline" size="sm" onClick={onClose} className="rounded-md">
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
