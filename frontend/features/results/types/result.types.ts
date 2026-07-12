export interface SkinAttribute {
  label: string;
  value: number;
}

export interface Ingredient {
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
}

export interface ProductRecommendation {
  id: string;
  bpomId?: string | null;
  name: string;
  brand: string;
  category: string;
  mainCategory?: string;
  subCategory?: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  productUrl?: string | null;
  matchedIngredients?: string[];
  similarityScore?: number;
}
