'use client';

import React from 'react';
import { Users, Info, Check } from 'lucide-react';
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

interface AddAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  newAccountName: string;
  setNewAccountName: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AddAccountDialog({
  isOpen,
  onClose,
  newAccountName,
  setNewAccountName,
  onSubmit,
}: AddAccountDialogProps) {
  const safeFolderName = newAccountName.trim()
    ? `automation-profile-${newAccountName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-')}`
    : '';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle>Tambah Profil Akun Browser</DialogTitle>
              <DialogDescription>
                Buat profil terisolasi baru untuk rotasi akun dan sesi multi-portal
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Nama Profil Akun
            </label>
            <Input
              type="text"
              required
              autoFocus
              placeholder="Contoh: Akun Alternatif / Akun Kerja 2"
              value={newAccountName}
              onChange={(e) => setNewAccountName(e.target.value)}
            />
          </div>

          {safeFolderName && (
            <div className="rounded-xl border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
              <span className="mb-0.5 block font-semibold text-foreground">
                Nama Folder Sesi:
              </span>
              <span className="font-mono text-[11px] text-primary">
                {safeFolderName}
              </span>
            </div>
          )}

          <div className="flex items-start gap-2 rounded-xl border border-border/60 bg-muted/30 p-3 text-[11px] text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <span>
              Setiap profil akun memiliki folder penyimpanan sesi, cookies, dan cache browser mandiri yang tidak saling menimpa.
            </span>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                setNewAccountName('');
              }}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" className="gap-1.5">
              <Check className="h-3.5 w-3.5" />
              <span>Simpan &amp; Aktifkan Akun</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
