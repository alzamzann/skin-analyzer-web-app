"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Focus,
  LockKeyhole,
  Smile,
  Sparkles,
  SunMedium,
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
import { saveAnalysisResult } from "@/features/results/utils/analysisResultStorage";

const guidance = [
  { icon: Focus, label: "Wajah menghadap depan dan berada di tengah" },
  { icon: SunMedium, label: "Pencahayaan alami yang baik" },
  { icon: BadgeCheck, label: "Tanpa riasan atau kacamata hitam" },
  { icon: Smile, label: "Ekspresi netral" },
];

export default function AnalyzePage() {
  const router = useRouter();
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

  const confirmPendingFile = (croppedFile: File) => {
    selectFile(croppedFile);
    closePendingPreview();
  };

  const handleAnalyze = async () => {
    if (!file) {
      return;
    }

    const nextResult = await analyze(file);
    if (nextResult) {
      saveAnalysisResult(nextResult);
      router.push("/result");
    }
  };

  return (
    <main className="min-h-[100dvh] bg-[radial-gradient(circle_at_top,#f7fbfb_0%,#ebebeb_52%,#ffffff_100%)] text-[var(--color-midnight-ink)]">
      <Navbar
        action={
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Link>
          </Button>
        }
        brandHref="/"
        className="bg-transparent"
        items={[
          { label: "Beranda", href: "/" },
          { label: "Unggah", href: "#upload" },
          { label: "Panduan", href: "#guidance" },
          { label: "Privasi", href: "/#privacy" },
        ]}
      />

      <div className="mx-auto flex min-h-[calc(100dvh-99px)] w-full max-w-[1480px] flex-col px-4 sm:px-6">

        <section className="mx-auto w-full max-w-5xl pb-8 pt-14 text-center sm:pt-16">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-deep-teal)]">
            Analisis kulit
          </p>
          <h1 className="mt-4 text-5xl font-semibold leading-none tracking-[-0.04em] text-[var(--color-midnight-ink)] sm:text-6xl">
            Unggah satu foto wajah yang jelas.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[var(--color-slate-grille)] sm:text-lg">
            Dermalyzer memetakan tanda-tanda kulit yang terlihat ke profil
            Baumann, lalu menyiapkan panduan bahan dan produk untuk rutinitas
            Anda.
          </p>
        </section>

        <section
          id="upload"
          className="mx-auto grid w-full max-w-4xl gap-6 pb-6 lg:grid-cols-[1.08fr_0.92fr]"
        >
          <ImageUploadCard
            error={uploadError}
            fileName={file?.name}
            onFileSelect={stageFileForPreview}
            onOpenCamera={() => setShowCamera(true)}
          />

          <aside className="space-y-4 rounded-[24px] border border-[var(--color-ash-cloud)] bg-white/90 p-5 shadow-[0_18px_60px_rgba(0,38,43,0.06)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-deep-teal)]">
                Pratinjau
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.01em]">
                Gambar analisis yang dikonfirmasi
              </h2>
            </div>
            <ImagePreview imageUrl={previewUrl} />
            <Button
              type="button"
              size="lg"
              disabled={!file || isAnalyzing}
              onClick={handleAnalyze}
              className="h-12 w-full gap-2"
            >
              {isAnalyzing ? "Menganalisis..." : "Analisis gambar"}
            </Button>
            {isAnalyzing && <AnalysisLoading />}
            {analysisError && <AnalysisError message={analysisError} />}
            {status === "success" && result && (
              <div className="rounded-[18px] border border-[var(--color-ash-cloud)] bg-[var(--color-pale-mint)] p-4 text-sm leading-6 text-[var(--color-oceanic-deep)]">
                Analisis selesai. Hasil Anda siap ditinjau pada halaman hasil.
              </div>
            )}
            <div className="flex items-start gap-3 rounded-[18px] bg-[var(--color-fog-gray)] p-4 text-sm leading-6 text-[var(--color-slate-grille)]">
              <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-oceanic-deep)]" />
              <p>
                Gunakan gambar yang jelas dengan seluruh wajah terlihat.
                Hindari bayangan pekat, filter, kacamata hitam, atau sudut
                menyamping.
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
            <span className="text-sm font-semibold">Untuk hasil terbaik</span>
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
            <Link href="/">Beranda</Link>
            <a href="#upload">Unggah</a>
            <a href="#guidance">Panduan</a>
          </div>
          <p className="mt-4 text-sm text-[var(--color-slate-grille)]">
            © 2026 Dermalyzer. Hanya untuk edukasi analisis kulit.
          </p>
        </footer>
      </div>

      {pendingFile && pendingPreviewUrl && (
        <ImageConfirmationDialog
          key={pendingPreviewUrl}
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
