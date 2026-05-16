import Image from "next/image";
import { ImageIcon } from "lucide-react";

interface ImagePreviewProps {
  imageUrl: string | null;
}

export function ImagePreview({ imageUrl }: ImagePreviewProps) {
  if (!imageUrl) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-[18px] border border-[var(--color-ash-cloud)] bg-[var(--color-fog-gray)] text-sm text-[var(--color-slate-grille)]">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-[var(--color-oceanic-deep)]">
            <ImageIcon className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <span>No image selected</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[18px] border border-[var(--color-ash-cloud)] bg-[var(--color-fog-gray)]">
      <Image
        src={imageUrl}
        alt="Selected skin analysis preview"
        fill
        className="object-cover"
      />
    </div>
  );
}
