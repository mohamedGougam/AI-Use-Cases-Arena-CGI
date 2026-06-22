"use client";

import { useMemo, useCallback } from "react";
import { HardHat } from "lucide-react";
import type { UseCase } from "@/types";
import { analyzeUseCase } from "@/lib/architect-engine";
import { applyArchitectOverrides } from "@/lib/apply-architect-overrides";
import { useApp } from "@/context/app-context";
import { useAuth } from "@/context/auth-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { OverallReadinessBanner, ReadinessGauge } from "@/components/architect/readiness-gauge";
import {
  ArchitectQuestions,
  ReadinessDimensionCard,
} from "@/components/architect/readiness-dimension-card";
import { TelecomImpactAnalysis } from "@/components/architect/telecom-impact-analysis";
import { ArchitectureCard } from "@/components/architect/architecture-card";
import { ArchitectDocumentUpload } from "@/components/architect/architect-document-upload";
import { EffortEstimationPanel } from "@/components/architect/effort-estimation-panel";
import { ArchitectExportPanel } from "@/components/architect/architect-export-panel";
import { EvaluationHistoryPanel } from "@/components/architect/evaluation-history-panel";
import { ArenaDatabaseStatus } from "@/components/architect/arena-database-status";
import { useArchitectOverrideHandlers } from "@/components/architect/use-architect-overrides";
import { useOpenAiArchitecture } from "@/components/architect/use-openai-recommendation";
import type { ArchitectOverrideContext } from "@/components/architect/use-architect-overrides";
import { getDimensionMeta } from "@/lib/architect-field-meta";

export function ArchitectWorkspace({ useCase }: { useCase: UseCase }) {
  const { setArchitectFieldOverride, setArchitectAiRecommendation } = useApp();
  const { email } = useAuth();

  const ruleAssessment = useMemo(() => analyzeUseCase(useCase), [useCase]);

  const onAiRecommendation = useCallback(
    (rec: Parameters<typeof setArchitectAiRecommendation>[1]) => {
      setArchitectAiRecommendation(useCase.id, rec);
    },
    [setArchitectAiRecommendation, useCase.id]
  );

  const openAi = useOpenAiArchitecture(useCase, ruleAssessment, onAiRecommendation);

  const baseAssessment = useMemo(
    () => ({ ...ruleAssessment, architecture: openAi.architecture }),
    [ruleAssessment, openAi.architecture]
  );

  const assessment = useMemo(
    () => applyArchitectOverrides(baseAssessment, useCase.architectOverrides),
    [baseAssessment, useCase.architectOverrides]
  );

  const setField = useCallback(
    (fieldKey: string, entry: Parameters<typeof setArchitectFieldOverride>[2]) => {
      setArchitectFieldOverride(useCase.id, fieldKey, entry);
    },
    [setArchitectFieldOverride, useCase.id]
  );

  const overrides = useArchitectOverrideHandlers(useCase.architectOverrides, setField);

  const exportedByName =
    useCase.architectOverrides?.updatedByName ||
    (email ? email.split("@")[0] : "CGI AI Architect");

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
          <ArchitectDocumentUpload useCase={useCase} wordCounts={assessment.wordCounts} overrides={overrides} />
          <OverallReadinessBanner score={assessment.overallScore} overrides={overrides} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {assessment.dimensions.map((d) => (
              <ReadinessGauge
                key={d.key}
                label={d.title.replace(" Readiness", "").replace(" Understanding", "")}
                score={d.score}
                fieldKey={`dimension.${d.key}.score`}
                meta={getDimensionMeta(d.key)}
                overrides={overrides}
              />
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {assessment.dimensions.map((d) => (
              <ReadinessDimensionCard
                key={d.key}
                dimension={d}
                overrides={overrides}
              />
            ))}
          </div>

          <ArchitectQuestions questions={assessment.architectQuestions} overrides={overrides} />
          <TelecomImpactAnalysis areas={assessment.telecomImpactAreas} overrides={overrides} />
          <ArchitectureCard
            architecture={assessment.architecture}
            overrides={overrides}
            source={openAi.source}
            loading={openAi.loading}
            error={openAi.error}
            missingApiKey={openAi.missingApiKey}
            model={openAi.model}
            generatedAt={openAi.generatedAt}
            stale={openAi.stale}
            onRegenerate={openAi.regenerate}
          />
        </TabsContent>

        <TabsContent value="estimation">
          <EffortEstimationPanel assessment={assessment} overrides={overrides} />
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <ArenaDatabaseStatus />
          <ArchitectExportPanel
            useCase={useCase}
            assessment={assessment}
            baseAssessment={baseAssessment}
            exportedByName={exportedByName}
          />
          <EvaluationHistoryPanel useCaseId={useCase.id} />
        </TabsContent>
      </Tabs>
    </section>
  );
}

export type { ArchitectOverrideContext };
