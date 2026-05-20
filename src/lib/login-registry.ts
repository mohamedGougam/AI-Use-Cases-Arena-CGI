import { isAdminEmail, isLegacyInvestNlEmail, normalizeEmail } from "@/lib/auth";

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

/** Remove admin and retired Invest-NL accounts from the signed-in user registry. */
export function purgeNonParticipantAccounts(): void {
  const registry = loadRegistry().filter((u) => !isAdminEmail(u.email) && !isLegacyInvestNlEmail(u.email));
  saveRegistry(registry);
}

/** Record a participant sign-in for the admin leaderboard user list. */
export function registerUserLogin(email: string): void {
  const normalized = normalizeEmail(email);
  if (!normalized.includes("@") || isAdminEmail(normalized) || isLegacyInvestNlEmail(normalized)) {
    return;
  }

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
  purgeNonParticipantAccounts();
  return loadRegistry()
    .filter((u) => !isAdminEmail(u.email) && !isLegacyInvestNlEmail(u.email))
    .sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt));
}
