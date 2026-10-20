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
import { Bookmark, ShieldCheck, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { getBookmarkletCode, getLinkedInProfileBookmarkletCode } from '@/lib/xraySearch';

interface BookmarkletGuideDialogProps {
  type: 'google' | 'linkedin' | null;
  onClose: () => void;
}

export const BookmarkletGuideDialog: React.FC<BookmarkletGuideDialogProps> = ({
  type,
  onClose,
}) => {
  if (!type) return null;

  const isGoogle = type === 'google';
  const code = isGoogle ? getBookmarkletCode() : getLinkedInProfileBookmarkletCode();

  return (
    <Dialog open={Boolean(type)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader className="border-b border-border pb-3">
          <div className="flex items-center gap-2">
            {isGoogle ? (
              <Bookmark className="w-4 h-4 text-brand" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-brand" />
            )}
            <DialogTitle className="text-sm font-semibold text-foreground">
              {isGoogle ? 'Bookmarklet Penelusuran Google' : 'Bookmarklet Profil LinkedIn (1-Klik)'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            {isGoogle
              ? 'Tarik tombol di bawah ini ke baris bookmark browser Anda. Saat membuka tab hasil pencarian Google, klik bookmark ini untuk mengirim seluruh daftar profil ke aplikasi ini secara instan.'
              : 'Fitur ini mengekstrak seluruh riwayat kerja lengkap, durasi kerja, status #OpenToWork, preferensi lokasi, dan keahlian langsung saat Anda membuka tab profil LinkedIn kandidat.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-xs text-muted-foreground my-2">
          <div className="p-4 bg-muted/40 border border-border rounded-xl text-center space-y-2">
            <span className="text-[11px] text-muted-foreground block">Tarik tombol ini ke Bookmarks Bar:</span>
            <a
              href={code}
              onClick={(e) => {
                e.preventDefault();
                toast.info('Tarik tombol ini ke Bookmarks Bar browser Anda');
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 font-medium text-xs rounded-md shadow-xs cursor-grab active:cursor-grabbing transition bg-brand hover:bg-brand/90 text-white"
            >
              {isGoogle ? <Bookmark className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              <span>{isGoogle ? 'Kirim ke AutoApply' : 'Ekstrak Profil ke AutoApply'}</span>
            </a>
          </div>

          <div className="space-y-1 text-[11px]">
            <span className="font-semibold text-foreground block">Langkah penggunaan:</span>
            <ol className="list-decimal list-inside space-y-1">
              {isGoogle ? (
                <>
                  <li>Buka pencarian di Google.</li>
                  <li>Klik tombol bookmark di browser.</li>
                  <li>Daftar kandidat akan otomatis terkirim dan tersimpan di tabel ini.</li>
                </>
              ) : (
                <>
                  <li>Buka profil LinkedIn kandidat mana saja.</li>
                  <li>Klik tombol bookmark &quot;Ekstrak Profil ke AutoApply&quot; di browser Anda.</li>
                  <li>Data riwayat kerja &amp; background check AI langsung tersimpan di dashboard!</li>
                </>
              )}
            </ol>
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-border flex sm:justify-between items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(code);
              toast.success('Kode bookmarklet disalin ke clipboard');
            }}
            className="text-xs text-brand gap-1 rounded-md"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Salin Kode Script</span>
          </Button>

          <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs rounded-md">
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
