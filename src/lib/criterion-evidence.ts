import type { ReadinessCriterion, ReadinessDimension } from "@/lib/architect-engine";

/** True when criterion has structured evidence from master-context assessment. */
export function criterionHasEvidence(criterion: ReadinessCriterion): boolean {
  return Boolean(
    criterion.evidence?.trim() ||
      criterion.source?.trim() ||
      (criterion.confidence != null && criterion.confidence > 0)
  );
}

export function assessmentNeedsCitationRefresh(dimensions: ReadinessDimension[]): boolean {
  const withExplanation = dimensions.flatMap((d) =>
    d.criteria.filter((c) => c.explanation?.trim() || c.met)
  );
  if (!withExplanation.length) return false;
  return withExplanation.some((c) => c.met && !criterionHasEvidence(c));
}
