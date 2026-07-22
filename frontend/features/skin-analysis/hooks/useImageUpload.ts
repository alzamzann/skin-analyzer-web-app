"use client";

import { useCallback, useState } from "react";

import { validateImageFile } from "@/lib/utils/imageValidation";

// --- Hook: manage state file gambar, preview URL, dan error ---
export function useImageUpload() {
  // --- State: file terpilih, object URL preview, dan pesan error ---
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // --- Select: validasi file lalu simpan ke state ---
  const selectFile = useCallback((nextFile: File | null) => {
    // --- Jika null, bersihkan semua state ---
    if (!nextFile) {
      setFile(null);
      setPreviewUrl(null);
      setError(null);
      return;
    }

    // --- Validasi tipe MIME dan ukuran file ---
    const validationError = validateImageFile(nextFile);
    if (validationError) {
      setError(validationError);
      return;
    }

    // --- Simpan file dan buat object URL untuk preview ---
    setFile(nextFile);
    setPreviewUrl(URL.createObjectURL(nextFile));
    setError(null);
  }, []);

  // --- Return: file, preview URL, error, dan handler selectFile ---
  return { error, file, previewUrl, selectFile };
}
