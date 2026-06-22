"use client";

import { Radio, Server, Shield, Wifi } from "lucide-react";
import type { TelecomImpactArea } from "@/lib/architect-engine";
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

export function TelecomImpactAnalysis({ areas }: { areas: TelecomImpactArea[] }) {
  return (
    <div className="rounded-xl border border-border/20 bg-card/60 p-5">
      <h3 className="mb-1 font-semibold">Telecom Impact Analysis</h3>
      <p className="mb-4 text-sm text-muted">
        Domains likely impacted based on use case content, category, and telecom context.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {areas.map((area) => {
          const Icon = AREA_ICONS[area.area] ?? Server;
          return (
            <div
              key={area.area}
              className="rounded-lg border border-border/15 bg-background/50 p-3"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{area.area}</span>
                </div>
                <span className="text-xs font-bold text-primary">{area.relevance}%</span>
              </div>
              <Progress value={area.relevance} className="h-1.5" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
