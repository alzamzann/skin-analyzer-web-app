import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { BaumannIntroSection } from "@/features/landing/components/BaumannIntroSection";
import { CTASection } from "@/features/landing/components/CTASection";
import { HeroSection } from "@/features/landing/components/HeroSection";
import { HowItWorksSection } from "@/features/landing/components/HowItWorksSection";
import { Code, Hexagon, MessageCircle } from "lucide-react";

export default function Home() {
  return (
    <main
      id="top"
      className="min-h-[100dvh] bg-[var(--color-cloud-canvas)] text-[var(--color-graphite-text)]"
    >
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <BaumannIntroSection />
      <CTASection />
      <Footer
        logo={<Hexagon className="h-10 w-10" />}
        brandName="DermAI"
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
          text: "© 2026 DermAI",
          license: "All rights reserved",
        }}
      />
    </main>
  );
}
