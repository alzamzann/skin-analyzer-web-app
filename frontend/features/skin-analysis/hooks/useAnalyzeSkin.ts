"use client";

import { useCallback, useState } from "react";

import { analyzeSkinImage } from "../services/skinAnalysisApi";
import type {
  AnalysisStatus,
  SkinAnalysisResult,
} from "../types/skinAnalysis.types";

// --- Hook: wrapper API call analisis kulit dengan state management ---
export function useAnalyzeSkin() {
  // --- State: status (idle/loading/success/error), hasil analisis, dan error ---
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [result, setResult] = useState<SkinAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // --- Analyze: kirim gambar ke API, handle loading/success/error ---
  const analyze = useCallback(async (image: File) => {
    setStatus("loading");
    setError(null);

    try {
      // --- Kirim gambar ke backend dan terima hasil analisis ---
      const nextResult = await analyzeSkinImage({ image });
      setResult(nextResult);
      setStatus("success");
      return nextResult;
    } catch (caughtError) {
      // --- Tangkap error dan format pesan untuk user ---
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Analisis gagal dilakukan.";
      setError(message);
      setStatus("error");
      return null;
    }
  }, []);

  // --- Return: analyze handler, error, result, dan status ---
  return { analyze, error, result, status };
}
