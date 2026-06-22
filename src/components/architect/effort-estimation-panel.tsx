"use client";

import { Calculator, Users } from "lucide-react";
import type { ArchitectAssessment } from "@/lib/architect-engine";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function EffortEstimationPanel({ assessment }: { assessment: ArchitectAssessment }) {
  const { modelEstimates, consensus } = assessment;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/20 bg-card/60 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Multi-Model Estimation Engine</h3>
        </div>
        <p className="mb-4 text-sm text-muted">
          Simulated timeline estimates from multiple AI models for workshop-grade planning.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {modelEstimates.map((est) => (
            <div
              key={est.model}
              className="rounded-lg border border-border/15 bg-background/50 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">{est.model}</span>
                <Badge variant="outline">{est.complexity}</Badge>
              </div>
              <p className="mt-2 text-2xl font-bold text-primary">{est.weeks} weeks</p>
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-xs text-muted">
                  <span>Confidence</span>
                  <span>{est.confidence}%</span>
                </div>
                <Progress value={est.confidence} className="h-1.5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-primary/25 bg-primary/5 p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
          Consensus Estimate
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted">Timeline</p>
            <p className="text-xl font-bold">
              {consensus.timelineMin}–{consensus.timelineMax} weeks
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">Confidence</p>
            <p className="text-xl font-bold text-primary">{consensus.confidence}%</p>
          </div>
        </div>
      </div>

      <DeliveryTeamPanel assessment={assessment} />
    </div>
  );
}

function DeliveryTeamPanel({ assessment }: { assessment: ArchitectAssessment }) {
  return (
    <div className="rounded-xl border border-border/20 bg-card/60 p-5">
      <div className="mb-4 flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">CGI Delivery Team Recommendation</h3>
      </div>
      <p className="mb-4 text-sm text-muted">
        Recommended team composition and skills for delivery.
      </p>
      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {assessment.deliveryTeam.map((role) => (
          <div
            key={role.role}
            className="flex items-center justify-between rounded-lg border border-border/15 bg-background/50 px-3 py-2"
          >
            <span className="text-sm">{role.role}</span>
            <span className="font-bold text-primary">{role.days} days</span>
          </div>
        ))}
      </div>
      <div className="mb-3 flex items-center justify-between rounded-lg bg-primary/10 px-4 py-3">
        <span className="font-medium">Total Team Effort</span>
        <span className="text-lg font-bold text-primary">{assessment.totalTeamDays} person-days</span>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Required Skills</p>
        <div className="flex flex-wrap gap-2">
          {assessment.requiredSkills.map((skill) => (
            <Badge key={skill} variant="secondary">
              {skill}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
