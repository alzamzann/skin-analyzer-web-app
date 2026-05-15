import type { AnchorHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "dark" | "outline" | "ghost";

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  icon?: ReactNode;
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-[var(--color-spring-leaf)] bg-[var(--color-spring-leaf)] text-[var(--color-midnight-ink)] hover:-translate-y-0.5",
  dark:
    "border-[var(--color-oceanic-deep)] bg-[var(--color-oceanic-deep)] text-[var(--color-surface-white)] hover:-translate-y-0.5",
  outline:
    "border-[var(--color-spring-leaf)] bg-transparent text-[var(--color-oceanic-deep)] hover:bg-[var(--color-pale-mint)]",
  ghost:
    "border-transparent bg-transparent text-[var(--color-slate-grille)] hover:text-[var(--color-midnight-ink)]",
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
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-oceanic-deep)]",
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
