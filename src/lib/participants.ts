import {
  getAvatarFromEmail,
  getDisplayNameFromEmail,
  isAdminEmail,
  isArchitectEmail,
  isLegacyInvestNlEmail,
  normalizeEmail,
} from "@/lib/auth";
import type { UseCase } from "@/types";

/** Simple, transparent scoring — shown on the leaderboard help card. */
export const SCORE_POINTS = {
  submit: 10,
  voteReceived: 2,
  voteCast: 1,
  comment: 1,
  businessCompleteness: 10,
  dataCompleteness: 10,
  architectureCompleteness: 10,
  riskIdentification: 10,
  estimationAccuracy: 10,
} as const;

export const SCORE_RULES = [
  { label: "Submit a use case", points: SCORE_POINTS.submit },
  { label: "Each vote your idea receives", points: SCORE_POINTS.voteReceived },
  { label: "Vote on someone else's idea", points: SCORE_POINTS.voteCast },
  { label: "Leave a comment", points: SCORE_POINTS.comment },
  { label: "Business completeness (rich problem & value)", points: SCORE_POINTS.businessCompleteness },
  { label: "Data completeness (data sources documented)", points: SCORE_POINTS.dataCompleteness },
  { label: "Architecture completeness (solution detail)", points: SCORE_POINTS.architectureCompleteness },
  { label: "Risk identification (security & compliance)", points: SCORE_POINTS.riskIdentification },
  { label: "Estimation readiness (delivery context)", points: SCORE_POINTS.estimationAccuracy },
] as const;

export interface ParticipantScore {
  email: string;
  name: string;
  avatar: string;
  submissions: number;
  votesReceived: number;
  votesCast: number;
  comments: number;
  completenessBonus: number;
  score: number;
}

function resolveSubmitterEmail(uc: UseCase): string | null {
  if (uc.submitterEmail) return normalizeEmail(uc.submitterEmail);
  if (uc.submitterId?.includes("@")) return normalizeEmail(uc.submitterId);
  return null;
}

function wordCount(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function computeSubmissionBonuses(uc: UseCase): number {
  let bonus = 0;
  const titleDesc = [uc.title, uc.description].join(" ").toLowerCase();
  const analysis = uc.architectBrief?.extractedText
    ? [titleDesc, uc.architectBrief.extractedText, ...uc.tags].join(" ").toLowerCase()
    : [titleDesc, uc.category, uc.department, ...uc.tags].join(" ").toLowerCase();

  if (wordCount(uc.title) >= 3 && wordCount(uc.description) >= 8) {
    bonus += SCORE_POINTS.businessCompleteness;
  }
  if (/data|database|crm|oss|bss|warehouse|lake/.test(analysis)) {
    bonus += SCORE_POINTS.dataCompleteness;
  }
  if (/solution|model|ai|llm|rag|agent|automation/.test(analysis)) {
    bonus += SCORE_POINTS.architectureCompleteness;
  }
  if (/security|gdpr|privacy|pii|compliance|fraud/.test(analysis)) {
    bonus += SCORE_POINTS.riskIdentification;
  }
  if (/timeline|budget|sponsor|team|roadmap|milestone/.test(analysis)) {
    bonus += SCORE_POINTS.estimationAccuracy;
  }

  return bonus;
}

function isExcludedParticipant(email: string): boolean {
  return isAdminEmail(email) || isArchitectEmail(email) || isLegacyInvestNlEmail(email);
}

export function buildParticipantScores(useCases: UseCase[]): ParticipantScore[] {
  const map = new Map<string, ParticipantScore>();

  const ensure = (rawEmail: string): ParticipantScore | null => {
    if (!rawEmail?.includes("@")) return null;
    const email = normalizeEmail(rawEmail);
    if (isExcludedParticipant(email)) return null;
    let entry = map.get(email);
    if (!entry) {
      entry = {
        email,
        name: getDisplayNameFromEmail(email),
        avatar: getAvatarFromEmail(email),
        submissions: 0,
        votesReceived: 0,
        votesCast: 0,
        comments: 0,
        completenessBonus: 0,
        score: 0,
      };
      map.set(email, entry);
    }
    return entry;
  };

  for (const uc of useCases) {
    const submitter = resolveSubmitterEmail(uc);
    if (submitter) {
      const p = ensure(submitter);
      if (p) {
        p.submissions += 1;
        p.votesReceived += uc.votes;
        p.completenessBonus += computeSubmissionBonuses(uc);
      }
    }

    const voters = uc.voterEmails?.length
      ? uc.voterEmails
      : uc.voterIds.filter((id) => id.includes("@"));
    for (const voter of voters) {
      const v = ensure(voter);
      if (v) v.votesCast += 1;
    }

    for (const c of uc.comments) {
      const author = c.userEmail ?? (c.userId.includes("@") ? c.userId : null);
      if (!author) continue;
      const a = ensure(author);
      if (a) a.comments += 1;
    }
  }

  for (const p of map.values()) {
    p.score =
      p.submissions * SCORE_POINTS.submit +
      p.votesReceived * SCORE_POINTS.voteReceived +
      p.votesCast * SCORE_POINTS.voteCast +
      p.comments * SCORE_POINTS.comment +
      p.completenessBonus;
  }

  return [...map.values()].sort((a, b) => b.score - a.score);
}

export function getParticipantScore(
  useCases: UseCase[],
  email: string | null,
  scores?: ParticipantScore[]
): ParticipantScore | null {
  if (!email || isExcludedParticipant(email)) return null;
  const normalized = normalizeEmail(email);
  const list = scores ?? buildParticipantScores(useCases);
  return (
    list.find((p) => p.email === normalized) ?? {
      email: normalized,
      name: getDisplayNameFromEmail(normalized),
      avatar: getAvatarFromEmail(normalized),
      submissions: 0,
      votesReceived: 0,
      votesCast: 0,
      comments: 0,
      completenessBonus: 0,
      score: 0,
    }
  );
}

export function formatEmailTag(email: string): string {
  return normalizeEmail(email);
}

/** True when the signed-in user ties or holds the highest participant score. */
export function isParticipantScoreLeader(
  email: string | null | undefined,
  scores: ParticipantScore[]
): boolean {
  if (!email || scores.length === 0) return false;
  const topScore = scores[0].score;
  if (topScore <= 0) return false;
  const normalized = normalizeEmail(email);
  const entry = scores.find((p) => p.email === normalized);
  return entry !== undefined && entry.score === topScore;
}
