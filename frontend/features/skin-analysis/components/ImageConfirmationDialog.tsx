"use client";

import Image from "next/image";
import { Check, ImagePlus, RotateCcw, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface ImageConfirmationDialogProps {
  fileName: string;
  imageUrl: string;
  onCancel: () => void;
  onConfirm: () => void;
  onRepick: (file: File | null) => void;
}

export function ImageConfirmationDialog({
  fileName,
  imageUrl,
  onCancel,
  onConfirm,
  onRepick,
}: ImageConfirmationDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[rgba(0,38,43,0.42)] px-4 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-preview-title"
    >
      <div className="w-full max-w-2xl rounded-[24px] border border-[#EAEAEA] bg-white p-5 shadow-[0_32px_90px_rgba(0,38,43,0.18)] sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-deep-teal)]">
              Pratinjau unggahan
            </p>
            <h2
              id="image-preview-title"
              className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[var(--color-midnight-ink)]"
            >
              Konfirmasi foto ini
            </h2>
            <p className="mt-1 max-w-lg truncate text-sm text-[var(--color-slate-grille)]">
              {fileName}
            </p>
          </div>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full text-[var(--color-slate-grille)] transition-colors hover:bg-[#EDF3EC] hover:text-[var(--color-midnight-ink)]"
            aria-label="Tutup pratinjau unggahan"
            onClick={onCancel}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-[18px] border border-[var(--color-ash-cloud)] bg-[var(--color-fog-gray)]">
          <Image
            src={imageUrl}
            alt="Pratinjau gambar yang dipilih"
            fill
            className="object-cover"
          />
        </div>

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onCancel}>
            <X className="h-4 w-4" />
            Batal
          </Button>
          <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-[var(--color-spring-leaf)] bg-white px-7 text-sm font-medium text-[var(--color-oceanic-deep)] transition-colors hover:bg-[var(--color-pale-mint)]">
            <RotateCcw className="h-4 w-4" />
            Pilih ulang
            <Input
              className="sr-only"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => onRepick(event.target.files?.[0] ?? null)}
            />
          </label>
          <Button type="button" onClick={onConfirm}>
            <Check className="h-4 w-4" />
            Konfirmasi foto
          </Button>
        </div>

        <p className="mt-4 flex items-center gap-2 text-xs text-[var(--color-slate-grille)]">
          <ImagePlus className="h-3.5 w-3.5" />
          Konfirmasi hanya foto dengan wajah di tengah, tajam, dan memiliki
          pencahayaan merata.
        </p>
      </div>
    </div>
  );
}
