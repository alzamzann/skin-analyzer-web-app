import type { SkinAnalysisResult } from "@/features/skin-analysis/types/skinAnalysis.types";

const storageKey = "dermalyzer.analysisResult";

export function saveAnalysisResult(result: SkinAnalysisResult) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(storageKey, JSON.stringify(result));
}

export function readAnalysisResult() {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.sessionStorage.getItem(storageKey);
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as SkinAnalysisResult;
  } catch {
    window.sessionStorage.removeItem(storageKey);
    return null;
  }
}
