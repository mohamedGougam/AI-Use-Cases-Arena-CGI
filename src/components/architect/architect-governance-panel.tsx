"use client";

import type { ComponentType } from "react";
import { FileSearch, AlertTriangle, Lightbulb, ShieldAlert } from "lucide-react";
import type { ArchitectGovernanceOutput } from "@/lib/architect-engine";

export function ArchitectGovernancePanel({
  governance,
  confidence,
}: {
  governance: ArchitectGovernanceOutput;
  confidence: number;
}) {
  return (
    <div className="rounded-xl border border-border/20 bg-card/60 p-5 space-y-4">
      <div>
        <h3 className="font-semibold">Consulting Assessment Summary</h3>
        <p className="mt-1 text-sm text-muted">{governance.executiveSummary}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted">
          Architecture Confidence
        </span>
        <span className="text-2xl font-bold tabular-nums text-primary">{confidence}%</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GovernanceList
          icon={FileSearch}
          title="Evidence used"
          items={governance.evidenceUsed}
          empty="No evidenced facts captured yet."
        />
        <GovernanceList
          icon={AlertTriangle}
          title="Missing information"
          items={governance.missingInformation}
          empty="No gaps identified."
          variant="warning"
        />
        <GovernanceList
          icon={Lightbulb}
          title="Assumptions"
          items={governance.assumptions}
          empty="No assumptions recorded."
        />
        <GovernanceList
          icon={ShieldAlert}
          title="Risks"
          items={governance.risks}
          empty="No risks identified."
          variant="warning"
        />
      </div>
    </div>
  );
}

function GovernanceList({
  icon: Icon,
  title,
  items,
  empty,
  variant,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  items: string[];
  empty: string;
  variant?: "warning";
}) {
  return (
    <div className="rounded-lg border border-border/15 bg-background/40 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon className={`h-4 w-4 ${variant === "warning" ? "text-amber-500" : "text-primary"}`} />
        <h4 className="text-sm font-semibold">{title}</h4>
      </div>
      {items.length ? (
        <ul className="space-y-1.5 text-sm text-muted">
          {items.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-primary/60">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted italic">{empty}</p>
      )}
    </div>
  );
}
