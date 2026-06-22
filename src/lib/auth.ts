export const AUTH_STORAGE_KEY = "ai-use-cases-arena-auth";

/** Internal email used for admin sessions (type Admin on the login screen). */
export const ADMIN_EMAIL = "arena-admin@cgi.com";
export const ADMIN_DISPLAY_NAME = "Administrator";

/** Internal email used for AI Architect sessions (type Architect on the login screen). */
export const ARCHITECT_EMAIL = "arena-architect@cgi.com";
export const ARCHITECT_DISPLAY_NAME = "AI Architect";

/** Internal identity for business-user sessions (type Business on the login screen). */
export const BUSINESS_EMAIL = "arena-business@cgi.com";
export const BUSINESS_DISPLAY_NAME = "Business User";

/** Retired admin identities — excluded from scoring and user lists. */
const LEGACY_ADMIN_EMAILS = new Set([
  "arena-admin@invest-nl.nl",
  "arena-admin@7x.ae",
]);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isAdminLogin(input: string): boolean {
  return input.trim().toLowerCase() === "admin";
}

export function isArchitectLogin(input: string): boolean {
  return input.trim().toLowerCase() === "architect";
}

export function isBusinessLogin(input: string): boolean {
  return input.trim().toLowerCase() === "business";
}

export function isArchitectEmail(email: string): boolean {
  return normalizeEmail(email) === ARCHITECT_EMAIL;
}

export function isBusinessEmail(email: string): boolean {
  return normalizeEmail(email) === BUSINESS_EMAIL;
}

/** Workshop participant (business user) — scored and can submit. */
export function isParticipantEmail(email: string): boolean {
  const normalized = normalizeEmail(email);
  return (
    isBusinessEmail(normalized) ||
    (isValidEmail(normalized) &&
      !isAdminEmail(normalized) &&
      !isArchitectEmail(normalized) &&
      !isLegacyInvestNlEmail(normalized))
  );
}

/** Facilitator (admin), AI Architect, or both — can access architect review tooling. */
export function canAccessArchitectTools(opts: {
  isAdmin: boolean;
  isArchitect: boolean;
}): boolean {
  return opts.isAdmin || opts.isArchitect;
}

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim().toLowerCase());
}

export function isAdminEmail(email: string): boolean {
  const normalized = normalizeEmail(email);
  return normalized === ADMIN_EMAIL || LEGACY_ADMIN_EMAILS.has(normalized);
}

/** True when the address is a retired @invest-nl.nl login (never scored). */
export function isLegacyInvestNlEmail(email: string): boolean {
  return normalizeEmail(email).endsWith("@invest-nl.nl");
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function getDisplayNameFromEmail(email: string): string {
  const normalized = normalizeEmail(email);
  if (normalized === ADMIN_EMAIL) return ADMIN_DISPLAY_NAME;
  if (normalized === ARCHITECT_EMAIL) return ARCHITECT_DISPLAY_NAME;
  if (normalized === BUSINESS_EMAIL) return BUSINESS_DISPLAY_NAME;
  const local = normalized.split("@")[0] ?? email;
  const name = local.replace(/[._-]+/g, " ").trim();
  if (!name) return email;
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getAvatarFromEmail(email: string): string {
  const normalized = normalizeEmail(email);
  if (normalized === ADMIN_EMAIL) return "AD";
  if (normalized === ARCHITECT_EMAIL) return "AR";
  if (normalized === BUSINESS_EMAIL) return "BU";
  const local = normalized.split("@")[0] ?? "";
  const parts = local.replace(/[._-]+/g, " ").trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  return local.slice(0, 2).toUpperCase() || "??";
}

/** Resolve the creator identity for private messaging on a use case. */
export function resolveUseCaseCreatorEmail(uc: {
  submitterEmail?: string;
  submitterId?: string;
  submitter?: string;
}): string {
  if (uc.submitterEmail?.includes("@")) {
    return normalizeEmail(uc.submitterEmail);
  }
  if (uc.submitterId?.includes("@")) {
    return normalizeEmail(uc.submitterId);
  }
  if (uc.submitter === BUSINESS_DISPLAY_NAME) {
    return BUSINESS_EMAIL;
  }
  return "";
}

export function isSameIdentity(a: string, b: string): boolean {
  return normalizeEmail(a) === normalizeEmail(b);
}
