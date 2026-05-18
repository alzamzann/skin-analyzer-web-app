import { endpoints } from "@/lib/api/endpoints";

import type {
  SkinAnalysisInput,
  SkinAnalysisResult,
} from "../types/skinAnalysis.types";

export async function analyzeSkinImage({
  image,
}: SkinAnalysisInput): Promise<SkinAnalysisResult> {
  const formData = new FormData();
  formData.append("image", image);

  const response = await fetch(endpoints.analyzeSkin, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message =
      payload?.detail?.message ?? "Skin analysis failed. Try another image.";
    throw new Error(message);
  }

  return response.json() as Promise<SkinAnalysisResult>;
}
