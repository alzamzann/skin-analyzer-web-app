const acceptedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const maxImageSizeInBytes = 8 * 1024 * 1024;

export function validateImageFile(file: File) {
  if (!acceptedImageTypes.includes(file.type)) {
    return "Upload a JPG, PNG, or WebP image.";
  }

  if (file.size > maxImageSizeInBytes) {
    return "Upload an image smaller than 8 MB.";
  }

  return null;
}
