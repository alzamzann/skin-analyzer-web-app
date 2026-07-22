"use client";

import { useCallback, useRef, useState } from "react";

// --- Hook: akses kamera device dan capture frame sebagai file ---
export function useCameraCapture() {
  // --- State & ref: video element, media stream, dan error ---
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  // --- Camera: akses kamera depan device (getUserMedia) ---
  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      setStream(mediaStream);
      setError(null);

      // --- Hubungkan stream ke video element ---
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch {
      setError("Izin kamera diblokir atau kamera tidak tersedia.");
    }
  }, []);

  // --- Camera: hentikan semua media track ---
  const stopCamera = useCallback(() => {
    setStream((currentStream) => {
      currentStream?.getTracks().forEach((track) => track.stop());
      return null;
    });
  }, []);

  // --- Capture: ambil frame dari video ke canvas, convert ke JPEG ---
  const captureFrame = useCallback(async () => {
    const video = videoRef.current;

    // --- Pastikan video sudah siap (width/height > 0) ---
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      setError("Pratinjau kamera belum siap.");
      return null;
    }

    // --- Buat canvas dengan ukuran yang sama dengan video ---
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // --- Gambar frame video ke canvas ---
    const context = canvas.getContext("2d");
    if (!context) {
      setError("Gambar dari kamera tidak dapat diambil.");
      return null;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // --- Convert canvas ke blob JPEG, lalu buat File object ---
    return new Promise<File | null>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError("Gambar dari kamera tidak dapat diambil.");
            resolve(null);
            return;
          }

          const file = new File([blob], `dermalyzer-camera-${Date.now()}.jpg`, {
            type: "image/jpeg",
          });
          setError(null);
          resolve(file);
        },
        "image/jpeg",
        0.92,
      );
    });
  }, []);

  // --- Return: capture handler, error, start/stop camera, stream, videoRef ---
  return { captureFrame, error, startCamera, stopCamera, stream, videoRef };
}
