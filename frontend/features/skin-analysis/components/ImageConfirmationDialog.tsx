"use client";

import { useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import {
  Check,
  ImagePlus,
  Move,
  RotateCcw,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createCroppedImageFile } from "@/features/skin-analysis/utils/cropImage";

interface ImageConfirmationDialogProps {
  fileName: string;
  imageUrl: string;
  onCancel: () => void;
  onConfirm: (croppedFile: File) => void;
  onRepick: (file: File | null) => void;
}

export function ImageConfirmationDialog({
  fileName,
  imageUrl,
  onCancel,
  onConfirm,
  onRepick,
}: ImageConfirmationDialogProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [cropError, setCropError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) {
      setCropError("Area crop belum siap. Coba geser atau perbesar gambar.");
      return;
    }

    setIsSaving(true);
    setCropError(null);

    try {
      const croppedFile = await createCroppedImageFile(
        imageUrl,
        croppedAreaPixels,
        fileName,
      );
      onConfirm(croppedFile);
    } catch (error) {
      setCropError(
        error instanceof Error
          ? error.message
          : "Gambar tidak dapat dipotong.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[rgba(0,38,43,0.42)] px-4 py-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-preview-title"
    >
      <div className="my-auto w-full max-w-3xl rounded-[24px] border border-[#EAEAEA] bg-white p-5 shadow-[0_32px_90px_rgba(0,38,43,0.18)] sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-deep-teal)]">
              Atur posisi foto
            </p>
            <h2
              id="image-preview-title"
              className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[var(--color-midnight-ink)]"
            >
              Posisikan wajah di dalam lingkaran
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

        <div className="relative aspect-square overflow-hidden rounded-[18px] border border-[var(--color-ash-cloud)] bg-[#162A2D] sm:aspect-[4/3]">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            objectFit="contain"
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_croppedArea, croppedPixels) =>
              setCroppedAreaPixels(croppedPixels)
            }
          />
          <div className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[rgba(0,38,43,0.72)] px-4 py-2 text-xs font-medium text-white backdrop-blur-sm">
            <Move className="h-3.5 w-3.5" />
            Geser foto untuk mengatur posisi wajah
          </div>
        </div>

        <div className="mt-5 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
          <ZoomOut
            aria-hidden="true"
            className="h-5 w-5 text-[var(--color-slate-grille)]"
          />
          <Input
            aria-label="Perbesar atau perkecil gambar"
            className="h-2 cursor-pointer appearance-none border-0 bg-[var(--color-ash-cloud)] p-0 accent-[var(--color-oceanic-deep)]"
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
          />
          <ZoomIn
            aria-hidden="true"
            className="h-5 w-5 text-[var(--color-slate-grille)]"
          />
        </div>

        {cropError && (
          <p className="mt-4 text-sm font-medium text-destructive">{cropError}</p>
        )}

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            disabled={isSaving}
            onClick={onCancel}
          >
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
          <Button type="button" disabled={isSaving} onClick={handleConfirm}>
            <Check className="h-4 w-4" />
            {isSaving ? "Memproses..." : "Gunakan hasil crop"}
          </Button>
        </div>

        <p className="mt-4 flex items-center gap-2 text-xs text-[var(--color-slate-grille)]">
          <ImagePlus className="h-3.5 w-3.5" />
          Pastikan seluruh wajah terlihat di dalam lingkaran, termasuk dahi,
          pipi, dan dagu.
        </p>
      </div>
    </div>
  );
}
