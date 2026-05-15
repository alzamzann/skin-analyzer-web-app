export interface SkinAnalysisInput {
  image: File;
}

export interface SkinAnalysisResult {
  baumannType: string;
  confidence: number;
  attributes: {
    oiliness: number;
    sensitivity: number;
    pigmentation: number;
    wrinkleTendency: number;
  };
  roiImageUrl?: string;
}

export type AnalysisStatus = "idle" | "loading" | "success" | "error";
