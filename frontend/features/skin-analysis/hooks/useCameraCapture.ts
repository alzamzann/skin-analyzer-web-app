"use client";

import { useCallback, useRef, useState } from "react";

export function useCameraCapture() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      setStream(mediaStream);
      setError(null);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch {
      setError("Izin kamera diblokir atau kamera tidak tersedia.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    setStream((currentStream) => {
      currentStream?.getTracks().forEach((track) => track.stop());
      return null;
    });
  }, []);

  const captureFrame = useCallback(async () => {
    const video = videoRef.current;

    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      setError("Pratinjau kamera belum siap.");
      return null;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      setError("Gambar dari kamera tidak dapat diambil.");
      return null;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

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

  return { captureFrame, error, startCamera, stopCamera, stream, videoRef };
}
