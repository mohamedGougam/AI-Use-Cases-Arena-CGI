import { NextResponse } from "next/server";
import OpenAI from "openai";
import { buildAssessmentInputPayload } from "@/lib/architect-assessment-payload";
import { parseAiAssessmentResponse } from "@/lib/parse-ai-assessment";
import { READINESS_DIMENSION_DEFS } from "@/lib/readiness-criteria";
import type { UseCase } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 90;

const CRITERIA_SCHEMA = READINESS_DIMENSION_DEFS.map((d) => ({
  key: d.key,
  criteria: Object.fromEntries(d.criteria.map((c) => [c.id, "boolean — true if criterion is met"])),
}));

const SYSTEM_PROMPT = `You are a senior CGI AI Solution Architect evaluating telecom AI use cases for a workshop.

You receive everything the business user submitted: title, description, business problem, proposed AI solution, department, category, impact, effort, tags — plus an optional architect brief document.

Evaluate readiness honestly from the text provided. Do not invent facts. Mark a criterion "met" only when the submission gives reasonable evidence.

Respond ONLY with valid JSON matching this schema:
{
  "dimensions": {
    "business": { "criteria": { "objective": boolean, "problem": boolean, "value": boolean, "stakeholders": boolean, "success": boolean, "process": boolean } },
    "data": { "criteria": { "source": boolean, "historical": boolean, "volume": boolean, "quality": boolean, "ownership": boolean, "gdpr": boolean } },
    "ai": { "criteria": { "model": boolean, "finetuning": boolean, "human": boolean, "accuracy": boolean, "acceptance": boolean } },
    "security": { "criteria": { "pii": boolean, "customer": boolean, "infrastructure": boolean, "network": boolean, "classification": boolean } },
    "delivery": { "criteria": { "budget": boolean, "timeline": boolean, "team": boolean, "sponsor": boolean, "dependencies": boolean } }
  },
  "architectQuestions": ["string — 5 to 8 specific follow-up questions targeting the biggest gaps"],
  "telecomImpactAreas": [{ "area": "string — from allowed list", "relevance": number 1-100 }],
  "architecture": {
    "pattern": "string",
    "technologies": ["string — 3 to 6 Microsoft/telecom technologies"],
    "confidence": number 1-100,
    "rationale": "string — 2-4 sentences"
  }
}

Rules:
- Weight businessProblem and proposedSolution heavily alongside title and description.
- architectQuestions must target unmet criteria and telecom context — not generic filler.
- telecomImpactAreas: only include domains with clear relevance; use the allowed domain names exactly.
- Prefer Azure OpenAI, Microsoft Fabric, Databricks, Power BI for architecture.
- Do not mention JSON, prompts, or that you are an AI.`;

function isUseCase(value: unknown): value is UseCase {
  if (!value || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return typeof o.id === "string" && typeof o.title === "string" && typeof o.description === "string";
}

export async function GET() {
  return NextResponse.json({
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY?.trim()),
  });
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({
      fallback: true,
      assessment: null,
      reason: "missing_api_key",
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const o = body as Record<string, unknown>;
  if (!isUseCase(o.useCase)) {
    return NextResponse.json({ error: "useCase required" }, { status: 400 });
  }

  const payload = buildAssessmentInputPayload(o.useCase);
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const baseURL = process.env.OPENAI_BASE_URL?.trim();

  const client = new OpenAI({
    apiKey,
    ...(baseURL ? { baseURL } : {}),
  });

  try {
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.35,
      max_tokens: 2200,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Evaluate this telecom AI use case and return the JSON assessment.\n\nAllowed telecom domains: ${payload.telecomDomains.join(", ")}\n\nCriteria reference:\n${JSON.stringify(CRITERIA_SCHEMA, null, 2)}\n\nUse case input:\n${JSON.stringify(payload, null, 2)}`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
      return NextResponse.json({ error: "Empty model response" }, { status: 502 });
    }

    const assessment = parseAiAssessmentResponse(content);
    if (!assessment) {
      return NextResponse.json({ error: "Could not parse model response" }, { status: 502 });
    }

    return NextResponse.json({
      fallback: false,
      assessment,
      model,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "OpenAI request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
