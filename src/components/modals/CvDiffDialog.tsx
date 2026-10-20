'use client';

import React from 'react';
import { FileText, Sparkles, Check, AlertCircle, Copy } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

export interface DiffItem {
  field: string;
  label: string;
  oldVal: string;
  newVal: string;
  willChange: boolean;
}

interface CvDiffDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cvFileName?: string;
  cvExtractedText?: string;
  cvAnalyzedAt?: string;
  pendingParsedCv: any;
  pendingDiffList: DiffItem[];
  selectedDiffFields: Set<string>;
  setSelectedDiffFields: React.Dispatch<React.SetStateAction<Set<string>>>;
  onApplyPendingCvDiff: () => void;
}

export function CvDiffDialog({
  isOpen,
  onClose,
  cvFileName,
  cvExtractedText,
  cvAnalyzedAt,
  pendingParsedCv,
  pendingDiffList,
  selectedDiffFields,
  setSelectedDiffFields,
  onApplyPendingCvDiff,
}: CvDiffDialogProps) {
  const [activeTab, setActiveTab] = React.useState<'diff' | 'raw'>('diff');

  const eligibleDiffs = pendingDiffList.filter((d) => d.willChange && d.newVal);
  const allEligibleSelected =
    eligibleDiffs.length > 0 && selectedDiffFields.size === eligibleDiffs.length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-6 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle>Pratinjau CV &amp; Rencana Perubahan Profil</DialogTitle>
                {cvFileName && (
                  <Badge variant="outline" className="text-[10px]">
                    {cvFileName}
                  </Badge>
                )}
              </div>
              <DialogDescription className="mt-0.5">
                Tinjau teks hasil ekstraksi dokumen CV Anda dan bandingkan data apa saja yang akan diperbarui ke formulir.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-border shrink-0 text-xs">
          <Button
            type="button"
            variant={activeTab === 'diff' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('diff')}
            className="gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Perbandingan Data Formulir</span>
            {eligibleDiffs.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-[9px] px-1.5 py-0 bg-background">
                {eligibleDiffs.length}
              </Badge>
            )}
          </Button>

          <Button
            type="button"
            variant={activeTab === 'raw' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('raw')}
            className="gap-1.5"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>
              Teks Mentah Hasil Ekstraksi ({cvExtractedText ? cvExtractedText.length : 0} karakter)
            </span>
          </Button>
        </div>

        {/* Modal Body */}
        <ScrollArea className="flex-1 px-6 py-4 max-h-[60vh]">
          {activeTab === 'diff' ? (
            <div className="space-y-4">
              {/* Status Banner */}
              {pendingParsedCv ? (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-emerald-700 dark:text-emerald-300 text-xs">
                      Data profil berhasil diekstraksi dari dokumen!
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Tinjau tabel berikut untuk melihat kolom mana yang akan berubah atau tetap sama. Klik <strong>&ldquo;Terapkan ke Formulir&rdquo;</strong> di bawah untuk langsung memperbarui profil.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-amber-700 dark:text-amber-300 text-xs">
                      Ekstraksi AI Belum Dikonfigurasi
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Teks mentah PDF sudah berhasil dibaca 100%, namun API Key AI di Pengaturan belum aktif. Anda tetap dapat membaca teks aslinya di tab &ldquo;Teks Mentah&rdquo;.
                    </p>
                  </div>
                </div>
              )}

              {/* Diffs Table */}
              <div className="rounded-2xl border border-border overflow-hidden">
                {pendingDiffList.length > 0 && pendingParsedCv && (
                  <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b border-border">
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-foreground select-none">
                      <Checkbox
                        checked={allEligibleSelected}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedDiffFields(new Set(eligibleDiffs.map((d) => d.field)));
                          } else {
                            setSelectedDiffFields(new Set());
                          }
                        }}
                      />
                      <span>Pilih semua yang berubah</span>
                    </label>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span className="font-semibold text-primary">{selectedDiffFields.size}</span>
                      <span>/ {eligibleDiffs.length} kolom dipilih</span>
                      {selectedDiffFields.size > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedDiffFields(new Set())}
                          className="ml-2 text-destructive hover:underline"
                        >
                          Batal semua
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-muted/60 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        <th className="p-3 w-10 text-center">Pilih</th>
                        <th className="p-3">Nama Kolom</th>
                        <th className="p-3 w-1/3">Nilai Saat Ini</th>
                        <th className="p-3 w-1/3">Nilai Baru dari CV</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {pendingDiffList.length > 0 ? (
                        pendingDiffList.map((item) => {
                          const isSelected = selectedDiffFields.has(item.field);
                          const canSelect = item.willChange && Boolean(item.newVal);

                          return (
                            <tr
                              key={item.field}
                              onClick={() => {
                                if (!canSelect) return;
                                setSelectedDiffFields((prev) => {
                                  const next = new Set(prev);
                                  next.has(item.field) ? next.delete(item.field) : next.add(item.field);
                                  return next;
                                });
                              }}
                              className={`transition-colors ${
                                canSelect ? 'cursor-pointer hover:bg-muted/40' : 'opacity-70'
                              } ${isSelected && canSelect ? 'bg-primary/5' : ''}`}
                            >
                              <td className="p-3 text-center align-middle">
                                {canSelect ? (
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() => {
                                      setSelectedDiffFields((prev) => {
                                        const next = new Set(prev);
                                        next.has(item.field)
                                          ? next.delete(item.field)
                                          : next.add(item.field);
                                        return next;
                                      });
                                    }}
                                  />
                                ) : (
                                  <span className="inline-block h-4 w-4 rounded border border-border bg-muted/40" />
                                )}
                              </td>
                              <td className="p-3 font-medium text-foreground align-top">
                                {item.label}
                              </td>
                              <td className="p-3 text-muted-foreground font-mono text-[11px] align-top break-all">
                                {item.oldVal || <span className="italic text-muted-foreground/60">(Kosong)</span>}
                              </td>
                              <td className="p-3 font-mono text-[11px] align-top break-all">
                                {item.willChange ? (
                                  <span
                                    className={`font-semibold ${
                                      isSelected
                                        ? 'text-primary'
                                        : 'text-muted-foreground line-through'
                                    }`}
                                  >
                                    {item.newVal}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">
                                    {item.newVal || (
                                      <span className="italic text-muted-foreground/60">
                                        (Sama / Tidak Ditemukan)
                                      </span>
                                    )}
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-center align-middle whitespace-nowrap">
                                {item.willChange ? (
                                  isSelected ? (
                                    <Badge variant="success" className="text-[10px]">
                                      Akan Diterapkan
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="text-[10px] line-through">
                                      Dilewati
                                    </Badge>
                                  )
                                ) : (
                                  <Badge variant="secondary" className="text-[10px]">
                                    Tetap Sama
                                  </Badge>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-muted-foreground italic">
                            Belum ada komparasi data aktif. Silakan unggah CV terlebih dahulu.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Seluruh halaman dokumen PDF diekstrak menjadi teks digital di bawah:</span>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => {
                    if (cvExtractedText) {
                      navigator.clipboard.writeText(cvExtractedText);
                      toast.success('Teks CV disalin ke clipboard!');
                    }
                  }}
                  className="gap-1"
                >
                  <Copy className="h-3 w-3" />
                  <span>Salin Teks</span>
                </Button>
              </div>
              <pre className="p-4 rounded-2xl bg-muted/40 border border-border text-foreground font-mono text-[11px] whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[420px] select-all">
                {cvExtractedText || 'Teks CV belum dimuat atau kosong.'}
              </pre>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <DialogFooter className="p-4 border-t border-border bg-muted/20 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            {cvAnalyzedAt ? `Waktu analisis: ${cvAnalyzedAt}` : ''}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Tutup
            </Button>
            {pendingParsedCv && (
              <Button
                type="button"
                size="sm"
                onClick={onApplyPendingCvDiff}
                disabled={selectedDiffFields.size === 0}
                className="gap-1.5"
              >
                <Check className="h-3.5 w-3.5" />
                <span>
                  Terapkan {selectedDiffFields.size > 0 ? `${selectedDiffFields.size} Kolom` : ''} ke Formulir
                </span>
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
