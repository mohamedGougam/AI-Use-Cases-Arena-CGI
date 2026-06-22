import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { ArchitectAssessment, ArchitectureRecommendation } from "@/lib/architect-engine";
import {
  buildRecommendationPayload,
  type ArchitectRecommendationPayload,
} from "@/lib/architect-recommendation-payload";
import type { UseCase } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are a senior CGI AI Solution Architect advising a telecom operator (e.g. KPN-scale) on Microsoft-centric AI delivery.

You receive a full use case: business text, optional architect brief, readiness scores, gaps, and a rule-based draft architecture.

Respond ONLY with valid JSON matching this schema:
{
  "pattern": "string — architecture pattern name (e.g. RAG Knowledge Assistant, Agentic AI, Predictive Analytics)",
  "technologies": ["string — 3 to 6 Microsoft/telecom technologies"],
  "confidence": number — integer 1-100,
  "rationale": "string — 2-4 sentences grounded in the provided use case text and readiness gaps"
}

Rules:
- Ground every claim in the input; do not invent facts not supported by the text.
- Prefer Azure OpenAI, Microsoft Fabric, Databricks, Power BI, and telecom OSS/BSS integration where relevant.
- Confidence reflects how well the use case is specified (readiness scores and text richness).
- If the architect brief is present, weight it heavily alongside title and description.
- Do not mention JSON, prompts, or that you are an AI.
- Keep rationale practical for a CGI workshop, not marketing hype.`;

function isUseCase(value: unknown): value is UseCase {
  if (!value || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return typeof o.id === "string" && typeof o.title === "string" && typeof o.description === "string";
}

function isAssessment(value: unknown): value is ArchitectAssessment {
  if (!value || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return typeof o.overallScore === "number" && Array.isArray(o.dimensions) && o.architecture !== undefined;
}

function parseRecommendation(content: string): ArchitectureRecommendation | null {
  try {
    const raw = JSON.parse(content) as Record<string, unknown>;
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
  } catch {
    return null;
  }
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
      recommendation: null,
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
  let payload: ArchitectRecommendationPayload;

  if (isUseCase(o.useCase) && isAssessment(o.assessment)) {
    payload = buildRecommendationPayload(o.useCase, o.assessment);
  } else if (o.payload && typeof o.payload === "object") {
    payload = o.payload as ArchitectRecommendationPayload;
  } else {
    return NextResponse.json({ error: "useCase and assessment required" }, { status: 400 });
  }

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
      max_tokens: 900,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Analyze this telecom AI use case and produce the architecture recommendation JSON.\n\n${JSON.stringify(payload, null, 2)}`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
      return NextResponse.json({ error: "Empty model response" }, { status: 502 });
    }

    const recommendation = parseRecommendation(content);
    if (!recommendation) {
      return NextResponse.json({ error: "Could not parse model response" }, { status: 502 });
    }

    return NextResponse.json({
      fallback: false,
      recommendation,
      model,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "OpenAI request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
