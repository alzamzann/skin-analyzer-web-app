import { cn } from "@/lib/utils/cn";

interface LoadingSpinnerProps {
  className?: string;
  label?: string;
}

export function LoadingSpinner({ className, label }: LoadingSpinnerProps) {
  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-platinum-border)] border-t-[var(--color-ink-text)]" />
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  );
}
