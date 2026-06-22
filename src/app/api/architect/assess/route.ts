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
  criteria: Object.fromEntries(
    d.criteria.map((c) => [
      c.id,
      '{ "met": boolean, "explanation": "8-18 words — why met or what is missing, citing submission evidence" }',
    ])
  ),
}));

const SYSTEM_PROMPT = `You are a senior CGI AI Solution Architect evaluating telecom AI use cases for a workshop.

You receive everything the business user submitted: title, description, business problem, proposed AI solution, department, category, impact, effort, tags — plus an optional architect brief document.

Evaluate readiness honestly from the text provided. Do not invent facts. Mark a criterion "met" only when the submission gives reasonable evidence.

Respond ONLY with valid JSON matching this schema:
{
  "contentRichness": {
    "score": number 0-100,
    "summary": "one sentence on overall submission depth",
    "fields": {
      "title": "8-15 words on title quality",
      "description": "8-15 words on description quality",
      "businessProblem": "8-15 words",
      "proposedSolution": "8-15 words",
      "document": "8-15 words on architect brief or note if absent"
    }
  },
  "dimensions": {
    "business": { "criteria": { "objective": { "met": boolean, "explanation": "string" }, ... } },
    "data": { "criteria": { "source": { "met": boolean, "explanation": "string" }, ... } },
    "ai": { "criteria": { ... } },
    "security": { "criteria": { ... } },
    "delivery": { "criteria": { ... } }
  },
  "architectQuestions": ["string — 5 to 8 specific follow-up questions targeting the biggest gaps"],
  "telecomImpactAreas": [{ "area": "string — from allowed list", "relevance": number 1-100 }],
  "architecture": {
    "pattern": "string — concise architecture pattern name",
    "technologies": ["string — 3 to 6 Microsoft/telecom technologies"],
    "confidence": number 1-100,
    "rationale": "string — structured AI & data architecture for THIS use case. Write 5-8 sentences as a cohesive narrative covering: (1) data sources and ingestion path, (2) storage/processing (lakehouse, warehouse, streaming), (3) AI/ML or GenAI components and how they are applied, (4) integrations with telecom/OSS-BSS/CRM or ops systems, (5) security, privacy, and governance controls, (6) how outputs reach users (dashboards, APIs, agents). Reference specific submission details — never use generic filler about 'cloud-based technologies' without naming components and flows."
  }
}

Rules:
- Every criterion needs a concise explanation grounded in the actual submission text.
- Weight businessProblem and proposedSolution heavily alongside title and description.
- contentRichness.fields must comment on each field even when empty or thin.
- architectQuestions must target unmet criteria and telecom context.
- telecomImpactAreas: only include domains with clear relevance; use allowed domain names exactly.
- Prefer Azure OpenAI, Microsoft Fabric, Databricks, Power BI, Azure Machine Learning for architecture.
- architecture.rationale must read like a solution architect's design narrative — concrete components, data flows, and integrations tied to the submission.
- Do not mention JSON, prompts, AI vendors, or that you are an AI.`;

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
      max_tokens: 3200,
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
