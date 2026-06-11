import type { Area } from "react-easy-crop";

const MAX_CROP_SIZE = 1600;

function loadImage(imageUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Gambar tidak dapat diproses."));
    image.src = imageUrl;
  });
}

export async function createCroppedImageFile(
  imageUrl: string,
  cropArea: Area,
  originalFileName: string,
) {
  const image = await loadImage(imageUrl);
  const outputSize = Math.min(
    Math.max(Math.round(cropArea.width), 1),
    MAX_CROP_SIZE,
  );
  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Editor crop tidak dapat digunakan pada browser ini.");
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(
    image,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    outputSize,
    outputSize,
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result);
          return;
        }

        reject(new Error("Hasil crop tidak dapat dibuat."));
      },
      "image/jpeg",
      0.92,
    );
  });

  const baseName = originalFileName.replace(/\.[^/.]+$/, "") || "wajah";
  return new File([blob], `${baseName}-cropped.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}
