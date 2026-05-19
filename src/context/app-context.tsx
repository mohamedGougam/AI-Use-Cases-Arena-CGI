"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { initialUseCases, initialUsers } from "@/data/initial-data";
import { useAuth } from "@/context/auth-context";
import {
  ADMIN_DISPLAY_NAME,
  getAvatarFromEmail,
  getDisplayNameFromEmail,
  isAdminEmail,
  normalizeEmail,
} from "@/lib/auth";
import {
  buildParticipantScores,
  getParticipantScore,
  type ParticipantScore,
} from "@/lib/participants";
import {
  calculateInnovationScore,
  deriveUseCaseBadges,
  getDaysSinceCreated,
} from "@/lib/scoring";
import type {
  Comment,
  CreatorMessage,
  SubmitUseCaseInput,
  UseCase,
  User,
} from "@/types";

const STORAGE_KEY = "ai-use-cases-arena-state-v4";

interface PersistedState {
  useCases: UseCase[];
  votedUseCaseIds: string[];
}

interface AppContextValue {
  useCases: UseCase[];
  currentUser: User;
  myScore: ParticipantScore | null;
  participantScores: ParticipantScore[];
  votedUseCaseIds: string[];
  submitUseCase: (input: SubmitUseCaseInput) => UseCase;
  voteOnUseCase: (useCaseId: string) => boolean;
  unvoteOnUseCase: (useCaseId: string) => boolean;
  addComment: (useCaseId: string, text: string) => void;
  addCreatorMessage: (useCaseId: string, text: string) => boolean;
  hasVoted: (useCaseId: string) => boolean;
  getUseCasesByEmail: (email: string) => UseCase[];
}

const AppContext = createContext<AppContextValue | null>(null);

function migrateUseCase(uc: UseCase): UseCase {
  return {
    ...uc,
    voterEmails: uc.voterEmails ?? [],
    creatorMessages: uc.creatorMessages ?? [],
    submitterEmail:
      uc.submitterEmail ??
      (uc.submitterId?.includes("@") ? normalizeEmail(uc.submitterId) : ""),
  };
}

function loadState(): PersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    return {
      useCases: (parsed.useCases ?? []).map(migrateUseCase),
      votedUseCaseIds: parsed.votedUseCaseIds ?? [],
    };
  } catch {
    return null;
  }
}

function saveState(state: PersistedState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { email, isAdmin } = useAuth();
  const [useCases, setUseCases] = useState<UseCase[]>(
    initialUseCases.map(migrateUseCase)
  );
  const [votedUseCaseIds, setVotedUseCaseIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = loadState();
    if (saved) {
      setUseCases(saved.useCases);
      setVotedUseCaseIds(saved.votedUseCaseIds);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveState({ useCases, votedUseCaseIds });
  }, [useCases, votedUseCaseIds, hydrated]);

  const participantScores = useMemo(
    () => buildParticipantScores(useCases),
    [useCases]
  );

  const myScore = useMemo(
    () => (isAdmin ? null : getParticipantScore(useCases, email)),
    [useCases, email, isAdmin]
  );

  const currentUser = useMemo((): User => {
    const base = initialUsers[0];
    if (!email) return base;
    const normalized = normalizeEmail(email);
    const stats = myScore;
    const admin = isAdminEmail(normalized);
    return {
      ...base,
      id: normalized,
      email: normalized,
      name: admin ? ADMIN_DISPLAY_NAME : (stats?.name ?? getDisplayNameFromEmail(normalized)),
      avatar: admin ? "AD" : (stats?.avatar ?? getAvatarFromEmail(normalized)),
      points: admin ? 0 : (stats?.score ?? 0),
      badges: [],
      rank: "Explorer",
      votingStreak: 0,
    };
  }, [email, myScore]);

  const submitUseCase = useCallback(
    (input: SubmitUseCaseInput): UseCase => {
      if (!email) throw new Error("Must be signed in to submit");
      const normalized = normalizeEmail(email);
      const id = `uc-${Date.now()}`;
      const createdAt = new Date().toISOString();
      const base: UseCase = {
        id,
        title: input.title,
        description: input.description,
        businessProblem: input.businessProblem,
        proposedSolution: input.proposedSolution,
        department: input.department,
        category: input.category,
        impact: input.impact,
        effort: input.effort,
        tags: input.tags,
        votes: 0,
        voterIds: [],
        voterEmails: [],
        comments: [],
        creatorMessages: [],
        submitter: getDisplayNameFromEmail(normalized),
        submitterId: normalized,
        submitterEmail: normalized,
        createdAt,
        innovationScore: 0,
        status: "Submitted",
        badges: [],
      };
      base.innovationScore = calculateInnovationScore(
        0,
        base.impact,
        base.effort,
        0,
        0
      );
      base.badges = deriveUseCaseBadges(base);

      setUseCases((prev) => [base, ...prev]);
      return base;
    },
    [email, isAdmin]
  );

  const voteOnUseCase = useCallback(
    (useCaseId: string): boolean => {
      if (!email || votedUseCaseIds.includes(useCaseId)) return false;
      const normalized = normalizeEmail(email);

      setVotedUseCaseIds((prev) => [...prev, useCaseId]);

      setUseCases((prev) =>
        prev.map((uc) => {
          if (uc.id !== useCaseId) return uc;
          if (uc.voterEmails.includes(normalized)) return uc;

          const votes = uc.votes + 1;
          const voterEmails = [...uc.voterEmails, normalized];
          const voterIds = [...uc.voterIds, normalized];
          const updated: UseCase = {
            ...uc,
            votes,
            voterEmails,
            voterIds,
            innovationScore: calculateInnovationScore(
              votes,
              uc.impact,
              uc.effort,
              uc.comments.length,
              getDaysSinceCreated(uc.createdAt)
            ),
          };
          updated.badges = deriveUseCaseBadges(updated);
          return updated;
        })
      );

      return true;
    },
    [email, votedUseCaseIds]
  );

  const unvoteOnUseCase = useCallback(
    (useCaseId: string): boolean => {
      if (!email || !votedUseCaseIds.includes(useCaseId)) return false;
      const normalized = normalizeEmail(email);

      setVotedUseCaseIds((prev) => prev.filter((id) => id !== useCaseId));

      setUseCases((prev) =>
        prev.map((uc) => {
          if (uc.id !== useCaseId) return uc;
          if (!uc.voterEmails.includes(normalized)) return uc;

          const votes = Math.max(0, uc.votes - 1);
          const voterEmails = uc.voterEmails.filter((e) => e !== normalized);
          const voterIds = uc.voterIds.filter((id) => id !== normalized);
          const updated: UseCase = {
            ...uc,
            votes,
            voterEmails,
            voterIds,
            innovationScore: calculateInnovationScore(
              votes,
              uc.impact,
              uc.effort,
              uc.comments.length,
              getDaysSinceCreated(uc.createdAt)
            ),
          };
          updated.badges = deriveUseCaseBadges(updated);
          return updated;
        })
      );

      return true;
    },
    [email, votedUseCaseIds]
  );

  const addComment = useCallback(
    (useCaseId: string, text: string) => {
      if (!email || isAdmin) return;
      const normalized = normalizeEmail(email);
      const comment: Comment = {
        id: `comment-${Date.now()}`,
        useCaseId,
        userId: normalized,
        userEmail: normalized,
        userName: getDisplayNameFromEmail(normalized),
        text,
        createdAt: new Date().toISOString(),
      };

      setUseCases((prev) =>
        prev.map((uc) => {
          if (uc.id !== useCaseId) return uc;
          const comments = [...uc.comments, comment];
          const updated: UseCase = {
            ...uc,
            comments,
            innovationScore: calculateInnovationScore(
              uc.votes,
              uc.impact,
              uc.effort,
              comments.length,
              getDaysSinceCreated(uc.createdAt)
            ),
          };
          updated.badges = deriveUseCaseBadges(updated);
          return updated;
        })
      );
    },
    [email, isAdmin]
  );

  const addCreatorMessage = useCallback(
    (useCaseId: string, text: string): boolean => {
      if (!email || !text.trim()) return false;
      const normalized = normalizeEmail(email);
      const useCase = useCases.find((uc) => uc.id === useCaseId);
      if (!useCase) return false;

      const creatorEmail = normalizeEmail(useCase.submitterEmail || "");
      if (!creatorEmail) return false;
      if (normalized === creatorEmail) return false;

      const message: CreatorMessage = {
        id: `creator-msg-${Date.now()}`,
        useCaseId,
        fromEmail: normalized,
        fromName: isAdminEmail(normalized)
          ? ADMIN_DISPLAY_NAME
          : getDisplayNameFromEmail(normalized),
        text: text.trim(),
        createdAt: new Date().toISOString(),
      };

      setUseCases((prev) =>
        prev.map((uc) =>
          uc.id === useCaseId
            ? { ...uc, creatorMessages: [...uc.creatorMessages, message] }
            : uc
        )
      );
      return true;
    },
    [email, useCases]
  );

  const hasVoted = useCallback(
    (useCaseId: string) => votedUseCaseIds.includes(useCaseId),
    [votedUseCaseIds]
  );

  const getUseCasesByEmail = useCallback(
    (targetEmail: string) => {
      const normalized = normalizeEmail(targetEmail);
      return useCases.filter(
        (uc) =>
          uc.submitterEmail === normalized ||
          normalizeEmail(uc.submitterEmail || "") === normalized
      );
    },
    [useCases]
  );

  const value = useMemo(
    () => ({
      useCases,
      currentUser,
      myScore,
      participantScores,
      votedUseCaseIds,
      submitUseCase,
      voteOnUseCase,
      unvoteOnUseCase,
      addComment,
      addCreatorMessage,
      hasVoted,
      getUseCasesByEmail,
    }),
    [
      useCases,
      currentUser,
      myScore,
      participantScores,
      votedUseCaseIds,
      submitUseCase,
      voteOnUseCase,
      unvoteOnUseCase,
      addComment,
      addCreatorMessage,
      hasVoted,
      getUseCasesByEmail,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
