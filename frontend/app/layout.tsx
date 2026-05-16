import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Dermalyzer | AI Skin Type Analyzer",
  description:
    "Dermalyzer analyzes a face photo into a Baumann skin type, ingredient guidance, and skincare product recommendations.",
  openGraph: {
    title: "Dermalyzer | AI Skin Type Analyzer",
    description:
      "Turn a face photo into a Baumann-style skin profile and focused skincare routine guidance.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dermalyzer | AI Skin Type Analyzer",
    description:
      "Turn a face photo into a Baumann-style skin profile and focused skincare routine guidance.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
