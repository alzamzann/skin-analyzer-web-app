import type { Ingredient } from "../types/result.types";

interface IngredientListProps {
  ingredients: Ingredient[];
}

export function IngredientList({ ingredients }: IngredientListProps) {
  return (
    <div className="space-y-3">
      {ingredients.map((ingredient) => (
        <div
          key={ingredient.name}
          className="rounded-2xl border border-[var(--color-platinum-border)] bg-card p-4"
        >
          <h3 className="font-semibold text-foreground">{ingredient.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{ingredient.reason}</p>
        </div>
      ))}
    </div>
  );
}
