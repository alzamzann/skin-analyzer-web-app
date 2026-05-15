"use client";

import { motion } from "framer-motion";

const navItems = ["Products", "How it Works", "Science", "Privacy", "Pricing"];

function BrandMark() {
  return (
    <motion.a
      aria-label="Dermalyzer home"
      className="inline-flex items-center justify-self-start text-[#111111]"
      href="#top"
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

function NavLink({ item }: { item: string }) {
  return (
    <motion.a
      className="rounded-full px-3 py-2 text-[0.84rem] font-medium leading-none tracking-[0] text-[#2F3437] transition-[color,background-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#EDF3EC] hover:text-[#111111] focus-visible:bg-[#EDF3EC]"
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
      className="flex w-full justify-center bg-[#FBFBFA] px-4 pt-5 sm:px-6 lg:px-10"
      initial={{ opacity: 0, y: -18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
    >
      <motion.div
        className="mx-auto grid min-h-[68px] w-full max-w-[1040px] grid-cols-1 items-center justify-items-center gap-4 rounded-full border border-[#EAEAEA] bg-white/95 px-5 py-3 backdrop-blur-sm sm:min-h-[74px] sm:px-6 lg:grid-cols-[minmax(140px,0.58fr)_auto_minmax(140px,0.58fr)] lg:px-8"
        whileHover={{
          y: -2,
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
