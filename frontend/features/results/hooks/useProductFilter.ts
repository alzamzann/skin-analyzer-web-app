"use client";

import { useMemo, useState } from "react";

import type { ProductRecommendation } from "../types/result.types";

export function useProductFilter(products: ProductRecommendation[]) {
  const [category, setCategory] = useState<string>("All");

  const filteredProducts = useMemo(() => {
    if (category === "All") {
      return products;
    }

    return products.filter((product) => product.category === category);
  }, [category, products]);

  return { category, filteredProducts, setCategory };
}
