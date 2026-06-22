import { NextResponse } from "next/server";
import type { UseCase } from "@/types";
import {
  getArenaDbStatus,
  listEvaluationHistory,
  recordEvaluationSnapshot,
} from "@/lib/arena-db/repository";
import type { EvaluationEventType } from "@/lib/arena-db/types";

export const runtime = "nodejs";

const EVENT_TYPES: EvaluationEventType[] = [
  "use_case_submitted",
  "use_case_updated",
  "vote_cast",
  "comment_added",
  "creator_message",
  "document_uploaded",
  "document_removed",
  "overrides_updated",
  "overrides_cleared",
  "state_sync",
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const useCaseId = searchParams.get("useCaseId") ?? undefined;
  const limit = Math.min(500, Number(searchParams.get("limit") ?? 100) || 100);

  try {
    const history = await listEvaluationHistory(useCaseId, limit);
    return NextResponse.json({ history, status: getArenaDbStatus() });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load history";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const o = body as Record<string, unknown>;
  const useCase = o.useCase as UseCase | undefined;
  const eventType = o.eventType as EvaluationEventType | undefined;

  if (!useCase?.id || !eventType || !EVENT_TYPES.includes(eventType)) {
    return NextResponse.json({ error: "useCase and valid eventType required" }, { status: 400 });
  }

  try {
    const snapshot = await recordEvaluationSnapshot({
      useCase,
      eventType,
      actorEmail: typeof o.actorEmail === "string" ? o.actorEmail : undefined,
      actorName: typeof o.actorName === "string" ? o.actorName : undefined,
      detail: typeof o.detail === "string" ? o.detail : undefined,
    });
    return NextResponse.json({ snapshot, status: getArenaDbStatus() });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to record snapshot";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
