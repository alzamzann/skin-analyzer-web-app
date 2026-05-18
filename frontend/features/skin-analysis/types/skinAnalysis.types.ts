export interface SkinAnalysisInput {
  image: File;
}

export interface SkinAnalysisResult {
  analysisId: string;
  baumannType: string;
  confidence: number;
  description: string;
  attributes: {
    oiliness: number;
    sensitivity: number;
    pigmentation: number;
    wrinkleTendency: number;
  };
  detectedLabels: {
    label: string;
    detected: boolean;
    confidence: number;
  }[];
  baumannMapping: {
    oiliness: string;
    sensitivity: string;
    pigmentation: string;
    aging: string;
  };
  recommendedIngredients: {
    name: string;
    reason: string;
    ingredientType?: string | null;
    alternateName?: string | null;
    inciName?: string | null;
    bestFor?: string | null;
    canUsedTo?: string | null;
    notRecommend?: string | null;
    personalCareCategory?: string | null;
    topicalUse?: string | null;
  }[];
  recommendedProducts: {
    id: string;
    bpomId?: string | null;
    name: string;
    brand: string;
    category: string;
    description?: string | null;
    price: number;
    imageUrl?: string | null;
    productUrl?: string | null;
    matchedIngredients: string[];
    similarityScore: number;
  }[];
  availableFilters: string[];
  disclaimer: string;
  roiImageUrl?: string;
}

export type AnalysisStatus = "idle" | "loading" | "success" | "error";
