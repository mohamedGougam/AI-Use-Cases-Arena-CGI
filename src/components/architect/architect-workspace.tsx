"use client";

import { useMemo } from "react";
import { HardHat } from "lucide-react";
import type { UseCase } from "@/types";
import { analyzeUseCase } from "@/lib/architect-engine";
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

export function ArchitectWorkspace({ useCase }: { useCase: UseCase }) {
  const assessment = useMemo(() => analyzeUseCase(useCase), [useCase]);

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
      </div>

      <Tabs defaultValue="review" className="w-full">
        <TabsList>
          <TabsTrigger value="review">AI Architect Review</TabsTrigger>
          <TabsTrigger value="estimation">Effort Estimation</TabsTrigger>
        </TabsList>

        <TabsContent value="review" className="space-y-6">
          <ArchitectDocumentUpload useCase={useCase} wordCounts={assessment.wordCounts} />
          <OverallReadinessBanner score={assessment.overallScore} />

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {assessment.dimensions.map((d) => (
              <ReadinessGauge
                key={d.key}
                label={d.title.replace(" Readiness", "").replace(" Understanding", "")}
                score={d.score}
              />
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {assessment.dimensions.map((d) => (
              <ReadinessDimensionCard key={d.key} dimension={d} />
            ))}
          </div>

          <ArchitectQuestions questions={assessment.architectQuestions} />
          <TelecomImpactAnalysis areas={assessment.telecomImpactAreas} />
          <ArchitectureCard architecture={assessment.architecture} />
        </TabsContent>

        <TabsContent value="estimation">
          <EffortEstimationPanel assessment={assessment} />
        </TabsContent>
      </Tabs>
    </section>
  );
}
