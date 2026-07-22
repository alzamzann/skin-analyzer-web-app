const IMAGE_KEY = "dermalyzer.pendingImage";

// --- Helper: File → base64 data URL ---
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// --- Helper: base64 data URL → File ---
function base64ToFile(dataUrl: string, filename: string): File {
  const [header, data] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] || "image/jpeg";
  const binary = atob(data);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return new File([array], filename, { type: mime });
}

// --- Simpan gambar ke sessionStorage sebagai base64 ---
export async function savePendingImage(file: File): Promise<void> {
  const base64 = await fileToBase64(file);
  sessionStorage.setItem(IMAGE_KEY, base64);
}

// --- Load gambar dari sessionStorage, return File object ---
export async function loadPendingImage(): Promise<File | null> {
  if (typeof window === "undefined") return null;

  const base64 = sessionStorage.getItem(IMAGE_KEY);
  if (!base64) return null;

  return base64ToFile(base64, "uploaded-image.jpg");
}

// --- Hapus gambar dari sessionStorage ---
export function clearPendingImage(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(IMAGE_KEY);
}
