"use client";

import { motion } from "framer-motion";

const navItems = ["Products", "How it Works", "Science", "Privacy", "Pricing"];

function BrandMark() {
  return (
    <motion.a
      aria-label="DermAI home"
      className="inline-flex items-baseline justify-self-start text-[var(--color-ink-text)]"
      href="#top"
      whileHover={{ opacity: 0.78, y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 360, damping: 24 }}
    >
      <span className="text-[clamp(1.35rem,2vw,2rem)] font-semibold leading-none tracking-[var(--tracking-heading)]">
        DermAI
      </span>
      <span className="ml-1 text-[clamp(1.25rem,1.8vw,1.85rem)] font-semibold leading-none text-[var(--color-amethyst-accent)]">
        *
      </span>
    </motion.a>
  );
}

function NavLink({ item }: { item: string }) {
  return (
    <motion.a
      className="rounded-full px-3 py-2 text-[clamp(0.82rem,0.86vw,1rem)] font-medium leading-none tracking-[0] text-[var(--color-ink-text)] transition-[color,background-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[var(--color-amethyst-accent)] hover:text-[var(--color-ink-text)] hover:shadow-[var(--shadow-subtle)] focus-visible:bg-[var(--color-sky-blue-highlight)]"
      href={`#${item.toLowerCase().replaceAll(" ", "-")}`}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
    >
      {item}
    </motion.a>
  );
}

export function Navbar() {
  return (
    <motion.header
      className="flex w-full justify-center px-[var(--spacing-16)] pt-[var(--spacing-20)] sm:px-[var(--spacing-24)] lg:px-[var(--spacing-40)]"
      initial={{ opacity: 0, y: -18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
    >
      <motion.div
        className="mx-auto grid min-h-[72px] w-full max-w-[1040px] grid-cols-1 items-center justify-items-center gap-[var(--spacing-16)] rounded-full border border-[var(--color-porcelain-surface)] bg-[var(--color-porcelain-surface)] px-[var(--spacing-20)] py-[var(--spacing-12)] shadow-[var(--shadow-md)] sm:min-h-[78px] sm:px-[var(--spacing-24)] lg:grid-cols-[minmax(140px,0.58fr)_auto_minmax(140px,0.58fr)] lg:px-[var(--spacing-32)]"
        whileHover={{
          y: -2,
          boxShadow: "rgba(0, 0, 0, 0.06) 0px 14px 28px 0px",
        }}
        transition={{ type: "spring", stiffness: 180, damping: 22 }}
      >
        <BrandMark />

        <nav
          aria-label="Primary navigation"
          className="hidden items-center justify-center gap-[clamp(0.65rem,1.1vw,1.25rem)] lg:flex"
        >
          {navItems.map((item) => (
            <NavLink item={item} key={item} />
          ))}
        </nav>
        <div aria-hidden="true" className="hidden lg:block" />
      </motion.div>
    </motion.header>
  );
}
