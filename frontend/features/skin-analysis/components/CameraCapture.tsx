"use client";

import { Camera, CameraOff } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

import { useCameraCapture } from "../hooks/useCameraCapture";

export function CameraCapture() {
  const { error, startCamera, stopCamera, stream, videoRef } = useCameraCapture();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Camera capture</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="aspect-video w-full rounded-2xl bg-[var(--color-cloud-canvas)] object-cover"
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-3">
          <Button type="button" onClick={startCamera}>
            <Camera className="h-4 w-4" />
            Start
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={stopCamera}
            disabled={!stream}
          >
            <CameraOff className="h-4 w-4" />
            Stop
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
