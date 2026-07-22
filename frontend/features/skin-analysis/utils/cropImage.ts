import type { Area } from "react-easy-crop";

// --- Konstanta: batas ukuran output crop (pixel) ---
const MAX_CROP_SIZE = 1600;

// --- Helper: load gambar dari URL ke HTMLImageElement ---
function loadImage(imageUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Gambar tidak dapat diproses."));
    image.src = imageUrl;
  });
}

// --- Crop: potong gambar sesuai area dan export ke JPEG ---
export async function createCroppedImageFile(
  imageUrl: string,
  cropArea: Area,
  originalFileName: string,
) {
  // --- Load gambar asli dari URL ---
  const image = await loadImage(imageUrl);

  // --- Hitung ukuran output (min 1px, max 1600px) ---
  const outputSize = Math.min(
    Math.max(Math.round(cropArea.width), 1),
    MAX_CROP_SIZE,
  );

  // --- Buat canvas dan ambil context 2D ---
  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Editor crop tidak dapat digunakan pada browser ini.");
  }

  // --- Gambar area crop ke canvas dengan smoothing ---
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

  // --- Convert canvas ke blob JPEG (quality 0.92) ---
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

  // --- Buat File object dengan nama {original}-cropped.jpg ---
  const baseName = originalFileName.replace(/\.[^/.]+$/, "") || "wajah";
  return new File([blob], `${baseName}-cropped.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}
