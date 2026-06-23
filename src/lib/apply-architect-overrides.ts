import type { ArchitectAssessment } from "@/lib/architect-engine";
import type { ArchitectOverrideEntry, ArchitectOverrides } from "@/types";

export function isFieldOverridden(
  overrides: ArchitectOverrides | undefined,
  fieldKey: string
): boolean {
  return Boolean(overrides?.fields[fieldKey]);
}

export function getOverrideNote(
  overrides: ArchitectOverrides | undefined,
  fieldKey: string
): string | undefined {
  return overrides?.fields[fieldKey]?.architectNote;
}

export function applyArchitectOverrides(
  base: ArchitectAssessment,
  overrides?: ArchitectOverrides
): ArchitectAssessment {
  if (!overrides?.fields || Object.keys(overrides.fields).length === 0) {
    return base;
  }

  const f = overrides.fields;
  const num = (key: string, fallback: number) => {
    const entry = f[key];
    if (!entry) return fallback;
    const v = entry.value;
    return typeof v === "number" ? v : Number(v) || fallback;
  };
  const str = (key: string, fallback: string) => {
    const entry = f[key];
    if (!entry) return fallback;
    return String(entry.value);
  };
  const bool = (key: string, fallback: boolean) => {
    const entry = f[key];
    if (!entry) return fallback;
    return Boolean(entry.value);
  };

  const dimensions = base.dimensions.map((dim) => ({
    ...dim,
    score: num(`dimension.${dim.key}.score`, dim.score),
    criteria: dim.criteria.map((c, i) => ({
      ...c,
      met: bool(`dimension.${dim.key}.criteria.${i}`, c.met),
      label: str(`dimension.${dim.key}.criteria.${i}.label`, c.label),
      score: num(`dimension.${dim.key}.criteria.${i}.score`, c.score ?? (c.met ? 100 : 0)),
      evidence: str(`dimension.${dim.key}.criteria.${i}.evidence`, c.evidence ?? "") || undefined,
      source: str(`dimension.${dim.key}.criteria.${i}.source`, c.source ?? "") || undefined,
      confidence: num(
        `dimension.${dim.key}.criteria.${i}.confidence`,
        c.confidence ?? c.score ?? (c.met ? 100 : 0)
      ),
      explanation: str(
        `dimension.${dim.key}.criteria.${i}.explanation`,
        c.explanation ?? ""
      ) || undefined,
    })),
  }));

  const telecomImpactAreas = base.telecomImpactAreas.map((area) => ({
    ...area,
    relevance: num(`telecom.${area.area}`, area.relevance),
  }));

  const architecture = {
    ...base.architecture,
    pattern: str("architecture.pattern", base.architecture.pattern),
    confidence: num("architecture.confidence", base.architecture.confidence),
    rationale: str("architecture.rationale", base.architecture.rationale),
    technologies: f["architecture.technologies"]
      ? String(f["architecture.technologies"].value)
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : base.architecture.technologies,
  };

  const modelEstimates = base.modelEstimates.map((est) => ({
    ...est,
    weeks: num(`estimate.${est.model}.weeks`, est.weeks),
    confidence: num(`estimate.${est.model}.confidence`, est.confidence),
    complexity: str(`estimate.${est.model}.complexity`, est.complexity) as
      | "Low"
      | "Medium"
      | "High",
  }));

  const consensus = {
    timelineMin: num("consensus.timelineMin", base.consensus.timelineMin),
    timelineMax: num("consensus.timelineMax", base.consensus.timelineMax),
    confidence: num("consensus.confidence", base.consensus.confidence),
  };

  const deliveryTeam = base.deliveryTeam.map((role) => ({
    ...role,
    days: num(`delivery.${role.role}.days`, role.days),
  }));

  const architectQuestions = base.architectQuestions.map((q, i) =>
    str(`question.${i}`, q)
  );

  const requiredSkills = f["requiredSkills"]
    ? String(f["requiredSkills"].value)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : base.requiredSkills;

  return {
    ...base,
    overallScore: num("overallScore", base.overallScore),
    dimensions,
    telecomImpactAreas,
    architecture,
    modelEstimates,
    consensus,
    deliveryTeam,
    architectQuestions,
    requiredSkills,
    totalTeamDays: num("totalTeamDays", base.totalTeamDays),
    wordCounts: {
      ...base.wordCounts,
      titleWords: num("wordCount.title", base.wordCounts.titleWords),
      descriptionWords: num("wordCount.description", base.wordCounts.descriptionWords),
      businessUserTotal: num("wordCount.businessTotal", base.wordCounts.businessUserTotal),
      documentWords: num("wordCount.document", base.wordCounts.documentWords),
    },
  };
}

export function buildOverrideEntry(
  value: string | number | boolean,
  architectNote?: string
): ArchitectOverrideEntry {
  return {
    value,
    ...(architectNote?.trim() ? { architectNote: architectNote.trim() } : {}),
  };
}
