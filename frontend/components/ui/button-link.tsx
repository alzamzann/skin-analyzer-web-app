import type { AnchorHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "dark" | "outline" | "ghost";

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  icon?: ReactNode;
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-[var(--color-amethyst-accent)] bg-[var(--color-amethyst-accent)] text-[var(--color-ink-text)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]",
  dark:
    "border-[var(--color-ink-text)] bg-[var(--color-ink-text)] text-[var(--color-porcelain-surface)] hover:-translate-y-0.5",
  outline:
    "border-[var(--color-ink-text)] bg-transparent text-[var(--color-ink-text)] hover:bg-[var(--color-cloud-canvas)]",
  ghost:
    "border-transparent bg-transparent text-[var(--color-graphite-text)] hover:text-[var(--color-ink-text)]",
};

export function ButtonLink({
  children,
  className = "",
  icon,
  variant = "primary",
  ...props
}: ButtonLinkProps) {
  return (
    <a
      className={[
        "inline-flex min-h-11 items-center justify-center gap-2 border px-[var(--spacing-16)] py-2.5 text-sm font-medium tracking-[0] transition-[transform,background-color,border-color,box-shadow,color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:translate-y-px active:scale-[0.98]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-ink-text)]",
        "rounded-[var(--radius-button)]",
        variantClasses[variant],
        className,
      ].join(" ")}
      {...props}
    >
      <span>{children}</span>
      {icon ? (
        <span className="shrink-0" aria-hidden="true">
          {icon}
        </span>
      ) : null}
    </a>
  );
}
