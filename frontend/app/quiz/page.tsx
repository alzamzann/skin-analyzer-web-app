"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { AnalysisError } from "@/features/skin-analysis/components/AnalysisError";
import { BaumannQuiz } from "@/features/skin-analysis/components/BaumannQuiz";
import { QuizLoading } from "@/features/skin-analysis/components/QuizLoading";
import { useAnalyzeSkin } from "@/features/skin-analysis/hooks/useAnalyzeSkin";
import type { QuizAxisScores } from "@/features/skin-analysis/types/quiz.types";
import {
  clearPendingImage,
  loadPendingImage,
} from "@/features/skin-analysis/utils/imageStorage";
import { saveAnalysisResult } from "@/features/results/utils/analysisResultStorage";

// --- Halaman: quiz self-diagnosis + trigger analisis ---
export default function QuizPage() {
  const router = useRouter();

  // --- State: gambar dari sessionStorage ---
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- Hooks: analisis kulit ---
  const {
    analyze,
    error: analysisError,
    status,
  } = useAnalyzeSkin();

  // --- Load gambar dari sessionStorage saat mount ---
  useEffect(() => {
    loadPendingImage().then((file) => {
      if (file) {
        setImageUrl(URL.createObjectURL(file));
      } else {
        // Kembali ke /analyze jika tidak ada gambar
        router.push("/analyze");
      }
      setIsLoading(false);
    });
  }, [router]);

  // --- Quiz selesai: trigger analisis ---
  const handleQuizComplete = async (scores: QuizAxisScores) => {
    const file = await loadPendingImage();
    if (!file) {
      router.push("/analyze");
      return;
    }

    const result = await analyze(file, scores);
    if (result) {
      saveAnalysisResult(result);
      clearPendingImage();
      router.push("/result");
    }
  };

  // --- Loading state: tampilkan spinner saat load gambar ---
  if (isLoading) {
    return (
      <main className="min-h-[100dvh] grid place-items-center bg-[radial-gradient(circle_at_top,#f7fbfb_0%,#ebebeb_52%,#ffffff_100%)]">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--color-oceanic-deep)]" />
          <p className="mt-4 text-sm text-[var(--color-slate-grille)]">
            Memuat...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-[radial-gradient(circle_at_top,#f7fbfb_0%,#ebebeb_52%,#ffffff_100%)] text-[var(--color-midnight-ink)]">
      {/* --- Navbar --- */}
      <Navbar
        action={
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href="/analyze">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Link>
          </Button>
        }
        brandHref="/"
        className="bg-transparent"
        items={[
          { label: "Beranda", href: "/" },
          { label: "Unggah", href: "/analyze" },
        ]}
      />

      <div className="mx-auto flex min-h-[calc(100dvh-99px)] w-full max-w-[1480px] flex-col items-center px-4 sm:px-6">
        {/* --- Hero: judul halaman quiz --- */}
        <section className="w-full max-w-2xl pb-8 pt-14 text-center sm:pt-16">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-deep-teal)]">
            Self-Diagnosis Quiz
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-none tracking-[-0.04em] text-[var(--color-midnight-ink)] sm:text-5xl">
            Jawab pertanyaan berikut
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[var(--color-slate-grille)] sm:text-lg">
            Quiz ini membantu memberikan hasil analisis yang lebih akurat
            dengan menggabungkan data foto dan kondisi kulit Anda.
          </p>
        </section>

        {/* --- Content: preview gambar + quiz --- */}
        <div className="w-full max-w-4xl pb-16">
          {/* --- Preview gambar: tampilkan foto wajah yang sudah di-upload --- */}
          {imageUrl && (
            <div className="mb-8 flex justify-center">
              <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-[var(--color-spring-leaf)] shadow-[0_8px_30px_rgba(0,38,43,0.12)]">
                <Image
                  src={imageUrl}
                  alt="Foto wajah"
                  fill
                  sizes="128px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          )}

          {/* --- Quiz component --- */}
          <BaumannQuiz onComplete={handleQuizComplete} />

          {/* --- Loading analisis --- */}
          {status === "loading" && <QuizLoading />}

          {/* --- Error analisis --- */}
          {analysisError && (
            <div className="mt-6 mx-auto max-w-lg">
              <AnalysisError message={analysisError} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
