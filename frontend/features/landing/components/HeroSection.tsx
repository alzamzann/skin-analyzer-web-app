"use client";

import {
  FloatingIconsHero,
  type FloatingIconsHeroProps,
} from "@/components/ui/floating-icons-hero-section";

interface AlphabetIconProps {
  className?: string;
}

function createAlphabetIcon(letter: string, color: string) {
  const AlphabetIcon = ({ className }: AlphabetIconProps) => (
    <span
      aria-hidden="true"
      className={`${className ?? ""} grid place-items-center font-bold leading-none tracking-[-0.05em]`}
      style={{ color }}
    >
      {letter}
    </span>
  );

  AlphabetIcon.displayName = `Type${letter}`;
  return AlphabetIcon;
}

const TypeD = createAlphabetIcon("D", "#C77D8A");
const TypeO = createAlphabetIcon("O", "#C28B55");
const TypeS = createAlphabetIcon("S", "#7FA56F");
const TypeR = createAlphabetIcon("R", "#5FA89B");
const TypeP = createAlphabetIcon("P", "#6E9DBC");
const TypeN = createAlphabetIcon("N", "#8585BC");
const TypeW = createAlphabetIcon("W", "#A77CAA");
const TypeT = createAlphabetIcon("T", "#9B8E68");

const alphabetIcons: FloatingIconsHeroProps["icons"] = [
  { id: 1, icon: TypeD, className: "top-[13%] left-[12%]" },
  { id: 2, icon: TypeO, className: "top-[18%] right-[12%]" },
  { id: 3, icon: TypeS, className: "top-[39%] left-[10%]" },
  { id: 4, icon: TypeR, className: "top-[43%] right-[9%]" },
  { id: 5, icon: TypeP, className: "bottom-[15%] left-[15%]" },
  { id: 6, icon: TypeN, className: "bottom-[13%] right-[15%]" },
  { id: 7, icon: TypeW, className: "top-[8%] left-[47%]" },
  { id: 8, icon: TypeT, className: "bottom-[8%] right-[45%]" },
];

export function HeroSection() {
  return (
    <FloatingIconsHero
      id="products"
      title="Dermalyzer reads visible skin signals"
      subtitle="Upload one clear face photo to estimate a Baumann-style skin type, then review ingredient guidance and product matches from the current dataset."
      ctaText="Start analysis"
      ctaHref="/analyze"
      icons={alphabetIcons}
    />
  );
}
