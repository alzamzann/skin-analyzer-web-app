"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Info, Leaf, Star, TriangleAlert } from "lucide-react";

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

const PREGNANCY_CAUTION_INGREDIENTS = new Set(["Retinol", "Hydroquinone"]);

function getLocalizedBaumannDescription(
  mapping: SkinAnalysisResult["baumannMapping"],
) {
  const labels = [
    mapping.oiliness,
    mapping.sensitivity,
    mapping.pigmentation,
    mapping.aging,
  ];

  return `Profil kulit Anda cenderung ${labels[0]}, ${labels[1]}, ${labels[2]}, dan ${labels[3]}. Gunakan hasil ini sebagai panduan untuk memilih bahan dan produk yang sesuai dengan kebutuhan kulit Anda.`;
}

export default function ResultPage() {
  const [hasLoadedAnalysis, setHasLoadedAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SkinAnalysisResult | null>(
    null,
  );

  useEffect(() => {
    // Session storage is browser-only; load it after hydration to preserve SSR markup.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
              Analisis Ulang
            </Link>
          </Button>
        }
        brandHref="/"
        className="bg-transparent"
        items={[
          { label: "Beranda", href: "/" },
          { label: "Analisis", href: "/analyze" },
          { label: "Bahan", href: "#ingredients" },
          { label: "Produk", href: "#products" },
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
      mainCategory: product.mainCategory,
      subCategory: product.subCategory,
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
  const pregnancyCautionIngredients = resultIngredients
    .filter((ingredient) => PREGNANCY_CAUTION_INGREDIENTS.has(ingredient.name))
    .map((ingredient) => ingredient.name);
  const productCategoryFilters = analysisResult.productCategoryFilters ?? [];
  const {
    mainCategory,
    subCategory,
    products,
    isLoading,
    error,
    selectMainCategory,
    setSubCategory,
    retry,
  } = useProductFilter(resultProducts, analysisResult.baumannType);

  return (
    <>
        <section className="overflow-hidden rounded-[24px] border border-[#EAEAEA] bg-white/95 shadow-[0_24px_80px_rgba(0,38,43,0.08)] md:grid md:grid-cols-[1fr_1fr]">
          <BaumannResultCard
            baumannType={analysisResult.baumannType}
            description={getLocalizedBaumannDescription(
              analysisResult.baumannMapping,
            )}
          />
          <SkinAttributeSummary attributes={resultAttributes} />
        </section>

        <section id="ingredients" className="mt-12">
          <div className="mb-6 flex items-center gap-4">
            <span className="grid h-9 w-9 place-items-center rounded-[10px] border border-[#D7E5E3] bg-[#F7FBFB] text-[#0B7A75]">
              <Leaf className="h-5 w-5" strokeWidth={1.7} />
            </span>
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#0B1026]">
              Bahan yang Direkomendasikan
            </h2>
          </div>
          <IngredientList
            ingredients={[...resultIngredients].sort((a, b) =>
              a.name.localeCompare(b.name, "id"),
            )}
          />
          {pregnancyCautionIngredients.length > 0 && (
            <div
              className="mt-6 flex items-start gap-3 rounded-[16px] border border-[#FDE047] bg-[#FEF9C3] p-4 text-[#854D0E]"
              role="note"
            >
              <TriangleAlert
                aria-hidden="true"
                className="mt-[3px] h-5 w-5 shrink-0 text-[#CA8A04]"
                strokeWidth={2}
              />
              <p className="text-sm font-medium leading-6">
                <span className="font-semibold">Peringatan Kehamilan:</span>{" "}
                hindari produk yang mengandung{" "}
                {pregnancyCautionIngredients.map((ingredient, index) => (
                  <span key={ingredient}>
                    {index > 0 && " atau "}
                    <strong className="font-semibold">{ingredient}</strong>
                  </span>
                ))}{" "}
                dan konsultasikan dengan dokter kandungan atau dokter kulit
                sebelum memilih produk perawatan kulit.
              </p>
            </div>
          )}
        </section>

        <section id="products" className="mt-12">
          <div className="mb-6 flex items-center gap-4">
            <span className="grid h-9 w-9 place-items-center rounded-[10px] border border-[#D7E5E3] bg-[#F7FBFB] text-[#0B7A75]">
              <Star className="h-5 w-5" strokeWidth={1.7} />
            </span>
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#0B1026]">
              {mainCategory === "All"
                ? "Rutinitas yang Direkomendasikan"
                : "5 Rekomendasi Produk Teratas"}
            </h2>
          </div>
          <ProductCategoryFilter
            filters={productCategoryFilters}
            mainValue={mainCategory}
            subValue={subCategory}
            onMainChange={selectMainCategory}
            onSubChange={setSubCategory}
          />
          <div className="mt-6">
            {isLoading ? (
              <ProductLoadingState />
            ) : error ? (
              <ProductErrorState message={error} onRetry={retry} />
            ) : (
              <ProductRecommendationList products={products} />
            )}
          </div>
        </section>

        <div className="mt-12 flex justify-center">
          <Button asChild size="lg">
            <Link href="/analyze" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Analisis Ulang
            </Link>
          </Button>
        </div>

        {analysisResult.disclaimer && (
          <section className="mt-12 grid grid-cols-[1.25rem_minmax(0,1fr)] items-center gap-3 rounded-[18px] border border-[#FECACA] bg-[#FEF2F2] p-5 text-[#991B1B]">
            <Info
              aria-hidden="true"
              className="h-5 w-5 text-[#DC2626]"
              strokeWidth={2}
            />
            <p className="text-base font-semibold leading-7">
              Hasil ini hanya untuk tujuan edukasi dan bukan diagnosis medis.
              Konsultasikan dengan dokter kulit untuk mendapatkan evaluasi dan
              saran medis profesional.
            </p>
          </section>
        )}

        <footer className="mt-16 border-t border-[#EAEAEA] pt-9 text-center">
          <p className="text-3xl font-semibold tracking-[-0.03em] text-[#0B1026]">
            Dermalyzer<span className="text-[#0B7A75]">*</span>
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-[#354D51]">
            <Link href="/">Beranda</Link>
            <Link href="/analyze">Analisis</Link>
            <a href="#ingredients">Bahan</a>
            <a href="#products">Produk</a>
          </div>
          <p className="mt-5 text-sm text-[#4F6466]">
            © 2026 Dermalyzer. Hanya untuk edukasi analisis kulit.
          </p>
        </footer>
    </>
  );
}

function ProductLoadingState() {
  return (
    <div aria-label="Memuat rekomendasi produk" className="grid gap-4">
      {[1, 2].map((row) => (
        <div
          key={row}
          className="h-[164px] animate-pulse rounded-[16px] border border-[#EAEAEA] bg-white p-4"
        >
          <div className="h-full w-full rounded-[12px] bg-[#F4F6F7]" />
        </div>
      ))}
    </div>
  );
}

function ProductErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-[16px] border border-[#EAEAEA] bg-white p-5">
      <p className="text-sm text-[#4F6466]">{message}</p>
      <Button className="mt-4" size="sm" variant="outline" onClick={onRetry}>
        Coba lagi
      </Button>
    </div>
  );
}

function ResultLoadingState() {
  return (
    <section className="grid min-h-[58vh] place-items-center rounded-[24px] border border-[#EAEAEA] bg-white/95 p-8 text-center shadow-[0_24px_80px_rgba(0,38,43,0.08)]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0B7A75]">
          Hasil
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#0B1026]">
          Memuat hasil analisis
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
          Hasil analisis tidak ditemukan
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-[#0B1026]">
          Mulai dengan foto wajah.
        </h1>
        <p className="mt-4 text-base leading-7 text-[#4F6466]">
          Halaman ini hanya menampilkan hasil setelah gambar dianalisis pada
          sesi browser saat ini.
        </p>
        <Button asChild className="mt-8">
          <Link href="/analyze">Buka halaman analisis</Link>
        </Button>
      </div>
    </section>
  );
}
