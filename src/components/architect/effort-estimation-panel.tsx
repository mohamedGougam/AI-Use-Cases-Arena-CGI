"use client";

import { Calculator, Users } from "lucide-react";
import type { ArchitectAssessment } from "@/lib/architect-engine";
import { ARCHITECT_FIELD_META, getDeliveryRoleMeta, getModelEstimateMeta } from "@/lib/architect-field-meta";
import { EditableArchitectField } from "@/components/architect/editable-architect-field";
import type { ArchitectOverrideContext } from "@/components/architect/use-architect-overrides";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function EffortEstimationPanel({
  assessment,
  overrides,
}: {
  assessment: ArchitectAssessment;
  overrides: ArchitectOverrideContext;
}) {
  const { modelEstimates, consensus } = assessment;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/20 bg-card/60 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Multi-Model Estimation Engine</h3>
        </div>
        <p className="mb-4 text-sm text-muted">
          Consensus timeline estimates from GPT, Claude, Gemini, and DeepSeek for workshop planning.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {modelEstimates.map((est) => {
            const weeksKey = `estimate.${est.model}.weeks`;
            const confKey = `estimate.${est.model}.confidence`;
            const meta = getModelEstimateMeta(est.model);
            return (
              <div
                key={est.model}
                className="rounded-lg border border-border/15 bg-background/50 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">{est.model}</span>
                  <Badge variant="outline">{est.complexity}</Badge>
                </div>
                <EditableArchitectField
                  fieldKey={weeksKey}
                  label="Timeline (weeks)"
                  value={est.weeks}
                  displayValue={`${est.weeks} weeks`}
                  meta={meta}
                  type="number"
                  isOverridden={overrides.isOverridden(weeksKey)}
                  overrideNote={overrides.getNote(weeksKey)}
                  onSave={(v, note) => overrides.onSave(weeksKey, v, note)}
                  onReset={() => overrides.onReset(weeksKey)}
                />
                <EditableArchitectField
                  fieldKey={confKey}
                  label="Confidence"
                  value={est.confidence}
                  displayValue={`${est.confidence}%`}
                  meta={meta}
                  type="number"
                  isOverridden={overrides.isOverridden(confKey)}
                  overrideNote={overrides.getNote(confKey)}
                  onSave={(v, note) => overrides.onSave(confKey, v, note)}
                  onReset={() => overrides.onReset(confKey)}
                />
                <Progress value={est.confidence} className="h-1.5" />
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-primary/25 bg-primary/5 p-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-primary">
          Consensus Estimate
        </h3>
        <EditableArchitectField
          fieldKey="consensus.timelineMin"
          label="Timeline (min weeks)"
          value={consensus.timelineMin}
          displayValue={`${consensus.timelineMin} weeks`}
          meta={ARCHITECT_FIELD_META["consensus.timelineMin"]}
          type="number"
          isOverridden={overrides.isOverridden("consensus.timelineMin")}
          overrideNote={overrides.getNote("consensus.timelineMin")}
          onSave={(v, note) => overrides.onSave("consensus.timelineMin", v, note)}
          onReset={() => overrides.onReset("consensus.timelineMin")}
        />
        <EditableArchitectField
          fieldKey="consensus.timelineMax"
          label="Timeline (max weeks)"
          value={consensus.timelineMax}
          displayValue={`${consensus.timelineMax} weeks`}
          meta={ARCHITECT_FIELD_META["consensus.timelineMax"]}
          type="number"
          isOverridden={overrides.isOverridden("consensus.timelineMax")}
          overrideNote={overrides.getNote("consensus.timelineMax")}
          onSave={(v, note) => overrides.onSave("consensus.timelineMax", v, note)}
          onReset={() => overrides.onReset("consensus.timelineMax")}
        />
        <EditableArchitectField
          fieldKey="consensus.confidence"
          label="Consensus confidence"
          value={consensus.confidence}
          displayValue={`${consensus.confidence}%`}
          meta={ARCHITECT_FIELD_META["consensus.confidence"]}
          type="number"
          isOverridden={overrides.isOverridden("consensus.confidence")}
          overrideNote={overrides.getNote("consensus.confidence")}
          onSave={(v, note) => overrides.onSave("consensus.confidence", v, note)}
          onReset={() => overrides.onReset("consensus.confidence")}
        />
      </div>

      <DeliveryTeamPanel assessment={assessment} overrides={overrides} />
    </div>
  );
}

function DeliveryTeamPanel({
  assessment,
  overrides,
}: {
  assessment: ArchitectAssessment;
  overrides: ArchitectOverrideContext;
}) {
  return (
    <div className="rounded-xl border border-border/20 bg-card/60 p-5">
      <div className="mb-4 flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">CGI Delivery Team Recommendation</h3>
      </div>
      <p className="mb-4 text-sm text-muted">
        Recommended team composition and skills for delivery.
      </p>
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        {assessment.deliveryTeam.map((role) => {
          const key = `delivery.${role.role}.days`;
          return (
            <EditableArchitectField
              key={role.role}
              fieldKey={key}
              label={role.role}
              value={role.days}
              displayValue={`${role.days} days`}
              meta={getDeliveryRoleMeta(role.role)}
              type="number"
              isOverridden={overrides.isOverridden(key)}
              overrideNote={overrides.getNote(key)}
              onSave={(v, note) => overrides.onSave(key, v, note)}
              onReset={() => overrides.onReset(key)}
            />
          );
        })}
      </div>
      <EditableArchitectField
        fieldKey="totalTeamDays"
        label="Total team effort"
        value={assessment.totalTeamDays}
        displayValue={`${assessment.totalTeamDays} person-days`}
        meta={ARCHITECT_FIELD_META.totalTeamDays}
        type="number"
        isOverridden={overrides.isOverridden("totalTeamDays")}
        overrideNote={overrides.getNote("totalTeamDays")}
        onSave={(v, note) => overrides.onSave("totalTeamDays", v, note)}
        onReset={() => overrides.onReset("totalTeamDays")}
      />
      <div className="mt-4">
        <EditableArchitectField
          fieldKey="requiredSkills"
          label="Required skills"
          value={assessment.requiredSkills.join(", ")}
          meta={ARCHITECT_FIELD_META.requiredSkills}
          type="textarea"
          isOverridden={overrides.isOverridden("requiredSkills")}
          overrideNote={overrides.getNote("requiredSkills")}
          onSave={(v, note) => overrides.onSave("requiredSkills", v, note)}
          onReset={() => overrides.onReset("requiredSkills")}
        />
      </div>
    </div>
  );
}
