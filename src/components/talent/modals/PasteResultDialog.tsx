'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ClipboardPaste, Check, RefreshCw } from 'lucide-react';

interface PasteResultDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pastedText: string;
  onChangePastedText: (text: string) => void;
  isLoading: boolean;
  onSubmit: () => void;
}

export const PasteResultDialog: React.FC<PasteResultDialogProps> = ({
  isOpen,
  onClose,
  pastedText,
  onChangePastedText,
  isLoading,
  onSubmit,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl p-6">
        <DialogHeader className="border-b border-subtle-theme pb-3">
          <div className="flex items-center gap-2">
            <ClipboardPaste className="w-4 h-4 text-primary" />
            <DialogTitle className="text-sm font-semibold text-main-theme">
              Tempel Hasil Pencarian
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-theme mt-1">
            Salin teks hasil pencarian dari tab Google (Ctrl + A lalu Ctrl + C), kemudian tempelkan di kotak di bawah ini:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 text-xs my-2">
          <textarea
            rows={8}
            value={pastedText}
            onChange={(e) => onChangePastedText(e.target.value)}
            placeholder="Tempel teks hasil pencarian di sini..."
            className="w-full input-theme border rounded-xl p-3 text-xs font-mono focus:outline-none focus:border-primary leading-relaxed transition"
            autoFocus
          />
          <p className="text-[11px] text-muted-theme">
            Sistem akan mengekstrak nama, jabatan, domisili, tautan profil, dan nomor kontak yang tertera.
          </p>
        </div>

        <DialogFooter className="pt-3 border-t border-subtle-theme flex sm:justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
            Batal
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onSubmit}
            disabled={isLoading || !pastedText.trim()}
            className="text-xs gap-1.5 shadow-sm"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            <span>Ekstrak &amp; Simpan Data</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
