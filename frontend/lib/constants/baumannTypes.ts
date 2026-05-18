export const skinModelLabels = [
  "Acne",
  "Redness",
  "Pigmentation",
  "Blackheads",
  "Wrinkles",
  "Enlarged Pores",
] as const;

export const baumannAxes = {
  oiliness: ["Oily", "Dry"],
  sensitivity: ["Sensitive", "Resistant"],
  pigmentation: ["Pigmented", "Non-pigmented"],
  wrinkleTendency: ["Wrinkle-prone", "Tight"],
} as const;

export const baumannMappingRules = [
  {
    axis: "oiliness",
    labels: ["Blackheads", "Enlarged Pores"],
    positiveCode: "O",
    negativeCode: "D",
    positiveResult: "Oily",
    negativeResult: "Dry",
  },
  {
    axis: "sensitivity",
    labels: ["Acne", "Redness"],
    positiveCode: "S",
    negativeCode: "R",
    positiveResult: "Sensitive",
    negativeResult: "Resistant",
  },
  {
    axis: "pigmentation",
    labels: ["Pigmentation"],
    positiveCode: "P",
    negativeCode: "N",
    positiveResult: "Pigmented",
    negativeResult: "Non-pigmented",
  },
  {
    axis: "wrinkleTendency",
    labels: ["Wrinkles"],
    positiveCode: "W",
    negativeCode: "T",
    positiveResult: "Wrinkle-prone",
    negativeResult: "Tight",
  },
] as const;

export const baumannTypeExamples = ["OSPW", "DRNT", "ORPW", "DSNT"] as const;
