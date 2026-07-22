"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import type { Ingredient } from "../types/result.types";

interface IngredientListProps {
  ingredients: Ingredient[];
}

export function IngredientList({ ingredients }: IngredientListProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="flex flex-wrap gap-2">
      {ingredients.map((ingredient, index) => {
        const isExpanded = expandedIndex === index;
        const hasDetails =
          (ingredient.inciName &&
            ingredient.inciName !== ingredient.name) ||
          ingredient.alternateName ||
          ingredient.personalCareCategory;

        return (
          <div key={ingredient.name} className="flex flex-col">
            <button
              type="button"
              onClick={() => hasDetails && toggle(index)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                isExpanded
                  ? "border-[#0B7A75] bg-[#EDF3EC] text-[#0B7A75]"
                  : "border-[#D7E5E3] bg-[#F7FBFB] text-[#0B1026] hover:bg-[#EDF3EC]"
              } ${hasDetails ? "cursor-pointer" : "cursor-default"}`}
              title={ingredient.reason}
            >
              <span>{ingredient.name}</span>
              {hasDetails && (
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              )}
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mt-1.5 rounded-[12px] border border-[#D7E5E3] bg-white px-3.5 py-2.5 text-sm">
                    {ingredient.inciName &&
                      ingredient.inciName !== ingredient.name && (
                        <p className="text-[#354D51]">
                          <span className="font-medium text-[#0B1026]">
                            INCI:
                          </span>{" "}
                          {ingredient.inciName}
                        </p>
                      )}
                    {ingredient.alternateName && (
                      <p className="mt-1 text-[#354D51]">
                        <span className="font-medium text-[#0B1026]">
                          Nama lain:
                        </span>{" "}
                        {ingredient.alternateName}
                      </p>
                    )}
                    {ingredient.personalCareCategory && (
                      <p className="mt-1 text-[#354D51]">
                        <span className="font-medium text-[#0B1026]">
                          Personal Care Category:
                        </span>{" "}
                        {ingredient.personalCareCategory}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
