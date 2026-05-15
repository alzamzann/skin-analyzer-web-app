import { Code, MessageCircle } from "lucide-react";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { BaumannIntroSection } from "@/features/landing/components/BaumannIntroSection";
import { CTASection } from "@/features/landing/components/CTASection";
import { HeroSection } from "@/features/landing/components/HeroSection";
import { HowItWorksSection } from "@/features/landing/components/HowItWorksSection";
import { PrivacySection } from "@/features/landing/components/PrivacySection";

export default function Home() {
  return (
    <main
      id="top"
      className="min-h-[100dvh] bg-[#FBFBFA] text-[#2F3437]"
    >
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <BaumannIntroSection />
      <PrivacySection />
      <CTASection />
      <Footer
        logo={
          <span className="grid h-8 w-8 place-items-center rounded-[6px] border border-[#EAEAEA] bg-white text-sm font-semibold text-[#111111]">
            Dz
          </span>
        }
        brandName="Dermalyzer"
        socialLinks={[
          {
            icon: <MessageCircle className="h-5 w-5" />,
            href: "https://twitter.com",
            label: "Twitter",
          },
          {
            icon: <Code className="h-5 w-5" />,
            href: "https://github.com/alzamzann/skin-analyzer-web-app",
            label: "GitHub",
          },
        ]}
        mainLinks={[
          { href: "#products", label: "Products" },
          { href: "#how-it-works", label: "How it Works" },
          { href: "#science", label: "Science" },
          { href: "#pricing", label: "Pricing" },
        ]}
        legalLinks={[
          { href: "#privacy", label: "Privacy" },
          { href: "#terms", label: "Terms" },
        ]}
        copyright={{
          text: "© 2026 Dermalyzer",
          license: "All rights reserved",
        }}
      />
    </main>
  );
}
