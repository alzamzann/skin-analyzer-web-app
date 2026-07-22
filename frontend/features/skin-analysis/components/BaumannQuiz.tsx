"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { useQuizScores } from "../hooks/useQuizScores";
import { quizQuestions } from "../data/quizQuestions";
import type { QuizAxisScores } from "../types/quiz.types";
import { QuizStep } from "./QuizStep";

interface BaumannQuizProps {
  onComplete: (scores: QuizAxisScores) => void;
}

export function BaumannQuiz({ onComplete }: BaumannQuizProps) {
  const {
    currentAxisIndex,
    answers,
    currentStep,
    totalSteps,
    isCurrentQuestionAnswered,
    selectAnswer,
    goNext,
    goPrev,
    getAxisScores,
  } = useQuizScores();

  const [showSkipWarning, setShowSkipWarning] = useState(false);

  const questionIndex =
    currentAxisIndex * 2 + (currentStep % 2);
  const currentQuestion = quizQuestions[questionIndex];

  const handleSkip = () => {
    setShowSkipWarning(true);
  };

  const handleFinish = () => {
    onComplete(getAxisScores());
  };

  return (
    <>
      {/* Quiz Card */}
      <div className="mx-auto w-full max-w-lg rounded-[24px] border border-[#EAEAEA] bg-white p-6 shadow-[0_32px_90px_rgba(0,38,43,0.18)]">
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-deep-teal)]">
            Self-Diagnosis Quiz
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[var(--color-midnight-ink)]">
            {currentQuestion.axisLabel}
          </h2>
        </div>

        {/* Quiz Step */}
        <QuizStep
          question={currentQuestion}
          selectedValue={answers[currentQuestion.id]}
          onSelect={(value) => selectAnswer(currentQuestion.id, value)}
        />

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <Button
            type="button"
            variant="secondary"
            onClick={goPrev}
            disabled={currentStep === 0}
          >
            Kembali
          </Button>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={handleSkip}
              className="text-[var(--color-stone-whisper)]"
            >
              Lewati
            </Button>
            <Button
              type="button"
              onClick={
                currentStep === totalSteps - 1 ? handleFinish : goNext
              }
              disabled={!isCurrentQuestionAnswered}
            >
              {currentStep === totalSteps - 1 ? "Selesai" : "Selanjutnya"}
            </Button>
          </div>
        </div>

        {/* Progress Dots */}
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full ${
                i <= currentStep
                  ? "bg-[var(--color-oceanic-deep)]"
                  : "bg-[var(--color-ash-cloud)]"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Skip Warning Modal (Sweet Alert Style) */}
      {showSkipWarning && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(0,38,43,0.42)] backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-[24px] bg-white p-8 text-center shadow-[0_32px_90px_rgba(0,38,43,0.18)]">
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-[#fff3e6]">
              <AlertTriangle className="h-8 w-8 text-[var(--color-amber-pop)]" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--color-midnight-ink)]">
              Quiz Wajib Diselesaikan
            </h3>
            <p className="mt-3 text-sm text-[var(--color-slate-grille)]">
              Self-diagnosis quiz membantu memberikan hasil analisis yang lebih
              akurat. Silakan selesaikan quiz terlebih dahulu.
            </p>
            <div className="mt-6">
              <Button onClick={() => setShowSkipWarning(false)}>
                Kembali ke Quiz
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
