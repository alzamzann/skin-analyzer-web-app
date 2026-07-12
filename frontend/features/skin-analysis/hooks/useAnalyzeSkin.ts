"use client";

import { useCallback, useState } from "react";

import { analyzeSkinImage } from "../services/skinAnalysisApi";
import type {
  AnalysisStatus,
  SkinAnalysisResult,
} from "../types/skinAnalysis.types";

export function useAnalyzeSkin() {
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [result, setResult] = useState<SkinAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (image: File) => {
    setStatus("loading");
    setError(null);

    try {
      const nextResult = await analyzeSkinImage({ image });
      setResult(nextResult);
      setStatus("success");
      return nextResult;
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Analisis gagal dilakukan.";
      setError(message);
      setStatus("error");
      return null;
    }
  }, []);

  return { analyze, error, result, status };
}
