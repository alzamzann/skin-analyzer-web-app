import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface BaumannResultCardProps {
  baumannType: string;
  confidence: number;
}

export function BaumannResultCard({
  baumannType,
  confidence,
}: BaumannResultCardProps) {
  return (
    <Card className="border-[var(--color-ink-text)] bg-[var(--color-amethyst-accent)]">
      <CardHeader>
        <Badge className="w-fit bg-[var(--color-sky-blue-highlight)]">
          Result
        </Badge>
        <CardTitle className="text-5xl">{baumannType}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-medium text-[var(--color-ink-text)]">
          Confidence {Math.round(confidence * 100)}%
        </p>
      </CardContent>
    </Card>
  );
}
