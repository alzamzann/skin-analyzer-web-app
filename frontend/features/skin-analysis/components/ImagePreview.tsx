import Image from "next/image";

interface ImagePreviewProps {
  imageUrl: string | null;
}

export function ImagePreview({ imageUrl }: ImagePreviewProps) {
  if (!imageUrl) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl border border-[var(--color-platinum-border)] bg-[var(--color-cloud-canvas)] text-sm text-muted-foreground">
        No image selected
      </div>
    );
  }

  return (
    <div className="relative aspect-square overflow-hidden rounded-2xl border border-[var(--color-platinum-border)]">
      <Image src={imageUrl} alt="Selected skin analysis preview" fill className="object-cover" />
    </div>
  );
}
