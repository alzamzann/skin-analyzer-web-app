import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { MotionReveal } from "@/features/landing/components/MotionReveal";

const axes = [
  {
    label: "Kering vs berminyak",
    code: "D / O",
    description:
      "Menggunakan Komedo atau Pori-pori Besar untuk menentukan apakah profil diawali dengan kulit berminyak atau kering.",
  },
  {
    label: "Sensitif vs resisten",
    code: "S / R",
    description: "Menggunakan Jerawat atau Kemerahan untuk menentukan kecenderungan sensitivitas kulit.",
  },
  {
    label: "Berpigmen vs tidak berpigmen",
    code: "P / N",
    description: "Menggunakan Pigmentasi untuk menentukan kebutuhan rekomendasi bagi warna kulit yang tidak merata.",
  },
  {
    label: "Rentan keriput vs kencang",
    code: "W / T",
    description: "Menggunakan Keriput untuk membedakan perawatan tekstur dan perawatan kekencangan kulit.",
  },
];

export function BaumannIntroSection() {
  return (
    <section id="science" className="w-full bg-transparent px-4 py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <MotionReveal className="lg:pt-10">
          <Badge className="border-[#EAEAEA] bg-[#EDF3EC] text-[#346538]">
            Metode Baumann
          </Badge>
          <h2 className="mt-6 max-w-2xl text-4xl font-medium leading-[1.1] tracking-[-0.03em] text-[#111111] text-balance sm:text-6xl">
            Klasifikasi Baumann membuat hasil model lebih mudah digunakan.
          </h2>
          <p className="mt-6 max-w-[62ch] text-base leading-7 text-[#5f5e5b]">
            Model memprediksi kondisi yang terlihat seperti Jerawat, Kemerahan,
            Pigmentasi, Komedo, Keriput, dan Pori-pori Besar. Dermalyzer
            memetakan sinyal tersebut menjadi kode Baumann empat huruf, lalu
            menggunakannya untuk mencari bahan dan produk dari dataset saat ini.
          </p>
          <div className="mt-10 grid max-w-lg grid-cols-2 border-y border-[#EAEAEA] py-5 text-sm">
            <div>
              <div className="font-mono text-3xl font-semibold text-[#111111]">
                16
              </div>
              <p className="mt-1 text-[#787774]">profil yang mungkin</p>
            </div>
            <div className="border-l border-[#EAEAEA] pl-5">
              <div className="font-mono text-3xl font-semibold text-[#111111]">
                4
              </div>
              <p className="mt-1 text-[#787774]">sumbu keputusan</p>
            </div>
          </div>
        </MotionReveal>
        <MotionReveal delay={0.08}>
        <Card className="relative overflow-hidden rounded-[12px] border border-[#EAEAEA] bg-white">
          <CardContent className="p-0">
            <div className="grid border-b border-[#EAEAEA] lg:grid-cols-[1fr_auto]">
              <div className="p-6 sm:p-8">
                <p className="text-sm font-medium text-[#787774]">
                  Contoh hasil
                </p>
                <div className="mt-4 font-mono text-7xl font-semibold leading-none tracking-[-0.04em] text-[#111111] sm:text-8xl">
                  DSPT
                </div>
              </div>
              <div className="flex items-end border-t border-[#EAEAEA] bg-[#F7F6F3] p-6 sm:p-8 lg:border-l lg:border-t-0">
                <p className="max-w-56 text-sm leading-6 text-[#5f5e5b]">
                  Huruf-huruf ini menjadi dasar untuk filter produk, prioritas
                  bahan, dan penjelasan rekomendasi.
                </p>
              </div>
            </div>
            <div className="divide-y divide-[#EAEAEA]">
              {axes.map((axis) => (
                <div
                  className="grid gap-4 p-6 sm:grid-cols-[6rem_1fr] sm:p-8"
                  key={axis.label}
                >
                  <div className="flex min-h-12 items-center">
                    <span className="inline-flex rounded-[8px] border border-[#EAEAEA] bg-[#FBF3DB] px-3 py-2 font-mono text-base font-semibold tracking-[-0.02em] text-[#956400]">
                    {axis.code}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#111111]">
                      {axis.label}
                    </h3>
                    <p className="mt-1 max-w-[55ch] text-sm leading-6 text-[#5f5e5b]">
                      {axis.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        </MotionReveal>
      </div>
    </section>
  );
}
