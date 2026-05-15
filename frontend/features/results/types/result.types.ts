import type { ProductCategory } from "@/lib/constants/productCategories";

export interface SkinAttribute {
  label: string;
  value: number;
}

export interface Ingredient {
  name: string;
  reason: string;
}

export interface ProductRecommendation {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number;
  imageUrl?: string;
}
