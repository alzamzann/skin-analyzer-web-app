"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Leaf, Star } from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { BaumannResultCard } from "@/features/results/components/BaumannResultCard";
import { IngredientList } from "@/features/results/components/IngredientList";
import { ProductCategoryFilter } from "@/features/results/components/ProductCategoryFilter";
import { ProductRecommendationList } from "@/features/results/components/ProductRecommendationList";
import { SkinAttributeSummary } from "@/features/results/components/SkinAttributeSummary";
import { useProductFilter } from "@/features/results/hooks/useProductFilter";
import { readAnalysisResult } from "@/features/results/utils/analysisResultStorage";
import type { SkinAnalysisResult } from "@/features/skin-analysis/types/skinAnalysis.types";
import type {
  Ingredient,
  ProductRecommendation,
  SkinAttribute,
} from "@/features/results/types/result.types";

const attributes: SkinAttribute[] = [
  { label: "Oily", value: 82 },
  { label: "Sensitive", value: 58 },
  { label: "Pigmented", value: 76 },
  { label: "Tight", value: 26 },
];

const ingredients: Ingredient[] = [
  {
    name: "Niacinamide",
    reason: "Balances oil and supports uneven tone.",
  },
  {
    name: "Salicylic Acid (BHA)",
    reason: "Helps refine pores and reduce congestion.",
  },
  {
    name: "Tranexamic Acid",
    reason: "Supports visible discoloration concerns.",
  },
  {
    name: "Centella Asiatica",
    reason: "Calms visible sensitivity and redness.",
  },
  {
    name: "Zinc PCA",
    reason: "Supports oily and blemish-prone skin.",
  },
];

const products: ProductRecommendation[] = [
  {
    id: "cleanser-1",
    name: "Gentle Hydrating Cleanser",
    brand: "Dermalyzer Lab",
    category: "Cleanser",
    description: "Gently cleanses while maintaining skin moisture balance.",
    imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80",
    price: 185000,
  },
  {
    id: "serum-1",
    name: "10% Niacinamide Serum",
    brand: "Dermalyzer Lab",
    category: "Serum",
    description: "Visibly reduces excess oil and improves skin tone.",
    imageUrl: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=400&q=80",
    price: 249000,
  },
  {
    id: "moisturizer-1",
    name: "Oil-Free Gel Moisturizer",
    brand: "Dermalyzer Lab",
    category: "Moisturizer",
    description: "Lightweight hydration that soothes and softens skin.",
    imageUrl: "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?auto=format&fit=crop&w=400&q=80",
    price: 215000,
  },
  {
    id: "sunscreen-1",
    name: "Daily Defense SPF 50+",
    brand: "Dermalyzer Lab",
    category: "Sunscreen",
    description: "Broad-spectrum protection with a clean matte finish.",
    imageUrl: "https://images.unsplash.com/photo-1598662972299-5408ddb8a3dc?auto=format&fit=crop&w=400&q=80",
    price: 199000,
  },
  {
    id: "toner-1",
    name: "Barrier Comfort Toner",
    brand: "Dermalyzer Lab",
    category: "Toner",
    description: "Prepares sensitive skin with light calming hydration.",
    imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80",
    price: 169000,
  },
];

export default function ResultPage() {
  const [analysisResult] = useState<SkinAnalysisResult | null>(
    () => readAnalysisResult(),
  );
  const resultProducts = useMemo<ProductRecommendation[]>(() => {
    if (!analysisResult) {
      return products;
    }

    return analysisResult.recommendedProducts.map((product) => ({
      id: product.id,
      bpomId: product.bpomId,
      name: product.name,
      brand: product.brand,
      category: product.category,
      description: product.description ?? undefined,
      imageUrl: product.imageUrl,
      price: product.price,
      productUrl: product.productUrl,
      matchedIngredients: product.matchedIngredients,
      similarityScore: product.similarityScore,
    }));
  }, [analysisResult]);
  const resultIngredients = useMemo<Ingredient[]>(() => {
    if (!analysisResult) {
      return ingredients;
    }

    return analysisResult.recommendedIngredients.map((ingredient) => ({
      name: ingredient.name,
      reason: ingredient.reason,
      ingredientType: ingredient.ingredientType,
      alternateName: ingredient.alternateName,
      inciName: ingredient.inciName,
      bestFor: ingredient.bestFor,
      canUsedTo: ingredient.canUsedTo,
      notRecommend: ingredient.notRecommend,
      personalCareCategory: ingredient.personalCareCategory,
      topicalUse: ingredient.topicalUse,
    }));
  }, [analysisResult]);
  const resultAttributes = useMemo<SkinAttribute[]>(() => {
    if (!analysisResult) {
      return attributes;
    }

    return [
      {
        label: analysisResult.baumannMapping.oiliness,
        value: analysisResult.attributes.oiliness,
      },
      {
        label: analysisResult.baumannMapping.sensitivity,
        value: analysisResult.attributes.sensitivity,
      },
      {
        label: analysisResult.baumannMapping.pigmentation,
        value: analysisResult.attributes.pigmentation,
      },
      {
        label: analysisResult.baumannMapping.aging,
        value: analysisResult.attributes.wrinkleTendency,
      },
    ];
  }, [analysisResult]);
  const availableFilters = useMemo(
    () =>
      analysisResult?.availableFilters ?? [
        "All",
        "Cleanser",
        "Serum",
        "Moisturizer",
        "Sunscreen",
        "Toner",
      ],
    [analysisResult],
  );
  const { category, filteredProducts, setCategory } =
    useProductFilter(resultProducts);

  return (
    <main className="min-h-[100dvh] bg-[radial-gradient(circle_at_top,#F7FBFB_0%,#EBEBEB_48%,#FFFFFF_100%)] text-[#0B1026]">
      <Navbar
        action={
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href="/analyze">
              <ArrowLeft className="h-4 w-4" />
              Analyze again
            </Link>
          </Button>
        }
        brandHref="/"
        className="bg-transparent"
        items={[
          { label: "Home", href: "/" },
          { label: "Analyze", href: "/analyze" },
          { label: "Ingredients", href: "#ingredients" },
          { label: "Products", href: "#products" },
        ]}
      />

      <div className="mx-auto w-full max-w-6xl px-4 pb-14 pt-9 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[24px] border border-[#EAEAEA] bg-white/95 shadow-[0_24px_80px_rgba(0,38,43,0.08)] md:grid md:grid-cols-[1fr_1fr]">
          <BaumannResultCard
            baumannType={analysisResult?.baumannType ?? "OSPT"}
            confidence={analysisResult?.confidence ?? 0.91}
            description={
              analysisResult?.description ??
              "Your skin is oily, sensitive, pigmented, and tight. Focus on balancing oil, calming sensitivity, fading discoloration, and reinforcing hydration."
            }
          />
          <SkinAttributeSummary attributes={resultAttributes} />
        </section>

        <section id="ingredients" className="mt-12">
          <div className="mb-6 flex items-center gap-4">
            <span className="grid h-9 w-9 place-items-center rounded-[10px] border border-[#D7E5E3] bg-[#F7FBFB] text-[#0B7A75]">
              <Leaf className="h-5 w-5" strokeWidth={1.7} />
            </span>
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#0B1026]">
              Recommended ingredients
            </h2>
          </div>
          <IngredientList ingredients={resultIngredients} />
        </section>

        <section id="products" className="mt-12">
          <div className="mb-6 flex items-center gap-4">
            <span className="grid h-9 w-9 place-items-center rounded-[10px] border border-[#D7E5E3] bg-[#F7FBFB] text-[#0B7A75]">
              <Star className="h-5 w-5" strokeWidth={1.7} />
            </span>
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#0B1026]">
              Top 5 product recommendations
            </h2>
          </div>
          <ProductCategoryFilter
            options={availableFilters}
            value={category}
            onChange={setCategory}
          />
          <div className="mt-6">
            <ProductRecommendationList products={filteredProducts} />
          </div>
        </section>

        {analysisResult?.disclaimer && (
          <section className="mt-12 rounded-[18px] border border-[#EAEAEA] bg-white p-5 text-sm leading-6 text-[#4F6466]">
            {analysisResult.disclaimer}
          </section>
        )}

        <footer className="mt-16 border-t border-[#EAEAEA] pt-9 text-center">
          <p className="text-3xl font-semibold tracking-[-0.03em] text-[#0B1026]">
            Dermalyzer<span className="text-[#0B7A75]">*</span>
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-[#354D51]">
            <Link href="/">Home</Link>
            <Link href="/analyze">Analyze</Link>
            <a href="#ingredients">Ingredients</a>
            <a href="#products">Products</a>
          </div>
          <p className="mt-5 text-sm text-[#4F6466]">
            © 2026 Dermalyzer. Educational skin analysis only.
          </p>
        </footer>
      </div>
    </main>
  );
}
