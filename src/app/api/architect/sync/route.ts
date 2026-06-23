import { NextResponse } from "next/server";
import OpenAI from "openai";
import { buildAssessmentInputPayload } from "@/lib/architect-assessment-payload";
import { parseArchitectSyncResponse } from "@/lib/parse-architect-sync";
import { CRITERION_EXPLANATION_RULES } from "@/lib/architect-governance-prompt";
import { READINESS_DIMENSION_DEFS } from "@/lib/readiness-criteria";
import type { ArchitectAssessment } from "@/lib/architect-engine";
import type { UseCase } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are a senior CGI AI Solution Architect finalizing a telecom use case assessment after workshop edits.

The architect has adjusted one field based on professional experience. Harmonize the full architecture recommendation and update related readiness signals where their edit implies changes.

Respond ONLY with valid JSON:
{
  "architecture": {
    "pattern": "string — architecture pattern name",
    "rationale": "string — 5-8 sentences: structured AI and data architecture narrative for this use case (data sources/ingestion, processing layer, AI/ML components, telecom integrations, security/governance, delivery to users). Reference submission specifics.",
    "technologies": ["string — 3-6 Microsoft/telecom technologies"],
    "confidence": number 1-100
  },
  "criterionExplanations": {
    "business": { "objective": "source field + verbatim quote if met", ... },
    "data": { ... },
    "ai": { ... },
    "security": { ... },
    "delivery": { ... }
  },
  "criteria": {
    "business": { "objective": boolean, "problem": boolean, ... },
    ...
  },
  "dimensionScores": {
    "business": number 0-100,
    "data": number,
    ...
  }
}

Rules:
- Honor the architect's edit and note — treat them as authoritative workshop judgment. Never overwrite the meaning of the field they edited.
- Keep rationale as the primary AI & data architecture narrative with concrete components, data flows, integrations, and delivery — not generic summaries of readiness gaps.
- Align pattern, technology stack, and confidence with the rationale.
- Refresh criterion explanations only where the architect's change affects them; keep others consistent with submission evidence.
${CRITERION_EXPLANATION_RULES}
- Adjust met/not met flags and dimension scores only when clearly implied by the architect edit.
- Prefer Azure OpenAI, Microsoft Fabric, Databricks, Power BI.
- Do not mention JSON, prompts, or AI vendors.`;

function isUseCase(value: unknown): value is UseCase {
  if (!value || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return typeof o.id === "string" && typeof o.title === "string";
}

function isAssessment(value: unknown): value is ArchitectAssessment {
  if (!value || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return typeof o.overallScore === "number" && Array.isArray(o.dimensions);
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ fallback: true });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const o = body as Record<string, unknown>;
  if (!isUseCase(o.useCase) || !isAssessment(o.assessment)) {
    return NextResponse.json({ error: "useCase and assessment required" }, { status: 400 });
  }

  const changedFieldKey = typeof o.changedFieldKey === "string" ? o.changedFieldKey : "";
  const changedValue = o.changedValue;
  const architectNote = typeof o.architectNote === "string" ? o.architectNote.trim() : "";

  if (!changedFieldKey) {
    return NextResponse.json({ error: "changedFieldKey required" }, { status: 400 });
  }

  const payload = buildAssessmentInputPayload(o.useCase);
  const assessment = o.assessment;
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

  const client = new OpenAI({
    apiKey,
    ...(process.env.OPENAI_BASE_URL?.trim() ? { baseURL: process.env.OPENAI_BASE_URL.trim() } : {}),
  });

  const criteriaRef = READINESS_DIMENSION_DEFS.map((d) => ({
    key: d.key,
    criteria: d.criteria.map((c) => c.id),
  }));

  try {
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.4,
      max_tokens: 2000,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Harmonize the assessment after this architect edit.

Changed field: ${changedFieldKey}
New value: ${JSON.stringify(changedValue)}
Architect workshop note: ${architectNote || "(none)"}

Criteria keys reference:
${JSON.stringify(criteriaRef, null, 2)}

Current assessment:
${JSON.stringify(
  {
    overallScore: assessment.overallScore,
    dimensions: assessment.dimensions.map((d) => ({
      key: d.key,
      score: d.score,
      criteria: d.criteria.map((c) => ({
        label: c.label,
        met: c.met,
        explanation: c.explanation,
      })),
    })),
    architecture: assessment.architecture,
  },
  null,
  2
)}

Use case input:
${JSON.stringify(payload, null, 2)}`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
      return NextResponse.json({ error: "Empty model response" }, { status: 502 });
    }

    const parsed = parseArchitectSyncResponse(content);
    if (!parsed) {
      return NextResponse.json({ error: "Could not parse sync response" }, { status: 502 });
    }

    return NextResponse.json({ fallback: false, updates: parsed });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sync request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
