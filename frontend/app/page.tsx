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
      className="min-h-[100dvh] bg-[radial-gradient(circle_at_top,#F7FBFB_0%,#EBEBEB_48%,#FFFFFF_100%)] text-[#2F3437]"
    >
      <Navbar className="bg-transparent" />
      <HeroSection />
      <HowItWorksSection />
      <BaumannIntroSection />
      <PrivacySection />
      <CTASection />
      <Footer
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
          { href: "#products", label: "Produk" },
          { href: "#how-it-works", label: "Cara Kerja" },
          { href: "#science", label: "Dasar Ilmiah" },
        ]}
        legalLinks={[
          { href: "#privacy", label: "Privasi" },
          { href: "#terms", label: "Ketentuan" },
        ]}
        copyright={{
          text: "© 2026 Dermalyzer",
          license: "Hak cipta dilindungi",
        }}
      />
    </main>
  );
}
