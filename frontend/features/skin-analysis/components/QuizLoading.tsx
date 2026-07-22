"use client";

import { Loader2 } from "lucide-react";

export function QuizLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Loader2 className="h-12 w-12 animate-spin text-[var(--color-oceanic-deep)]" />
      <h3 className="mt-6 text-xl font-semibold text-[var(--color-midnight-ink)]">
        Menganalisis kulit Anda...
      </h3>
      <p className="mt-3 text-sm text-[var(--color-slate-grille)]">
        Menggabungkan hasil foto dan self-diagnosis quiz
      </p>
    </div>
  );
}
