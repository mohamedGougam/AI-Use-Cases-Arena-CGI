import type {
  ArchitectureRecommendation,
  ArchitectEstimationOutput,
  ArchitectGovernanceOutput,
  ReadinessCriterion,
  ReadinessDimension,
  TelecomImpactArea,
} from "@/lib/architect-engine";
import type { AiContentRichness } from "@/lib/content-richness";
import { READINESS_DIMENSION_DEFS } from "@/lib/readiness-criteria";
import { TELECOM_IMPACT_AREAS } from "@/lib/constants";
import type { MasterDiscoveryContext } from "@/lib/master-discovery-context";
import { parseMasterDiscoveryContext } from "@/lib/master-discovery-context";
import type { ArchitectDiscoveryQuestion } from "@/types";

export interface ParsedAiAssessment {
  masterDiscoveryContext: MasterDiscoveryContext;
  dimensions: ReadinessDimension[];
  overallScore: number;
  discoveryQuestions: ArchitectDiscoveryQuestion[];
  telecomImpactAreas: TelecomImpactArea[];
  architecture: ArchitectureRecommendation;
  architectureUnlocked: boolean;
  estimationUnlocked: boolean;
  governance: ArchitectGovernanceOutput;
  estimation: ArchitectEstimationOutput;
  contentRichness?: AiContentRichness;
}

const LOCKED_ARCHITECTURE: ArchitectureRecommendation = {
  pattern: "Pending discovery",
  technologies: [],
  confidence: 15,
  rationale:
    "Architecture recommendation is locked until sufficient workshop information is captured. Continue the discovery interview to unlock a concrete AI and data architecture.",
};

const LOCKED_ESTIMATION: ArchitectEstimationOutput = {
  locked: true,
  lockReason: "Insufficient information available.",
  modelEstimates: [],
  consensus: { timelineMin: 0, timelineMax: 0, confidence: 0 },
  deliveryTeam: [],
  requiredSkills: [],
  totalTeamDays: 0,
};

function parseArchitecture(
  raw: Record<string, unknown>,
  unlocked: boolean
): ArchitectureRecommendation {
  if (!unlocked) return { ...LOCKED_ARCHITECTURE };

  const pattern = typeof raw.pattern === "string" ? raw.pattern.trim() : "";
  const rationale = typeof raw.rationale === "string" ? raw.rationale.trim() : "";
  const confidence =
    typeof raw.confidence === "number"
      ? Math.min(100, Math.max(1, Math.round(raw.confidence)))
      : 15;
  const technologies = Array.isArray(raw.technologies)
    ? raw.technologies.map((t) => String(t).trim()).filter(Boolean).slice(0, 8)
    : [];

  if (!pattern || !rationale) return { ...LOCKED_ARCHITECTURE, confidence };
  return { pattern, rationale, confidence, technologies };
}

function parseCriterionEntry(value: unknown, label: string): ReadinessCriterion | null {
  if (typeof value === "boolean") {
    return { label, met: value };
  }
  if (!value || typeof value !== "object") return null;
  const o = value as Record<string, unknown>;

  const statusStr = typeof o.status === "string" ? o.status.toLowerCase() : "";
  const met =
    typeof o.met === "boolean"
      ? o.met
      : statusStr === "met" || statusStr === "yes" || statusStr === "identified";

  const evidence =
    typeof o.evidence === "string" ? o.evidence.trim().slice(0, 320) : undefined;
  const source = typeof o.source === "string" ? o.source.trim().slice(0, 120) : undefined;
  const confidence =
    typeof o.confidence === "number"
      ? Math.min(100, Math.max(0, Math.round(o.confidence)))
      : undefined;
  const score =
    typeof o.score === "number"
      ? Math.min(100, Math.max(0, Math.round(o.score)))
      : confidence;

  let explanation =
    typeof o.explanation === "string" ? o.explanation.trim().slice(0, 420) : undefined;

  if (!explanation && evidence && source) {
    explanation = `Evidence: "${evidence}" — Source: ${source}`;
  }

  return {
    label,
    met,
    score,
    evidence: evidence || undefined,
    source: source || undefined,
    confidence: confidence ?? score,
    explanation: explanation || undefined,
  };
}

function parseCriteria(dimensionKey: string, rawCriteria: unknown): ReadinessCriterion[] | null {
  if (!rawCriteria || typeof rawCriteria !== "object") return null;
  const def = READINESS_DIMENSION_DEFS.find((d) => d.key === dimensionKey);
  if (!def) return null;

  const map = rawCriteria as Record<string, unknown>;
  const criteria: ReadinessCriterion[] = [];

  for (const c of def.criteria) {
    const parsed = parseCriterionEntry(map[c.id], c.label);
    if (!parsed) return null;
    criteria.push(parsed);
  }

  return criteria;
}

function dimensionScoreFromCriteria(criteria: ReadinessCriterion[]): number {
  if (!criteria.length) return 0;
  const total = criteria.reduce((sum, c) => {
    if (typeof c.score === "number") return sum + c.score;
    return sum + (c.met ? 100 : 0);
  }, 0);
  return Math.round(total / criteria.length);
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
    dimensions.push({
      key: def.key,
      title: def.title,
      score: dimensionScoreFromCriteria(criteria),
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

function parseTelecomAreas(raw: unknown): TelecomImpactArea[] {
  if (!Array.isArray(raw)) return [];
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

  return areas.sort((a, b) => b.relevance - a.relevance).slice(0, 6);
}

function parseDiscoveryQuestions(raw: unknown): ArchitectDiscoveryQuestion[] | null {
  if (!Array.isArray(raw)) return null;
  const questions: ArchitectDiscoveryQuestion[] = [];

  for (const [index, item] of raw.entries()) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const question = typeof o.question === "string" ? o.question.trim() : "";
    const rationale = typeof o.rationale === "string" ? o.rationale.trim() : "";
    if (question.length < 8) continue;
    questions.push({
      id: typeof o.id === "string" && o.id.trim() ? o.id.trim() : `Q${index + 1}`,
      question,
      rationale: rationale || "Required to progress discovery before architecture or estimation.",
      status: "missing",
    });
  }

  return questions.length > 0 ? questions.slice(0, 12) : null;
}

function parseStringList(raw: unknown, max = 12): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((s) => String(s).trim())
    .filter(Boolean)
    .slice(0, max);
}

function parseGovernance(raw: unknown): ArchitectGovernanceOutput {
  if (!raw || typeof raw !== "object") {
    return {
      evidenceUsed: [],
      missingInformation: ["Workshop discovery not yet complete."],
      assumptions: [],
      risks: [],
      executiveSummary: "Discovery workshop in progress. Assessment will mature as business answers are captured.",
    };
  }
  const o = raw as Record<string, unknown>;
  return {
    evidenceUsed: parseStringList(o.evidenceUsed),
    missingInformation: parseStringList(o.missingInformation),
    assumptions: parseStringList(o.assumptions),
    risks: parseStringList(o.risks),
    executiveSummary:
      typeof o.executiveSummary === "string"
        ? o.executiveSummary.trim()
        : "Discovery workshop in progress.",
  };
}

function parseEstimation(raw: unknown, unlocked: boolean): ArchitectEstimationOutput {
  if (!unlocked) {
    const lockReason =
      raw && typeof raw === "object" && typeof (raw as Record<string, unknown>).lockReason === "string"
        ? String((raw as Record<string, unknown>).lockReason).trim()
        : LOCKED_ESTIMATION.lockReason;
    return { ...LOCKED_ESTIMATION, lockReason };
  }

  if (!raw || typeof raw !== "object") return { ...LOCKED_ESTIMATION, locked: false };

  const o = raw as Record<string, unknown>;
  const modelEstimates = Array.isArray(o.modelEstimates)
    ? o.modelEstimates
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const m = item as Record<string, unknown>;
          const model = typeof m.model === "string" ? m.model.trim() : "";
          const weeks = typeof m.weeks === "number" ? Math.max(0, Math.round(m.weeks)) : 0;
          const confidence =
            typeof m.confidence === "number"
              ? Math.min(100, Math.max(0, Math.round(m.confidence)))
              : 0;
          const complexity: "Low" | "Medium" | "High" =
            m.complexity === "Low" || m.complexity === "Medium" || m.complexity === "High"
              ? m.complexity
              : "Medium";
          if (!model) return null;
          return { model, weeks, complexity, confidence };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null)
    : [];

  const consensusRaw = o.consensus && typeof o.consensus === "object" ? o.consensus : {};
  const c = consensusRaw as Record<string, unknown>;
  const consensus = {
    timelineMin: typeof c.timelineMin === "number" ? Math.max(0, Math.round(c.timelineMin)) : 0,
    timelineMax: typeof c.timelineMax === "number" ? Math.max(0, Math.round(c.timelineMax)) : 0,
    confidence:
      typeof c.confidence === "number"
        ? Math.min(100, Math.max(0, Math.round(c.confidence)))
        : 0,
  };

  const deliveryTeam = Array.isArray(o.deliveryTeam)
    ? o.deliveryTeam
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const d = item as Record<string, unknown>;
          const role = typeof d.role === "string" ? d.role.trim() : "";
          const days = typeof d.days === "number" ? Math.max(0, Math.round(d.days)) : 0;
          if (!role) return null;
          return { role, days };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null)
    : [];

  return {
    locked: false,
    modelEstimates,
    consensus,
    deliveryTeam,
    requiredSkills: parseStringList(o.requiredSkills, 20),
    totalTeamDays:
      typeof o.totalTeamDays === "number" ? Math.max(0, Math.round(o.totalTeamDays)) : 0,
  };
}

export function parseAiAssessmentResponse(content: string): ParsedAiAssessment | null {
  try {
    const raw = JSON.parse(content) as Record<string, unknown>;
    const masterDiscoveryContext = parseMasterDiscoveryContext(raw.masterDiscoveryContext);
    const dimensions = parseDimensions(raw.dimensions);
    const discoveryQuestions =
      parseDiscoveryQuestions(raw.discoveryQuestions) ??
      (Array.isArray(raw.architectQuestions)
        ? parseDiscoveryQuestions(
            raw.architectQuestions.map((q, i) => ({
              id: `Q${i + 1}`,
              question: String(q),
              rationale: "Follow-up question to close information gaps.",
            }))
          )
        : null);

    const architectureUnlocked = raw.architectureUnlocked === true;
    const estimationUnlocked = raw.estimationUnlocked === true;

    const architecture = parseArchitecture(
      raw.architecture && typeof raw.architecture === "object"
        ? (raw.architecture as Record<string, unknown>)
        : {},
      architectureUnlocked
    );

    const estimation = parseEstimation(raw.estimation, estimationUnlocked);
    const governance = parseGovernance(raw.governance);
    const telecomImpactAreas = parseTelecomAreas(raw.telecomImpactAreas);

    if (!dimensions || !discoveryQuestions) return null;

    const overallScore = Math.round(
      dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length
    );

    return {
      masterDiscoveryContext,
      dimensions,
      overallScore,
      discoveryQuestions,
      telecomImpactAreas,
      architecture,
      architectureUnlocked,
      estimationUnlocked,
      governance,
      estimation,
      contentRichness: parseContentRichness(raw.contentRichness),
    };
  } catch {
    return null;
  }
}
