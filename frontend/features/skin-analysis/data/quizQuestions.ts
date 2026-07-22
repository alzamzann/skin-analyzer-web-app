import type { QuizQuestion } from "../types/quiz.types";

export const quizQuestions: QuizQuestion[] = [
  // Axis 1: Oiliness (O vs D)
  {
    id: "oil-1",
    axis: "oiliness",
    axisLabel: "Oiliness",
    question:
      "Setelah cuci muka 2-3 jam tanpa menggunakan produk apapun, kulit wajah Anda terasa/terlihat:",
    options: [
      { label: "Sangat kasar, mengelupas, atau kusam", value: 0.0 },
      { label: "Terasa kencang", value: 0.25 },
      { label: "Terhidrasi baik tanpa kilap", value: 0.5 },
      { label: "Mengkilap dengan pantulan cahaya", value: 1.0 },
    ],
  },
  {
    id: "oil-2",
    axis: "oiliness",
    axisLabel: "Oiliness",
    question: "Wajah berminyak di area T-zone (jidat dan hidung):",
    options: [
      { label: "Tidak pernah", value: 0.0 },
      { label: "Kadang-kadang", value: 0.5 },
      { label: "Sering", value: 0.75 },
      { label: "Selalu", value: 1.0 },
    ],
  },

  // Axis 2: Sensitivity (S vs R)
  {
    id: "sens-1",
    axis: "sensitivity",
    axisLabel: "Sensitivity",
    question:
      "Produk perawatan kulit (pembersih, pelembab, toner, makeup) menyebabkan wajah berjerawat, ruam, gatal, atau perih:",
    options: [
      { label: "Tidak pernah", value: 0.0 },
      { label: "Jarang", value: 0.5 },
      { label: "Sering", value: 0.75 },
      { label: "Selalu", value: 1.0 },
      { label: "Saya tidak menggunakan produk", value: 0.0 },
    ],
  },
  {
    id: "sens-2",
    axis: "sensitivity",
    axisLabel: "Sensitivity",
    question: "Wajah terlihat merah dalam foto:",
    options: [
      { label: "Tidak pernah, atau saya tidak menyadarinya", value: 0.0 },
      { label: "Kadang-kadang", value: 0.5 },
      { label: "Sering", value: 0.75 },
      { label: "Selalu", value: 1.0 },
    ],
  },

  // Axis 3: Pigmentation (P vs N)
  {
    id: "pig-1",
    axis: "pigmentation",
    axisLabel: "Pigmentation",
    question: "Setelah jerawat, muncul bintik gelap/hitam:",
    options: [
      { label: "Tidak pernah", value: 0.0 },
      { label: "Kadang-kadang", value: 0.5 },
      { label: "Sering", value: 0.75 },
      { label: "Selalu", value: 1.0 },
      { label: "Saya tidak pernah berjerawat", value: 0.0 },
    ],
  },
  {
    id: "pig-2",
    axis: "pigmentation",
    axisLabel: "Pigmentation",
    question:
      "Bintik kecil cokelat (freckles/bintik matahari) di wajah, dada, punggung, atau lengan:",
    options: [
      { label: "Tidak ada", value: 0.0 },
      { label: "Ya, sedikit (satu sampai lima)", value: 0.33 },
      { label: "Ya, banyak (enam sampai lima belas)", value: 0.67 },
      { label: "Ya, sangat banyak (enam belas atau lebih)", value: 1.0 },
    ],
  },

  // Axis 4: Aging/Wrinkle (W vs T)
  {
    id: "wrink-1",
    axis: "wrinkle_tendency",
    axisLabel: "Aging",
    question: "Apakah Anda memiliki kerutan di wajah:",
    options: [
      {
        label: "Tidak ada, bahkan saat bergerak",
        value: 0.0,
      },
      {
        label: "Hanya saat bergerak (tersenyum, mengerutkan dahi)",
        value: 0.5,
      },
      {
        label: "Saat bergerak dan sedikit saat diam",
        value: 0.75,
      },
      {
        label: "Terlihat bahkan saat tidak bergerak",
        value: 1.0,
      },
    ],
  },
  {
    id: "wrink-2",
    axis: "wrinkle_tendency",
    axisLabel: "Aging",
    question: "Menurut Anda, usia kulit Anda:",
    options: [
      { label: "Satu sampai lima tahun lebih muda dari usia Anda", value: 0.0 },
      { label: "Sesuai usia Anda", value: 0.5 },
      { label: "Lima tahun lebih tua dari usia Anda", value: 0.75 },
      { label: "Lebih dari lima tahun lebih tua dari usia Anda", value: 1.0 },
    ],
  },
];

// Helper: dapatkan pertanyaan per axis
export function getQuestionsByAxis(
  axis: QuizQuestion["axis"],
): QuizQuestion[] {
  return quizQuestions.filter((q) => q.axis === axis);
}

// Helper: dapatkan semua axis
export function getUniqueAxes(): QuizQuestion["axis"][] {
  return ["oiliness", "sensitivity", "pigmentation", "wrinkle_tendency"];
}

// Helper: hitung skor per axis dari jawaban
export function calculateAxisScores(answers: Record<string, number>) {
  const axes = getUniqueAxes();
  const scores: Record<string, number> = {};

  for (const axis of axes) {
    const questions = getQuestionsByAxis(axis);
    const axisAnswers = questions.map((q) => answers[q.id] ?? 0.5);
    scores[axis] =
      axisAnswers.reduce((a, b) => a + b, 0) / axisAnswers.length;
  }

  return scores;
}
