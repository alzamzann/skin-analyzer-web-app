"use client";

import type { QuizQuestion } from "../types/quiz.types";

interface QuizStepProps {
  question: QuizQuestion;
  selectedValue: number | undefined;
  onSelect: (value: number) => void;
}

export function QuizStep({ question, selectedValue, onSelect }: QuizStepProps) {
  return (
    <div className="space-y-6">
      {/* Axis Label */}
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--color-oceanic-deep)]">
          {question.axisLabel}
        </p>
      </div>

      {/* Pertanyaan */}
      <div className="rounded-[18px] border border-[var(--color-ash-cloud)] bg-[var(--color-fog-gray)] p-5">
        <p className="text-base font-medium text-[var(--color-midnight-ink)]">
          {question.question}
        </p>
      </div>

      {/* Opsi Jawaban */}
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(option.value)}
            className={`w-full rounded-full border px-5 py-3 text-left text-sm font-medium transition-all ${
              selectedValue === option.value
                ? "border-[var(--color-spring-leaf)] bg-[var(--color-pale-mint)] text-[var(--color-oceanic-deep)]"
                : "border-[var(--color-ash-cloud)] bg-white text-[var(--color-slate-grille)] hover:border-[var(--color-oceanic-deep)]"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
