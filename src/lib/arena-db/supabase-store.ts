import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ArenaPersistedState, EvaluationSnapshot } from "@/lib/arena-db/types";
import { ARENA_STATE_VERSION } from "@/lib/arena-db/types";

const STATE_ROW_ID = "default";

function getServiceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function isSupabaseDbConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim())
  );
}

export async function loadSupabaseState(): Promise<ArenaPersistedState | null> {
  const client = getServiceClient();
  if (!client) return null;

  const { data, error } = await client
    .from("arena_state")
    .select("payload, updated_at")
    .eq("id", STATE_ROW_ID)
    .maybeSingle();

  if (error) throw error;
  if (!data?.payload) return null;

  const payload = data.payload as ArenaPersistedState;
  return {
    ...payload,
    updatedAt: data.updated_at ?? payload.updatedAt,
  };
}

export async function saveSupabaseState(state: ArenaPersistedState): Promise<void> {
  const client = getServiceClient();
  if (!client) throw new Error("Supabase not configured");

  const payload: ArenaPersistedState = {
    ...state,
    version: ARENA_STATE_VERSION,
    updatedAt: new Date().toISOString(),
  };

  const { error } = await client.from("arena_state").upsert({
    id: STATE_ROW_ID,
    payload,
    updated_at: payload.updatedAt,
  });

  if (error) throw error;
}

export async function appendSupabaseHistory(snapshot: EvaluationSnapshot): Promise<void> {
  const client = getServiceClient();
  if (!client) throw new Error("Supabase not configured");

  const { error } = await client.from("evaluation_snapshots").insert({
    id: snapshot.id,
    use_case_id: snapshot.useCaseId,
    use_case_title: snapshot.useCaseTitle,
    event_type: snapshot.eventType,
    payload: snapshot.payload,
    actor_email: snapshot.actorEmail ?? null,
    actor_name: snapshot.actorName ?? null,
    created_at: snapshot.createdAt,
  });

  if (error) throw error;
}

export async function listSupabaseHistory(
  useCaseId?: string,
  limit = 100
): Promise<EvaluationSnapshot[]> {
  const client = getServiceClient();
  if (!client) return [];

  let query = client
    .from("evaluation_snapshots")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (useCaseId) {
    query = query.eq("use_case_id", useCaseId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id as string,
    useCaseId: row.use_case_id as string,
    useCaseTitle: row.use_case_title as string,
    eventType: row.event_type as EvaluationSnapshot["eventType"],
    payload: row.payload as EvaluationSnapshot["payload"],
    actorEmail: (row.actor_email as string) ?? undefined,
    actorName: (row.actor_name as string) ?? undefined,
    createdAt: row.created_at as string,
  }));
}
