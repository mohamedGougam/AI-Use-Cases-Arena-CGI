"use client";

import { useMemo, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, FileSearch, HardHat, Lightbulb } from "lucide-react";
import type { UseCase } from "@/types";
import { applyArchitectOverrides } from "@/lib/apply-architect-overrides";
import { emptyArchitectAssessment } from "@/lib/map-ai-assessment";
import { useApp } from "@/context/app-context";
import { useAuth } from "@/context/auth-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { OverallReadinessBanner, ReadinessGauge } from "@/components/architect/readiness-gauge";
import { ReadinessDimensionCard } from "@/components/architect/readiness-dimension-card";
import { TelecomImpactAnalysis } from "@/components/architect/telecom-impact-analysis";
import { ArchitectureCard } from "@/components/architect/architecture-card";
import { ArchitectDocumentUpload } from "@/components/architect/architect-document-upload";
import {
  ArchitectGovernanceEstimationHints,
  DeliveryTeamPanel,
  EffortEstimationPanel,
} from "@/components/architect/effort-estimation-panel";
import { ArchitectExportPanel } from "@/components/architect/architect-export-panel";
import { EvaluationHistoryPanel } from "@/components/architect/evaluation-history-panel";
import { ArenaDatabaseStatus } from "@/components/architect/arena-database-status";
import { ArchitectAiReviewHeader } from "@/components/architect/architect-ai-review-header";
import {
  ArchitectCollapsibleSection,
  ArchitectReviewNav,
} from "@/components/architect/architect-collapsible-section";
import { ArchitectDiscoveryWorkshop } from "@/components/architect/architect-discovery-workshop";
import { MasterDiscoveryContextPanel } from "@/components/architect/master-discovery-context-panel";
import { useArchitectOverrideHandlers } from "@/components/architect/use-architect-overrides";
import { useArchitectSync } from "@/components/architect/use-architect-sync";
import { reassessAfterAnswer, useOpenAiAssessment } from "@/components/architect/use-openai-assessment";
import type { ArchitectOverrideContext } from "@/components/architect/use-architect-overrides";
import { getDimensionMeta } from "@/lib/architect-field-meta";
import { assessmentNeedsCitationRefresh } from "@/lib/criterion-evidence";
import { migrateLegacyQuestions } from "@/lib/discovery-questions";

const ESTIMATION_SECTION_IDS = [
  "effortEstimation",
  "costEstimation",
  "deliveryTeamRecommendation",
] as const;

type SectionId =
  | "architectQuestions"
  | "executiveSummary"
  | "risks"
  | "assumptions"
  | "masterDiscoveryContext"
  | "business"
  | "data"
  | "ai"
  | "security"
  | "delivery"
  | "telecomImpact"
  | "architectureRecommendation"
  | (typeof ESTIMATION_SECTION_IDS)[number]
  | "reviewHistory";

type SectionState = Record<SectionId, boolean>;

const DEFAULT_SECTION_STATE: SectionState = {
  architectQuestions: true,
  executiveSummary: false,
  risks: false,
  assumptions: false,
  masterDiscoveryContext: false,
  business: false,
  data: false,
  ai: false,
  security: false,
  delivery: false,
  telecomImpact: false,
  architectureRecommendation: false,
  effortEstimation: false,
  costEstimation: false,
  deliveryTeamRecommendation: false,
  reviewHistory: false,
};

function summarizeDimension(score: number, metCount: number, totalCount: number) {
  return {
    primary: `${score}%`,
    secondary:
      metCount === totalCount
        ? `${metCount} of ${totalCount} criteria met`
        : `${totalCount - metCount} gaps identified`,
  };
}

function statusBadge(label: string, tone: "default" | "warning" | "success" = "default") {
  const classes =
    tone === "warning"
      ? "border-amber-500/40 text-amber-500"
      : tone === "success"
        ? "border-emerald-500/40 text-emerald-500"
        : "border-primary/30 text-primary";
  return (
    <Badge variant="outline" className={classes}>
      {label}
    </Badge>
  );
}

export function ArchitectWorkspace({ useCase }: { useCase: UseCase }) {
  const {
    setArchitectFieldOverride,
    setArchitectFieldOverrides,
    applyWorkshopReassessment,
  } = useApp();
  const { email } = useAuth();
  const [reassessing, setReassessing] = useState(false);
  const [sections, setSections] = useState<SectionState>(DEFAULT_SECTION_STATE);
  const [highlighted, setHighlighted] = useState<SectionId[]>([]);
  const sectionRefs = useRef<Partial<Record<SectionId, HTMLElement | null>>>({});

  const onAiAssessment = useCallback(
    (
      assessment: Parameters<typeof applyWorkshopReassessment>[1],
      discoveryQuestions: Parameters<typeof applyWorkshopReassessment>[2]
    ) => {
      applyWorkshopReassessment(useCase.id, assessment, discoveryQuestions);
    },
    [applyWorkshopReassessment, useCase.id]
  );

  const openAi = useOpenAiAssessment(useCase, onAiAssessment);

  const baseAssessment = useMemo(() => {
    if (openAi.assessment) return openAi.assessment;
    return emptyArchitectAssessment(useCase);
  }, [openAi.assessment, useCase]);

  const assessment = useMemo(
    () => applyArchitectOverrides(baseAssessment, useCase.architectOverrides),
    [baseAssessment, useCase.architectOverrides]
  );

  const discoveryQuestions = useMemo(() => {
    if (useCase.architectDiscoveryQuestions?.length) {
      return useCase.architectDiscoveryQuestions;
    }
    return assessment.discoveryQuestions.length
      ? assessment.discoveryQuestions
      : migrateLegacyQuestions(assessment.architectQuestions);
  }, [useCase.architectDiscoveryQuestions, assessment.discoveryQuestions, assessment.architectQuestions]);

  const setFieldOverrides = useCallback(
    (updates: Parameters<typeof setArchitectFieldOverrides>[1]) => {
      setArchitectFieldOverrides(useCase.id, updates);
    },
    [setArchitectFieldOverrides, useCase.id]
  );

  const { syncField, syncing } = useArchitectSync(useCase, assessment, setFieldOverrides);

  const setField = useCallback(
    (fieldKey: string, entry: Parameters<typeof setArchitectFieldOverride>[2]) => {
      setArchitectFieldOverride(useCase.id, fieldKey, entry);
    },
    [setArchitectFieldOverride, useCase.id]
  );

  const overrides = useArchitectOverrideHandlers(useCase.architectOverrides, setField);

  const handleReassess = useCallback(
    async (questionId: string, answer: string) => {
      const architectName =
        useCase.architectOverrides?.updatedByName ||
        (email ? email.split("@")[0] : "CGI AI Architect");

      setReassessing(true);
      try {
        const result = await reassessAfterAnswer(useCase, questionId, answer, architectName);
        if (!result.ok) return result;

        const { architectAiAssessment, discoveryQuestions: updatedQuestions } = result.data;
        applyWorkshopReassessment(useCase.id, architectAiAssessment, updatedQuestions);
        return { ok: true as const };
      } catch (err) {
        return {
          ok: false as const,
          error: err instanceof Error ? err.message : "Reassessment failed",
        };
      } finally {
        setReassessing(false);
      }
    },
    [applyWorkshopReassessment, email, useCase]
  );

  const exportedByName =
    useCase.architectOverrides?.updatedByName ||
    (email ? email.split("@")[0] : "CGI AI Architect");

  const workshopLoading = openAi.loading || reassessing;
  const needsCitationRefresh = assessmentNeedsCitationRefresh(assessment.dimensions);
  const reviewStateKey = `architectReviewUIState:${useCase.id}`;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(reviewStateKey);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as Partial<SectionState>;
      setSections((prev) => ({ ...prev, ...parsed }));
    } catch {
      // ignore malformed persisted state
    }
  }, [reviewStateKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(reviewStateKey, JSON.stringify(sections));
  }, [reviewStateKey, sections]);

  const setSectionOpen = useCallback((id: SectionId, open: boolean) => {
    setSections((prev) => ({ ...prev, [id]: open }));
  }, []);

  const toggleSection = useCallback((id: string) => {
    setSections((prev) => ({ ...prev, [id as SectionId]: !prev[id as SectionId] }));
  }, []);

  const highlightSections = useCallback((ids: SectionId[]) => {
    setHighlighted(ids);
    window.setTimeout(() => setHighlighted((prev) => prev.filter((id) => !ids.includes(id))), 2200);
  }, []);

  const expandAndFocus = useCallback(
    (id: SectionId) => {
      setSectionOpen(id, true);
      window.setTimeout(() => {
        sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
    },
    [setSectionOpen]
  );

  const expandMany = useCallback(
    (ids: SectionId[]) => {
      setSections((prev) => {
        const next = { ...prev };
        for (const id of ids) next[id] = true;
        return next;
      });
      highlightSections(ids);
    },
    [highlightSections]
  );

  const expandAll = useCallback(() => {
    setSections({
      architectQuestions: true,
      executiveSummary: true,
      risks: true,
      assumptions: true,
      masterDiscoveryContext: true,
      business: true,
      data: true,
      ai: true,
      security: true,
      delivery: true,
      telecomImpact: true,
      architectureRecommendation: true,
      effortEstimation: true,
      costEstimation: true,
      deliveryTeamRecommendation: true,
      reviewHistory: true,
    });
  }, []);

  const collapseAll = useCallback(() => {
    setSections(DEFAULT_SECTION_STATE);
  }, []);

  const dimensionSectionMap = useMemo(
    () =>
      ({
        business: "business",
        data: "data",
        ai: "ai",
        security: "security",
        delivery: "delivery",
      }) as const,
    []
  );

  const reviewNavItems = [
    { id: "architectQuestions", label: "Architect Questions", active: sections.architectQuestions },
    { id: "executiveSummary", label: "Executive Summary", active: sections.executiveSummary },
    { id: "risks", label: "Risks", active: sections.risks },
    { id: "assumptions", label: "Assumptions", active: sections.assumptions },
    { id: "masterDiscoveryContext", label: "Discovery Context", active: sections.masterDiscoveryContext },
    ...assessment.dimensions.map((d) => ({
      id: d.key,
      label: d.title.replace(" Readiness", "").replace(" Understanding", ""),
      active: sections[d.key as keyof SectionState] as boolean,
    })),
    { id: "telecomImpact", label: "Telecom Impact", active: sections.telecomImpact },
    { id: "architectureRecommendation", label: "Architecture", active: sections.architectureRecommendation },
  ] as { id: string; label: string; active?: boolean }[];

  const executiveSummary = assessment.governance.executiveSummary;
  const risks = assessment.governance.risks;
  const assumptions = assessment.governance.assumptions;

  const wrapRef = (id: SectionId) => (node: HTMLElement | null) => {
    sectionRefs.current[id] = node;
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <HardHat className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold">AI Solutioning Workspace</h2>
        </div>
        <Badge variant="outline" className="border-primary/40">
          CGI AI Architect
        </Badge>
        {useCase.architectOverrides && (
          <Badge variant="secondary" className="text-xs">
            Architect adjustments saved
          </Badge>
        )}
      </div>

      <Tabs defaultValue="review" className="w-full">
        <TabsList>
          <TabsTrigger value="review">AI Architect Review</TabsTrigger>
          <TabsTrigger value="estimation">Effort Estimation</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="review" className="space-y-6">
          <ArchitectDocumentUpload
            useCase={useCase}
            wordCounts={assessment.wordCounts}
            contentRichness={openAi.contentRichness}
          />
          <ArchitectAiReviewHeader
            source={openAi.source}
            loading={openAi.loading}
            error={openAi.error}
            missingApiKey={openAi.missingApiKey}
            stale={openAi.stale}
            needsCitationRefresh={needsCitationRefresh}
            generatedAt={openAi.generatedAt}
            onRegenerate={openAi.regenerate}
          />
          <ArchitectReviewNav
            items={reviewNavItems}
            onSelect={(id) => expandAndFocus(id as SectionId)}
            onExpandAll={expandAll}
            onCollapseAll={collapseAll}
          />

          <div className="rounded-xl border border-border/20 bg-card/40 p-4">
            <OverallReadinessBanner
              score={assessment.overallScore}
              overrides={overrides}
              source={openAi.source === "openai" ? "openai" : "rules"}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {assessment.dimensions.map((d) => (
              <ReadinessGauge
                key={d.key}
                label={d.title.replace(" Readiness", "").replace(" Understanding", "")}
                score={d.score}
                fieldKey={`dimension.${d.key}.score`}
                meta={getDimensionMeta(d.key, openAi.source === "openai" ? "openai" : "rules")}
                overrides={overrides}
              />
            ))}
          </div>

          <div ref={wrapRef("architectQuestions")}>
            <ArchitectCollapsibleSection
              id="architectQuestions"
              title="Architect Questions"
              status={statusBadge(`${discoveryQuestions.filter((q) => q.answer?.trim()).length}/${discoveryQuestions.length || 0} answered`)}
              summary={{
                primary:
                  discoveryQuestions.length > 0
                    ? `${discoveryQuestions.filter((q) => q.answer?.trim()).length} of ${discoveryQuestions.length} answered`
                    : "No questions generated yet",
                secondary: `Architecture confidence ${assessment.architecture.confidence}%`,
              }}
              open={sections.architectQuestions}
              highlighted={highlighted.includes("architectQuestions")}
              onToggle={toggleSection}
            >
              <ArchitectDiscoveryWorkshop
                useCaseId={useCase.id}
                questions={discoveryQuestions}
                assessment={assessment}
                architectName={exportedByName}
                loading={workshopLoading}
                onReassess={async (questionId, answer) => {
                  const result = await handleReassess(questionId, answer);
                  if (result.ok) {
                    expandMany([
                      "architectQuestions",
                      "executiveSummary",
                      "risks",
                      "assumptions",
                      "masterDiscoveryContext",
                      "business",
                      "data",
                      "ai",
                      "security",
                      "delivery",
                      "telecomImpact",
                      "architectureRecommendation",
                      "effortEstimation",
                      "costEstimation",
                      "deliveryTeamRecommendation",
                    ]);
                  }
                  return result;
                }}
              />
            </ArchitectCollapsibleSection>
          </div>

          <div ref={wrapRef("executiveSummary")}>
            <ArchitectCollapsibleSection
              id="executiveSummary"
              title="Executive Summary"
              score={`${assessment.architecture.confidence}% confidence`}
              summary={{
                primary: executiveSummary || "No executive summary yet",
              }}
              open={sections.executiveSummary}
              highlighted={highlighted.includes("executiveSummary")}
              onToggle={toggleSection}
            >
              <div className="rounded-xl border border-border/20 bg-card/60 p-5">
                <p className="text-sm leading-relaxed text-muted">
                  {executiveSummary || "No executive summary yet. Regenerate review to build one."}
                </p>
              </div>
            </ArchitectCollapsibleSection>
          </div>

          <div ref={wrapRef("risks")}>
            <ArchitectCollapsibleSection
              id="risks"
              title="Risks"
              status={statusBadge(`${risks.length} identified`, risks.length ? "warning" : "default")}
              summary={{
                primary: risks[0] ?? "No risks identified",
                secondary: risks.length > 1 ? `${risks.length - 1} more risk items` : undefined,
              }}
              open={sections.risks}
              highlighted={highlighted.includes("risks")}
              onToggle={toggleSection}
            >
              <GovernanceListCard
                icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
                empty="No risks identified."
                items={risks}
              />
            </ArchitectCollapsibleSection>
          </div>

          <div ref={wrapRef("assumptions")}>
            <ArchitectCollapsibleSection
              id="assumptions"
              title="Assumptions"
              status={statusBadge(`${assumptions.length} tracked`)}
              summary={{
                primary: assumptions[0] ?? "No assumptions recorded",
                secondary: assumptions.length > 1 ? `${assumptions.length - 1} more assumptions` : undefined,
              }}
              open={sections.assumptions}
              highlighted={highlighted.includes("assumptions")}
              onToggle={toggleSection}
            >
              <GovernanceListCard
                icon={<Lightbulb className="h-4 w-4 text-primary" />}
                empty="No assumptions recorded."
                items={assumptions}
              />
            </ArchitectCollapsibleSection>
          </div>

          <div ref={wrapRef("masterDiscoveryContext")}>
            <ArchitectCollapsibleSection
              id="masterDiscoveryContext"
              title="Master Discovery Context"
              status={statusBadge(
                `${Object.values(assessment.masterDiscoveryContext).reduce((sum, arr) => sum + arr.length, 0)} facts`
              )}
              summary={{
                primary: "Holistic context extracted across all sources",
                secondary: "Used before readiness scoring",
              }}
              open={sections.masterDiscoveryContext}
              highlighted={highlighted.includes("masterDiscoveryContext")}
              onToggle={toggleSection}
            >
              <MasterDiscoveryContextPanel context={assessment.masterDiscoveryContext} />
            </ArchitectCollapsibleSection>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {assessment.dimensions.map((d) => {
              const metCount = d.criteria.filter((c) => c.met).length;
              const sectionId = dimensionSectionMap[d.key as keyof typeof dimensionSectionMap];
              return (
                <div key={d.key} ref={wrapRef(sectionId)}>
                  <ArchitectCollapsibleSection
                    id={sectionId}
                    title={d.title}
                    score={`${d.score}%`}
                    status={statusBadge(`${metCount}/${d.criteria.length} met`, d.score >= 70 ? "success" : d.score >= 40 ? "default" : "warning")}
                    summary={summarizeDimension(d.score, metCount, d.criteria.length)}
                    open={sections[sectionId]}
                    highlighted={highlighted.includes(sectionId)}
                    onToggle={toggleSection}
                  >
                    <ReadinessDimensionCard
                      dimension={d}
                      overrides={overrides}
                      source={openAi.source === "openai" ? "openai" : "rules"}
                      onSyncSave={(fieldKey, value, note) => {
                        syncField(fieldKey, value, note);
                        expandMany([sectionId, "architectureRecommendation"]);
                      }}
                    />
                  </ArchitectCollapsibleSection>
                </div>
              );
            })}
          </div>

          <div ref={wrapRef("telecomImpact")}>
            <ArchitectCollapsibleSection
              id="telecomImpact"
              title="Telecom Impact Assessment"
              summary={{
                primary:
                  assessment.telecomImpactAreas[0]
                    ? `${assessment.telecomImpactAreas[0].area} ${assessment.telecomImpactAreas[0].relevance}%`
                    : "No impact areas identified",
                secondary:
                  assessment.telecomImpactAreas.length > 1
                    ? `${assessment.telecomImpactAreas.length} domains assessed`
                    : undefined,
              }}
              open={sections.telecomImpact}
              highlighted={highlighted.includes("telecomImpact")}
              onToggle={toggleSection}
            >
              <TelecomImpactAnalysis
                areas={assessment.telecomImpactAreas}
                overrides={overrides}
                source={openAi.source === "openai" ? "openai" : "rules"}
              />
            </ArchitectCollapsibleSection>
          </div>

          <div ref={wrapRef("architectureRecommendation")}>
            <ArchitectCollapsibleSection
              id="architectureRecommendation"
              title="Architecture Recommendation"
              score={`${assessment.architecture.confidence}%`}
              status={assessment.architectureUnlocked ? statusBadge("Unlocked", "success") : statusBadge("Locked", "warning")}
              summary={{
                primary: `${assessment.architecture.pattern}${assessment.architecture.technologies.length ? ` + ${assessment.architecture.technologies[0]}` : ""}`,
                secondary: assessment.architectureUnlocked
                  ? "AI and data architecture ready for review"
                  : "Continue discovery to unlock final architecture",
              }}
              open={sections.architectureRecommendation}
              highlighted={highlighted.includes("architectureRecommendation")}
              onToggle={toggleSection}
            >
              <ArchitectureCard
                architecture={assessment.architecture}
                overrides={overrides}
                syncing={syncing}
                onSyncSave={(fieldKey, value, note) => {
                  syncField(fieldKey, value, note);
                  expandMany(["architectureRecommendation"]);
                }}
                locked={!assessment.architectureUnlocked}
              />
            </ArchitectCollapsibleSection>
          </div>
        </TabsContent>

        <TabsContent value="estimation" className="space-y-4">
          <ArchitectReviewNav
            items={[
              { id: "effortEstimation", label: "Effort Estimation", active: sections.effortEstimation },
              { id: "costEstimation", label: "Cost Estimation", active: sections.costEstimation },
              {
                id: "deliveryTeamRecommendation",
                label: "Delivery Team",
                active: sections.deliveryTeamRecommendation,
              },
            ]}
            onSelect={(id) => expandAndFocus(id as SectionId)}
            onExpandAll={() => expandMany([...ESTIMATION_SECTION_IDS])}
            onCollapseAll={() => {
              for (const id of ESTIMATION_SECTION_IDS) setSectionOpen(id, false);
            }}
          />

          <div ref={wrapRef("effortEstimation")}>
            <ArchitectCollapsibleSection
              id="effortEstimation"
              title="Effort Estimation"
              status={
                assessment.estimation.locked
                  ? statusBadge("Locked", "warning")
                  : statusBadge(`${assessment.consensus.timelineMin}-${assessment.consensus.timelineMax} weeks`, "success")
              }
              summary={{
                primary: assessment.estimation.locked
                  ? assessment.estimation.lockReason ?? "Insufficient information available."
                  : `${assessment.modelEstimates.length} model views · ${assessment.consensus.confidence}% confidence`,
                secondary: assessment.estimation.locked ? "Continue workshop discovery" : "Consensus estimate ready",
              }}
              open={sections.effortEstimation}
              highlighted={highlighted.includes("effortEstimation")}
              onToggle={toggleSection}
            >
              {assessment.estimation.locked ? (
                <ArchitectGovernanceEstimationHints assessment={assessment} />
              ) : (
                <EffortEstimationPanel
                  assessment={assessment}
                  overrides={overrides}
                  includeDeliveryTeam={false}
                />
              )}
            </ArchitectCollapsibleSection>
          </div>

          <div ref={wrapRef("costEstimation")}>
            <ArchitectCollapsibleSection
              id="costEstimation"
              title="Cost Estimation"
              status={statusBadge("Future-ready", "warning")}
              summary={{
                primary: assessment.estimation.locked
                  ? "Estimation locked until critical evidence exists"
                  : "Cost view can be enabled from the same workbench model",
                secondary: "Component structure prepared for workshop mode expansion",
              }}
              open={sections.costEstimation}
              highlighted={highlighted.includes("costEstimation")}
              onToggle={toggleSection}
            >
              <div className="rounded-xl border border-border/20 bg-card/60 p-5">
                <p className="text-sm text-muted">
                  Cost estimation is not exposed yet. The collapsible section is in place so a future
                  cost model can be added without changing the workshop navigation pattern.
                </p>
              </div>
            </ArchitectCollapsibleSection>
          </div>

          <div ref={wrapRef("deliveryTeamRecommendation")}>
            <ArchitectCollapsibleSection
              id="deliveryTeamRecommendation"
              title="Delivery Team Recommendation"
              status={statusBadge(`${assessment.deliveryTeam.length} roles`, assessment.deliveryTeam.length ? "success" : "warning")}
              summary={{
                primary: assessment.deliveryTeam.length
                  ? `${assessment.deliveryTeam.length} recommended roles`
                  : "No delivery team recommendation available",
                secondary: assessment.requiredSkills.length
                  ? `${assessment.requiredSkills.length} required skills`
                  : undefined,
              }}
              open={sections.deliveryTeamRecommendation}
              highlighted={highlighted.includes("deliveryTeamRecommendation")}
              onToggle={toggleSection}
            >
              <DeliveryTeamPanel assessment={assessment} overrides={overrides} />
            </ArchitectCollapsibleSection>
          </div>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <ArenaDatabaseStatus />
          <ArchitectExportPanel
            useCase={useCase}
            assessment={assessment}
            baseAssessment={baseAssessment}
            exportedByName={exportedByName}
          />
          <div ref={wrapRef("reviewHistory")}>
            <ArchitectCollapsibleSection
              id="reviewHistory"
              title="Review History"
              summary={{
                primary: "Persistent audit trail of workshop and review activity",
              }}
              open={sections.reviewHistory}
              highlighted={highlighted.includes("reviewHistory")}
              onToggle={toggleSection}
            >
              <EvaluationHistoryPanel useCaseId={useCase.id} />
            </ArchitectCollapsibleSection>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}

export type { ArchitectOverrideContext };

function GovernanceListCard({
  icon,
  items,
  empty,
}: {
  icon: ReactNode;
  items: string[];
  empty: string;
}) {
  return (
    <div className="rounded-xl border border-border/20 bg-card/60 p-5">
      <div className="mb-3 flex items-center gap-2">{icon}</div>
      {items.length ? (
        <ul className="space-y-2 text-sm text-muted">
          {items.map((item) => (
            <li key={item} className="flex gap-2">
              <FileSearch className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/70" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">{empty}</p>
      )}
    </div>
  );
}
