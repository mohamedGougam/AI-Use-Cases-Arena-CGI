import { NextResponse } from "next/server";
import type { UseCase } from "@/types";
import {
  getArenaDbStatus,
  loadArenaState,
  saveArenaState,
} from "@/lib/arena-db/repository";
import { ARENA_STATE_VERSION } from "@/lib/arena-db/types";

export const runtime = "nodejs";

function isUseCaseArray(value: unknown): value is UseCase[] {
  return Array.isArray(value);
}

export async function GET() {
  try {
    const { state, status } = await loadArenaState();
    return NextResponse.json({
      state,
      status,
      version: ARENA_STATE_VERSION,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load arena state";
    return NextResponse.json({ error: message, status: getArenaDbStatus() }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const o = body as Record<string, unknown>;
  if (!isUseCaseArray(o.useCases)) {
    return NextResponse.json({ error: "useCases array required" }, { status: 400 });
  }

  const votedUseCaseIds = Array.isArray(o.votedUseCaseIds)
    ? (o.votedUseCaseIds as string[])
    : [];

  try {
    const state = await saveArenaState(o.useCases, votedUseCaseIds);
    return NextResponse.json({ state, status: getArenaDbStatus() });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save arena state";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
