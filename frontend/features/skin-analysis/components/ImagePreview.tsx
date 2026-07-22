import Image from "next/image";
import { ImageIcon } from "lucide-react";

// --- Props: URL gambar untuk ditampilkan (null jika belum ada) ---
interface ImagePreviewProps {
  imageUrl: string | null;
}

// --- Komponen: preview gambar atau placeholder kosong ---
export function ImagePreview({ imageUrl }: ImagePreviewProps) {
  // --- Placeholder: tampilkan jika belum ada gambar dipilih ---
  if (!imageUrl) {
    return (
      <div className="flex aspect-[4/3] min-w-0 items-center justify-center rounded-[18px] border border-[var(--color-ash-cloud)] bg-[var(--color-fog-gray)] text-sm text-[var(--color-slate-grille)]">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-[var(--color-oceanic-deep)]">
            <ImageIcon className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <span>Belum ada gambar yang dipilih</span>
        </div>
      </div>
    );
  }

  // --- Image: tampilkan gambar yang sudah dipilih ---
  return (
    <div className="relative aspect-[4/3] min-w-0 overflow-hidden rounded-[18px] border border-[var(--color-ash-cloud)] bg-[var(--color-fog-gray)]">
      <Image
        src={imageUrl}
        alt="Pratinjau gambar analisis kulit yang dipilih"
        fill
        className="object-cover"
      />
    </div>
  );
}
