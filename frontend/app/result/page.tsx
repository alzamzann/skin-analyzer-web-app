"use client";

import Link from "next/link";

import { PageContainer } from "@/components/layout/PageContainer";
import { BaumannResultCard } from "@/features/results/components/BaumannResultCard";
import { IngredientList } from "@/features/results/components/IngredientList";
import { ProductCategoryFilter } from "@/features/results/components/ProductCategoryFilter";
import { ProductRecommendationList } from "@/features/results/components/ProductRecommendationList";
import { SkinAttributeSummary } from "@/features/results/components/SkinAttributeSummary";
import { useProductFilter } from "@/features/results/hooks/useProductFilter";
import type {
  Ingredient,
  ProductRecommendation,
  SkinAttribute,
} from "@/features/results/types/result.types";

const attributes: SkinAttribute[] = [
  { label: "Oiliness", value: 74 },
  { label: "Sensitivity", value: 48 },
  { label: "Pigmentation", value: 62 },
  { label: "Wrinkle tendency", value: 31 },
];

const ingredients: Ingredient[] = [
  {
    name: "Niacinamide",
    reason: "Supports barrier comfort and helps refine visible uneven tone.",
  },
  {
    name: "Azelaic acid",
    reason: "Useful for visible redness and pigmentation-prone routines.",
  },
];

const products: ProductRecommendation[] = [
  {
    id: "cleanser-1",
    name: "Gentle Gel Cleanser",
    brand: "DermAI Lab",
    category: "Cleanser",
    price: 24,
  },
  {
    id: "serum-1",
    name: "Barrier Balance Serum",
    brand: "DermAI Lab",
    category: "Serum",
    price: 46,
  },
  {
    id: "sunscreen-1",
    name: "Daily Mineral SPF",
    brand: "DermAI Lab",
    category: "Sunscreen",
    price: 32,
  },
];

export default function ResultPage() {
  const { category, filteredProducts, setCategory } = useProductFilter(products);

  return (
    <main className="min-h-[100dvh] bg-background py-12">
      <PageContainer className="space-y-8">
        <div>
          <Link className="text-sm text-muted-foreground hover:text-foreground" href="/">
            Back to home
          </Link>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground">
            Analysis result
          </h1>
        </div>
        <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <BaumannResultCard baumannType="OSPW" confidence={0.87} />
          <SkinAttributeSummary attributes={attributes} />
        </div>
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Ingredient focus
          </h2>
          <IngredientList ingredients={ingredients} />
        </section>
        <section className="space-y-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-2xl font-semibold text-foreground">
              Product recommendations
            </h2>
            <ProductCategoryFilter value={category} onChange={setCategory} />
          </div>
          <ProductRecommendationList products={filteredProducts} />
        </section>
      </PageContainer>
    </main>
  );
}
