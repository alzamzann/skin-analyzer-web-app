"use client";

import { Upload } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

interface ImageUploadCardProps {
  error?: string | null;
  onFileSelect: (file: File | null) => void;
}

export function ImageUploadCard({ error, onFileSelect }: ImageUploadCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload face photo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-platinum-border)] bg-[var(--color-cloud-canvas)] p-6 text-center">
          <Upload className="mb-3 h-6 w-6 text-[var(--color-ink-text)]" />
          <span className="text-sm font-medium text-foreground">
            Choose JPG, PNG, or WebP
          </span>
          <Input
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => onFileSelect(event.target.files?.[0] ?? null)}
          />
        </label>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="button" variant="secondary">
          Use selected image
        </Button>
      </CardContent>
    </Card>
  );
}
