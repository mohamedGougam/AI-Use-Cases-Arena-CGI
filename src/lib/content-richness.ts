import { countWords } from "@/lib/document-analysis";
import type { UseCase } from "@/types";

export type ContentDensity = "empty" | "sparse" | "adequate" | "rich";

export interface ContentFieldAnalysis {
  key: string;
  label: string;
  words: number;
  density: ContentDensity;
  hint: string;
}

export interface ContentRichnessAnalysis {
  score: number;
  summary: string;
  fields: ContentFieldAnalysis[];
}

export interface AiContentRichness {
  score: number;
  summary: string;
  fields?: Record<string, string>;
}

function densityForWords(words: number, thresholds: [number, number, number]): ContentDensity {
  const [sparseMax, adequateMax] = thresholds;
  if (words === 0) return "empty";
  if (words <= sparseMax) return "sparse";
  if (words <= adequateMax) return "adequate";
  return "rich";
}

function densityLabel(density: ContentDensity): string {
  switch (density) {
    case "empty":
      return "Missing";
    case "sparse":
      return "Thin";
    case "adequate":
      return "Adequate";
    case "rich":
      return "Strong";
  }
}

function densityScore(density: ContentDensity): number {
  switch (density) {
    case "empty":
      return 0;
    case "sparse":
      return 35;
    case "adequate":
      return 72;
    case "rich":
      return 95;
  }
}

function defaultHint(label: string, density: ContentDensity, words: number): string {
  if (density === "empty") return `${label} was not provided — readiness depends on other fields.`;
  if (density === "sparse")
    return `Only ${words} word${words === 1 ? "" : "s"} — add scope, outcomes, or constraints.`;
  if (density === "adequate") return `${words} words — enough context for a workshop review.`;
  return `${words} words — detailed context for assessment.`;
}

const FIELD_THRESHOLDS: Record<string, [number, number, number]> = {
  title: [4, 10, 999],
  description: [12, 35, 999],
  businessProblem: [20, 60, 999],
  proposedSolution: [20, 60, 999],
  document: [80, 250, 999],
};

export function analyzeContentRichness(
  useCase: UseCase,
  overrides?: {
    titleWords?: number;
    descriptionWords?: number;
    documentWords?: number;
  }
): ContentRichnessAnalysis {
  const titleWords = overrides?.titleWords ?? countWords(useCase.title);
  const descriptionWords = overrides?.descriptionWords ?? countWords(useCase.description);
  const businessProblemWords = countWords(useCase.businessProblem);
  const proposedSolutionWords = countWords(useCase.proposedSolution);
  const documentWords = overrides?.documentWords ?? useCase.architectBrief?.wordCount ?? 0;

  const rawFields: { key: string; label: string; words: number; thresholds: [number, number, number] }[] = [
    { key: "title", label: "Title", words: titleWords, thresholds: FIELD_THRESHOLDS.title },
    { key: "description", label: "Description", words: descriptionWords, thresholds: FIELD_THRESHOLDS.description },
    {
      key: "businessProblem",
      label: "Business problem",
      words: businessProblemWords,
      thresholds: FIELD_THRESHOLDS.businessProblem,
    },
    {
      key: "proposedSolution",
      label: "Proposed solution",
      words: proposedSolutionWords,
      thresholds: FIELD_THRESHOLDS.proposedSolution,
    },
    {
      key: "document",
      label: "Architect brief",
      words: documentWords,
      thresholds: FIELD_THRESHOLDS.document,
    },
  ];

  const fields: ContentFieldAnalysis[] = rawFields.map((f) => {
    const density = densityForWords(f.words, f.thresholds);
    return {
      key: f.key,
      label: f.label,
      words: f.words,
      density,
      hint: defaultHint(f.label, density, f.words),
    };
  });

  const weights = [0.12, 0.18, 0.22, 0.22, 0.26];
  const score = Math.round(
    fields.reduce((sum, f, i) => sum + densityScore(f.density) * weights[i], 0)
  );

  const thin = fields.filter((f) => f.density === "empty" || f.density === "sparse");
  const strong = fields.filter((f) => f.density === "rich");

  let summary: string;
  if (score >= 75) {
    summary = `Rich submission (${score}% content depth)${strong.length ? ` — strongest in ${strong.map((f) => f.label.toLowerCase()).join(", ")}.` : "."}`;
  } else if (score >= 45) {
    summary = `Moderate depth (${score}%) — ${thin.length ? `strengthen ${thin.map((f) => f.label.toLowerCase()).join(" and ")}.` : "workshop-ready with minor gaps."}`;
  } else {
    summary = `Limited business text (${score}%) — ${useCase.architectBrief ? "architect brief carries most of the detail." : "expand problem, solution, or upload a brief."}`;
  }

  return { score, summary, fields };
}

export function mergeAiContentRichness(
  base: ContentRichnessAnalysis,
  ai?: AiContentRichness | null
): ContentRichnessAnalysis {
  if (!ai) return base;

  const fields = base.fields.map((f) => ({
    ...f,
    hint: ai.fields?.[f.key]?.trim() || f.hint,
  }));

  return {
    score: typeof ai.score === "number" ? Math.min(100, Math.max(0, Math.round(ai.score))) : base.score,
    summary: ai.summary?.trim() || base.summary,
    fields,
  };
}

export { densityLabel };
