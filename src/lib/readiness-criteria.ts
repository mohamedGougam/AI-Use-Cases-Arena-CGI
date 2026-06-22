/** Canonical readiness checklist used by rule engine and OpenAI assessment. */
export interface ReadinessCriterionDef {
  id: string;
  label: string;
}

export interface ReadinessDimensionDef {
  key: string;
  title: string;
  criteria: ReadinessCriterionDef[];
}

export const READINESS_DIMENSION_DEFS: ReadinessDimensionDef[] = [
  {
    key: "business",
    title: "Business Understanding",
    criteria: [
      { id: "objective", label: "Business objective defined" },
      { id: "problem", label: "Problem clearly articulated" },
      { id: "value", label: "Expected value identified" },
      { id: "stakeholders", label: "Stakeholders identified" },
      { id: "success", label: "Success criteria identified" },
      { id: "process", label: "Existing process documented" },
    ],
  },
  {
    key: "data",
    title: "Data Readiness",
    criteria: [
      { id: "source", label: "Data source identified" },
      { id: "historical", label: "Historical data exists" },
      { id: "volume", label: "Data volume known" },
      { id: "quality", label: "Data quality understood" },
      { id: "ownership", label: "Data ownership identified" },
      { id: "gdpr", label: "GDPR classification identified" },
    ],
  },
  {
    key: "ai",
    title: "AI Readiness",
    criteria: [
      { id: "model", label: "Existing model available" },
      { id: "finetuning", label: "Fine tuning required" },
      { id: "human", label: "Human validation required" },
      { id: "accuracy", label: "Target accuracy identified" },
      { id: "acceptance", label: "Acceptance criteria defined" },
    ],
  },
  {
    key: "security",
    title: "Security Readiness",
    criteria: [
      { id: "pii", label: "PII involved" },
      { id: "customer", label: "Customer data involved" },
      { id: "infrastructure", label: "Critical infrastructure involved" },
      { id: "network", label: "Network data involved" },
      { id: "classification", label: "Security classification defined" },
    ],
  },
  {
    key: "delivery",
    title: "Delivery Readiness",
    criteria: [
      { id: "budget", label: "Budget known" },
      { id: "timeline", label: "Timeline known" },
      { id: "team", label: "Team availability known" },
      { id: "sponsor", label: "Sponsor identified" },
      { id: "dependencies", label: "Dependencies identified" },
    ],
  },
];

export function scoreFromCriteria(metCount: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((metCount / total) * 100);
}
