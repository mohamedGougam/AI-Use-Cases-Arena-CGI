import { READINESS_DIMENSION_DEFS } from "@/lib/readiness-criteria";

export type ArchitectMetaSource = "openai" | "rules" | "none";

export interface ArchitectFieldMeta {
  meaning: string;
  calculation: string;
}

const DIMENSION_META: Record<string, ArchitectFieldMeta> = {
  business: {
    meaning: "How well the business problem, value, and stakeholders are understood.",
    calculation:
      "Percentage of business checklist criteria met. Word-count checks use title + description only; keywords may include the architect brief.",
  },
  data: {
    meaning: "Whether data sources, volume, quality, and governance are sufficiently described.",
    calculation:
      "Percentage of data checklist criteria met via keyword matching in title, description, architect brief, category, and tags.",
  },
  ai: {
    meaning: "Readiness to select, train, or operate an AI solution with clear acceptance criteria.",
    calculation:
      "Percentage of AI checklist criteria met via keyword matching across the analysis text corpus.",
  },
  security: {
    meaning: "Visibility of privacy, customer data, and telecom infrastructure risks.",
    calculation:
      "Keyword-based security signals with category bonuses for Cybersecurity and Fraud Detection use cases.",
  },
  delivery: {
    meaning: "Clarity on budget, timeline, sponsors, team capacity, and dependencies.",
    calculation:
      "Percentage of delivery checklist criteria met via keyword matching in the submitted and architect-enriched text.",
  },
};

const CRITERION_META: Record<string, ArchitectFieldMeta> = {
  "business.objective": {
    meaning: "The submitter states a clear business goal in plain language.",
    calculation: "Met when description has ≥8 words, or title ≥3 and description ≥4 words.",
  },
  "business.problem": {
    meaning: "The pain point is understandable from the business user's own words.",
    calculation: "Met when combined title + description ≥12 words, or description alone ≥10 words.",
  },
  "business.value": {
    meaning: "Expected business value or impact level is identifiable.",
    calculation: "Met when impact is not Low, or value/ROI keywords appear in the analysis text.",
  },
  "business.stakeholders": {
    meaning: "Sponsors, owners, or stakeholder groups are mentioned.",
    calculation: "Keyword match for stakeholder, sponsor, team, department, owner, etc.",
  },
  "business.success": {
    meaning: "Measurable success criteria or KPIs are referenced.",
    calculation: "Keyword match for KPI, success, target, metric, goal, ROI, SLA.",
  },
  "business.process": {
    meaning: "The current or as-is process is described enough to scope change.",
    calculation: "Combined title + description ≥25 words, or process/workflow keywords present.",
  },
  "data.source": {
    meaning: "Required data sources or systems of record are named.",
    calculation: "Evidence of databases, CRM, OSS/BSS, data lake, or APIs in the submission.",
  },
  "data.historical": {
    meaning: "Historical records exist to train or benchmark the solution.",
    calculation: "References to archives, logs, transactions, or multi-period data.",
  },
  "data.volume": {
    meaning: "Scale of data (records, users, throughput) is described.",
    calculation: "Volume, scale, or magnitude indicators in the submission text.",
  },
  "data.quality": {
    meaning: "Data quality, labelling, or validation is addressed.",
    calculation: "Quality, accuracy, labelling, or validation language in the submission.",
  },
  "data.ownership": {
    meaning: "Data owners, stewards, or governance roles are identified.",
    calculation: "Ownership, stewardship, or governance references in the submission.",
  },
  "data.gdpr": {
    meaning: "Privacy classification and GDPR considerations are stated.",
    calculation: "GDPR, PII, privacy, consent, or retention language in the submission.",
  },
  "ai.model": {
    meaning: "An existing or foundation model approach is identified.",
    calculation: "References to models, LLMs, Copilot, or pre-trained capabilities.",
  },
  "ai.finetuning": {
    meaning: "Need for domain-specific training or fine-tuning is clear.",
    calculation: "Fine-tuning, custom training, or domain-specific model language.",
  },
  "ai.human": {
    meaning: "Human review or validation in the loop is specified.",
    calculation: "Human-in-the-loop, review, supervision, or approval workflow language.",
  },
  "ai.accuracy": {
    meaning: "Target accuracy, precision, or quality thresholds are defined.",
    calculation: "Accuracy, precision, recall, F1, threshold, or % targets in the submission.",
  },
  "ai.acceptance": {
    meaning: "Acceptance criteria for go-live are described.",
    calculation: "Acceptance, UAT, pilot, benchmark, or SLA criteria in the submission.",
  },
  "security.pii": {
    meaning: "Personal or subscriber-identifiable information is in scope.",
    calculation: "PII, personal data, subscriber, or identity references.",
  },
  "security.customer": {
    meaning: "Customer or subscriber data processing is involved.",
    calculation: "Customer, subscriber, consumer, CRM, or billing data references.",
  },
  "security.infrastructure": {
    meaning: "Critical telecom infrastructure is affected.",
    calculation: "Network core, infrastructure, OSS, RAN, 5G, or fiber references.",
  },
  "security.network": {
    meaning: "Network operational or telemetry data is used.",
    calculation: "RAN, OSS, NMS, topology, alarms, or network KPI references.",
  },
  "security.classification": {
    meaning: "Security or compliance classification is documented.",
    calculation: "Security classification, ISO, SOC, NIST, or compliance language.",
  },
  "delivery.budget": {
    meaning: "Budget or investment envelope is known.",
    calculation: "Budget, cost, investment, CAPEX, or OPEX references.",
  },
  "delivery.timeline": {
    meaning: "Delivery timeline or phasing is described.",
    calculation: "Timeline, quarter, phase, roadmap, or milestone language.",
  },
  "delivery.team": {
    meaning: "Team capacity or availability is addressed.",
    calculation: "Team, capacity, resource, FTE, or availability references.",
  },
  "delivery.sponsor": {
    meaning: "Executive or business sponsor is identified.",
    calculation: "Sponsor, executive, director, steering, or owner references.",
  },
  "delivery.dependencies": {
    meaning: "Technical or organisational dependencies are listed.",
    calculation: "Dependencies, integration, legacy, vendor, or platform references.",
  },
};

export const ARCHITECT_FIELD_META: Record<string, ArchitectFieldMeta> = {
  overallScore: {
    meaning: "Composite readiness across all five dimensions for workshop prioritization.",
    calculation: "Average of Business, Data, AI, Security, and Delivery dimension scores.",
  },
  "wordCount.title": {
    meaning: "Words in the business user's use case title.",
    calculation: "Whitespace-separated token count on the title field only.",
  },
  "wordCount.description": {
    meaning: "Words in the business user's short description.",
    calculation: "Whitespace-separated token count on the description field only.",
  },
  "wordCount.businessTotal": {
    meaning: "Combined length of business-submitted title and description.",
    calculation: "Sum of title word count and description word count.",
  },
  "wordCount.document": {
    meaning: "Words extracted from the architect-uploaded detailed brief.",
    calculation: "Local document parsing (PDF/DOCX/TXT/MD) with optional HF summary.",
  },
  "architecture.pattern": {
    meaning: "Recommended solution pattern aligned to CGI's Microsoft-centric telecom practice.",
    calculation: "Rule-based match on keywords and category (e.g. RAG, Agentic AI, Conversational AI).",
  },
  "architecture.confidence": {
    meaning: "How strongly the engine believes the recommended pattern fits this use case.",
    calculation: "Base confidence from matched architecture rules plus keyword hit density.",
  },
  "architecture.rationale": {
    meaning: "Consulting narrative explaining why this architecture fits the use case.",
    calculation: "Narrative aligned to the matched architecture pattern and use case signals.",
  },
  "architecture.technologies": {
    meaning: "Suggested Microsoft / telecom technology stack for delivery.",
    calculation: "Predefined technology list per matched architecture pattern.",
  },
  "consensus.timelineMin": {
    meaning: "Optimistic delivery timeline in weeks across multi-model estimates.",
    calculation: "Minimum weeks from GPT, Claude, Gemini, and DeepSeek estimate variance.",
  },
  "consensus.timelineMax": {
    meaning: "Conservative delivery timeline in weeks across multi-model estimates.",
    calculation: "Maximum weeks from the multi-model estimation engine.",
  },
  "consensus.confidence": {
    meaning: "Average confidence of the timeline consensus range.",
    calculation: "Mean confidence across all model estimates in the effort panel.",
  },
  totalTeamDays: {
    meaning: "Total person-days recommended for CGI delivery of this use case.",
    calculation: "Sum of role-level day estimates scaled by impact × effort multipliers.",
  },
  requiredSkills: {
    meaning: "Skills CGI should staff on the delivery team.",
    calculation: "Base skill set plus additions when architecture references Sentinel, IoT, or telecom OSS/BSS.",
  },
  ...DIMENSION_META,
  ...Object.fromEntries(
    Object.entries(DIMENSION_META).map(([key, meta]) => [
      `dimension.${key}.score`,
      meta,
    ])
  ),
  ...CRITERION_META,
};

export function getCriterionMeta(
  dimensionKey: string,
  index: number,
  label: string,
  source: ArchitectMetaSource = "rules"
): ArchitectFieldMeta {
  const def = READINESS_DIMENSION_DEFS.find((d) => d.key === dimensionKey);
  const criterionId = def?.criteria[index]?.id;
  const metaKey = criterionId ? `${dimensionKey}.${criterionId}` : null;

  if (metaKey && CRITERION_META[metaKey]) {
    const base = CRITERION_META[metaKey];
    if (source === "openai") {
      return {
        meaning: base.meaning,
        calculation:
          "When met: cites the source field (description, business problem, etc.) and quotes the exact sentence. When not met: lists fields checked and the gap.",
      };
    }
    return base;
  }

  return {
    meaning: label,
    calculation:
      source === "openai"
        ? "When met: cites source field and quotes the exact sentence from the submission. When not met: lists fields checked."
        : "Met when relevant keywords or thresholds are found in title, description, architect brief, category, department, and tags.",
  };
}

export function getTelecomAreaMeta(
  area: string,
  source: ArchitectMetaSource = "rules"
): ArchitectFieldMeta {
  return {
    meaning: `Likely impact on the ${area} domain within a telecom operator.`,
    calculation:
      source === "openai"
        ? "Relevance score from use case text, category, and telecom context."
        : "Relevance score from keyword hits in analysis text plus category-to-domain mapping bonuses.",
  };
}

export function getModelEstimateMeta(model: string): ArchitectFieldMeta {
  return {
    meaning: `${model} delivery timeline estimate for workshop planning.`,
    calculation:
      "Base weeks from architecture pattern × impact/effort multiplier, with per-model variance.",
  };
}

export function getDeliveryRoleMeta(role: string): ArchitectFieldMeta {
  return {
    meaning: `Recommended ${role} allocation for a CGI delivery squad.`,
    calculation: "Role baseline days × impact/effort multiplier, with pattern-specific role additions.",
  };
}

export function getQuestionMeta(
  index: number,
  source: ArchitectMetaSource = "rules"
): ArchitectFieldMeta {
  return {
    meaning: `Follow-up question #${index + 1} to close information gaps before estimation.`,
    calculation:
      source === "openai"
        ? "Generated from unmet readiness criteria and gaps in the business submission."
        : "Generated from unmet readiness criteria and telecom-specific keyword triggers.",
  };
}

export function getDimensionMeta(
  key: string,
  source: ArchitectMetaSource = "rules"
): ArchitectFieldMeta {
  const base =
    DIMENSION_META[key] ?? {
      meaning: "Readiness dimension score.",
      calculation: "Percentage of checklist criteria met in this dimension.",
    };
  if (source === "openai") {
    return {
      meaning: base.meaning,
      calculation: "Percentage of checklist criteria met from the business submission.",
    };
  }
  return base;
}
