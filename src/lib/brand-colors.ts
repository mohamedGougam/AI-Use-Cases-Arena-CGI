/** CGI brand palette — [CGI.com](https://www.cgi.com/en), logo red #E31937 per CGI guidelines */
export const BRAND = {
  red: "#E31937",
  redDark: "#B8142C",
  charcoal: "#1F2937",
  ink: "#111827",
  white: "#FFFFFF",
  surface: "#F8FAFC",
  slate: "#64748B",
  coral: "#FCA5A5",
  roseDeep: "#881337",
} as const;

export const CHART_COLORS = [
  BRAND.red,
  BRAND.charcoal,
  BRAND.redDark,
  BRAND.slate,
  BRAND.coral,
  BRAND.roseDeep,
] as const;

export const CONFETTI_COLORS = [BRAND.red, BRAND.coral, BRAND.white] as const;
