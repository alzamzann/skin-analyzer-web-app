"use client";

import type React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Camera, ScanFace, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type HowItWorksProps = React.HTMLAttributes<HTMLElement>;

interface StepCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
}

const StepCard: React.FC<StepCardProps> = ({
  icon,
  title,
  description,
  benefits,
}) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 14 },
      visible: { opacity: 1, y: 0 },
    }}
    whileHover={{ y: -4 }}
    transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
    className={cn(
      "relative flex h-full flex-col rounded-[12px] border border-[#EAEAEA] bg-white p-6 text-[#2F3437] transition-[box-shadow,transform,background-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] sm:p-8",
      "hover:bg-[#F9F9F8] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
    )}
  >
    <div className="mb-5 flex items-center justify-between gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-[10px] border border-[#EAEAEA] bg-[#EDF3EC] text-[#346538]">
        {icon}
      </div>
    </div>
    <h3 className="mb-2 text-xl font-semibold tracking-[-0.01em] text-[#111111]">
      {title}
    </h3>
    <p className="mb-7 text-sm leading-6 text-[#5f5e5b] md:min-h-[4.5rem]">
      {description}
    </p>
    <ul className="mt-auto space-y-3">
      {benefits.map((benefit, index) => (
        <li key={index} className="flex items-center gap-3">
          <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[#FBF3DB]">
            <div className="h-1.5 w-1.5 rounded-full bg-[#956400]" />
          </div>
          <span className="text-sm leading-6 text-[#5f5e5b]">{benefit}</span>
        </li>
      ))}
    </ul>
  </motion.div>
);

export const HowItWorksSection: React.FC<HowItWorksProps> = ({
  className,
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();
  const stepsData = [
    {
      icon: <Camera className="h-5 w-5" strokeWidth={1.75} />,
      step: "1",
      title: "Unggah satu foto wajah",
      description:
        "Pilih foto wajah tampak depan yang jelas atau gunakan fitur kamera.",
      benefits: [
        "Validasi format JPG, PNG, dan WebP",
        "Panduan untuk satu wajah",
        "Pilihan pengambilan foto dengan kamera",
      ],
    },
    {
      icon: <ScanFace className="h-5 w-5" strokeWidth={1.75} />,
      step: "2",
      title: "Petakan atribut yang terlihat",
      description:
        "Backend mendeteksi area wajah dan memetakan label model ke jenis kulit Baumann.",
      benefits: [
        "ROI dahi, hidung, dan pipi",
        "Skor keyakinan EfficientNet",
        "Jerawat, kemerahan, pigmentasi, komedo, keriput, dan pori-pori besar",
      ],
    },
    {
      icon: <Sparkles className="h-5 w-5" strokeWidth={1.75} />,
      step: "3",
      title: "Tinjau rekomendasi",
      description:
        "Lihat bahan dan kecocokan produk yang diperingkat dari dataset saat ini.",
      benefits: [
        "Penjelasan kecocokan bahan",
        "5 rekomendasi produk teratas",
        "Filter produk berbasis katalog",
      ],
    },
  ];

  return (
    <section
      id="how-it-works"
      className={cn("w-full bg-transparent px-4 py-24 sm:py-32", className)}
      {...props}
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mx-auto mb-14 max-w-4xl text-center"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.32 }}
          transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#787774]">
            Proses
          </p>
          <h2 className="mt-4 text-4xl font-medium leading-[1.08] tracking-[-0.03em] text-[#111111] sm:text-6xl">
            Cara kerja
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#5f5e5b]">
            Proses ini mengubah foto wajah menjadi jenis kulit Baumann,
            panduan bahan, dan rekomendasi produk.
          </p>
        </motion.div>

        <div className="relative mx-auto mb-8 w-full max-w-4xl">
          <motion.div
            aria-hidden="true"
            className="absolute left-[16.6667%] top-1/2 h-px w-[66.6667%] -translate-y-1/2 bg-[#EAEAEA]"
            initial={shouldReduceMotion ? false : { opacity: 0, scaleX: 0 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, scaleX: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "center" }}
          />
          <motion.div
            className="relative grid grid-cols-3"
            initial={shouldReduceMotion ? false : "hidden"}
            whileInView={shouldReduceMotion ? undefined : "visible"}
            viewport={{ once: true, amount: 0.5 }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
            }}
          >
            {stepsData.map((step) => (
              <motion.div
                key={step.step}
                className="flex h-9 w-9 items-center justify-center justify-self-center rounded-full border border-[#D7E5E3] bg-[#EDF3EC] font-mono text-sm font-semibold text-[#346538] ring-8 ring-[#FBFBFA]"
                variants={{
                  hidden: { opacity: 0, y: 10, scale: 0.92 },
                  visible: { opacity: 1, y: 0, scale: 1 },
                }}
                transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
              >
                {step.step}
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3"
          initial={shouldReduceMotion ? false : "hidden"}
          whileInView={shouldReduceMotion ? undefined : "visible"}
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
        >
          {stepsData.map((step, index) => (
            <StepCard
              key={index}
              icon={step.icon}
              title={step.title}
              description={step.description}
              benefits={step.benefits}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};
