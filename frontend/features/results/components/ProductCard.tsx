import Image from "next/image";

import { Badge } from "@/components/ui/Badge";

import type { ProductRecommendation } from "../types/result.types";

interface ProductCardProps {
  product: ProductRecommendation;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="grid gap-5 rounded-[16px] border border-[#EAEAEA] bg-white p-3 transition-[background-color,box-shadow] duration-200 hover:bg-[#F9FDFD] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:grid-cols-[150px_1fr] sm:items-center sm:p-4">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[12px] bg-[#F4F6F7]">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(min-width: 640px) 150px, calc(100vw - 3.5rem)"
            className="object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center text-sm text-[#A1C2C6]">
            Dermalyzer
          </div>
        )}
      </div>
      <div className="min-w-0 px-1">
        <Badge className="border-[#0B7A75]/20 bg-[#DDF1EF] px-3.5 py-1.5 text-[0.68rem] uppercase tracking-[0.08em] text-[#006A66]">
          {product.mainCategory
            ? `${product.mainCategory} / ${product.category}`
            : product.category}
        </Badge>
        <h3 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-[#0B1026]">
          {product.name}
        </h3>
        <p className="mt-1 text-sm text-[#4F6466]">{product.brand}</p>
        {typeof product.similarityScore === "number" && (
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#4F6466]">
            Kecocokan {Math.round(product.similarityScore * 100)}%
          </p>
        )}
        {product.matchedIngredients && product.matchedIngredients.length > 0 && (
          <p className="mt-2 text-xs leading-5 text-[#4F6466]">
            Bahan yang cocok: {product.matchedIngredients.join(", ")}
          </p>
        )}
        {product.productUrl && (
          <a
            className="mt-3 inline-flex text-sm font-semibold text-[#0B7A75] hover:text-[#0B1026]"
            href={product.productUrl}
            rel="noreferrer"
            target="_blank"
          >
            Lihat produk
          </a>
        )}
      </div>
    </article>
  );
}
