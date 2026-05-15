import * as React from "react";

import { cn } from "@/lib/utils/cn";

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[var(--color-ink-text)] bg-[var(--color-sky-blue-highlight)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-text)]",
        className,
      )}
      {...props}
    />
  );
}
