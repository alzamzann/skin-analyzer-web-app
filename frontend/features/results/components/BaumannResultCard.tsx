import { ScanFace, Sparkles } from "lucide-react";

interface BaumannResultCardProps {
  baumannType: string;
  confidence: number;
  description: string;
}

export function BaumannResultCard({
  baumannType,
  confidence,
  description,
}: BaumannResultCardProps) {
  return (
    <section className="flex h-full flex-col justify-center border-b border-[#EAEAEA] p-8 md:border-b-0 md:border-r lg:p-10">
      <div className="flex flex-col gap-7 sm:flex-row sm:items-center">
        <div className="grid h-28 w-28 shrink-0 place-items-center rounded-full border border-[#EAEAEA] bg-[#EDF3EC] text-[#0B7A75] ring-8 ring-[#F7FBFB]">
          <ScanFace className="h-12 w-12" strokeWidth={1.45} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[#0B1026]">
              Hasil Analisis Kulit Anda
            </h1>
            <Sparkles className="h-4 w-4 text-[#0B7A75]" strokeWidth={1.8} />
          </div>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-[#0B1026]">
            Jenis Kulit Baumann
          </p>
          <p className="mt-3 text-7xl font-semibold leading-none tracking-[-0.06em] text-[#0B1026]">
            {baumannType}
          </p>
          <p className="mt-4 text-sm font-semibold text-[#0B7A75]">
            Tingkat keyakinan {Math.round(confidence * 100)}%
          </p>
        </div>
      </div>
      <p className="mt-8 max-w-lg text-base leading-8 text-[#354D51]">
        {description}
      </p>
    </section>
  );
}
