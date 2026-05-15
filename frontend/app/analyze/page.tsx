"use client";

import Link from "next/link";

import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { AnalysisError } from "@/features/skin-analysis/components/AnalysisError";
import { AnalysisLoading } from "@/features/skin-analysis/components/AnalysisLoading";
import { CameraCapture } from "@/features/skin-analysis/components/CameraCapture";
import { ImagePreview } from "@/features/skin-analysis/components/ImagePreview";
import { ImageUploadCard } from "@/features/skin-analysis/components/ImageUploadCard";
import { useAnalyzeSkin } from "@/features/skin-analysis/hooks/useAnalyzeSkin";
import { useImageUpload } from "@/features/skin-analysis/hooks/useImageUpload";

export default function AnalyzePage() {
  const { error: uploadError, file, previewUrl, selectFile } = useImageUpload();
  const { analyze, error: analysisError, status } = useAnalyzeSkin();

  return (
    <main className="min-h-[100dvh] bg-background py-12">
      <PageContainer className="space-y-8">
        <div>
          <Link className="text-sm text-muted-foreground hover:text-foreground" href="/">
            Back to home
          </Link>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground">
            Analyze your skin
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Upload a clear, front-facing image to generate a Baumann-style skin
            profile.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <ImageUploadCard error={uploadError} onFileSelect={selectFile} />
            <CameraCapture />
          </div>
          <div className="space-y-6">
            <ImagePreview imageUrl={previewUrl} />
            {status === "loading" && <AnalysisLoading />}
            {analysisError && <AnalysisError message={analysisError} />}
            <Button
              type="button"
              size="lg"
              disabled={!file || status === "loading"}
              onClick={() => file && analyze(file)}
            >
              Analyze image
            </Button>
          </div>
        </div>
      </PageContainer>
    </main>
  );
}
