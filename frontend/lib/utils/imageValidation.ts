// --- Konstanta: tipe file gambar yang diterima dan batas ukuran ---
const acceptedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const maxImageSizeInBytes = 8 * 1024 * 1024;

// --- Validasi: cek tipe MIME dan ukuran file, return pesan error atau null ---
export function validateImageFile(file: File) {
  // --- Cek apakah tipe file sesuai dengan yang diterima ---
  if (!acceptedImageTypes.includes(file.type)) {
    return "Unggah gambar berformat JPG, PNG, atau WebP.";
  }

  // --- Cek apakah ukuran file melebihi batas maksimal ---
  if (file.size > maxImageSizeInBytes) {
    return "Unggah gambar berukuran kurang dari 8 MB.";
  }

  return null;
}
