"use client";

import { Select } from "@/components/ui/Select";
import {
  productCategories,
  type ProductCategory,
} from "@/lib/constants/productCategories";

interface ProductCategoryFilterProps {
  value: ProductCategory | "All";
  onChange: (value: ProductCategory | "All") => void;
}

export function ProductCategoryFilter({
  value,
  onChange,
}: ProductCategoryFilterProps) {
  return (
    <Select
      value={value}
      onChange={(event) => onChange(event.target.value as ProductCategory | "All")}
      aria-label="Filter product category"
      className="max-w-52"
    >
      <option value="All">All products</option>
      {productCategories.map((category) => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
    </Select>
  );
}
