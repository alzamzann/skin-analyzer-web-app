"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

export default function ResultPage() {
  const [hasLoadedAnalysis, setHasLoadedAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SkinAnalysisResult | null>(
    null,
  );

  useEffect(() => {
    setAnalysisResult(readAnalysisResult());
    setHasLoadedAnalysis(true);
  }, []);

  return (
    <main className="min-h-[100dvh] bg-[radial-gradient(circle_at_top,#F7FBFB_0%,#EBEBEB_48%,#FFFFFF_100%)] text-[#0B1026]">
      <Navbar
        action={
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href="/analyze">
              <ArrowLeft className="h-4 w-4" />
              Analyze Again
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
        {!hasLoadedAnalysis ? (
          <ResultLoadingState />
        ) : analysisResult ? (
          <AnalysisResultContent analysisResult={analysisResult} />
        ) : (
          <NoAnalysisFound />
        )}
      </div>
    </main>
  );
}

function AnalysisResultContent({
  analysisResult,
}: {
  analysisResult: SkinAnalysisResult;
}) {
  const resultProducts = useMemo<ProductRecommendation[]>(() => {
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
    () => analysisResult.availableFilters,
    [analysisResult],
  );
  const { category, filteredProducts, setCategory } =
    useProductFilter(resultProducts);

  return (
    <>
        <section className="overflow-hidden rounded-[24px] border border-[#EAEAEA] bg-white/95 shadow-[0_24px_80px_rgba(0,38,43,0.08)] md:grid md:grid-cols-[1fr_1fr]">
          <BaumannResultCard
            baumannType={analysisResult.baumannType}
            confidence={analysisResult.confidence}
            description={analysisResult.description}
          />
          <SkinAttributeSummary attributes={resultAttributes} />
        </section>

        <section id="ingredients" className="mt-12">
          <div className="mb-6 flex items-center gap-4">
            <span className="grid h-9 w-9 place-items-center rounded-[10px] border border-[#D7E5E3] bg-[#F7FBFB] text-[#0B7A75]">
              <Leaf className="h-5 w-5" strokeWidth={1.7} />
            </span>
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#0B1026]">
              Recommended Ingredients
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
              Top 5 Product Recommendations
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

        {analysisResult.disclaimer && (
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
    </>
  );
}

function ResultLoadingState() {
  return (
    <section className="grid min-h-[58vh] place-items-center rounded-[24px] border border-[#EAEAEA] bg-white/95 p-8 text-center shadow-[0_24px_80px_rgba(0,38,43,0.08)]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0B7A75]">
          Result
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#0B1026]">
          Loading analysis
        </h1>
      </div>
    </section>
  );
}

function NoAnalysisFound() {
  return (
    <section className="grid min-h-[58vh] place-items-center rounded-[24px] border border-[#EAEAEA] bg-white/95 p-8 text-center shadow-[0_24px_80px_rgba(0,38,43,0.08)]">
      <div className="max-w-md">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0B7A75]">
          No analysis found
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-[#0B1026]">
          Start with a face photo.
        </h1>
        <p className="mt-4 text-base leading-7 text-[#4F6466]">
          This page only shows results after an image has been analyzed in the
          current browser session.
        </p>
        <Button asChild className="mt-8">
          <Link href="/analyze">Go to analyzer</Link>
        </Button>
      </div>
    </section>
  );
}
