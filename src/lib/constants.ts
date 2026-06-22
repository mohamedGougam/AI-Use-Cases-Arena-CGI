import type { UseCaseCategory, Badge, RankLevel } from "@/types";

export const TELECOM_DEPARTMENTS = [
  "Network Operations",
  "Mobile Network Engineering",
  "Fiber Network & Rollout",
  "Customer Care & Contact Centers",
  "Consumer Business",
  "Enterprise Business",
  "Wholesale",
  "Cybersecurity",
  "IT Platforms & Applications",
  "Data & Analytics",
  "Field Services",
  "IoT & Connected Devices",
  "TV & Entertainment Services",
  "Sales & Commercial Operations",
  "Finance & Revenue Assurance",
  "Supply Chain & Assets",
  "Regulatory & Compliance",
  "HR & Workforce Transformation",
  "Sustainability",
  "Partner Ecosystem",
] as const;

export const DEPARTMENTS = TELECOM_DEPARTMENTS;

export type Department = (typeof DEPARTMENTS)[number];

/** Legacy labels from earlier builds; mapped to current dropdown values. */
const DEPARTMENT_LEGACY_ALIASES: Record<string, Department> = {
  Investment: "Finance & Revenue Assurance",
  Capital: "Finance & Revenue Assurance",
  "Market Development": "Sales & Commercial Operations",
  HR: "HR & Workforce Transformation",
  Finance: "Finance & Revenue Assurance",
  Operations: "Network Operations",
  "Relationship Management": "Consumer Business",
  "Data management related": "Data & Analytics",
  "IT related": "IT Platforms & Applications",
  "Cyber Security": "Cybersecurity",
};

/** Map stored labels to a value from {@link DEPARTMENTS}. */
export function normalizeDepartment(value: string): Department {
  const trimmed = value.trim();
  if (isKnownDepartment(trimmed)) return trimmed;
  const legacy = DEPARTMENT_LEGACY_ALIASES[trimmed];
  if (legacy) return legacy;
  return trimmed as Department;
}

export function isKnownDepartment(value: string): value is Department {
  return (DEPARTMENTS as readonly string[]).includes(value.trim());
}

/** Compare departments after legacy alias resolution. */
export function departmentsMatch(a: string, b: string): boolean {
  return normalizeDepartment(a) === normalizeDepartment(b);
}

export function isCanonicalDepartment(value: string): boolean {
  return isKnownDepartment(normalizeDepartment(value));
}

/** Label for UI: canonical name from {@link DEPARTMENTS} when possible. */
export function getDisplayDepartment(value: string): string {
  const normalized = normalizeDepartment(value);
  return isKnownDepartment(normalized) ? normalized : value;
}

export const TELECOM_CATEGORIES = [
  "Network Intelligence",
  "5G Innovation",
  "Fiber Expansion",
  "Customer Experience",
  "Contact Center AI",
  "Cybersecurity",
  "Fraud Detection",
  "Revenue Assurance",
  "Predictive Maintenance",
  "Field Technician Productivity",
  "Data & Analytics",
  "Generative AI",
  "AI Agents",
  "Document Intelligence",
  "Knowledge Management",
  "Sales Enablement",
  "Enterprise Solutions",
  "IoT",
  "Smart Cities",
  "Sustainability",
  "Operations Optimization",
  "Wholesale Services",
  "TV & Media Services",
  "Regulatory Compliance",
] as const;

export const CATEGORIES: UseCaseCategory[] = [...TELECOM_CATEGORIES];

export const TELECOM_IMPACT_AREAS = [
  "Mobile Network",
  "Fiber Network",
  "OSS",
  "BSS",
  "CRM",
  "Contact Center",
  "Security",
  "Data Platform",
  "Wholesale",
  "TV Services",
  "IoT",
] as const;

export const IMPACT_LEVELS = ["Low", "Medium", "High"] as const;
export const EFFORT_LEVELS = ["Low", "Medium", "High"] as const;

/** @deprecated Use SCORE_POINTS from @/lib/participants */
export const XP_REWARDS = {
  submitUseCase: 10,
  receiveVote: 2,
  castVote: 1,
  addComment: 1,
} as const;

export const RANK_THRESHOLDS: { level: RankLevel; minPoints: number }[] = [
  { level: "Arena Champion", minPoints: 500 },
  { level: "Visionary", minPoints: 300 },
  { level: "Strategist", minPoints: 150 },
  { level: "Challenger", minPoints: 50 },
  { level: "Explorer", minPoints: 0 },
];

export const GAMIFICATION_BADGES: Badge[] = [
  { id: "ai-explorer", name: "AI Explorer", description: "Submitted your first use case", icon: "compass" },
  { id: "innovation-champion", name: "Innovation Champion", description: "Earned 200+ XP", icon: "trophy" },
  { id: "top-contributor", name: "Top Contributor", description: "Submitted 3+ use cases", icon: "star" },
  { id: "quick-win-finder", name: "Quick Win Finder", description: "Identified a high-impact, low-effort idea", icon: "zap" },
  { id: "popular-idea", name: "Popular Idea", description: "Received 20+ votes on a use case", icon: "heart" },
  { id: "arena-champion", name: "Arena Champion", description: "Reached Arena Champion rank", icon: "crown" },
  { id: "strategic-thinker", name: "Strategic Thinker", description: "Submitted a strategic bet use case", icon: "brain" },
  { id: "collaboration-hero", name: "Collaboration Hero", description: "Added 5+ comments", icon: "users" },
  { id: "solution-architect", name: "Solution Architect", description: "Achieved high architecture completeness on a use case", icon: "layers" },
  { id: "data-champion", name: "Data Champion", description: "Demonstrated strong data readiness in submissions", icon: "database" },
  { id: "ai-strategist", name: "AI Strategist", description: "Submitted strategic telecom AI opportunities", icon: "target" },
  { id: "telecom-innovator", name: "Telecom Innovator", description: "Contributed to network or customer-facing innovation", icon: "radio" },
  { id: "innovation-leader", name: "Innovation Leader", description: "Top portfolio contributor with high readiness scores", icon: "award" },
  { id: "cgi-ai-master", name: "CGI AI Master", description: "Exceptional completeness across business, data, and architecture", icon: "sparkles" },
];

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "layout-dashboard" },
  { href: "/submit", label: "Submit Use Case", icon: "plus-circle", hideForAdmin: true, hideForArchitect: true },
  { href: "/gallery", label: "Use Case Gallery", icon: "grid-3x3" },
  { href: "/insights", label: "Insights", icon: "bar-chart-3" },
  { href: "/portfolio", label: "Portfolio Analysis", icon: "briefcase", executiveOnly: true },
  { href: "/leaderboard", label: "Leaderboard", icon: "trophy", adminOnly: true },
  { href: "/battle", label: "Department Battle", icon: "swords" },
] as const;

export const CURRENT_USER_ID = "user-current";
