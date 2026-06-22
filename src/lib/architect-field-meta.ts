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
    calculation: "Template rationale tied to the selected architecture pattern rule.",
  },
  "architecture.technologies": {
    meaning: "Suggested Microsoft / telecom technology stack for delivery.",
    calculation: "Predefined technology list per matched architecture pattern.",
  },
  "consensus.timelineMin": {
    meaning: "Optimistic delivery timeline in weeks across simulated model estimates.",
    calculation: "Minimum weeks from GPT, Claude, Gemini, and DeepSeek estimate variance.",
  },
  "consensus.timelineMax": {
    meaning: "Conservative delivery timeline in weeks across simulated model estimates.",
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

export function getCriterionMeta(dimensionKey: string, index: number, label: string): ArchitectFieldMeta {
  const ids: Record<string, string[]> = {
    business: [
      "business.objective",
      "business.problem",
      "business.value",
      "business.stakeholders",
      "business.success",
      "business.process",
    ],
    data: [],
    ai: [],
    security: [],
    delivery: [],
  };

  const id = ids[dimensionKey]?.[index];
  if (id && CRITERION_META[id]) return CRITERION_META[id];

  return {
    meaning: `Checklist item: ${label}`,
    calculation:
      "Met when relevant keywords or thresholds are found in title, description, architect brief, category, department, and tags.",
  };
}

export function getTelecomAreaMeta(area: string): ArchitectFieldMeta {
  return {
    meaning: `Likely impact on the ${area} domain within a telecom operator.`,
    calculation:
      "Relevance score from keyword hits in analysis text plus category-to-domain mapping bonuses.",
  };
}

export function getModelEstimateMeta(model: string): ArchitectFieldMeta {
  return {
    meaning: `Simulated ${model} timeline view for workshop discussion (not a live API call).`,
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

export function getQuestionMeta(index: number): ArchitectFieldMeta {
  return {
    meaning: `Follow-up question #${index + 1} to close information gaps before estimation.`,
    calculation: "Generated from unmet readiness criteria and telecom-specific keyword triggers.",
  };
}

export function getDimensionMeta(key: string): ArchitectFieldMeta {
  return (
    DIMENSION_META[key] ?? {
      meaning: "Readiness dimension score.",
      calculation: "Percentage of checklist criteria met in this dimension.",
    }
  );
}
