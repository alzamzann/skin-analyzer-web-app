export const productCategories = [
  "Cleanser",
  "Toner",
  "Serum",
  "Moisturizer",
  "Sunscreen",
] as const;

export type ProductCategory = (typeof productCategories)[number];

const productCategoryTranslations: Record<string, string> = {
  All: "Semua",
  Treatment: "Perawatan",
  Toner: "Toner",
  Essence: "Esens",
  "Face Serum": "Serum Wajah",
  Booster: "Booster",
  Ampoule: "Ampul",
  Cleanser: "Pembersih",
  "Face Wash": "Sabun Wajah",
  "Cleansing Oil": "Minyak Pembersih",
  "Cleansing Balm": "Balsem Pembersih",
  "Cleansing Cream": "Krim Pembersih",
  "Cleansing Gel": "Gel Pembersih",
  "Scrub And Exfoliator": "Scrub dan Eksfoliator",
  "Micellar Water": "Micellar Water",
  Peeling: "Peeling",
  Moisturizer: "Pelembap",
  "Face Oil": "Minyak Wajah",
  "Face Cream And Lotion": "Krim dan Losion Wajah",
  "Face Mist": "Face Mist",
  "Face Gel": "Gel Wajah",
  Sunscreen: "Tabir Surya",
  Other: "Lainnya",
};

export function translateProductCategory(category: string) {
  return productCategoryTranslations[category] ?? category;
}
