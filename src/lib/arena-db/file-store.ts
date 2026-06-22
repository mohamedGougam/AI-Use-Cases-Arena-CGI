import { promises as fs } from "fs";
import path from "path";
import type { ArenaPersistedState, EvaluationSnapshot } from "@/lib/arena-db/types";
import { ARENA_STATE_VERSION } from "@/lib/arena-db/types";

const DATA_DIR = path.join(process.cwd(), "data");
const STATE_FILE = path.join(DATA_DIR, "arena-state.json");
const HISTORY_FILE = path.join(DATA_DIR, "arena-history.json");

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function loadFileState(): Promise<ArenaPersistedState | null> {
  try {
    const raw = await fs.readFile(STATE_FILE, "utf-8");
    return JSON.parse(raw) as ArenaPersistedState;
  } catch {
    return null;
  }
}

export async function saveFileState(state: ArenaPersistedState): Promise<void> {
  await ensureDataDir();
  const payload: ArenaPersistedState = {
    ...state,
    version: ARENA_STATE_VERSION,
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(STATE_FILE, JSON.stringify(payload, null, 2), "utf-8");
}

export async function loadFileHistory(): Promise<EvaluationSnapshot[]> {
  try {
    const raw = await fs.readFile(HISTORY_FILE, "utf-8");
    const parsed = JSON.parse(raw) as EvaluationSnapshot[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function appendFileHistory(snapshot: EvaluationSnapshot): Promise<void> {
  await ensureDataDir();
  const history = await loadFileHistory();
  history.unshift(snapshot);
  const capped = history.slice(0, 5000);
  await fs.writeFile(HISTORY_FILE, JSON.stringify(capped, null, 2), "utf-8");
}

export async function listFileHistory(useCaseId?: string, limit = 100): Promise<EvaluationSnapshot[]> {
  const history = await loadFileHistory();
  const filtered = useCaseId
    ? history.filter((h) => h.useCaseId === useCaseId)
    : history;
  return filtered.slice(0, limit);
}
