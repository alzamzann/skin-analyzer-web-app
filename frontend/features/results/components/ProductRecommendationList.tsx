import { ProductCard } from "./ProductCard";
import type { ProductRecommendation } from "../types/result.types";

interface ProductRecommendationListProps {
  products: ProductRecommendation[];
}

export function ProductRecommendationList({
  products,
}: ProductRecommendationListProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-[16px] border border-[#EAEAEA] bg-white p-5 text-sm text-[#4F6466]">
        Belum ada produk yang sesuai dengan filter ini.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
