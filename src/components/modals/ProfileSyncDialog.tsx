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
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, ShieldCheck, Check } from 'lucide-react';
import { AppConfig } from '@/types';

export interface DetectedWebProfile {
  sourcePortal?: string;
  name?: string;
  phone?: string;
  email?: string;
  location?: string;
  education?: string;
  skills?: string;
}

interface ProfileSyncDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  detectedWebProfile: DetectedWebProfile | null;
  config: AppConfig;
  selectedFields: Set<string>;
  onToggleField: (field: string, checked: boolean) => void;
  onApply: () => void;
}

const PORTAL_NAMES: Record<string, string> = {
  glints: 'Glints',
  indeed: 'Indeed',
  linkedin: 'LinkedIn',
  jobstreet: 'JobStreet',
};

export const ProfileSyncDialog: React.FC<ProfileSyncDialogProps> = ({
  isOpen,
  onOpenChange,
  detectedWebProfile,
  config,
  selectedFields,
  onToggleField,
  onApply,
}) => {
  if (!detectedWebProfile) return null;

  const currentPortalName = PORTAL_NAMES[detectedWebProfile.sourcePortal || 'glints'] || 'Portal';

  const fields = [
    {
      id: 'fullName',
      label: 'Nama Lengkap',
      portalVal: detectedWebProfile.name,
      configVal: config.fullName,
    },
    {
      id: 'phoneNumber',
      label: 'Nomor WhatsApp / HP',
      portalVal: detectedWebProfile.phone,
      configVal: config.phoneNumber,
    },
    {
      id: 'email',
      label: 'Alamat Email',
      portalVal: detectedWebProfile.email,
      configVal: config.email,
    },
    {
      id: 'domicile',
      label: 'Lokasi Domisili',
      portalVal: detectedWebProfile.location,
      configVal: config.domicile,
    },
    {
      id: 'educationLevel',
      label: 'Pendidikan Terakhir',
      portalVal: detectedWebProfile.education,
      configVal: config.educationLevel,
    },
    {
      id: 'skills',
      label: 'Keahlian & Skills',
      portalVal: detectedWebProfile.skills,
      configVal: config.skills,
    },
  ].filter(f => Boolean(f.portalVal));

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-6">
        <DialogHeader className="pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-semibold text-foreground">
                Data Profil Terdeteksi dari Akun {currentPortalName}
              </DialogTitle>
              <DialogDescription className="text-[11px] text-muted-foreground mt-0.5">
                Pilih data mana saja yang ingin disinkronkan ke form AutoApply (Non-Destruktif)
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-3 rounded-xl bg-brand/5 border border-brand/20 text-xs text-foreground flex items-start gap-2.5 shrink-0 my-2">
          <ShieldCheck className="w-4 h-4 text-brand shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Akun {currentPortalName} Anda sudah memiliki data diri asli.</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Centang kolom di bawah jika Anda ingin mengimpor data dari akun {currentPortalName} ke formulir AutoApply, atau klik <strong>&quot;Pertahankan Data AutoApply&quot;</strong> jika tidak ingin mengubah data formulir saat ini.
            </p>
          </div>
        </div>

        <ScrollArea className="flex-1 border border-border rounded-xl p-1">
          <div className="divide-y divide-border">
            {fields.map((f) => {
              const isChecked = selectedFields.has(f.id);
              return (
                <div
                  key={f.id}
                  onClick={() => onToggleField(f.id, !isChecked)}
                  className="p-3.5 flex items-start gap-3 hover:bg-muted/40 cursor-pointer transition select-none"
                >
                  <Checkbox
                    id={`sync-${f.id}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => onToggleField(f.id, Boolean(checked))}
                    className="mt-0.5"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="font-semibold text-xs text-foreground">{f.label}</div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-muted-foreground">Di Akun {currentPortalName}: </span>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          {f.portalVal}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Di AutoApply: </span>
                        <span className="font-medium text-foreground truncate block">
                          {f.configVal || '(Kosong)'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <DialogFooter className="pt-3 border-t border-border flex sm:justify-between items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs text-muted-foreground hover:text-foreground rounded-md"
          >
            Pertahankan Data AutoApply (Jangan Timpa)
          </Button>

          <Button
            type="button"
            variant="brand"
            size="sm"
            onClick={onApply}
            disabled={selectedFields.size === 0}
            className="text-xs gap-1.5 rounded-md shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Impor {selectedFields.size} Kolom Terpilih ke AutoApply</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
