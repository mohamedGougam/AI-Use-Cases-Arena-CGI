"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  startTransition,
  type ReactNode,
} from "react";
import { initialUseCases, initialUsers } from "@/data/initial-data";
import { useAuth } from "@/context/auth-context";
import {
  ADMIN_DISPLAY_NAME,
  ARCHITECT_DISPLAY_NAME,
  BUSINESS_DISPLAY_NAME,
  BUSINESS_EMAIL,
  getAvatarFromEmail,
  getDisplayNameFromEmail,
  isAdminEmail,
  isArchitectEmail,
  isBusinessEmail,
  isSameIdentity,
  normalizeEmail,
  resolveUseCaseCreatorEmail,
} from "@/lib/auth";
import {
  buildParticipantScores,
  getParticipantScore,
  type ParticipantScore,
} from "@/lib/participants";
import { isKnownDepartment, normalizeDepartment } from "@/lib/constants";
import {
  calculateInnovationScore,
  deriveUseCaseBadges,
  getDaysSinceCreated,
} from "@/lib/scoring";
import type {
  ArchitectAiAssessment,
  ArchitectAiRecommendation,
  ArchitectDocumentBrief,
  ArchitectOverrideEntry,
  Comment,
  CreatorMessage,
  SubmitUseCaseInput,
  UseCase,
  User,
} from "@/types";
import {
  fetchArenaState,
  pushArenaState,
  recordArenaSnapshot,
} from "@/lib/arena-db/client-sync";
import type { ArenaDbStatus } from "@/lib/arena-db/types";

const STORAGE_KEY = "ai-use-cases-arena-state-v6";
const LEGACY_STORAGE_KEYS = [
  "ai-use-cases-arena-state-v5",
  "ai-use-cases-arena-state-v4",
];

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
  setArchitectBrief: (useCaseId: string, brief: ArchitectDocumentBrief) => void;
  clearArchitectBrief: (useCaseId: string) => void;
  setArchitectFieldOverride: (
    useCaseId: string,
    fieldKey: string,
    entry: ArchitectOverrideEntry | null
  ) => void;
  setArchitectAiAssessment: (
    useCaseId: string,
    assessment: ArchitectAiAssessment
  ) => void;
  /** @deprecated use setArchitectAiAssessment */
  setArchitectAiRecommendation: (
    useCaseId: string,
    recommendation: ArchitectAiRecommendation
  ) => void;
  clearArchitectOverrides: (useCaseId: string) => void;
  hasVoted: (useCaseId: string) => boolean;
  getUseCasesByEmail: (email: string) => UseCase[];
  dbStatus: ArenaDbStatus | null;
}

const AppContext = createContext<AppContextValue | null>(null);

function migrateUseCase(uc: UseCase): UseCase {
  const department = normalizeDepartment(uc.department);
  return {
    ...uc,
    department: isKnownDepartment(department) ? department : uc.department,
    voterEmails: uc.voterEmails ?? [],
    creatorMessages: uc.creatorMessages ?? [],
    submitterEmail:
      uc.submitterEmail ??
      (uc.submitterId?.includes("@") ? normalizeEmail(uc.submitterId) : "") ??
      (uc.submitter === BUSINESS_DISPLAY_NAME ? BUSINESS_EMAIL : ""),
  };
}

function loadState(): PersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ??
      LEGACY_STORAGE_KEYS.map((k) => localStorage.getItem(k)).find(Boolean);
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
  const { email, canAccessArchitectTools } = useAuth();
  const [useCases, setUseCases] = useState<UseCase[]>(
    initialUseCases.map(migrateUseCase)
  );
  const [votedUseCaseIds, setVotedUseCaseIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [dbStatus, setDbStatus] = useState<ArenaDbStatus | null>(null);

  useEffect(() => {
    async function hydrate() {
      const local = loadState();
      const remote = await fetchArenaState();

      if (remote?.status) setDbStatus(remote.status);

      const remoteState = remote?.state;
      const useRemote =
        remoteState &&
        remoteState.useCases.length > 0 &&
        (!local ||
          new Date(remoteState.updatedAt).getTime() >=
            new Date(local.useCases[0]?.createdAt ?? 0).getTime() ||
          remoteState.useCases.length >= local.useCases.length);

      if (useRemote && remoteState) {
        setUseCases(remoteState.useCases.map(migrateUseCase));
        setVotedUseCaseIds(remoteState.votedUseCaseIds ?? []);
        saveState({
          useCases: remoteState.useCases.map(migrateUseCase),
          votedUseCaseIds: remoteState.votedUseCaseIds ?? [],
        });
      } else if (local) {
        setUseCases(local.useCases);
        setVotedUseCaseIds(local.votedUseCaseIds);
        void pushArenaState(local.useCases, local.votedUseCaseIds);
      }

      setHydrated(true);
    }
    void hydrate();
  }, []);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dbSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveState({ useCases, votedUseCaseIds });
    }, 350);

    if (dbSaveTimeoutRef.current) clearTimeout(dbSaveTimeoutRef.current);
    dbSaveTimeoutRef.current = setTimeout(() => {
      void pushArenaState(useCases, votedUseCaseIds);
    }, 800);

    const flush = () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (dbSaveTimeoutRef.current) clearTimeout(dbSaveTimeoutRef.current);
      saveState({ useCases, votedUseCaseIds });
      void pushArenaState(useCases, votedUseCaseIds);
    };
    window.addEventListener("beforeunload", flush);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (dbSaveTimeoutRef.current) clearTimeout(dbSaveTimeoutRef.current);
      window.removeEventListener("beforeunload", flush);
    };
  }, [useCases, votedUseCaseIds, hydrated]);

  const participantScores = useMemo(
    () => buildParticipantScores(useCases),
    [useCases]
  );

  const myScore = useMemo(() => {
    if (canAccessArchitectTools || !email) return null;
    return getParticipantScore(useCases, email, participantScores);
  }, [useCases, email, canAccessArchitectTools, participantScores]);

  const currentUser = useMemo((): User => {
    const base = initialUsers[0];
    if (!email) return base;
    const normalized = normalizeEmail(email);
    const stats = myScore;
    const admin = isAdminEmail(normalized);
    const architect = isArchitectEmail(normalized);
    const business = isBusinessEmail(normalized);
    return {
      ...base,
      id: normalized,
      email: normalized,
      name: admin
        ? ADMIN_DISPLAY_NAME
        : architect
          ? ARCHITECT_DISPLAY_NAME
          : business
            ? BUSINESS_DISPLAY_NAME
            : (stats?.name ?? getDisplayNameFromEmail(normalized)),
      avatar: admin ? "AD" : architect ? "AR" : business ? "BU" : (stats?.avatar ?? getAvatarFromEmail(normalized)),
      points: admin ? 0 : (stats?.score ?? 0),
      badges: [],
      rank: "Explorer",
      votingStreak: 0,
    };
  }, [email, myScore]);

  const actorInfo = useCallback(() => {
    if (!email) return { actorEmail: undefined, actorName: undefined };
    const normalized = normalizeEmail(email);
    return {
      actorEmail: normalized,
      actorName: isAdminEmail(normalized)
        ? ADMIN_DISPLAY_NAME
        : isArchitectEmail(normalized)
          ? ARCHITECT_DISPLAY_NAME
          : isBusinessEmail(normalized)
            ? BUSINESS_DISPLAY_NAME
            : getDisplayNameFromEmail(normalized),
    };
  }, [email]);

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
        department: normalizeDepartment(input.department),
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
      void recordArenaSnapshot({
        useCase: base,
        eventType: "use_case_submitted",
        ...actorInfo(),
      });
      return base;
    },
    [email, actorInfo]
  );

  const updateUseCases = useCallback((updater: (prev: UseCase[]) => UseCase[]) => {
    startTransition(() => {
      setUseCases(updater);
    });
  }, []);

  const voteOnUseCase = useCallback(
    (useCaseId: string): boolean => {
      if (!email || votedUseCaseIds.includes(useCaseId)) return false;
      const normalized = normalizeEmail(email);

      setVotedUseCaseIds((prev) => [...prev, useCaseId]);

      updateUseCases((prev) =>
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
          void recordArenaSnapshot({
            useCase: updated,
            eventType: "vote_cast",
            ...actorInfo(),
            detail: `Vote count: ${updated.votes}`,
          });
          return updated;
        })
      );

      return true;
    },
    [email, votedUseCaseIds, updateUseCases, actorInfo]
  );

  const unvoteOnUseCase = useCallback(
    (useCaseId: string): boolean => {
      if (!email || !votedUseCaseIds.includes(useCaseId)) return false;
      const normalized = normalizeEmail(email);

      setVotedUseCaseIds((prev) => prev.filter((id) => id !== useCaseId));

      updateUseCases((prev) =>
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
    [email, votedUseCaseIds, updateUseCases]
  );

  const addComment = useCallback(
    (useCaseId: string, text: string) => {
      if (!email || canAccessArchitectTools) return;
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

      updateUseCases((prev) =>
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
          void recordArenaSnapshot({
            useCase: updated,
            eventType: "comment_added",
            ...actorInfo(),
          });
          return updated;
        })
      );
    },
    [email, canAccessArchitectTools, updateUseCases, actorInfo]
  );

  const addCreatorMessage = useCallback(
    (useCaseId: string, text: string): boolean => {
      if (!email || !text.trim()) return false;
      const normalized = normalizeEmail(email);
      let sent = false;

      setUseCases((prev) => {
        const useCase = prev.find((uc) => uc.id === useCaseId);
        if (!useCase) return prev;

        const creatorEmail = resolveUseCaseCreatorEmail(useCase);
        if (!creatorEmail || isSameIdentity(normalized, creatorEmail)) {
          return prev;
        }

        const message: CreatorMessage = {
          id: `creator-msg-${Date.now()}`,
          useCaseId,
          fromEmail: normalized,
          fromName: isAdminEmail(normalized)
            ? ADMIN_DISPLAY_NAME
            : isArchitectEmail(normalized)
              ? ARCHITECT_DISPLAY_NAME
              : isBusinessEmail(normalized)
                ? BUSINESS_DISPLAY_NAME
                : getDisplayNameFromEmail(normalized),
          text: text.trim(),
          createdAt: new Date().toISOString(),
        };

        sent = true;
        const updatedList = prev.map((uc) =>
          uc.id === useCaseId
            ? { ...uc, creatorMessages: [...(uc.creatorMessages ?? []), message] }
            : uc
        );
        const updatedUseCase = updatedList.find((uc) => uc.id === useCaseId);
        if (updatedUseCase) {
          void recordArenaSnapshot({
            useCase: updatedUseCase,
            eventType: "creator_message",
            actorEmail: normalized,
            actorName: message.fromName,
          });
        }
        return updatedList;
      });

      return sent;
    },
    [email]
  );

  const setArchitectBrief = useCallback(
    (useCaseId: string, brief: ArchitectDocumentBrief) => {
      if (!canAccessArchitectTools) return;
      updateUseCases((prev) =>
        prev.map((uc) => {
          if (uc.id !== useCaseId) return uc;
          const updated = { ...uc, architectBrief: brief };
          void recordArenaSnapshot({
            useCase: updated,
            eventType: "document_uploaded",
            ...actorInfo(),
            detail: brief.fileName,
          });
          return updated;
        })
      );
    },
    [canAccessArchitectTools, updateUseCases, actorInfo]
  );

  const clearArchitectBrief = useCallback(
    (useCaseId: string) => {
      if (!canAccessArchitectTools) return;
      updateUseCases((prev) =>
        prev.map((uc) => {
          if (uc.id !== useCaseId) return uc;
          const updated = { ...uc, architectBrief: undefined };
          void recordArenaSnapshot({
            useCase: updated,
            eventType: "document_removed",
            ...actorInfo(),
          });
          return updated;
        })
      );
    },
    [canAccessArchitectTools, updateUseCases, actorInfo]
  );

  const setArchitectFieldOverride = useCallback(
    (
      useCaseId: string,
      fieldKey: string,
      entry: ArchitectOverrideEntry | null
    ) => {
      if (!email || !canAccessArchitectTools) return;
      const normalized = normalizeEmail(email);
      const editorName = isAdminEmail(normalized)
        ? ADMIN_DISPLAY_NAME
        : isArchitectEmail(normalized)
          ? ARCHITECT_DISPLAY_NAME
          : getDisplayNameFromEmail(normalized);

      updateUseCases((prev) =>
        prev.map((uc) => {
          if (uc.id !== useCaseId) return uc;
          const existing = { ...(uc.architectOverrides?.fields ?? {}) };
          if (entry === null) {
            delete existing[fieldKey];
          } else {
            existing[fieldKey] = entry;
          }
          const hasFields = Object.keys(existing).length > 0;
          const updated: UseCase = {
            ...uc,
            architectOverrides: hasFields
              ? {
                  fields: existing,
                  updatedAt: new Date().toISOString(),
                  updatedByEmail: normalized,
                  updatedByName: editorName,
                }
              : undefined,
          };
          void recordArenaSnapshot({
            useCase: updated,
            eventType: entry === null ? "overrides_updated" : "overrides_updated",
            actorEmail: normalized,
            actorName: editorName,
            detail: entry === null ? `Reset field: ${fieldKey}` : `Updated field: ${fieldKey}`,
          });
          return updated;
        })
      );
    },
    [email, canAccessArchitectTools, updateUseCases]
  );

  const setArchitectAiAssessment = useCallback(
    (useCaseId: string, assessment: ArchitectAiAssessment) => {
      if (!canAccessArchitectTools) return;
      updateUseCases((prev) =>
        prev.map((uc) => {
          if (uc.id !== useCaseId) return uc;
          const updated = {
            ...uc,
            architectAiAssessment: assessment,
            architectAiRecommendation: undefined,
          };
          void recordArenaSnapshot({
            useCase: updated,
            eventType: "overrides_updated",
            ...actorInfo(),
            detail: `OpenAI assessment: ${assessment.pattern} (${assessment.overallScore}% readiness)`,
          });
          return updated;
        })
      );
    },
    [canAccessArchitectTools, updateUseCases, actorInfo]
  );

  const setArchitectAiRecommendation = useCallback(
    (useCaseId: string, recommendation: ArchitectAiRecommendation) => {
      setArchitectAiAssessment(useCaseId, {
        dimensions: [],
        overallScore: 0,
        architectQuestions: [],
        telecomImpactAreas: [],
        pattern: recommendation.pattern,
        technologies: recommendation.technologies,
        confidence: recommendation.confidence,
        rationale: recommendation.rationale,
        model: recommendation.model,
        generatedAt: recommendation.generatedAt,
        inputFingerprint: recommendation.inputFingerprint,
      });
    },
    [setArchitectAiAssessment]
  );

  const clearArchitectOverrides = useCallback(
    (useCaseId: string) => {
      if (!canAccessArchitectTools) return;
      updateUseCases((prev) =>
        prev.map((uc) => {
          if (uc.id !== useCaseId) return uc;
          const updated = { ...uc, architectOverrides: undefined };
          void recordArenaSnapshot({
            useCase: updated,
            eventType: "overrides_cleared",
            ...actorInfo(),
          });
          return updated;
        })
      );
    },
    [canAccessArchitectTools, updateUseCases, actorInfo]
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
      setArchitectBrief,
      clearArchitectBrief,
      setArchitectFieldOverride,
      setArchitectAiAssessment,
      setArchitectAiRecommendation,
      clearArchitectOverrides,
      hasVoted,
      getUseCasesByEmail,
      dbStatus,
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
      setArchitectBrief,
      clearArchitectBrief,
      setArchitectFieldOverride,
      setArchitectAiAssessment,
      setArchitectAiRecommendation,
      clearArchitectOverrides,
      hasVoted,
      getUseCasesByEmail,
      dbStatus,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
