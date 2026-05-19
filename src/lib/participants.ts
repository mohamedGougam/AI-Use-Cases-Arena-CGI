import {
  ADMIN_EMAIL,
  getAvatarFromEmail,
  getDisplayNameFromEmail,
  isAdminEmail,
  normalizeEmail,
} from "@/lib/auth";
import type { UseCase } from "@/types";

/** Simple, transparent scoring — shown on the leaderboard help card. */
export const SCORE_POINTS = {
  submit: 10,
  voteReceived: 2,
  voteCast: 1,
  comment: 1,
} as const;

export const SCORE_RULES = [
  { label: "Submit a use case", points: SCORE_POINTS.submit },
  { label: "Each vote your idea receives", points: SCORE_POINTS.voteReceived },
  { label: "Vote on someone else's idea", points: SCORE_POINTS.voteCast },
  { label: "Leave a comment", points: SCORE_POINTS.comment },
] as const;

export interface ParticipantScore {
  email: string;
  name: string;
  avatar: string;
  submissions: number;
  votesReceived: number;
  votesCast: number;
  comments: number;
  score: number;
}

function resolveSubmitterEmail(uc: UseCase): string | null {
  if (uc.submitterEmail) return normalizeEmail(uc.submitterEmail);
  if (uc.submitterId?.includes("@")) return normalizeEmail(uc.submitterId);
  return null;
}

export function buildParticipantScores(useCases: UseCase[]): ParticipantScore[] {
  const map = new Map<string, ParticipantScore>();

  const ensure = (rawEmail: string): ParticipantScore | null => {
    if (!rawEmail?.includes("@")) return null;
    const email = normalizeEmail(rawEmail);
    if (email === ADMIN_EMAIL || isAdminEmail(email)) return null;
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
      p.comments * SCORE_POINTS.comment;
  }

  return [...map.values()].sort((a, b) => b.score - a.score);
}

export function getParticipantScore(
  useCases: UseCase[],
  email: string | null
): ParticipantScore | null {
  if (!email || isAdminEmail(email)) return null;
  const normalized = normalizeEmail(email);
  return (
    buildParticipantScores(useCases).find((p) => p.email === normalized) ?? {
      email: normalized,
      name: getDisplayNameFromEmail(normalized),
      avatar: getAvatarFromEmail(normalized),
      submissions: 0,
      votesReceived: 0,
      votesCast: 0,
      comments: 0,
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
