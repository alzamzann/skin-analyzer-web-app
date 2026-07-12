const acceptedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const maxImageSizeInBytes = 8 * 1024 * 1024;

export function validateImageFile(file: File) {
  if (!acceptedImageTypes.includes(file.type)) {
    return "Unggah gambar berformat JPG, PNG, atau WebP.";
  }

  if (file.size > maxImageSizeInBytes) {
    return "Unggah gambar berukuran kurang dari 8 MB.";
  }

  return null;
}
