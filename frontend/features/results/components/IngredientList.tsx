import { FlaskConical, Leaf, Shield, Sparkles, Waves } from "lucide-react";

import type { Ingredient } from "../types/result.types";

interface IngredientListProps {
  ingredients: Ingredient[];
}

const ingredientIcons = [DropletIcon, FlaskConical, Sparkles, Leaf, Shield, Waves];

function DropletIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M12 3.75c2.9 3.35 5.1 6.12 5.1 9.18a5.1 5.1 0 0 1-10.2 0c0-3.06 2.2-5.83 5.1-9.18Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function IngredientList({ ingredients }: IngredientListProps) {
  return (
    <div className="flex flex-wrap gap-4">
      {ingredients.map((ingredient, index) => {
        const Icon = ingredientIcons[index % ingredientIcons.length];

        return (
          <div
            key={ingredient.name}
            className="inline-flex items-center gap-3 rounded-full border border-[#D7E5E3] bg-[#F7FBFB] px-5 py-3 text-sm font-medium text-[#0B1026]"
            title={ingredient.reason}
          >
            <Icon className="h-5 w-5 text-[#0B7A75]" />
            <span>{ingredient.name}</span>
          </div>
        );
      })}
    </div>
  );
}
