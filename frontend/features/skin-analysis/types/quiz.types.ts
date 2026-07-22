export interface QuizOption {
  label: string;
  value: number;
}

export interface QuizQuestion {
  id: string;
  axis: "oiliness" | "sensitivity" | "pigmentation" | "wrinkle_tendency";
  axisLabel: string;
  question: string;
  options: QuizOption[];
}

export interface QuizAxisScores {
  oiliness: number;
  sensitivity: number;
  pigmentation: number;
  wrinkle_tendency: number;
}

export type QuizAnswers = Record<string, number>;
