"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/utils/cn";

const defaultNavItems = [
  { label: "Produk", href: "#products" },
  { label: "Cara Kerja", href: "#how-it-works" },
  { label: "Dasar Ilmiah", href: "#science" },
  { label: "Privasi", href: "#privacy" },
];

interface NavbarItem {
  href: string;
  label: string;
}

interface NavbarProps {
  action?: React.ReactNode;
  brandHref?: string;
  className?: string;
  items?: NavbarItem[];
}

function navigate(href: string, router: ReturnType<typeof useRouter>) {
  if (href.startsWith("#")) {
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  } else {
    router.push(href);
  }
}

function BrandMark({ href = "/" }: { href?: string }) {
  return (
    <motion.a
      aria-label="Beranda Dermalyzer"
      className="inline-flex items-center justify-self-start text-[#111111]"
      href={href}
      whileHover={{ opacity: 0.78, y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 360, damping: 24 }}
    >
      <span className="text-[clamp(1.1rem,1.6vw,1.35rem)] font-semibold leading-none tracking-[-0.02em]">
        Dermalyzer
      </span>
      <span className="ml-1 text-[clamp(1.05rem,1.4vw,1.25rem)] font-semibold leading-none text-[#346538]">
        *
      </span>
    </motion.a>
  );
}

function NavLink({ item, onClick }: { item: NavbarItem; onClick?: () => void }) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick?.();
    navigate(item.href, router);
  };

  return (
    <motion.a
      className="rounded-full px-3 py-2 text-[0.84rem] font-medium leading-none tracking-[0] text-[#2F3437] transition-[color,background-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#EDF3EC] hover:text-[#111111] focus-visible:bg-[#EDF3EC]"
      href={item.href}
      onClick={handleClick}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
    >
      {item.label}
    </motion.a>
  );
}

export function Navbar({
  action,
  brandHref = "/",
  className,
  items = defaultNavItems,
}: NavbarProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleDropdownLink = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    setTimeout(() => navigate(href, router), 300);
  };

  return (
    <motion.header
      className={cn(
        "flex w-full justify-center bg-[#FBFBFA] px-4 pt-5 sm:px-6 lg:px-10",
        className,
      )}
      initial={{ opacity: 0, y: -18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
    >
      <div className="mx-auto w-full max-w-[1040px]">
        <motion.div
          className="grid min-h-[68px] grid-cols-[auto_1fr_auto] items-center justify-items-center gap-4 rounded-full border border-[#EAEAEA] bg-white/95 px-5 py-3 backdrop-blur-sm sm:min-h-[74px] sm:px-6 lg:grid-cols-[minmax(140px,0.58fr)_auto_minmax(140px,0.58fr)] lg:px-8"
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 180, damping: 22 }}
        >
          <BrandMark href={brandHref} />

          <nav
            aria-label="Navigasi utama"
            className="hidden items-center justify-center gap-[clamp(0.65rem,1.1vw,1.25rem)] lg:flex"
          >
            {items.map((item) => (
              <NavLink item={item} key={item.href} />
            ))}
          </nav>

          <div className="hidden justify-self-end lg:block">
            {action ?? <span aria-hidden="true" />}
          </div>

          <button
            type="button"
            className="grid h-10 w-10 place-items-center justify-self-end rounded-full text-[#2F3437] transition-colors hover:bg-[#EDF3EC] lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={mobileMenuOpen}
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileMenuOpen ? (
                <motion.span
                  key="close"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.15 }}
                >
                  <X className="h-5 w-5" />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{ opacity: 0, rotate: 90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: -90 }}
                  transition={{ duration: 0.15 }}
                >
                  <Menu className="h-5 w-5" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </motion.div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-50 lg:hidden"
            >
              <div className="mt-2 flex flex-col gap-1 rounded-[20px] border border-[#EAEAEA] bg-white px-4 py-4">
                {items.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleDropdownLink(e, item.href)}
                    className="rounded-full px-4 py-3 text-sm font-medium text-[#2F3437] transition-colors hover:bg-[#EDF3EC] hover:text-[#111111]"
                  >
                    {item.label}
                  </a>
                ))}
                {action && (
                  <div className="mt-2 border-t border-[#EAEAEA] pt-3">
                    {action}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
