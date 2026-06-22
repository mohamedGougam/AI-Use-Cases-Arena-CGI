import type { UseCase } from "@/types";
import type { ArenaDbStatus, ArenaPersistedState, EvaluationEventType, EvaluationSnapshot } from "@/lib/arena-db/types";

export async function fetchArenaState(): Promise<{
  state: ArenaPersistedState | null;
  status: ArenaDbStatus;
} | null> {
  try {
    const res = await fetch("/api/arena/state", { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      state: data.state ?? null,
      status: data.status,
    };
  } catch {
    return null;
  }
}

export async function pushArenaState(useCases: UseCase[], votedUseCaseIds: string[]): Promise<boolean> {
  try {
    const res = await fetch("/api/arena/state", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ useCases, votedUseCaseIds }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchEvaluationHistory(useCaseId?: string): Promise<{
  history: EvaluationSnapshot[];
  status?: ArenaDbStatus;
} | null> {
  try {
    const qs = useCaseId ? `?useCaseId=${encodeURIComponent(useCaseId)}` : "";
    const res = await fetch(`/api/arena/history${qs}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function recordArenaSnapshot(input: {
  useCase: UseCase;
  eventType: EvaluationEventType;
  actorEmail?: string;
  actorName?: string;
  detail?: string;
}): Promise<void> {
  try {
    await fetch("/api/arena/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    // Non-blocking — local state still saved
  }
}
