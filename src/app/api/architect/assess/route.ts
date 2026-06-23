import { NextResponse } from "next/server";
import { workshopFingerprint } from "@/lib/discovery-questions";
import { runOpenAiAssessment, toArchitectAiAssessment } from "@/lib/run-openai-assessment";
import type { ArchitectDiscoveryQuestion, UseCase } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 90;

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
  if (!process.env.OPENAI_API_KEY?.trim()) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is required. No fallback assessment is available." },
      { status: 503 }
    );
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

  const useCase = o.useCase;
  const discoveryQuestions = Array.isArray(o.discoveryQuestions)
    ? (o.discoveryQuestions as ArchitectDiscoveryQuestion[])
    : useCase.architectDiscoveryQuestions;

  try {
    const result = await runOpenAiAssessment(
      { ...useCase, architectDiscoveryQuestions: discoveryQuestions },
      { discoveryQuestions }
    );
    const fingerprint = workshopFingerprint({
      ...useCase,
      architectDiscoveryQuestions: result.discoveryQuestions,
    });
    const assessment = toArchitectAiAssessment(result, fingerprint);

    return NextResponse.json({
      assessment: {
        ...result.assessment,
        discoveryQuestions: result.discoveryQuestions,
      },
      architectAiAssessment: assessment,
      discoveryQuestions: result.discoveryQuestions,
      model: result.model,
      generatedAt: result.generatedAt,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "OpenAI request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
