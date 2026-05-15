import type React from "react";

import { cn } from "@/lib/utils/cn";

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PageContainer({
  children,
  className,
  ...props
}: PageContainerProps) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-4 lg:px-8", className)} {...props}>
      {children}
    </div>
  );
}
