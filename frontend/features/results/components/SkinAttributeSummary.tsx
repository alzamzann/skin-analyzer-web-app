import type { SkinAttribute } from "../types/result.types";

interface SkinAttributeSummaryProps {
  attributes: SkinAttribute[];
}

export function SkinAttributeSummary({ attributes }: SkinAttributeSummaryProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {attributes.map((attribute) => (
        <div
          key={attribute.label}
          className="rounded-2xl border border-[var(--color-platinum-border)] bg-card p-4"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">{attribute.label}</span>
            <span className="text-muted-foreground">{attribute.value}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--color-cloud-canvas)]">
            <div
              className="h-full rounded-full bg-[var(--color-sky-blue-highlight)]"
              style={{ width: `${attribute.value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
