"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Focus,
  LockKeyhole,
  Loader2,
  Smile,
  Sparkles,
  SunMedium,
} from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { CameraCapture } from "@/features/skin-analysis/components/CameraCapture";
import { ImagePreview } from "@/features/skin-analysis/components/ImagePreview";
import { ImageUploadCard } from "@/features/skin-analysis/components/ImageUploadCard";
import { useImageUpload } from "@/features/skin-analysis/hooks/useImageUpload";
import { validateFaceImage } from "@/features/skin-analysis/services/skinAnalysisApi";
import { savePendingImage } from "@/features/skin-analysis/utils/imageStorage";

// --- Data: panduan foto untuk hasil terbaik ---
const guidance = [
  { icon: Focus, label: "Wajah menghadap depan dan berada di tengah" },
  { icon: SunMedium, label: "Pencahayaan alami yang baik" },
  { icon: BadgeCheck, label: "Tanpa riasan atau kacamata hitam" },
  { icon: Smile, label: "Ekspresi netral" },
];

// --- Halaman: upload gambar, validasi wajah, navigasi ke quiz ---
export default function AnalyzePage() {
  const router = useRouter();

  // --- State: kontrol visibilitas kamera ---
  const [showCamera, setShowCamera] = useState(false);

  // --- State: validasi wajah ---
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // --- Hooks: upload gambar ---
  const { error: uploadError, file, selectFile } = useImageUpload();

  // --- Handle: pilih file dari input/kamera, validasi, navigasi ke quiz ---
  const handleFileSelect = async (selectedFile: File | null) => {
    if (!selectedFile) return;

    setIsValidating(true);
    setValidationError(null);

    try {
      // 1. Validasi wajah via backend
      await validateFaceImage(selectedFile);

      // 2. Jika pass, simpan gambar dan navigasi ke quiz
      selectFile(selectedFile);
      await savePendingImage(selectedFile);
      router.push("/quiz");
    } catch (error) {
      // 3. Jika gagal, tampilkan error
      setValidationError(
        error instanceof Error ? error.message : "Validasi wajah gagal.",
      );
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <main className="min-h-[100dvh] bg-[radial-gradient(circle_at_top,#f7fbfb_0%,#ebebeb_52%,#ffffff_100%)] text-[var(--color-midnight-ink)]">
      {/* --- Navbar: navigasi halaman --- */}
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

        {/* --- Hero: judul halaman analisis --- */}
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

        {/* --- Upload: kartu upload + pratinjau --- */}
        <section
          id="upload"
          className="mx-auto grid w-full max-w-4xl gap-6 overflow-hidden pb-6 lg:grid-cols-[1.08fr_0.92fr]"
        >
          {/* --- Upload card: input file + tombol kamera --- */}
          <ImageUploadCard
            error={uploadError || validationError}
            fileName={file?.name}
            onFileSelect={handleFileSelect}
            onOpenCamera={() => setShowCamera(true)}
          />

          {/* --- Sidebar: pratinjau gambar + status validasi --- */}
          <aside className="space-y-4 rounded-[24px] border border-[var(--color-ash-cloud)] bg-white/90 p-5 shadow-[0_18px_60px_rgba(0,38,43,0.06)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-deep-teal)]">
                Pratinjau
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.01em]">
                Gambar analisis yang dikonfirmasi
              </h2>
            </div>
            {/* --- Image preview: tampilkan gambar yang sudah dipilih --- */}
            <ImagePreview imageUrl={file ? URL.createObjectURL(file) : null} />

            {/* --- Loading validasi: tampilkan saat validasi wajah --- */}
            {isValidating && (
              <div className="flex items-center gap-2 rounded-[18px] bg-[var(--color-fog-gray)] p-4 text-sm text-[var(--color-slate-grille)]">
                <Loader2 className="h-4 w-4 animate-spin text-[var(--color-oceanic-deep)]" />
                Memvalidasi wajah...
              </div>
            )}

            {/* --- Info: instruksi setelah upload --- */}
            {file && !isValidating && !validationError && (
              <div className="rounded-[18px] border border-[var(--color-spring-leaf)] bg-[var(--color-pale-mint)] p-4 text-sm leading-6 text-[var(--color-oceanic-deep)]">
                Wajah terdeteksi! Memuat quiz...
              </div>
            )}

            {/* --- Tip: panduan penggunaan gambar --- */}
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

        {/* --- Guidance: tips foto untuk hasil terbaik --- */}
        <section
          id="guidance"
          className="mx-auto mb-8 grid w-full max-w-4xl gap-0 overflow-hidden rounded-[18px] border border-[var(--color-ash-cloud)] bg-white/80 shadow-[0_16px_50px_rgba(0,38,43,0.05)] md:grid-cols-[1.1fr_repeat(4,1fr)]"
        >
          {/* --- Label: judul panduan --- */}
          <div className="flex items-center gap-3 border-b border-[var(--color-ash-cloud)]/60 p-5 text-[var(--color-oceanic-deep)] md:border-b-0 md:border-r">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-semibold">Untuk hasil terbaik</span>
          </div>
          {/* --- List: setiap panduan dalam kolom --- */}
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

        {/* --- Footer: copyright --- */}
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

      {/* --- Dialog: kamera modal jika showCamera aktif --- */}
      {showCamera && (
        <CameraCapture
          onCapture={handleFileSelect}
          onClose={() => setShowCamera(false)}
        />
      )}
    </main>
  );
}
