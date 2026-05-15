import * as React from "react";

import { cn } from "@/lib/utils/cn";

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[var(--color-spring-leaf)] bg-[var(--color-surface-white)] px-3 py-1 text-xs font-semibold tracking-[var(--tracking-caption)] text-[var(--color-oceanic-deep)]",
        className,
      )}
      {...props}
    />
  );
}
