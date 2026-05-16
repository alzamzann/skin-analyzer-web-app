"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Camera, CameraOff, Check, RotateCcw, X } from "lucide-react";

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
              Camera preview
            </p>
            <h2
              id="camera-preview-title"
              className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[var(--color-midnight-ink)]"
            >
              {capturedUrl ? "Confirm this photo" : "Take a clear face photo"}
            </h2>
          </div>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full text-[var(--color-slate-grille)] transition-colors hover:bg-[#EDF3EC] hover:text-[var(--color-midnight-ink)]"
            aria-label="Close camera preview"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-[18px] border border-[var(--color-ash-cloud)] bg-[var(--color-fog-gray)]">
          {capturedUrl ? (
            <Image
              src={capturedUrl}
              alt="Captured camera preview"
              fill
              className="object-cover"
            />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />
          )}
        </div>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            <CameraOff className="h-4 w-4" />
            Cancel
          </Button>
          {capturedUrl ? (
            <>
              <Button type="button" variant="outline" onClick={handleRetake}>
                <RotateCcw className="h-4 w-4" />
                Retake
              </Button>
              <Button type="button" onClick={handleConfirm}>
                <Check className="h-4 w-4" />
                Confirm photo
              </Button>
            </>
          ) : (
            <Button type="button" disabled={!stream} onClick={handleCapture}>
              <Camera className="h-4 w-4" />
              Capture photo
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
