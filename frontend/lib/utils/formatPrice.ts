export function formatPrice(value: number, currency = "IDR", locale = "id-ID") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}
