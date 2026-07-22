"use client";

import { useCallback, useState } from "react";

import type { QuizAnswers, QuizAxisScores } from "../types/quiz.types";
import { calculateAxisScores, getUniqueAxes } from "../data/quizQuestions";

interface QuizState {
  currentAxisIndex: number;
  currentQuestionIndex: number;
  answers: QuizAnswers;
  isCompleted: boolean;
}

const TOTAL_AXES = getUniqueAxes().length;
const QUESTIONS_PER_AXIS = 2;

export function useQuizScores() {
  const [state, setState] = useState<QuizState>({
    currentAxisIndex: 0,
    currentQuestionIndex: 0,
    answers: {},
    isCompleted: false,
  });

  const totalSteps = TOTAL_AXES * QUESTIONS_PER_AXIS;
  const currentStep =
    state.currentAxisIndex * QUESTIONS_PER_AXIS +
    state.currentQuestionIndex;

  const axes = getUniqueAxes();
  const currentAxis = axes[state.currentAxisIndex];
  const questionIndex =
    state.currentAxisIndex * QUESTIONS_PER_AXIS +
    state.currentQuestionIndex;

  const selectAnswer = useCallback((questionId: string, value: number) => {
    setState((prev) => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: value },
    }));
  }, []);

  const goNext = useCallback(() => {
    setState((prev) => {
      if (prev.currentQuestionIndex < QUESTIONS_PER_AXIS - 1) {
        return {
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex + 1,
        };
      } else if (prev.currentAxisIndex < TOTAL_AXES - 1) {
        return {
          ...prev,
          currentAxisIndex: prev.currentAxisIndex + 1,
          currentQuestionIndex: 0,
        };
      } else {
        return { ...prev, isCompleted: true };
      }
    });
  }, []);

  const goPrev = useCallback(() => {
    setState((prev) => {
      if (prev.currentQuestionIndex > 0) {
        return {
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex - 1,
        };
      } else if (prev.currentAxisIndex > 0) {
        return {
          ...prev,
          currentAxisIndex: prev.currentAxisIndex - 1,
          currentQuestionIndex: QUESTIONS_PER_AXIS - 1,
        };
      }
      return prev;
    });
  }, []);

  const getAxisScores = useCallback((): QuizAxisScores => {
    const scores = calculateAxisScores(state.answers);
    return {
      oiliness: scores.oiliness ?? 0.5,
      sensitivity: scores.sensitivity ?? 0.5,
      pigmentation: scores.pigmentation ?? 0.5,
      wrinkle_tendency: scores.wrinkle_tendency ?? 0.5,
    };
  }, [state.answers]);

  // Cek apakah soal saat ini sudah dijawab
  const axesList = getUniqueAxes();
  // Hitung question ID berdasarkan index
  const allQuestions = [
    ...Array.from({ length: TOTAL_AXES }, (_, axisIdx) =>
      Array.from({ length: QUESTIONS_PER_AXIS }, (_, qIdx) => {
        const axis = axesList[axisIdx];
        return `${axis}-${qIdx + 1}`;
      }),
    ).flat(),
  ];
  const currentQuestionIdComputed = allQuestions[questionIndex];
  const isCurrentQuestionAnswered =
    currentQuestionIdComputed !== undefined &&
    state.answers[currentQuestionIdComputed] !== undefined;

  return {
    currentAxisIndex: state.currentAxisIndex,
    currentQuestionIndex: state.currentQuestionIndex,
    currentAxis,
    answers: state.answers,
    isCompleted: state.isCompleted,
    currentStep,
    totalSteps,
    isCurrentQuestionAnswered,
    selectAnswer,
    goNext,
    goPrev,
    getAxisScores,
  };
}
