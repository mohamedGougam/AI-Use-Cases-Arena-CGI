import type { UseCase } from "@/types";

export const ARENA_STATE_VERSION = 1;

export interface ArenaPersistedState {
  version: number;
  useCases: UseCase[];
  votedUseCaseIds: string[];
  updatedAt: string;
}

export type EvaluationEventType =
  | "use_case_submitted"
  | "use_case_updated"
  | "vote_cast"
  | "comment_added"
  | "creator_message"
  | "document_uploaded"
  | "document_removed"
  | "overrides_updated"
  | "overrides_cleared"
  | "state_sync";

export interface EvaluationSnapshot {
  id: string;
  useCaseId: string;
  useCaseTitle: string;
  eventType: EvaluationEventType;
  payload: {
    useCase?: UseCase;
    architectBrief?: UseCase["architectBrief"];
    architectOverrides?: UseCase["architectOverrides"];
    assessmentSummary?: {
      overallScore: number;
      timelineMin: number;
      timelineMax: number;
      architecturePattern: string;
      dimensionScores: Record<string, number>;
    };
    detail?: string;
  };
  actorEmail?: string;
  actorName?: string;
  createdAt: string;
}

export type ArenaDbBackend = "supabase" | "file";

export interface ArenaDbStatus {
  backend: ArenaDbBackend;
  configured: boolean;
  message: string;
}
