import type { Ingredient } from "../types/result.types";

interface IngredientListProps {
  ingredients: Ingredient[];
}

export function IngredientList({ ingredients }: IngredientListProps) {
  return (
    <div className="flex flex-wrap gap-4">
      {ingredients.map((ingredient) => (
        <div
          key={ingredient.name}
          className="inline-flex items-center rounded-full border border-[#D7E5E3] bg-[#F7FBFB] px-5 py-3 text-sm font-medium text-[#0B1026]"
          title={ingredient.reason}
        >
          <span>{ingredient.name}</span>
        </div>
      ))}
    </div>
  );
}
