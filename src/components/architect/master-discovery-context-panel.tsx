"use client";

import { Database } from "lucide-react";
import type { MasterDiscoveryContext } from "@/lib/master-discovery-context";
import { masterContextHasContent } from "@/lib/master-discovery-context";

const SECTION_LABELS: Record<keyof MasterDiscoveryContext, string> = {
  businessObjectives: "Business objectives",
  businessProblems: "Business problems",
  expectedBenefits: "Expected benefits",
  stakeholders: "Stakeholders",
  successCriteria: "Success criteria",
  dataSources: "Data sources",
  dataVolumes: "Data volumes",
  integrations: "Integrations",
  complianceRequirements: "Compliance",
  securityRequirements: "Security",
  architectureIndicators: "Architecture indicators",
  assumptions: "Assumptions",
  risks: "Risks",
};

export function MasterDiscoveryContextPanel({
  context,
}: {
  context: MasterDiscoveryContext;
}) {
  if (!masterContextHasContent(context)) {
    return (
      <div className="rounded-xl border border-border/20 bg-card/60 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Database className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Master Discovery Context</h3>
        </div>
        <p className="text-sm text-muted">
          Holistic context will appear after OpenAI reads all submission fields, documents, and workshop
          answers.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Master Discovery Context</h3>
        </div>
        <p className="mt-1 text-sm text-muted">
          Facts extracted from all sources before readiness scoring — title, description, business problem,
          solution, documents, workshop answers, and prior assessment.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(Object.keys(SECTION_LABELS) as (keyof MasterDiscoveryContext)[]).map((key) => {
          const items = context[key];
          if (!items.length) return null;
          return (
            <div
              key={key}
              className="rounded-lg border border-border/15 bg-background/40 p-3"
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/80">
                {SECTION_LABELS[key]}
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted">
                {items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-primary/50">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
