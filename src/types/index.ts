import type { Department } from "@/lib/constants";

export type ImpactLevel = "Low" | "Medium" | "High";
export type EffortLevel = "Low" | "Medium" | "High";
export type UseCaseStatus = "Submitted" | "Under Review" | "Prioritized" | "In Progress" | "Completed";

export type UseCaseCategory =
  | "Network Intelligence"
  | "5G Innovation"
  | "Fiber Expansion"
  | "Customer Experience"
  | "Contact Center AI"
  | "Cybersecurity"
  | "Fraud Detection"
  | "Revenue Assurance"
  | "Predictive Maintenance"
  | "Field Technician Productivity"
  | "Data & Analytics"
  | "Generative AI"
  | "AI Agents"
  | "Document Intelligence"
  | "Knowledge Management"
  | "Sales Enablement"
  | "Enterprise Solutions"
  | "IoT"
  | "Smart Cities"
  | "Sustainability"
  | "Operations Optimization"
  | "Wholesale Services"
  | "TV & Media Services"
  | "Regulatory Compliance";

export type GamificationBadgeId =
  | "ai-explorer"
  | "innovation-champion"
  | "top-contributor"
  | "quick-win-finder"
  | "popular-idea"
  | "arena-champion"
  | "strategic-thinker"
  | "collaboration-hero"
  | "solution-architect"
  | "data-champion"
  | "ai-strategist"
  | "telecom-innovator"
  | "innovation-leader"
  | "cgi-ai-master";

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

/** Detailed brief uploaded by the AI Architect for richer readiness analysis. */
export interface ArchitectDocumentBrief {
  fileName: string;
  mimeType: string;
  extractedText: string;
  wordCount: number;
  charCount: number;
  analyzedAt: string;
  modelId: string;
  modelName: string;
  extractionMethod: "local" | "hf-enhanced";
  analysisSummary?: string;
}

/** Architect adjustments based on workshop experience (persisted per use case). */
export interface ArchitectOverrideEntry {
  value: string | number | boolean;
  architectNote?: string;
}

export interface ArchitectOverrides {
  fields: Record<string, ArchitectOverrideEntry>;
  updatedAt: string;
  updatedByEmail: string;
  updatedByName: string;
}

/** OpenAI-generated architecture recommendation cached per use case. */
export interface ArchitectAiRecommendation {
  pattern: string;
  technologies: string[];
  confidence: number;
  rationale: string;
  model: string;
  generatedAt: string;
  inputFingerprint: string;
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
  architectBrief?: ArchitectDocumentBrief;
  architectOverrides?: ArchitectOverrides;
  architectAiRecommendation?: ArchitectAiRecommendation;
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
