import type { ReadinessDimension } from "@/lib/architect-engine";

/** True when explanation follows evidence-citation format from OpenAI prompts. */
export function explanationHasCitation(explanation?: string): boolean {
  if (!explanation?.trim()) return false;
  return (
    /^In (title|description|business problem|proposed solution|architect brief|workshop answer)/i.test(
      explanation.trim()
    ) || /^Not evidenced in/i.test(explanation.trim())
  );
}

export function assessmentNeedsCitationRefresh(dimensions: ReadinessDimension[]): boolean {
  const withExplanation = dimensions.flatMap((d) =>
    d.criteria.filter((c) => c.explanation?.trim())
  );
  if (!withExplanation.length) return false;
  return withExplanation.some((c) => !explanationHasCitation(c.explanation));
}
