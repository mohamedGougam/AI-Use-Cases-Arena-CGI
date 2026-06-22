/**
 * Supabase query layer — delegates to arena-db repository when configured.
 * @see src/lib/arena-db/repository.ts
 */

export {
  loadArenaState,
  saveArenaState,
  listEvaluationHistory,
  recordEvaluationSnapshot,
  getArenaDbStatus,
} from "@/lib/arena-db/repository";
