import Link from "next/link";
import { BadgeInfo } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { MotionReveal } from "@/features/landing/components/MotionReveal";

export function CTASection() {
  return (
    <section id="pricing" className="w-full bg-[#FBFBFA] px-4 pb-24 pt-2 sm:pb-32">
      <div className="mx-auto max-w-6xl">
        <MotionReveal>
        <div className="rounded-[12px] border border-[#EAEAEA] bg-white p-6 sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#787774]">
                Skin analysis
              </p>
              <h2 className="mt-3 max-w-2xl font-serif text-4xl font-medium leading-[1.1] tracking-[-0.03em] text-[#111111] text-balance sm:text-6xl">
                Start with one clear photo.
              </h2>
              <p className="mt-4 max-w-[62ch] text-base leading-7 text-[#5f5e5b]">
                The flow checks image quality, maps visible skin attributes to a
                Baumann type, then explains ingredient and product matches.
              </p>
              <div className="mt-6 flex max-w-[62ch] gap-3 rounded-[14px] bg-[#F7F6F3] p-4 ring-1 ring-black/[0.03]">
                <div className="grid h-9 w-9 flex-none place-items-center rounded-[10px] bg-white text-[#2F3437] ring-1 ring-black/[0.05]">
                  <BadgeInfo className="h-5 w-5" strokeWidth={1.65} />
                </div>
                <p className="text-sm leading-6 text-[#5f5e5b]">
                  Educational skincare guidance only. Dermalyzer is not a
                  medical diagnosis tool.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch">
              <Button
                asChild
                size="lg"
                className="h-11 rounded-[6px] bg-[#111111] px-6 text-sm text-white transition-transform duration-200 hover:bg-[#333333] active:scale-[0.98]"
              >
                <Link href="/analyze">Start analysis</Link>
              </Button>
              <p className="max-w-48 text-sm leading-6 text-[#787774] lg:text-right">
                Use one evenly lit, front-facing photo.
              </p>
            </div>
          </div>
        </div>
        </MotionReveal>
      </div>
    </section>
  );
}
