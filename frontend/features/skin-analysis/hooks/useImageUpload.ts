"use client";

import { useCallback, useState } from "react";

import { validateImageFile } from "@/lib/utils/imageValidation";

export function useImageUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectFile = useCallback((nextFile: File | null) => {
    if (!nextFile) {
      setFile(null);
      setPreviewUrl(null);
      setError(null);
      return;
    }

    const validationError = validateImageFile(nextFile);
    if (validationError) {
      setError(validationError);
      return;
    }

    setFile(nextFile);
    setPreviewUrl(URL.createObjectURL(nextFile));
    setError(null);
  }, []);

  return { error, file, previewUrl, selectFile };
}
