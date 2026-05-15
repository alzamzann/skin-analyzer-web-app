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
    throw new Error("Skin analysis failed. Try another image.");
  }

  return response.json() as Promise<SkinAnalysisResult>;
}
