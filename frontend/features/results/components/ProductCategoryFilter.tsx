"use client";

import { cn } from "@/lib/utils/cn";

interface ProductCategoryFilterProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export function ProductCategoryFilter({
  options,
  value,
  onChange,
}: ProductCategoryFilterProps) {
  return (
    <div
      aria-label="Filter product category"
      className="flex flex-wrap gap-3"
      role="group"
    >
      {options.map((option) => {
        const isActive = value === option;

        return (
          <button
            key={option}
            type="button"
            className={cn(
              "h-10 rounded-full border px-6 text-sm font-medium transition-[background-color,color,border-color] duration-200",
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
