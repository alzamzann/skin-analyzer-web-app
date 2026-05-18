"use client";

import {
  Droplet,
  Layers,
  Leaf,
  ScanFace,
  Shield,
  Sparkles,
  SunMedium,
  Waves,
  type LucideIcon,
} from "lucide-react";

import {
  FloatingIconsHero,
  type FloatingIconsHeroProps,
} from "@/components/ui/floating-icons-hero-section";

interface ClinicalIconProps {
  className?: string;
}

function createClinicalIcon(
  Icon: LucideIcon,
  color: string,
  displayName: string,
) {
  const ClinicalIcon = ({ className }: ClinicalIconProps) => (
    <Icon
      aria-hidden="true"
      className={className}
      strokeWidth={1.65}
      style={{ color }}
    />
  );

  ClinicalIcon.displayName = displayName;
  return ClinicalIcon;
}

const OilSignal = createClinicalIcon(Droplet, "#5FA89B", "OilSignal");
const BarrierSignal = createClinicalIcon(Shield, "#7FA56F", "BarrierSignal");
const ScanSignal = createClinicalIcon(ScanFace, "#6E9DBC", "ScanSignal");
const ToneSignal = createClinicalIcon(Sparkles, "#C77D8A", "ToneSignal");
const TextureSignal = createClinicalIcon(Waves, "#8585BC", "TextureSignal");
const SunSignal = createClinicalIcon(SunMedium, "#C28B55", "SunSignal");
const BotanicalSignal = createClinicalIcon(Leaf, "#9B8E68", "BotanicalSignal");
const LayerSignal = createClinicalIcon(Layers, "#A77CAA", "LayerSignal");

const clinicalSignalIcons: FloatingIconsHeroProps["icons"] = [
  { id: 1, icon: OilSignal, className: "top-[13%] left-[12%]" },
  { id: 2, icon: BarrierSignal, className: "top-[18%] right-[12%]" },
  { id: 3, icon: ScanSignal, className: "top-[39%] left-[10%]" },
  { id: 4, icon: ToneSignal, className: "top-[43%] right-[9%]" },
  { id: 5, icon: TextureSignal, className: "bottom-[15%] left-[15%]" },
  { id: 6, icon: SunSignal, className: "bottom-[13%] right-[15%]" },
  { id: 7, icon: BotanicalSignal, className: "top-[8%] left-[47%]" },
  { id: 8, icon: LayerSignal, className: "bottom-[8%] right-[45%]" },
];

export function HeroSection() {
  return (
    <FloatingIconsHero
      id="products"
      title="Dermalyzer reads visible skin signals"
      subtitle="Upload one clear face photo to estimate a Baumann-style skin type, then review ingredient guidance and product matches from the current dataset."
      ctaText="Start analysis"
      ctaHref="/analyze"
      icons={clinicalSignalIcons}
    />
  );
}
