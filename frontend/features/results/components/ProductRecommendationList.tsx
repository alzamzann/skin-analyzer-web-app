import { ProductCard } from "./ProductCard";
import type { ProductRecommendation } from "../types/result.types";

interface ProductRecommendationListProps {
  products: ProductRecommendation[];
}

export function ProductRecommendationList({
  products,
}: ProductRecommendationListProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
