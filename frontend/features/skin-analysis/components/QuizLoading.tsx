"use client";

import { Loader2 } from "lucide-react";

export function QuizLoading() {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(0,38,43,0.42)] backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-[24px] bg-white p-10 text-center shadow-[0_32px_90px_rgba(0,38,43,0.18)]">
        {/* Spinner */}
        <div className="mx-auto mb-6">
          <Loader2 className="h-12 w-12 animate-spin text-[var(--color-oceanic-deep)]" />
        </div>

        {/* Teks Utama */}
        <h3 className="text-xl font-semibold text-[var(--color-midnight-ink)]">
          Menganalisis kulit Anda...
        </h3>

        {/* Sub Teks */}
        <p className="mt-3 text-sm text-[var(--color-slate-grille)]">
          Menggabungkan hasil foto dan self-diagnosis quiz
        </p>
      </div>
    </div>
  );
}
