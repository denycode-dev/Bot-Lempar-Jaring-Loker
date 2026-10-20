'use client';

import React from 'react';
import {
  Bookmark,
  BookmarkPlus,
  BookmarkCheck,
  RotateCcw,
  Check,
  Clock,
  RefreshCw,
  Trash2,
  Sliders,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface ConfigPresetItem {
  id: string;
  name: string;
  savedAt: string;
  config: any;
}

interface PresetsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  configPresets: ConfigPresetItem[];
  newPresetName: string;
  setNewPresetName: (val: string) => void;
  isSavingPreset: boolean;
  onSavePreset: () => void;
  onLoadPreset: (preset: ConfigPresetItem) => void;
  onOverwritePreset: (preset: ConfigPresetItem) => void;
  onDeletePreset: (preset: ConfigPresetItem) => void;
  onRestoreDraft: () => void;
}

export function PresetsDialog({
  isOpen,
  onClose,
  configPresets,
  newPresetName,
  setNewPresetName,
  isSavingPreset,
  onSavePreset,
  onLoadPreset,
  onOverwritePreset,
  onDeletePreset,
  onRestoreDraft,
}: PresetsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
              <Bookmark className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Preset Konfigurasi</DialogTitle>
              <DialogDescription>
                Simpan dan muat ulang konfigurasi formulir kapan saja tanpa mengetik ulang
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Restore Draft Banner */}
        <div className="px-6 pt-4 shrink-0">
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <RotateCcw className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <div className="text-xs font-medium text-foreground">
                  Draft Terakhir (Auto-Tersimpan)
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Formulir disimpan otomatis setiap ada perubahan ke browser storage.
                </div>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onRestoreDraft();
                onClose();
              }}
              className="gap-1.5 shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Pulihkan Draft</span>
            </Button>
          </div>
        </div>

        {/* Save New Preset Input */}
        <div className="px-6 pt-3 shrink-0">
          <div className="p-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <BookmarkPlus className="h-4 w-4" />
              <span>Simpan Konfigurasi Saat Ini sebagai Preset Baru</span>
            </div>
            <div className="flex gap-2">
              <Input
                type="text"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSavePreset();
                }}
                placeholder="Nama preset (mis: Lamaran Fullstack Remote, QA Engineer Jakarta...)"
                className="flex-1"
              />
              <Button
                type="button"
                disabled={!newPresetName.trim() || isSavingPreset}
                onClick={onSavePreset}
                size="sm"
                className="gap-1.5 shrink-0 bg-amber-500 hover:bg-amber-600 text-white"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Simpan</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Presets List */}
        <ScrollArea className="flex-1 px-6 py-4 max-h-[50vh]">
          {configPresets.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
                <Bookmark className="h-6 w-6" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">
                  Belum ada preset tersimpan
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Ketik nama preset di atas lalu klik &ldquo;Simpan&rdquo; untuk menyimpan profil Anda.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider pb-1">
                {configPresets.length} Preset Tersimpan
              </div>
              {configPresets.map((preset) => {
                const platforms = [
                  preset.config.enableGlints && 'Glints',
                  preset.config.enableJobstreet && 'Jobstreet',
                  preset.config.enableLinkedin && 'LinkedIn',
                  preset.config.enableIndeed && 'Indeed',
                ].filter(Boolean);

                const savedDate = new Date(preset.savedAt);
                return (
                  <div
                    key={preset.id}
                    className="p-4 rounded-2xl border border-border bg-card hover:border-amber-500/40 transition-all group space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 shrink-0 mt-0.5">
                          <BookmarkCheck className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-foreground truncate">
                            {preset.name}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap text-[11px] text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>
                              {savedDate.toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          onClick={() => onOverwritePreset(preset)}
                          className="gap-1 text-muted-foreground hover:text-amber-500"
                          title="Timpa preset ini dengan konfigurasi saat ini"
                        >
                          <RefreshCw className="h-3 w-3" />
                          <span>Timpa</span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => onDeletePreset(preset)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="Hapus preset ini"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {platforms.map((p) => (
                          <Badge key={p as string} variant="secondary" className="text-[9px]">
                            {p}
                          </Badge>
                        ))}
                      </div>

                      <Button
                        type="button"
                        size="xs"
                        onClick={() => onLoadPreset(preset)}
                        className="bg-amber-500 hover:bg-amber-600 text-white font-medium"
                      >
                        Muat Preset
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="p-4 border-t border-border bg-muted/20">
          <Button variant="outline" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
