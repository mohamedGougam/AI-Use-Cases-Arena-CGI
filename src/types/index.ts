import type { Department } from "@/lib/constants";

export type ImpactLevel = "Low" | "Medium" | "High";
export type EffortLevel = "Low" | "Medium" | "High";
export type UseCaseStatus = "Submitted" | "Under Review" | "Prioritized" | "In Progress" | "Completed";

export type UseCaseCategory =
  | "Productivity"
  | "Risk"
  | "Customer Experience"
  | "Finance"
  | "Operations"
  | "ESG"
  | "Investment Analysis"
  | "Legal"
  | "HR"
  | "Other";

export type GamificationBadgeId =
  | "ai-explorer"
  | "innovation-champion"
  | "top-contributor"
  | "quick-win-finder"
  | "popular-idea"
  | "arena-champion"
  | "strategic-thinker"
  | "collaboration-hero";

export type RankLevel =
  | "Explorer"
  | "Challenger"
  | "Strategist"
  | "Visionary"
  | "Arena Champion";

export type UseCaseBadge =
  | "Trending"
  | "High Impact"
  | "Quick Win"
  | "Strategic Bet"
  | "Crowd Favorite";

export interface User {
  id: string;
  email?: string;
  name: string;
  department: Department;
  avatar: string;
  points: number;
  badges: GamificationBadgeId[];
  rank: RankLevel;
  votingStreak: number;
}

export interface Comment {
  id: string;
  useCaseId: string;
  userId: string;
  userEmail?: string;
  userName: string;
  text: string;
  createdAt: string;
}

/** Private feedback visible to the use case creator (and admin). */
export interface CreatorMessage {
  id: string;
  useCaseId: string;
  fromEmail: string;
  fromName: string;
  text: string;
  createdAt: string;
}

export interface Vote {
  id: string;
  useCaseId: string;
  userId: string;
  createdAt: string;
}

export interface Badge {
  id: GamificationBadgeId;
  name: string;
  description: string;
  icon: string;
}

export interface UseCase {
  id: string;
  title: string;
  description: string;
  businessProblem: string;
  proposedSolution: string;
  department: Department;
  category: UseCaseCategory;
  impact: ImpactLevel;
  effort: EffortLevel;
  tags: string[];
  votes: number;
  voterIds: string[];
  voterEmails: string[];
  comments: Comment[];
  creatorMessages: CreatorMessage[];
  submitter: string;
  submitterId: string;
  submitterEmail: string;
  createdAt: string;
  innovationScore: number;
  status: UseCaseStatus;
  badges: UseCaseBadge[];
}

export interface DepartmentStats {
  department: Department;
  useCaseCount: number;
  totalVotes: number;
  innovationScore: number;
  engagement: number;
}

export type SortOption =
  | "most-votes"
  | "newest"
  | "highest-impact"
  | "lowest-effort"
  | "trending"
  | "quick-wins";

export interface UseCaseFilters {
  department?: Department;
  category?: UseCaseCategory;
  impact?: ImpactLevel;
  effort?: EffortLevel;
  tag?: string;
  search?: string;
}

export interface SubmitUseCaseInput {
  title: string;
  description: string;
  businessProblem: string;
  proposedSolution: string;
  department: Department;
  impact: ImpactLevel;
  effort: EffortLevel;
  category: UseCaseCategory;
  tags: string[];
  submitterName: string;
}
