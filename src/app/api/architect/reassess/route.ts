import { NextResponse } from "next/server";
import { workshopFingerprint } from "@/lib/discovery-questions";
import { runOpenAiAssessment, toArchitectAiAssessment } from "@/lib/run-openai-assessment";
import type { ArchitectDiscoveryQuestion, UseCase } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 90;

function isUseCase(value: unknown): value is UseCase {
  if (!value || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return typeof o.id === "string" && typeof o.title === "string";
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY?.trim()) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is required. No fallback reassessment is available." },
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

  const questionId = typeof o.questionId === "string" ? o.questionId : "";
  const answer = typeof o.answer === "string" ? o.answer.trim() : "";
  if (!questionId || !answer) {
    return NextResponse.json({ error: "questionId and answer required" }, { status: 400 });
  }

  const useCase = o.useCase;
  const existing: ArchitectDiscoveryQuestion[] =
    useCase.architectDiscoveryQuestions ??
    (Array.isArray(o.discoveryQuestions) ? (o.discoveryQuestions as ArchitectDiscoveryQuestion[]) : []);

  const discoveryQuestions = existing.map((q) =>
    q.id === questionId
      ? {
          ...q,
          answer,
          answeredAt: new Date().toISOString(),
          answeredBy: typeof o.answeredBy === "string" ? o.answeredBy : "CGI AI Architect",
          status: "answered" as const,
        }
      : q
  );

  try {
    const result = await runOpenAiAssessment(
      { ...useCase, architectDiscoveryQuestions: discoveryQuestions },
      { discoveryQuestions, reassess: true }
    );

    const mergedQuestions = result.discoveryQuestions.map((q) => ({
      ...q,
      status: q.answer?.trim() ? ("used" as const) : ("missing" as const),
    }));

    const fingerprint = workshopFingerprint({
      ...useCase,
      architectDiscoveryQuestions: mergedQuestions,
    });
    const architectAiAssessment = toArchitectAiAssessment(
      { ...result, discoveryQuestions: mergedQuestions },
      fingerprint
    );

    return NextResponse.json({
      assessment: {
        ...result.assessment,
        discoveryQuestions: mergedQuestions,
      },
      architectAiAssessment,
      discoveryQuestions: mergedQuestions,
      model: result.model,
      generatedAt: result.generatedAt,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Reassessment failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
