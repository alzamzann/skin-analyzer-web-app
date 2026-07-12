import { Droplet, Shield, Sparkles, Waves } from "lucide-react";

import type { SkinAttribute } from "../types/result.types";

interface SkinAttributeSummaryProps {
  attributes: SkinAttribute[];
}

const attributeIcons = {
  Oily: Droplet,
  Sensitive: Shield,
  Pigmented: Sparkles,
  Tight: Waves,
};

export function SkinAttributeSummary({ attributes }: SkinAttributeSummaryProps) {
  return (
    <section className="grid content-center gap-7 p-8 lg:p-10">
      {attributes.map((attribute) => {
        const Icon =
          attributeIcons[attribute.label as keyof typeof attributeIcons] ??
          Sparkles;

        return (
          <div key={attribute.label} className="grid gap-3">
            <div className="flex items-center gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#EAF7F6] text-[#0B7A75]">
                <Icon className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold text-[#0B1026]">
                    {attribute.label}
                  </span>
                  <span className="text-sm text-[#354D51]">
                    {attribute.value}%
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#EEF2F5]">
                  <div
                    className="h-full rounded-full bg-[#0B7A75]"
                    style={{ width: `${attribute.value}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
