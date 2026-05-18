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
import { initialUseCases, initialUsers } from "@/data/mock-data";
import { CURRENT_USER_ID, XP_REWARDS } from "@/lib/constants";
import {
  calculateInnovationScore,
  deriveUseCaseBadges,
  getDaysSinceCreated,
  getRankFromPoints,
} from "@/lib/scoring";
import type {
  Comment,
  SubmitUseCaseInput,
  UseCase,
  User,
} from "@/types";

const STORAGE_KEY = "ai-use-cases-arena-state";

interface PersistedState {
  useCases: UseCase[];
  users: User[];
  votedUseCaseIds: string[];
  commentCount: number;
  submittedCount: number;
}

interface AppContextValue {
  useCases: UseCase[];
  users: User[];
  currentUser: User;
  votedUseCaseIds: string[];
  submitUseCase: (input: SubmitUseCaseInput) => UseCase;
  voteOnUseCase: (useCaseId: string) => boolean;
  addComment: (useCaseId: string, text: string) => void;
  hasVoted: (useCaseId: string) => boolean;
  getUserById: (id: string) => User | undefined;
}

const AppContext = createContext<AppContextValue | null>(null);

function loadState(): PersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

function saveState(state: PersistedState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [useCases, setUseCases] = useState<UseCase[]>(initialUseCases);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [votedUseCaseIds, setVotedUseCaseIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = loadState();
    if (saved) {
      setUseCases(saved.useCases);
      setUsers(saved.users);
      setVotedUseCaseIds(saved.votedUseCaseIds);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveState({
      useCases,
      users,
      votedUseCaseIds,
      commentCount: 0,
      submittedCount: 0,
    });
  }, [useCases, users, votedUseCaseIds, hydrated]);

  const currentUser = useMemo(
    () => users.find((u) => u.id === CURRENT_USER_ID) ?? users[0],
    [users]
  );

  const updateCurrentUserPoints = useCallback((delta: number) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== CURRENT_USER_ID) return u;
        const points = u.points + delta;
        return {
          ...u,
          points,
          rank: getRankFromPoints(points),
          badges:
            points >= 200 && !u.badges.includes("innovation-champion")
              ? [...u.badges, "innovation-champion"]
              : u.badges,
        };
      })
    );
  }, []);

  const awardSubmitterVotePoints = useCallback((submitterId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== submitterId) return u;
        const points = u.points + XP_REWARDS.receiveVote;
        return { ...u, points, rank: getRankFromPoints(points) };
      })
    );
  }, []);

  const submitUseCase = useCallback(
    (input: SubmitUseCaseInput): UseCase => {
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
        comments: [],
        submitter: input.submitterName,
        submitterId: CURRENT_USER_ID,
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
      updateCurrentUserPoints(XP_REWARDS.submitUseCase);

      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== CURRENT_USER_ID) return u;
          const badges = u.badges.includes("ai-explorer")
            ? u.badges
            : [...u.badges, "ai-explorer" as const];
          return { ...u, badges };
        })
      );

      return base;
    },
    [updateCurrentUserPoints]
  );

  const voteOnUseCase = useCallback(
    (useCaseId: string): boolean => {
      if (votedUseCaseIds.includes(useCaseId)) return false;

      setVotedUseCaseIds((prev) => [...prev, useCaseId]);
      updateCurrentUserPoints(XP_REWARDS.castVote);

      setUseCases((prev) =>
        prev.map((uc) => {
          if (uc.id !== useCaseId) return uc;
          const votes = uc.votes + 1;
          const voterIds = [...uc.voterIds, CURRENT_USER_ID];
          const updated: UseCase = {
            ...uc,
            votes,
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
          awardSubmitterVotePoints(uc.submitterId);
          return updated;
        })
      );

      return true;
    },
    [votedUseCaseIds, updateCurrentUserPoints, awardSubmitterVotePoints]
  );

  const addComment = useCallback(
    (useCaseId: string, text: string) => {
      const comment: Comment = {
        id: `comment-${Date.now()}`,
        useCaseId,
        userId: CURRENT_USER_ID,
        userName: currentUser.name,
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

      updateCurrentUserPoints(XP_REWARDS.addComment);
    },
    [currentUser.name, updateCurrentUserPoints]
  );

  const hasVoted = useCallback(
    (useCaseId: string) => votedUseCaseIds.includes(useCaseId),
    [votedUseCaseIds]
  );

  const getUserById = useCallback(
    (id: string) => users.find((u) => u.id === id),
    [users]
  );

  const value = useMemo(
    () => ({
      useCases,
      users,
      currentUser,
      votedUseCaseIds,
      submitUseCase,
      voteOnUseCase,
      addComment,
      hasVoted,
      getUserById,
    }),
    [
      useCases,
      users,
      currentUser,
      votedUseCaseIds,
      submitUseCase,
      voteOnUseCase,
      addComment,
      hasVoted,
      getUserById,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
