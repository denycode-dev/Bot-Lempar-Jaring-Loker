'use client';

import React from 'react';
import { HelpCircle, Check } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface QuestionFormData {
  question: string;
  type: string;
  options: string;
  answer: string;
}

interface QuestionFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: QuestionFormData;
  onChange: (data: QuestionFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isEditMode?: boolean;
}

export function QuestionFormDialog({
  isOpen,
  onClose,
  data,
  onChange,
  onSubmit,
  isEditMode = false,
}: QuestionFormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <HelpCircle className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle>
                {isEditMode ? 'Edit Pertanyaan Bank' : 'Tambah Pertanyaan Baru'}
              </DialogTitle>
              <DialogDescription>
                {isEditMode
                  ? 'Perbarui teks pertanyaan, tipe input, opsi, atau jawaban bot'
                  : 'Tambahkan pertanyaan kuesioner baru ke bank soal lokal'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">
                Pertanyaan
              </label>
              <Badge variant="warning" className="text-[9px]">
                Wajib
              </Badge>
            </div>
            <Input
              type="text"
              required
              placeholder="Contoh: Berapa IPK terakhir Anda?"
              value={data.question}
              onChange={(e) => onChange({ ...data, question: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Tipe Input
              </label>
              <Select
                value={data.type || 'radiobutton'}
                onValueChange={(val) => onChange({ ...data, type: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe input" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="radiobutton">Radiobutton</SelectItem>
                  <SelectItem value="text">Text / TextArea</SelectItem>
                  <SelectItem value="checklist">Checklist</SelectItem>
                  <SelectItem value="dropdown">Dropdown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground">
                  Jawaban Bot
                </label>
                <Badge variant="warning" className="text-[9px]">
                  Wajib
                </Badge>
              </div>
              <Input
                type="text"
                required
                placeholder="Contoh: 3.75 atau Ahli"
                value={data.answer}
                onChange={(e) => onChange({ ...data, answer: e.target.value })}
                className="font-semibold text-emerald-600 dark:text-emerald-400"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">
                Pilihan Opsi (Pisahkan dengan tanda | )
              </label>
              <span className="text-[10px] text-muted-foreground">Opsional</span>
            </div>
            <Input
              type="text"
              placeholder="Contoh: Dasar | Menengah | Ahli"
              value={data.options}
              onChange={(e) => onChange({ ...data, options: e.target.value })}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" size="sm" className="gap-1.5">
              <Check className="h-3.5 w-3.5" />
              <span>{isEditMode ? 'Simpan Perubahan' : 'Simpan Soal'}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
