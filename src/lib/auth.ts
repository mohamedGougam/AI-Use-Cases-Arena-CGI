export const AUTH_STORAGE_KEY = "ai-use-cases-arena-auth";

/** Internal email used for admin sessions (type Admin on the login screen). */
export const ADMIN_EMAIL = "arena-admin@7x.ae";
export const ADMIN_DISPLAY_NAME = "Arena Admin";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isAdminLogin(input: string): boolean {
  return input.trim().toLowerCase() === "admin";
}

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim().toLowerCase());
}

export function isAdminEmail(email: string): boolean {
  return normalizeEmail(email) === ADMIN_EMAIL;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function getDisplayNameFromEmail(email: string): string {
  const local = normalizeEmail(email).split("@")[0] ?? email;
  const name = local.replace(/[._-]+/g, " ").trim();
  if (!name) return email;
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getAvatarFromEmail(email: string): string {
  const local = normalizeEmail(email).split("@")[0] ?? "";
  const parts = local.replace(/[._-]+/g, " ").trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  return local.slice(0, 2).toUpperCase() || "??";
}
