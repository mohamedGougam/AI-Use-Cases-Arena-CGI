import type {
  ArchitectureRecommendation,
  ReadinessCriterion,
  ReadinessDimension,
  TelecomImpactArea,
} from "@/lib/architect-engine";
import type { AiContentRichness } from "@/lib/content-richness";
import { READINESS_DIMENSION_DEFS, scoreFromCriteria } from "@/lib/readiness-criteria";
import { TELECOM_IMPACT_AREAS } from "@/lib/constants";

export interface ParsedAiAssessment {
  dimensions: ReadinessDimension[];
  overallScore: number;
  architectQuestions: string[];
  telecomImpactAreas: TelecomImpactArea[];
  architecture: ArchitectureRecommendation;
  contentRichness?: AiContentRichness;
}

function parseArchitecture(raw: Record<string, unknown>): ArchitectureRecommendation | null {
  const pattern = typeof raw.pattern === "string" ? raw.pattern.trim() : "";
  const rationale = typeof raw.rationale === "string" ? raw.rationale.trim() : "";
  const confidence =
    typeof raw.confidence === "number"
      ? Math.min(100, Math.max(1, Math.round(raw.confidence)))
      : 75;
  const technologies = Array.isArray(raw.technologies)
    ? raw.technologies.map((t) => String(t).trim()).filter(Boolean).slice(0, 8)
    : [];

  if (!pattern || !rationale || technologies.length === 0) return null;
  return { pattern, technologies, confidence, rationale };
}

function parseCriterionEntry(value: unknown): { met: boolean; explanation?: string } | null {
  if (typeof value === "boolean") return { met: value };
  if (!value || typeof value !== "object") return null;
  const o = value as Record<string, unknown>;
  if (typeof o.met !== "boolean") return null;
  const explanation =
    typeof o.explanation === "string" ? o.explanation.trim().slice(0, 160) : undefined;
  return { met: o.met, explanation: explanation || undefined };
}

function parseCriteria(dimensionKey: string, rawCriteria: unknown): ReadinessCriterion[] | null {
  if (!rawCriteria || typeof rawCriteria !== "object") return null;
  const def = READINESS_DIMENSION_DEFS.find((d) => d.key === dimensionKey);
  if (!def) return null;

  const map = rawCriteria as Record<string, unknown>;
  const criteria: ReadinessCriterion[] = [];

  for (const c of def.criteria) {
    const parsed = parseCriterionEntry(map[c.id]);
    if (!parsed) return null;
    criteria.push({
      label: c.label,
      met: parsed.met,
      explanation: parsed.explanation,
    });
  }

  return criteria;
}

function parseDimensions(raw: unknown): ReadinessDimension[] | null {
  if (!raw || typeof raw !== "object") return null;
  const map = raw as Record<string, unknown>;
  const dimensions: ReadinessDimension[] = [];

  for (const def of READINESS_DIMENSION_DEFS) {
    const entry = map[def.key];
    if (!entry || typeof entry !== "object") return null;
    const criteria = parseCriteria(def.key, (entry as Record<string, unknown>).criteria);
    if (!criteria) return null;
    const met = criteria.filter((c) => c.met).length;
    dimensions.push({
      key: def.key,
      title: def.title,
      score: scoreFromCriteria(met, criteria.length),
      criteria,
    });
  }

  return dimensions;
}

function parseContentRichness(raw: unknown): AiContentRichness | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const score =
    typeof o.score === "number" ? Math.min(100, Math.max(0, Math.round(o.score))) : undefined;
  const summary = typeof o.summary === "string" ? o.summary.trim() : "";
  if (score === undefined && !summary) return undefined;

  const fields: Record<string, string> = {};
  if (o.fields && typeof o.fields === "object") {
    for (const [key, val] of Object.entries(o.fields as Record<string, unknown>)) {
      if (typeof val === "string" && val.trim()) fields[key] = val.trim().slice(0, 120);
    }
  }

  return {
    score: score ?? 0,
    summary,
    fields: Object.keys(fields).length ? fields : undefined,
  };
}

function parseTelecomAreas(raw: unknown): TelecomImpactArea[] | null {
  if (!Array.isArray(raw)) return null;
  const areas: TelecomImpactArea[] = [];

  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const area = typeof o.area === "string" ? o.area.trim() : "";
    const relevance =
      typeof o.relevance === "number"
        ? Math.min(100, Math.max(0, Math.round(o.relevance)))
        : 0;
    if (!area || relevance <= 0) continue;
    if (!(TELECOM_IMPACT_AREAS as readonly string[]).includes(area)) continue;
    areas.push({ area, relevance });
  }

  if (areas.length === 0) {
    return [
      { area: "Data Platform", relevance: 50 },
      { area: "CRM", relevance: 40 },
    ];
  }

  return areas.sort((a, b) => b.relevance - a.relevance).slice(0, 6);
}

function parseQuestions(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) return null;
  const questions = raw
    .map((q) => String(q).trim())
    .filter((q) => q.length >= 10)
    .slice(0, 8);
  return questions.length > 0 ? questions : null;
}

export function parseAiAssessmentResponse(content: string): ParsedAiAssessment | null {
  try {
    const raw = JSON.parse(content) as Record<string, unknown>;
    const dimensions = parseDimensions(raw.dimensions);
    const architectQuestions = parseQuestions(raw.architectQuestions);
    const telecomImpactAreas = parseTelecomAreas(raw.telecomImpactAreas);
    const architecture = parseArchitecture(
      raw.architecture && typeof raw.architecture === "object"
        ? (raw.architecture as Record<string, unknown>)
        : {}
    );

    if (!dimensions || !architectQuestions || !telecomImpactAreas || !architecture) {
      return null;
    }

    const overallScore = Math.round(
      dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length
    );

    return {
      dimensions,
      overallScore,
      architectQuestions,
      telecomImpactAreas,
      architecture,
      contentRichness: parseContentRichness(raw.contentRichness),
    };
  } catch {
    return null;
  }
}
