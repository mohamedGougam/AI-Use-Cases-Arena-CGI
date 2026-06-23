import type { ArchitectDiscoveryQuestion } from "@/types";

export function normalizeQuestionText(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

export function discoveryProgress(questions: ArchitectDiscoveryQuestion[]) {
  const total = questions.length;
  const answered = questions.filter((q) => q.answer?.trim()).length;
  const progress = total > 0 ? Math.round((answered / total) * 100) : 0;
  return { total, answered, progress };
}

export function mergeDiscoveryQuestions(
  existing: ArchitectDiscoveryQuestion[],
  incoming: { id: string; question: string; rationale: string }[],
  markUsed = false
): ArchitectDiscoveryQuestion[] {
  const byId = new Map(existing.map((q) => [q.id, q]));
  const byText = new Map(existing.map((q) => [normalizeQuestionText(q.question), q]));

  return incoming.map((inq, index) => {
    const id = inq.id?.trim() || `Q${index + 1}`;
    const prev =
      byId.get(id) ?? byText.get(normalizeQuestionText(inq.question));

    if (prev?.answer?.trim()) {
      return {
        id,
        question: inq.question,
        rationale: inq.rationale,
        answer: prev.answer,
        answeredAt: prev.answeredAt,
        answeredBy: prev.answeredBy,
        status: markUsed ? "used" : "answered",
      };
    }

    return {
      id,
      question: inq.question,
      rationale: inq.rationale,
      status: "missing" as const,
    };
  });
}

export function migrateLegacyQuestions(
  legacy: string[],
  existing: ArchitectDiscoveryQuestion[] = []
): ArchitectDiscoveryQuestion[] {
  if (existing.length) return existing;
  return legacy.map((question, i) => ({
    id: `Q${i + 1}`,
    question,
    rationale: "Follow-up question to close information gaps before architecture or estimation.",
    status: "missing" as const,
  }));
}

/** Bump when assessment prompt/output rules change — invalidates cached assessments. */
export const ASSESSMENT_PROMPT_VERSION = "v3-master-discovery-context";

export function workshopFingerprint(
  useCase: {
    title: string;
    description: string;
    businessProblem: string;
    proposedSolution: string;
    category: string;
    department: string;
    impact: string;
    effort: string;
    tags: string[];
    architectBrief?: { wordCount?: number; analyzedAt?: string };
    architectDiscoveryQuestions?: ArchitectDiscoveryQuestion[];
  }
): string {
  const base = [
    useCase.title,
    useCase.description,
    useCase.businessProblem,
    useCase.proposedSolution,
    useCase.category,
    useCase.department,
    useCase.impact,
    useCase.effort,
    useCase.tags.join(","),
    useCase.architectBrief?.wordCount ?? 0,
    useCase.architectBrief?.analyzedAt ?? "",
  ].join("|");

  const answers = (useCase.architectDiscoveryQuestions ?? [])
    .map((q) => `${q.id}:${q.answer ?? ""}`)
    .join("|");

  return `${ASSESSMENT_PROMPT_VERSION}|${base}::${answers}`;
}
