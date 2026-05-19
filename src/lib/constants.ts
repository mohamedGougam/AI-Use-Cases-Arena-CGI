import type { UseCaseCategory, Badge, RankLevel } from "@/types";

export const DEPARTMENTS = [
  "Capital",
  "Market Development",
  "HR",
  "Finance",
  "Operations",
  "Relationship Management",
  "Data management related",
  "IT related",
  "Cyber Security",
] as const;

export const CATEGORIES: UseCaseCategory[] = [
  "Productivity",
  "Risk",
  "Customer Experience",
  "Finance",
  "Operations",
  "ESG",
  "Investment Analysis",
  "Legal",
  "HR",
  "Other",
];

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
];

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "layout-dashboard" },
  { href: "/submit", label: "Submit Use Case", icon: "plus-circle", hideForAdmin: true },
  { href: "/gallery", label: "Use Case Gallery", icon: "grid-3x3" },
  { href: "/insights", label: "Insights", icon: "bar-chart-3" },
  { href: "/leaderboard", label: "Leaderboard", icon: "trophy", adminOnly: true },
  { href: "/battle", label: "Department Battle", icon: "swords" },
] as const;

export const CURRENT_USER_ID = "user-current";
