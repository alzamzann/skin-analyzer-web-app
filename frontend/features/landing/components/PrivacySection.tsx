"use client";

import { Badge } from "@/components/ui/Badge";
import { MotionReveal } from "@/features/landing/components/MotionReveal";
import { motion, useReducedMotion } from "framer-motion";
import { EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";

const privacyPoints = [
  {
    icon: ShieldCheck,
    title: "Pemrosesan gambar sementara",
    description:
      "Gambar diproses untuk permintaan analisis dan tidak disimpan secara permanen pada versi MVP.",
  },
  {
    icon: EyeOff,
    title: "Tidak ada profil publik",
    description:
      "Gambar yang diunggah tidak ditampilkan kepada publik, tidak dijual, dan tidak digunakan untuk membuat profil sosial atau iklan.",
  },
  {
    icon: LockKeyhole,
    title: "Batas penggunaan data yang jelas",
    description:
      "Jika penyimpanan gambar ditambahkan nanti, pengguna harus dimintai persetujuan secara jelas sebelum foto disimpan.",
  },
];

export function PrivacySection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="privacy" className="w-full bg-transparent px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 border-y border-[#EAEAEA] py-10 md:grid-cols-[0.82fr_1.18fr] md:items-start lg:py-12">
          <MotionReveal>
            <Badge className="border-[#EAEAEA] bg-[#E1F3FE] text-[#1F6C9F]">
              Privasi
            </Badge>
            <h2 className="mt-5 max-w-xl text-4xl font-medium leading-[1.1] tracking-[-0.03em] text-[#111111] text-balance sm:text-5xl">
              Batas yang jelas sebelum mengunggah.
            </h2>
            <p className="mt-5 max-w-[58ch] text-base leading-7 text-[#5f5e5b]">
              Dermalyzer dirancang untuk satu tujuan khusus: menganalisis
              gambar, menampilkan hasil, dan menjelaskan ketentuan penyimpanan
              sebelum pengguna mengunggah apa pun.
            </p>
          </MotionReveal>

          <div className="grid gap-4">
            {privacyPoints.map((point, index) => {
              const Icon = point.icon;

              return (
                <MotionReveal key={point.title} delay={index * 0.07}>
                  <motion.article
                    whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                    transition={{
                      duration: 0.42,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="grid gap-4 rounded-[12px] border border-[#EAEAEA] bg-white p-5 transition-[box-shadow,background-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#F9F9F8] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:grid-cols-[2.75rem_1fr]"
                  >
                    <div className="grid h-12 w-12 place-items-center rounded-[10px] border border-[#EAEAEA] bg-[#EDF3EC] text-[#346538]">
                      <Icon className="h-5 w-5" strokeWidth={1.65} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-[#111111]">
                        {point.title}
                      </h3>
                      <p className="mt-1.5 max-w-[58ch] text-sm leading-6 text-[#5f5e5b]">
                        {point.description}
                      </p>
                    </div>
                  </motion.article>
                </MotionReveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
