'use client';

import React from 'react';
import { ShieldCheck, Lightbulb, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type PlatformKey = 'linkedin' | 'indeed' | 'glints' | 'jobstreet';

interface CookieImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetPlatform: PlatformKey;
  setTargetPlatform: (platform: PlatformKey) => void;
  rawCookieInput: string;
  setRawCookieInput: (val: string) => void;
  onSaveCookie: () => void;
  initialCookies?: Record<string, string>;
}

export function CookieImportDialog({
  isOpen,
  onClose,
  targetPlatform,
  setTargetPlatform,
  rawCookieInput,
  setRawCookieInput,
  onSaveCookie,
  initialCookies,
}: CookieImportDialogProps) {
  const platforms: PlatformKey[] = ['linkedin', 'indeed', 'glints', 'jobstreet'];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle>Impor Cookie Sesi Browser</DialogTitle>
              <DialogDescription>
                Bypass Cloudflare Turnstile &amp; Google OAuth secara instan
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Platform Selector Grid */}
          <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl border border-border bg-muted/40 text-xs font-medium">
            {platforms.map((p) => (
              <Button
                key={p}
                type="button"
                variant={targetPlatform === p ? 'default' : 'ghost'}
                size="xs"
                onClick={() => {
                  setTargetPlatform(p);
                  if (initialCookies && initialCookies[p]) {
                    setRawCookieInput(initialCookies[p]);
                  } else {
                    setRawCookieInput('');
                  }
                }}
                className="capitalize"
              >
                {p}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-foreground">
                Paste JSON Cookie atau Teks Header ({targetPlatform.toUpperCase()}):
              </span>
              <span className="text-muted-foreground">Dari ekstensi Cookie-Editor</span>
            </div>

            <Textarea
              rows={7}
              value={rawCookieInput}
              onChange={(e) => setRawCookieInput(e.target.value)}
              placeholder={`Paste cookie ${targetPlatform} di sini (format JSON array [...] atau string li_at=...)...`}
              className="font-mono text-xs"
            />

            <div className="flex items-start gap-2 rounded-xl border border-border/60 bg-muted/30 p-3 text-[11px] text-muted-foreground leading-relaxed">
              <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                <strong>Cara Cepat:</strong> Buka {targetPlatform} di Chrome biasa Anda &gt; Buka ekstensi <em>Cookie-Editor</em> &gt; Klik <em>Export (JSON)</em> &gt; Tempel (Paste) di atas lalu klik Simpan.
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onSaveCookie}
            className="gap-1.5"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Simpan Cookie {targetPlatform.toUpperCase()}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
