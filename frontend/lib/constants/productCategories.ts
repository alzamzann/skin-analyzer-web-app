export const productCategories = [
  "Cleanser",
  "Toner",
  "Serum",
  "Moisturizer",
  "Sunscreen",
] as const;

export type ProductCategory = (typeof productCategories)[number];
