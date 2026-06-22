import type { UseCase } from "@/types";
import { analyzeUseCase } from "@/lib/architect-engine";
import type {
  ArenaDbStatus,
  ArenaPersistedState,
  EvaluationEventType,
  EvaluationSnapshot,
} from "@/lib/arena-db/types";
import { ARENA_STATE_VERSION } from "@/lib/arena-db/types";
import {
  appendFileHistory,
  listFileHistory,
  loadFileState,
  saveFileState,
} from "@/lib/arena-db/file-store";
import {
  appendSupabaseHistory,
  isSupabaseDbConfigured,
  listSupabaseHistory,
  loadSupabaseState,
  saveSupabaseState,
} from "@/lib/arena-db/supabase-store";

export function getArenaDbStatus(): ArenaDbStatus {
  if (isSupabaseDbConfigured()) {
    return {
      backend: "supabase",
      configured: true,
      message: "Connected to Supabase (arena_state + evaluation_snapshots).",
    };
  }
  return {
    backend: "file",
    configured: true,
    message: "Using local file database (data/arena-state.json + arena-history.json).",
  };
}

export async function loadArenaState(): Promise<{
  state: ArenaPersistedState | null;
  status: ArenaDbStatus;
}> {
  const status = getArenaDbStatus();

  if (status.backend === "supabase") {
    try {
      const state = await loadSupabaseState();
      return { state, status };
    } catch {
      const fallback = await loadFileState();
      return {
        state: fallback,
        status: {
          backend: "file",
          configured: true,
          message: "Supabase unavailable — loaded local file database.",
        },
      };
    }
  }

  const state = await loadFileState();
  return { state, status };
}

export async function saveArenaState(
  useCases: UseCase[],
  votedUseCaseIds: string[]
): Promise<ArenaPersistedState> {
  const state: ArenaPersistedState = {
    version: ARENA_STATE_VERSION,
    useCases,
    votedUseCaseIds,
    updatedAt: new Date().toISOString(),
  };

  if (isSupabaseDbConfigured()) {
    try {
      await saveSupabaseState(state);
      return state;
    } catch {
      await saveFileState(state);
      return state;
    }
  }

  await saveFileState(state);
  return state;
}

export async function recordEvaluationSnapshot(input: {
  useCase: UseCase;
  eventType: EvaluationEventType;
  actorEmail?: string;
  actorName?: string;
  detail?: string;
}): Promise<EvaluationSnapshot> {
  const assessment = analyzeUseCase(input.useCase);
  const snapshot: EvaluationSnapshot = {
    id: `eval-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    useCaseId: input.useCase.id,
    useCaseTitle: input.useCase.title,
    eventType: input.eventType,
    payload: {
      useCase: input.useCase,
      architectBrief: input.useCase.architectBrief,
      architectOverrides: input.useCase.architectOverrides,
      assessmentSummary: {
        overallScore: assessment.overallScore,
        timelineMin: assessment.consensus.timelineMin,
        timelineMax: assessment.consensus.timelineMax,
        architecturePattern: assessment.architecture.pattern,
        dimensionScores: Object.fromEntries(
          assessment.dimensions.map((d) => [d.key, d.score])
        ),
      },
      detail: input.detail,
    },
    actorEmail: input.actorEmail,
    actorName: input.actorName,
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseDbConfigured()) {
    try {
      await appendSupabaseHistory(snapshot);
      return snapshot;
    } catch {
      await appendFileHistory(snapshot);
      return snapshot;
    }
  }

  await appendFileHistory(snapshot);
  return snapshot;
}

export async function listEvaluationHistory(
  useCaseId?: string,
  limit = 100
): Promise<EvaluationSnapshot[]> {
  if (isSupabaseDbConfigured()) {
    try {
      return await listSupabaseHistory(useCaseId, limit);
    } catch {
      return listFileHistory(useCaseId, limit);
    }
  }
  return listFileHistory(useCaseId, limit);
}
