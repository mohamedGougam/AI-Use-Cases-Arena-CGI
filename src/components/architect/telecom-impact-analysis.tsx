"use client";

import { Radio, Server, Shield, Wifi } from "lucide-react";
import type { TelecomImpactArea } from "@/lib/architect-engine";
import { getTelecomAreaMeta } from "@/lib/architect-field-meta";
import { EditableArchitectField } from "@/components/architect/editable-architect-field";
import type { ArchitectOverrideContext } from "@/components/architect/use-architect-overrides";
import type { AiAssessmentSource } from "@/components/architect/use-openai-assessment";
import { Progress } from "@/components/ui/progress";

const AREA_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "Mobile Network": Wifi,
  "Fiber Network": Radio,
  OSS: Server,
  BSS: Server,
  CRM: Server,
  "Contact Center": Radio,
  Security: Shield,
  "Data Platform": Server,
  Wholesale: Radio,
  "TV Services": Radio,
  IoT: Wifi,
};

export function TelecomImpactAnalysis({
  areas,
  overrides,
  source = "rules",
}: {
  areas: TelecomImpactArea[];
  overrides: ArchitectOverrideContext;
  source?: AiAssessmentSource;
}) {
  return (
    <div className="rounded-xl border border-border/20 bg-card/60 p-5">
      <h3 className="mb-1 font-semibold">Telecom Impact Analysis</h3>
      <p className="mb-4 text-sm text-muted">
        Domains likely impacted based on use case content, category, and telecom context.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {areas.map((area) => {
          const Icon = AREA_ICONS[area.area] ?? Server;
          const fieldKey = `telecom.${area.area}`;
          return (
            <div
              key={area.area}
              className="rounded-lg border border-border/15 bg-background/50 p-3 space-y-2"
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{area.area}</span>
              </div>
              <Progress value={area.relevance} className="h-1.5" />
              <EditableArchitectField
                fieldKey={fieldKey}
                label={`${area.area} relevance`}
                value={area.relevance}
                displayValue={`${area.relevance}%`}
                meta={getTelecomAreaMeta(area.area, source === "openai" ? "openai" : "rules")}
                type="number"
                isOverridden={overrides.isOverridden(fieldKey)}
                overrideNote={overrides.getNote(fieldKey)}
                onSave={(v, note) => overrides.onSave(fieldKey, v, note)}
                onReset={() => overrides.onReset(fieldKey)}
                className="!p-2 !bg-transparent"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
