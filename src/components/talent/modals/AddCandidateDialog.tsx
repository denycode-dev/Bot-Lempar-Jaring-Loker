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
import { Plus, Check, RefreshCw } from 'lucide-react';
import { TalentCandidate } from '@/lib/talentTypes';

interface AddCandidateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Partial<TalentCandidate>;
  onChangeCandidate: (candidate: Partial<TalentCandidate>) => void;
  isLoading: boolean;
  onSubmit: () => void;
}

export const AddCandidateDialog: React.FC<AddCandidateDialogProps> = ({
  isOpen,
  onClose,
  candidate,
  onChangeCandidate,
  isLoading,
  onSubmit,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-6">
        <DialogHeader className="border-b border-subtle-theme pb-3">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" />
            <DialogTitle className="text-sm font-semibold text-main-theme">
              Tambah Profil Kandidat
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-theme mt-1">
            Masukkan informasi kandidat untuk disimpan dan dianalisis oleh AI.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-xs my-2">
          <div>
            <label className="block text-xs font-medium text-main-theme mb-1">Nama Lengkap</label>
            <input
              type="text"
              required
              value={candidate.name || ''}
              onChange={(e) => onChangeCandidate({ ...candidate, name: e.target.value })}
              className="w-full input-theme border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-primary transition"
              placeholder="Nama kandidat"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-main-theme mb-1">Headline / Jabatan</label>
            <input
              type="text"
              value={candidate.headline || ''}
              onChange={(e) => onChangeCandidate({ ...candidate, headline: e.target.value })}
              className="w-full input-theme border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-primary transition"
              placeholder="Contoh: Staff Gudang | Administrasi Logistik"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-main-theme mb-1">Tautan Profil</label>
            <input
              type="url"
              required
              value={candidate.profileUrl || ''}
              onChange={(e) => onChangeCandidate({ ...candidate, profileUrl: e.target.value })}
              className="w-full input-theme border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-primary transition"
              placeholder="https://id.linkedin.com/in/username"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-main-theme mb-1">Nomor WhatsApp / HP</label>
              <input
                type="text"
                value={candidate.phone || ''}
                onChange={(e) => onChangeCandidate({ ...candidate, phone: e.target.value })}
                className="w-full input-theme border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-primary transition"
                placeholder="08123456789"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-main-theme mb-1">Domisili Kota</label>
              <input
                type="text"
                value={candidate.location || ''}
                onChange={(e) => onChangeCandidate({ ...candidate, location: e.target.value })}
                className="w-full input-theme border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-primary transition"
                placeholder="Surabaya / Sidoarjo"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-subtle-theme flex sm:justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
            Batal
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onSubmit}
            disabled={isLoading || !candidate.name?.trim() || !candidate.profileUrl?.trim()}
            className="text-xs gap-1.5 shadow-sm"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            <span>Simpan &amp; Analisis AI</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
