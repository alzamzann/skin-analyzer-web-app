import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

const highlights = [
  "Oiliness",
  "Sensitivity",
  "Pigmentation",
  "Wrinkle tendency",
];

export function BaumannIntroSection() {
  return (
    <section id="science" className="w-full bg-background py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div>
          <Badge>Baumann method</Badge>
          <h2 className="mt-5 max-w-xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Skin guidance that starts with a structured type.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
            DermAI organizes visible skin signals into a Baumann-style profile,
            then turns that result into ingredient and product guidance.
          </p>
        </div>
        <Card className="border-[var(--color-platinum-border)] bg-[var(--color-porcelain-surface)]">
          <CardHeader>
            <CardTitle>What the analyzer checks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {highlights.map((item) => (
                <div
                  className="rounded-2xl border border-[var(--color-platinum-border)] bg-[var(--color-cloud-canvas)] p-5 text-sm font-medium text-[var(--color-ink-text)]"
                  key={item}
                >
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
