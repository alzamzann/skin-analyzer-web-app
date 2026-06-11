"use client";

import { useEffect, useRef, useState } from "react";

import { fetchRecommendedProducts } from "@/features/skin-analysis/services/skinAnalysisApi";
import type { ProductRecommendation } from "../types/result.types";

export function useProductFilter(
  initialProducts: ProductRecommendation[],
  baumannType: string,
) {
  const [mainCategory, setMainCategory] = useState("All");
  const [subCategory, setSubCategory] = useState("All");
  const [filteredProducts, setFilteredProducts] = useState<ProductRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestController = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => requestController.current?.abort();
  }, []);

  const loadProducts = (selectedMainCategory: string, selectedSubCategory: string) => {
    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;
    setIsLoading(true);
    setError(null);

    void fetchRecommendedProducts({
      baumannType,
      mainCategory: selectedMainCategory,
      subCategory: selectedSubCategory,
      signal: controller.signal,
    })
      .then((result) => setFilteredProducts(result.products))
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) {
          return;
        }
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Rekomendasi produk tidak dapat dimuat.";
        setFilteredProducts([]);
        setError(message);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });
  };

  const selectMainCategory = (value: string) => {
    setMainCategory(value);
    setSubCategory("All");
    if (value === "All") {
      requestController.current?.abort();
      setIsLoading(false);
      setError(null);
      return;
    }
    loadProducts(value, "All");
  };

  const selectSubCategory = (value: string) => {
    setSubCategory(value);
    loadProducts(mainCategory, value);
  };

  return {
    mainCategory,
    subCategory,
    products: mainCategory === "All" ? initialProducts : filteredProducts,
    isLoading: mainCategory === "All" ? false : isLoading,
    error: mainCategory === "All" ? null : error,
    selectMainCategory,
    setSubCategory: selectSubCategory,
    retry: () => loadProducts(mainCategory, subCategory),
  };
}
