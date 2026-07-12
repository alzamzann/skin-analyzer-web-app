import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Dermalyzer | Analisis Jenis Kulit dengan AI",
  description:
    "Dermalyzer menganalisis foto wajah untuk menentukan jenis kulit Baumann serta memberikan panduan bahan dan rekomendasi produk perawatan kulit.",
  openGraph: {
    title: "Dermalyzer | Analisis Jenis Kulit dengan AI",
    description:
      "Ubah foto wajah menjadi profil kulit Baumann dan panduan rutinitas perawatan kulit yang terarah.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dermalyzer | Analisis Jenis Kulit dengan AI",
    description:
      "Ubah foto wajah menjadi profil kulit Baumann dan panduan rutinitas perawatan kulit yang terarah.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className="h-full antialiased"
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
