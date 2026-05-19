import { ADMIN_EMAIL, normalizeEmail } from "@/lib/auth";

export const LOGIN_REGISTRY_KEY = "ai-use-cases-arena-known-users";

export interface KnownUser {
  email: string;
  firstSeenAt: string;
  lastSeenAt: string;
}

function loadRegistry(): KnownUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOGIN_REGISTRY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as KnownUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRegistry(users: KnownUser[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOGIN_REGISTRY_KEY, JSON.stringify(users));
}

/** Record a non-admin sign-in for the admin leaderboard user list. */
export function registerUserLogin(email: string): void {
  const normalized = normalizeEmail(email);
  if (!normalized.includes("@") || normalized === ADMIN_EMAIL) return;

  const now = new Date().toISOString();
  const registry = loadRegistry();
  const existing = registry.find((u) => u.email === normalized);

  if (existing) {
    existing.lastSeenAt = now;
  } else {
    registry.push({ email: normalized, firstSeenAt: now, lastSeenAt: now });
  }

  saveRegistry(registry);
}

export function getKnownUsers(): KnownUser[] {
  return loadRegistry().sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt));
}
