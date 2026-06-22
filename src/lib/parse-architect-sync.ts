import type { ArchitectureRecommendation } from "@/lib/architect-engine";
import { READINESS_DIMENSION_DEFS } from "@/lib/readiness-criteria";

export interface ArchitectSyncUpdates {
  fields: Record<string, string | number | boolean>;
  criterionExplanations?: Record<string, Record<string, string>>;
}

function parseArchitecture(raw: unknown): ArchitectureRecommendation | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const pattern = typeof o.pattern === "string" ? o.pattern.trim() : "";
  const rationale = typeof o.rationale === "string" ? o.rationale.trim() : "";
  const confidence =
    typeof o.confidence === "number"
      ? Math.min(100, Math.max(1, Math.round(o.confidence)))
      : null;
  const technologies = Array.isArray(o.technologies)
    ? o.technologies.map((t) => String(t).trim()).filter(Boolean)
    : typeof o.technologies === "string"
      ? o.technologies.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

  if (!pattern || !rationale || confidence === null || technologies.length === 0) return null;
  return { pattern, rationale, confidence, technologies };
}

function parseCriterionExplanations(raw: unknown): Record<string, Record<string, string>> | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const result: Record<string, Record<string, string>> = {};

  for (const def of READINESS_DIMENSION_DEFS) {
    const dim = (raw as Record<string, unknown>)[def.key];
    if (!dim || typeof dim !== "object") continue;
    const map = dim as Record<string, unknown>;
    const explanations: Record<string, string> = {};
    for (const c of def.criteria) {
      const text = map[c.id];
      if (typeof text === "string" && text.trim()) {
        explanations[c.id] = text.trim().slice(0, 200);
      }
    }
    if (Object.keys(explanations).length) result[def.key] = explanations;
  }

  return Object.keys(result).length ? result : undefined;
}

export function parseArchitectSyncResponse(content: string): ArchitectSyncUpdates | null {
  try {
    const raw = JSON.parse(content) as Record<string, unknown>;
    const fields: Record<string, string | number | boolean> = {};

    if (raw.architecture) {
      const arch = parseArchitecture(raw.architecture);
      if (!arch) return null;
      fields["architecture.pattern"] = arch.pattern;
      fields["architecture.rationale"] = arch.rationale;
      fields["architecture.confidence"] = arch.confidence;
      fields["architecture.technologies"] = arch.technologies.join(", ");
    }

    if (raw.dimensionScores && typeof raw.dimensionScores === "object") {
      const dimScores: number[] = [];
      for (const [key, val] of Object.entries(raw.dimensionScores as Record<string, unknown>)) {
        if (typeof val === "number") {
          const score = Math.min(100, Math.max(0, Math.round(val)));
          fields[`dimension.${key}.score`] = score;
          dimScores.push(score);
        }
      }
      if (dimScores.length) {
        fields.overallScore = Math.round(
          dimScores.reduce((sum, s) => sum + s, 0) / dimScores.length
        );
      }
    }

    if (raw.criteria && typeof raw.criteria === "object") {
      for (const def of READINESS_DIMENSION_DEFS) {
        const dim = (raw.criteria as Record<string, unknown>)[def.key];
        if (!dim || typeof dim !== "object") continue;
        const map = dim as Record<string, unknown>;
        def.criteria.forEach((c, i) => {
          if (typeof map[c.id] === "boolean") {
            fields[`dimension.${def.key}.criteria.${i}`] = map[c.id] as boolean;
          }
        });
      }
    }

    const criterionExplanations = parseCriterionExplanations(raw.criterionExplanations);

    if (Object.keys(fields).length === 0 && !criterionExplanations) return null;

    return { fields, criterionExplanations };
  } catch {
    return null;
  }
}

export function flattenCriterionExplanations(
  explanations: Record<string, Record<string, string>>
): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const def of READINESS_DIMENSION_DEFS) {
    const dimMap = explanations[def.key];
    if (!dimMap) continue;
    def.criteria.forEach((c, i) => {
      const text = dimMap[c.id];
      if (text) fields[`dimension.${def.key}.criteria.${i}.explanation`] = text;
    });
  }
  return fields;
}
