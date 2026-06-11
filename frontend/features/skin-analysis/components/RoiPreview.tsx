import Image from "next/image";

interface RoiPreviewProps {
  roiImageUrl?: string;
}

export function RoiPreview({ roiImageUrl }: RoiPreviewProps) {
  if (!roiImageUrl) {
    return null;
  }

  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl border border-[var(--color-platinum-border)]">
      <Image
        src={roiImageUrl}
        alt="Pratinjau area kulit"
        fill
        className="object-cover"
      />
    </div>
  );
}
