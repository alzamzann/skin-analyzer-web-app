import { endpoints } from "@/lib/api/endpoints";

import type {
  ProductListResult,
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

interface ProductFilterRequest {
  baumannType: string;
  mainCategory?: string;
  subCategory?: string;
  signal?: AbortSignal;
}

export async function fetchRecommendedProducts({
  baumannType,
  mainCategory,
  subCategory,
  signal,
}: ProductFilterRequest): Promise<ProductListResult> {
  const searchParams = new URLSearchParams({ baumannType, topK: "5" });

  if (mainCategory && mainCategory !== "All") {
    searchParams.set("mainCategory", mainCategory);
  }
  if (subCategory && subCategory !== "All") {
    searchParams.set("subCategory", subCategory);
  }

  const response = await fetch(`${endpoints.products}?${searchParams.toString()}`, {
    signal,
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message =
      payload?.detail?.message ?? "Product recommendations could not be loaded.";
    throw new Error(message);
  }

  return response.json() as Promise<ProductListResult>;
}
