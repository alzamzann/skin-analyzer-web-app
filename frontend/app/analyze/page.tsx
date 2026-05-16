"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Focus,
  LockKeyhole,
  ScanFace,
  Smile,
  Sparkles,
  SunMedium,
  Target,
} from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { AnalysisError } from "@/features/skin-analysis/components/AnalysisError";
import { AnalysisLoading } from "@/features/skin-analysis/components/AnalysisLoading";
import { CameraCapture } from "@/features/skin-analysis/components/CameraCapture";
import { ImageConfirmationDialog } from "@/features/skin-analysis/components/ImageConfirmationDialog";
import { ImagePreview } from "@/features/skin-analysis/components/ImagePreview";
import { ImageUploadCard } from "@/features/skin-analysis/components/ImageUploadCard";
import { useAnalyzeSkin } from "@/features/skin-analysis/hooks/useAnalyzeSkin";
import { useImageUpload } from "@/features/skin-analysis/hooks/useImageUpload";

const capabilities = [
  {
    icon: Sparkles,
    title: "AI-powered analysis",
    description: "Advanced multi-label model",
  },
  {
    icon: ScanFace,
    title: "Baumann skin type",
    description: "Mapped into 1 of 16 skin types",
  },
  {
    icon: Target,
    title: "Personalized insights",
    description: "Ingredients and products tailored to you",
  },
];

const guidance = [
  { icon: Focus, label: "Face front and centered" },
  { icon: SunMedium, label: "Good, natural lighting" },
  { icon: BadgeCheck, label: "No makeup or sunglasses" },
  { icon: Smile, label: "Neutral expression" },
];

export default function AnalyzePage() {
  const [showCamera, setShowCamera] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null);
  const { error: uploadError, file, previewUrl, selectFile } = useImageUpload();
  const { analyze, error: analysisError, result, status } = useAnalyzeSkin();
  const isAnalyzing = status === "loading";

  const stageFileForPreview = (nextFile: File | null) => {
    if (!nextFile) {
      return;
    }

    setPendingFile(nextFile);
    setPendingPreviewUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }

      return URL.createObjectURL(nextFile);
    });
  };

  const closePendingPreview = () => {
    if (pendingPreviewUrl) {
      URL.revokeObjectURL(pendingPreviewUrl);
    }

    setPendingFile(null);
    setPendingPreviewUrl(null);
  };

  const confirmPendingFile = () => {
    if (!pendingFile) {
      return;
    }

    selectFile(pendingFile);
    closePendingPreview();
  };

  return (
    <main className="min-h-[100dvh] bg-[radial-gradient(circle_at_top,#f7fbfb_0%,#ebebeb_52%,#ffffff_100%)] text-[var(--color-midnight-ink)]">
      <Navbar
        action={
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        }
        brandHref="/"
        className="bg-transparent"
        items={[
          { label: "Home", href: "/" },
          { label: "Upload", href: "#upload" },
          { label: "Guidance", href: "#guidance" },
          { label: "Privacy", href: "/#privacy" },
        ]}
      />

      <div className="mx-auto flex min-h-[calc(100dvh-99px)] w-full max-w-[1480px] flex-col px-4 sm:px-6">

        <section className="mx-auto w-full max-w-5xl pb-8 pt-14 text-center sm:pt-16">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-deep-teal)]">
            Skin analyzer
          </p>
          <h1 className="mt-4 text-5xl font-semibold leading-none tracking-[-0.04em] text-[var(--color-midnight-ink)] sm:text-6xl">
            Upload one clear face photo.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[var(--color-slate-grille)] sm:text-lg">
            Dermalyzer maps visible skin signals into a Baumann-style profile,
            then prepares ingredient and product guidance for your routine.
          </p>
        </section>

        <section
          aria-label="Analysis capabilities"
          className="mx-auto grid w-full max-w-4xl gap-0 overflow-hidden rounded-[20px] border border-[var(--color-ash-cloud)] bg-white/95 shadow-[0_18px_60px_rgba(0,38,43,0.06)] md:grid-cols-3"
        >
          {capabilities.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="flex items-center gap-4 border-b border-[var(--color-ash-cloud)]/60 p-5 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0"
              >
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[var(--color-pale-mint)] text-[var(--color-oceanic-deep)]">
                  <Icon className="h-6 w-6" strokeWidth={1.7} />
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-[var(--color-midnight-ink)]">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-[var(--color-slate-grille)]">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </section>

        <section
          id="upload"
          className="mx-auto grid w-full max-w-4xl gap-6 py-6 lg:grid-cols-[1.08fr_0.92fr]"
        >
          <ImageUploadCard
            canAnalyze={Boolean(file) && !isAnalyzing}
            error={uploadError}
            fileName={file?.name}
            isAnalyzing={isAnalyzing}
            onAnalyze={() => file && analyze(file)}
            onFileSelect={stageFileForPreview}
            onOpenCamera={() => setShowCamera(true)}
          />

          <aside className="space-y-4 rounded-[24px] border border-[var(--color-ash-cloud)] bg-white/90 p-5 shadow-[0_18px_60px_rgba(0,38,43,0.06)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-deep-teal)]">
                Preview
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.01em]">
                Confirmed analysis image
              </h2>
            </div>
            <ImagePreview imageUrl={previewUrl} />
            {isAnalyzing && <AnalysisLoading />}
            {analysisError && <AnalysisError message={analysisError} />}
            {status === "success" && result && (
              <div className="rounded-[18px] border border-[var(--color-ash-cloud)] bg-[var(--color-pale-mint)] p-4 text-sm leading-6 text-[var(--color-oceanic-deep)]">
                Analysis finished. Your result is ready to review on the
                results page once the final results flow is connected.
              </div>
            )}
            <div className="flex items-start gap-3 rounded-[18px] bg-[var(--color-fog-gray)] p-4 text-sm leading-6 text-[var(--color-slate-grille)]">
              <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-oceanic-deep)]" />
              <p>
                Use a clear image where the full face is visible. Avoid heavy
                shadows, filters, sunglasses, or side angles.
              </p>
            </div>
          </aside>
        </section>

        <section
          id="guidance"
          className="mx-auto mb-8 grid w-full max-w-4xl gap-0 overflow-hidden rounded-[18px] border border-[var(--color-ash-cloud)] bg-white/80 shadow-[0_16px_50px_rgba(0,38,43,0.05)] md:grid-cols-[1.1fr_repeat(4,1fr)]"
        >
          <div className="flex items-center gap-3 border-b border-[var(--color-ash-cloud)]/60 p-5 text-[var(--color-oceanic-deep)] md:border-b-0 md:border-r">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-semibold">For best results</span>
          </div>
          {guidance.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="flex items-center gap-3 border-b border-[var(--color-ash-cloud)]/60 p-5 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0"
              >
                <Icon
                  className="h-5 w-5 shrink-0 text-[var(--color-stone-whisper)]"
                  strokeWidth={1.55}
                />
                <span className="text-sm leading-5 text-[var(--color-slate-grille)]">
                  {item.label}
                </span>
              </div>
            );
          })}
        </section>

        <footer className="mt-auto border-t border-[var(--color-ash-cloud)]/60 py-8 text-center">
          <div className="flex flex-col items-center justify-center gap-4 text-sm text-[var(--color-slate-grille)] sm:flex-row">
            <span className="text-xl font-bold tracking-[-0.02em] text-[var(--color-oceanic-deep)]">
              Dermalyzer
            </span>
            <Link href="/">Home</Link>
            <a href="#upload">Upload</a>
            <a href="#guidance">Guidance</a>
          </div>
          <p className="mt-4 text-sm text-[var(--color-slate-grille)]">
            © 2026 Dermalyzer. Educational skin analysis only.
          </p>
        </footer>
      </div>

      {pendingFile && pendingPreviewUrl && (
        <ImageConfirmationDialog
          fileName={pendingFile.name}
          imageUrl={pendingPreviewUrl}
          onCancel={closePendingPreview}
          onConfirm={confirmPendingFile}
          onRepick={stageFileForPreview}
        />
      )}

      {showCamera && (
        <CameraCapture
          onCapture={stageFileForPreview}
          onClose={() => setShowCamera(false)}
        />
      )}
    </main>
  );
}
