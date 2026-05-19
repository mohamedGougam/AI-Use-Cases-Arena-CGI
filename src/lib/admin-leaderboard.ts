import {
  getDisplayNameFromEmail,
  getAvatarFromEmail,
  isAdminEmail,
} from "@/lib/auth";
import type { KnownUser } from "@/lib/login-registry";
import {
  buildParticipantScores,
  type ParticipantScore,
} from "@/lib/participants";
import type { UseCase } from "@/types";

export interface AdminContributorRow {
  email: string;
  name: string;
  avatar: string;
  submissions: number;
  votesCast: number;
  votesReceived: number;
  comments: number;
  score: number;
  lastSignedInAt: string | null;
  rank: number;
}

export function buildAdminContributorRows(
  useCases: UseCase[],
  knownUsers: KnownUser[]
): AdminContributorRow[] {
  const scores = buildParticipantScores(useCases);
  const byEmail = new Map<string, ParticipantScore>();
  for (const s of scores) {
    byEmail.set(s.email, s);
  }

  const emails = new Set<string>();
  for (const u of knownUsers) {
    if (!isAdminEmail(u.email)) emails.add(u.email);
  }
  for (const s of scores) emails.add(s.email);

  const lastSeen = new Map(knownUsers.map((u) => [u.email, u.lastSeenAt]));

  const rows = [...emails].map((email) => {
    const stats = byEmail.get(email);
    return {
      email,
      name: stats?.name ?? getDisplayNameFromEmail(email),
      avatar: stats?.avatar ?? getAvatarFromEmail(email),
      submissions: stats?.submissions ?? 0,
      votesCast: stats?.votesCast ?? 0,
      votesReceived: stats?.votesReceived ?? 0,
      comments: stats?.comments ?? 0,
      score: stats?.score ?? 0,
      lastSignedInAt: lastSeen.get(email) ?? null,
    };
  });

  rows.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.submissions !== a.submissions) return b.submissions - a.submissions;
    return a.email.localeCompare(b.email);
  });

  return rows.map((row, i) => ({ ...row, rank: i + 1 }));
}

export function getAdminTotals(useCases: UseCase[]) {
  const totalUseCases = useCases.length;
  const totalVotes = useCases.reduce((sum, uc) => sum + uc.votes, 0);
  return { totalUseCases, totalVotes };
}
