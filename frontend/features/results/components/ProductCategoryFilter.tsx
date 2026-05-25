"use client";

import { cn } from "@/lib/utils/cn";
import type { ProductCategoryFilterOption } from "@/features/skin-analysis/types/skinAnalysis.types";

interface ProductCategoryFilterProps {
  filters: ProductCategoryFilterOption[];
  mainValue: string;
  subValue: string;
  onMainChange: (value: string) => void;
  onSubChange: (value: string) => void;
}

export function ProductCategoryFilter({
  filters,
  mainValue,
  subValue,
  onMainChange,
  onSubChange,
}: ProductCategoryFilterProps) {
  const mainOptions = ["All", ...filters.map((filter) => filter.mainCategory)];
  const selectedFilter = filters.find(
    (filter) => filter.mainCategory === mainValue,
  );
  const subOptions =
    selectedFilter && selectedFilter.subCategories.length > 1
      ? ["All", ...selectedFilter.subCategories]
      : [];

  return (
    <div className="space-y-3">
      <FilterRow
        ariaLabel="Filter by main product category"
        options={mainOptions}
        value={mainValue}
        onChange={onMainChange}
      />
      {subOptions.length > 0 && (
        <FilterRow
          ariaLabel={`Filter ${mainValue} by subcategory`}
          options={subOptions}
          value={subValue}
          onChange={onSubChange}
          secondary
        />
      )}
    </div>
  );
}

interface FilterRowProps {
  ariaLabel: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  secondary?: boolean;
}

function FilterRow({
  ariaLabel,
  options,
  value,
  onChange,
  secondary = false,
}: FilterRowProps) {
  return (
    <div aria-label={ariaLabel} className="flex flex-wrap gap-3" role="group">
      {options.map((option) => {
        const isActive = value === option;

        return (
          <button
            key={option}
            type="button"
            className={cn(
              "h-10 rounded-full border px-6 text-sm font-medium transition-[background-color,color,border-color,transform] duration-200 active:scale-[0.98]",
              secondary && "h-9 px-5 text-xs",
              isActive
                ? "border-[#0B7A75] bg-[#0B7A75] text-white"
                : "border-[#D9E1E8] bg-white text-[#4F6466] hover:border-[#B8CECD] hover:bg-[#F7FBFB] hover:text-[#0B1026]",
            )}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
