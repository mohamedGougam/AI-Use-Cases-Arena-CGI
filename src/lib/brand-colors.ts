/** 7X brand palette — aligned with https://www.7x.ae/ and official navy wordmark */
export const BRAND = {
  navy: "#001A33",
  navyMid: "#0A2847",
  navyLight: "#1E3A5F",
  black: "#000000",
  white: "#FFFFFF",
  accent: "#4DA3FF",
  accentBright: "#7BB8FF",
  accentCyan: "#00B8D9",
  muted: "#94A3B8",
} as const;

export const CHART_COLORS = [
  BRAND.accent,
  BRAND.navyLight,
  BRAND.accentBright,
  BRAND.accentCyan,
  BRAND.navyMid,
  BRAND.muted,
] as const;

export const CONFETTI_COLORS = [
  BRAND.accent,
  BRAND.navyLight,
  BRAND.accentBright,
] as const;
