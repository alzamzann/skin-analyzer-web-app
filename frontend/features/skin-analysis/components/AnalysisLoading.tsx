import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export function AnalysisLoading() {
  return (
    <div className="rounded-2xl border border-[var(--color-platinum-border)] bg-card p-6">
      <LoadingSpinner label="Menganalisis gambar kulit" />
    </div>
  );
}
