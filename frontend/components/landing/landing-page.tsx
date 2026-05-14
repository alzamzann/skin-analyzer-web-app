const navItems = ["Products", "How it Works", "Science", "Privacy", "Pricing"];

function BrandMark() {
  return (
    <a
      aria-label="DermAI home"
      className="inline-flex items-baseline text-[var(--color-ink-text)] transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:opacity-80"
      href="#top"
    >
      <span className="text-[clamp(2rem,3.2vw,3.5rem)] font-semibold leading-none tracking-[var(--tracking-heading)]">
        DermAI
      </span>
      <span className="ml-1 text-[clamp(1.8rem,2.7vw,3rem)] font-semibold leading-none text-[var(--color-amethyst-accent)]">
        *
      </span>
    </a>
  );
}

function NavLink({ item }: { item: string }) {
  return (
    <a
      className="rounded-[var(--radius-button)] px-1 py-2 text-[clamp(1rem,1.35vw,1.85rem)] font-medium leading-none tracking-[0] text-[var(--color-ink-text)] transition-[color,background-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-[var(--color-deep-plum)] focus-visible:bg-[var(--color-cloud-canvas)]"
      href={`#${item.toLowerCase().replaceAll(" ", "-")}`}
    >
      {item}
    </a>
  );
}

function NavigationBar() {
  return (
    <header className="w-full px-[var(--spacing-16)] pt-[var(--spacing-32)] sm:px-[var(--spacing-32)] lg:px-[var(--spacing-80)]">
      <div className="mx-auto grid min-h-[128px] w-full max-w-[2400px] grid-cols-[1fr_auto] items-center gap-[var(--spacing-24)] rounded-[var(--radius-large)] bg-[var(--color-porcelain-surface)] px-[var(--spacing-24)] py-[var(--spacing-20)] shadow-[var(--shadow-md)] sm:min-h-[144px] sm:px-[var(--spacing-40)] lg:grid-cols-[minmax(220px,0.8fr)_auto_minmax(220px,0.8fr)] lg:px-[var(--spacing-60)]">
        <BrandMark />

        <nav
          aria-label="Primary navigation"
          className="hidden items-center justify-center gap-[clamp(1.5rem,3vw,4rem)] lg:flex"
        >
          {navItems.map((item) => (
            <NavLink item={item} key={item} />
          ))}
        </nav>

        <div className="flex items-center justify-end gap-[var(--spacing-12)] sm:gap-[var(--spacing-24)]">
          <a
            className="hidden rounded-[var(--radius-button)] px-[var(--spacing-12)] py-[var(--spacing-8)] text-[clamp(1rem,1.35vw,1.85rem)] font-semibold leading-none tracking-[0] text-[var(--color-ink-text)] transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-[var(--color-deep-plum)] sm:inline-flex"
            href="#login"
          >
            Log in
          </a>
          <a
            className="inline-flex min-h-14 items-center justify-center rounded-[var(--radius-large)] border border-[var(--color-amethyst-accent)] bg-[var(--color-amethyst-accent)] px-[var(--spacing-20)] py-[var(--spacing-12)] text-[clamp(0.95rem,1.35vw,1.85rem)] font-semibold leading-none tracking-[0] text-[var(--color-ink-text)] shadow-[var(--shadow-subtle)] transition-[transform,background-color,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:bg-[var(--color-sky-blue-highlight)] hover:shadow-[var(--shadow-md)] active:translate-y-px active:scale-[0.98] sm:min-h-20 sm:px-[var(--spacing-32)]"
            href="#signup"
          >
            Sign up free
          </a>
        </div>
      </div>
    </header>
  );
}

export function LandingPage() {
  return (
    <main
      id="top"
      className="min-h-[100dvh] bg-[var(--color-cloud-canvas)] text-[var(--color-graphite-text)]"
    >
      <NavigationBar />
    </main>
  );
}
