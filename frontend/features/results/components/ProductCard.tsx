import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { formatPrice } from "@/lib/utils/formatPrice";

import type { ProductRecommendation } from "../types/result.types";

interface ProductCardProps {
  product: ProductRecommendation;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <Badge>{product.category}</Badge>
        <h3 className="mt-4 font-semibold text-foreground">{product.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{product.brand}</p>
        <p className="mt-4 text-sm font-semibold text-foreground">
          {formatPrice(product.price)}
        </p>
      </CardContent>
    </Card>
  );
}
