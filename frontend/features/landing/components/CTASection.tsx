import { Button } from "@/components/ui/Button";

export function CTASection() {
  return (
    <section id="pricing" className="w-full bg-background px-4 py-16 sm:py-24">
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-8 rounded-[var(--radius-card)] border border-[var(--color-ink-text)] bg-[var(--color-amethyst-accent)] p-8 text-[var(--color-ink-text)] sm:p-10 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em]">
            Skin analysis
          </p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Upload a face photo and get your first Baumann-style result.
          </h2>
        </div>
        <Button asChild className="bg-[var(--color-ink-text)]">
          <a href="/analyze">Start analysis</a>
        </Button>
      </div>
    </section>
  );
}
