export interface SkinAnalysisInput {
  image: File;
}

export interface ProductCategoryFilterOption {
  mainCategory: string;
  subCategories: string[];
}

export interface RecommendedProductResult {
  id: string;
  bpomId?: string | null;
  name: string;
  brand: string;
  category: string;
  mainCategory: string;
  subCategory: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  productUrl?: string | null;
  matchedIngredients: string[];
  similarityScore: number;
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
  recommendedProducts: RecommendedProductResult[];
  availableFilters: string[];
  productCategoryFilters: ProductCategoryFilterOption[];
  disclaimer: string;
  roiImageUrl?: string;
}

export interface ProductListResult {
  baumannType: string;
  category?: string | null;
  mainCategory?: string | null;
  subCategory?: string | null;
  totalCandidates: number;
  topK: number;
  products: RecommendedProductResult[];
}

export type AnalysisStatus = "idle" | "loading" | "success" | "error";
