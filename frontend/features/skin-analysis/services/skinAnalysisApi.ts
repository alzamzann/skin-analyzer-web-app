import { endpoints } from "@/lib/api/endpoints";

import type {
  ProductListResult,
  SkinAnalysisInput,
  SkinAnalysisResult,
} from "../types/skinAnalysis.types";

const apiErrorTranslations: Record<string, string> = {
  unsupported_image_type: "Unggah gambar berformat JPG, PNG, atau WebP.",
  empty_image: "Unggah gambar sebelum memulai analisis.",
  image_too_large: "Unggah gambar berukuran kurang dari 8 MB.",
  invalid_image: "File yang diunggah tidak dapat dibaca sebagai gambar.",
  no_face_detected:
    "Wajah tidak terdeteksi. Unggah foto wajah tampak depan yang jelas.",
  multiple_faces_detected:
    "Terdeteksi lebih dari satu wajah. Unggah foto yang hanya berisi satu wajah.",
  face_quality_rejected:
    "Kualitas atau posisi wajah belum sesuai. Gunakan foto tampak depan yang jelas, tajam, dan memiliki pencahayaan merata.",
  roi_extraction_failed:
    "Area kulit pada wajah tidak dapat diproses. Coba gunakan foto lain.",
  face_model_missing:
    "Model deteksi wajah belum tersedia pada server.",
  face_detector_unavailable:
    "Layanan deteksi wajah sedang tidak tersedia.",
  model_inference_failed: "Model tidak dapat menganalisis gambar ini.",
  model_inference_unavailable:
    "Layanan analisis kulit sedang tidak tersedia.",
  unsupported_model_architecture:
    "Konfigurasi model analisis kulit tidak didukung.",
  skin_model_missing: "Model analisis kulit belum tersedia pada server.",
  skin_model_load_failed: "Model analisis kulit tidak dapat dimuat.",
  invalid_product_category: "Kategori produk yang dipilih tidak valid.",
  internal_error:
    "Terjadi kesalahan saat memproses permintaan. Silakan coba lagi.",
};

function getLocalizedApiError(
  payload: { detail?: { code?: string; message?: string } } | null,
  fallback: string,
) {
  const code = payload?.detail?.code;
  return (code && apiErrorTranslations[code]) || payload?.detail?.message || fallback;
}

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
    const message = getLocalizedApiError(
      payload,
      "Analisis kulit gagal. Coba gunakan gambar lain.",
    );
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
    const message = getLocalizedApiError(
      payload,
      "Rekomendasi produk tidak dapat dimuat.",
    );
    throw new Error(message);
  }

  return response.json() as Promise<ProductListResult>;
}
