"use client";

import { Camera, CheckCircle2, LockKeyhole, Upload } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils/cn";

interface ImageUploadCardProps {
  canAnalyze?: boolean;
  error?: string | null;
  fileName?: string | null;
  isAnalyzing?: boolean;
  onAnalyze?: () => void;
  onFileSelect: (file: File | null) => void;
  onOpenCamera?: () => void;
}

export function ImageUploadCard({
  canAnalyze = false,
  error,
  fileName,
  isAnalyzing = false,
  onAnalyze,
  onFileSelect,
  onOpenCamera,
}: ImageUploadCardProps) {
  return (
    <div className="rounded-[24px] border border-[var(--color-ash-cloud)] bg-white p-4 shadow-[0_24px_80px_rgba(0,38,43,0.08)] sm:p-7">
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[18px] border border-dashed border-[rgba(161,194,198,0.85)] bg-[linear-gradient(180deg,#ffffff_0%,#fafafa_100%)] px-6 py-10 text-center">
        <div className="relative mb-5 grid h-28 w-28 place-items-center rounded-full bg-[var(--color-pale-mint)] text-[var(--color-oceanic-deep)]">
          <Camera className="h-12 w-12" strokeWidth={1.55} />
          <span className="absolute bottom-4 right-3 grid h-7 w-7 place-items-center rounded-full bg-[var(--color-oceanic-deep)] text-white ring-4 ring-white">
            <Upload className="h-3.5 w-3.5" strokeWidth={2.2} />
          </span>
        </div>

        <h2 className="text-2xl font-semibold tracking-[0.004px] text-[var(--color-midnight-ink)]">
          Upload your photo
        </h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-[var(--color-slate-grille)]">
          Front-facing, well-lit photos work best for Baumann skin type
          analysis.
        </p>

        <div className="mt-7 flex w-full max-w-[320px] flex-col gap-4">
          <label className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-[var(--color-oceanic-deep)] px-7 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-midnight-ink)]">
            <Upload className="h-4 w-4" strokeWidth={2} />
            <span>{fileName ? "Replace Photo" : "Upload Photo"}</span>
            <Input
              className="sr-only"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) =>
                onFileSelect(event.target.files?.[0] ?? null)
              }
            />
          </label>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xs text-[var(--color-stone-whisper)]">
            <span className="h-px bg-[var(--color-ash-cloud)]/70" />
            <span>or</span>
            <span className="h-px bg-[var(--color-ash-cloud)]/70" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-12 gap-2 border-[var(--color-oceanic-deep)] text-[var(--color-oceanic-deep)] hover:bg-[var(--color-pale-mint)]"
            onClick={onOpenCamera}
          >
            <Camera className="h-4 w-4" strokeWidth={2} />
            Use Camera
          </Button>
        </div>

        {fileName && (
          <div className="mt-5 inline-flex max-w-full items-center gap-2 rounded-full bg-[var(--color-pale-mint)] px-4 py-2 text-sm font-medium text-[var(--color-oceanic-deep)]">
            <CheckCircle2 className="h-4 w-4" />
            <span className="truncate">{fileName}</span>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        {onAnalyze && (
          <Button
            type="button"
            size="lg"
            disabled={!canAnalyze || isAnalyzing}
            onClick={onAnalyze}
            className={cn(
              "mt-6 w-full max-w-[320px]",
              isAnalyzing && "opacity-80",
            )}
          >
            {isAnalyzing ? "Analyzing..." : "Analyze image"}
          </Button>
        )}

        <p className="mt-7 flex items-center justify-center gap-2 text-xs text-[var(--color-slate-grille)]">
          <LockKeyhole className="h-3.5 w-3.5" />
          Your photos are processed securely and never stored.
        </p>
      </div>
    </div>
  );
}
