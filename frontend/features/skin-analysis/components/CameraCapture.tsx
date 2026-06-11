"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Camera,
  CameraOff,
  Check,
  RotateCcw,
  ScanFace,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/Button";

import { useCameraCapture } from "../hooks/useCameraCapture";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const { captureFrame, error, startCamera, stopCamera, stream, videoRef } =
    useCameraCapture();
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  useEffect(() => {
    return () => {
      if (capturedUrl) {
        URL.revokeObjectURL(capturedUrl);
      }
    };
  }, [capturedUrl]);

  const handleCapture = async () => {
    const nextFile = await captureFrame();
    if (nextFile) {
      if (capturedUrl) {
        URL.revokeObjectURL(capturedUrl);
      }

      setCapturedFile(nextFile);
      setCapturedUrl(URL.createObjectURL(nextFile));
      stopCamera();
    }
  };

  const handleRetake = () => {
    if (capturedUrl) {
      URL.revokeObjectURL(capturedUrl);
    }

    setCapturedFile(null);
    setCapturedUrl(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (!capturedFile) {
      return;
    }

    onCapture(capturedFile);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[rgba(0,38,43,0.42)] px-4 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="camera-preview-title"
    >
      <div className="w-full max-w-2xl rounded-[24px] border border-[#EAEAEA] bg-white p-5 shadow-[0_32px_90px_rgba(0,38,43,0.18)] sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-deep-teal)]">
              Pratinjau kamera
            </p>
            <h2
              id="camera-preview-title"
              className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[var(--color-midnight-ink)]"
            >
              {capturedUrl
                ? "Konfirmasi foto ini"
                : "Ambil foto wajah yang jelas"}
            </h2>
          </div>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full text-[var(--color-slate-grille)] transition-colors hover:bg-[#EDF3EC] hover:text-[var(--color-midnight-ink)]"
            aria-label="Tutup pratinjau kamera"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-[18px] border border-[var(--color-ash-cloud)] bg-[var(--color-fog-gray)]">
          {capturedUrl ? (
            <Image
              src={capturedUrl}
              alt="Pratinjau foto dari kamera"
              fill
              className="object-cover"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_36%,rgba(0,38,43,0.18)_72%)]" />
                <div className="relative grid h-[64%] max-h-[360px] min-h-[240px] w-[54%] min-w-[220px] max-w-[320px] place-items-center rounded-[46%] border border-white/80 shadow-[0_0_0_999px_rgba(0,38,43,0.08)]">
                  <span className="absolute left-0 top-0 h-9 w-9 -translate-x-3 -translate-y-3 border-l-2 border-t-2 border-[var(--color-spring-leaf)]" />
                  <span className="absolute right-0 top-0 h-9 w-9 -translate-y-3 translate-x-3 border-r-2 border-t-2 border-[var(--color-spring-leaf)]" />
                  <span className="absolute bottom-0 left-0 h-9 w-9 -translate-x-3 translate-y-3 border-b-2 border-l-2 border-[var(--color-spring-leaf)]" />
                  <span className="absolute bottom-0 right-0 h-9 w-9 translate-x-3 translate-y-3 border-b-2 border-r-2 border-[var(--color-spring-leaf)]" />
                  <div className="grid place-items-center gap-3 text-center text-white drop-shadow-[0_1px_8px_rgba(0,38,43,0.55)]">
                    <ScanFace className="h-14 w-14" strokeWidth={1.35} />
                    <span className="rounded-full bg-[rgba(0,38,43,0.42)] px-4 py-2 text-xs font-semibold tracking-[0.02em] backdrop-blur-sm">
                      Posisikan wajah di tengah
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        <div className="mt-6 flex flex-col gap-3 border-t border-[var(--color-ash-cloud)]/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="secondary"
            className="gap-2"
            onClick={onClose}
          >
            <CameraOff className="h-4 w-4" />
            Batal
          </Button>
          {capturedUrl ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={handleRetake}
              >
                <RotateCcw className="h-4 w-4" />
                Ambil ulang
              </Button>
              <Button type="button" className="gap-2" onClick={handleConfirm}>
                <Check className="h-4 w-4" />
                Konfirmasi foto
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              className="gap-2"
              disabled={!stream}
              onClick={handleCapture}
            >
              <Camera className="h-4 w-4" />
              Ambil foto
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
