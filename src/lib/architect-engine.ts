import type { UseCase } from "@/types";

import { TELECOM_IMPACT_AREAS } from "@/lib/constants";

import { countWords } from "@/lib/document-analysis";



export interface ReadinessCriterion {
  label: string;
  met: boolean;
  score?: number;
  evidence?: string;
  source?: string;
  confidence?: number;
  explanation?: string;
}



export interface ReadinessDimension {

  key: string;

  title: string;

  score: number;

  criteria: ReadinessCriterion[];

}



export interface WordCountStats {

  titleWords: number;

  descriptionWords: number;

  businessUserTotal: number;

  documentWords: number;

  hasDocument: boolean;

}



export interface TelecomImpactArea {

  area: string;

  relevance: number;

}



export interface ArchitectureRecommendation {

  pattern: string;

  technologies: string[];

  confidence: number;

  rationale: string;

}



export interface ModelEstimate {

  model: string;

  weeks: number;

  complexity: "Low" | "Medium" | "High";

  confidence: number;

}



export interface ConsensusEstimate {

  timelineMin: number;

  timelineMax: number;

  confidence: number;

}



export interface DeliveryRole {

  role: string;

  days: number;

}



export interface ArchitectGovernanceOutput {
  evidenceUsed: string[];
  missingInformation: string[];
  assumptions: string[];
  risks: string[];
  executiveSummary: string;
}

export interface ArchitectEstimationOutput {
  locked: boolean;
  lockReason?: string;
  modelEstimates: ModelEstimate[];
  consensus: ConsensusEstimate;
  deliveryTeam: DeliveryRole[];
  requiredSkills: string[];
  totalTeamDays: number;
}

export interface ArchitectDiscoveryQuestionItem {
  id: string;
  question: string;
  rationale: string;
  answer?: string;
  answeredAt?: string;
  answeredBy?: string;
  status: "missing" | "answered" | "used";
}

import type { MasterDiscoveryContext } from "@/lib/master-discovery-context";
import { EMPTY_MASTER_DISCOVERY_CONTEXT } from "@/lib/master-discovery-context";

export interface ArchitectAssessment {

  masterDiscoveryContext: MasterDiscoveryContext;

  dimensions: ReadinessDimension[];

  overallScore: number;

  /** @deprecated use discoveryQuestions */
  architectQuestions: string[];

  discoveryQuestions: ArchitectDiscoveryQuestionItem[];

  governance: ArchitectGovernanceOutput;

  architectureUnlocked: boolean;

  estimationUnlocked: boolean;

  telecomImpactAreas: TelecomImpactArea[];

  architecture: ArchitectureRecommendation;

  estimation: ArchitectEstimationOutput;

  modelEstimates: ModelEstimate[];

  consensus: ConsensusEstimate;

  deliveryTeam: DeliveryRole[];

  requiredSkills: string[];

  totalTeamDays: number;

  wordCounts: WordCountStats;

}



/** Full corpus for keyword analysis (includes architect document when uploaded). */

function analysisText(uc: UseCase): string {

  const parts = [uc.title, uc.description];

  if (uc.architectBrief?.extractedText) {

    parts.push(uc.architectBrief.extractedText);

  }

  parts.push(uc.category, uc.department, ...uc.tags);

  return parts.join(" ").toLowerCase();

}



export function getWordCountStats(uc: UseCase): WordCountStats {

  const titleWords = countWords(uc.title);

  const descriptionWords = countWords(uc.description);

  return {

    titleWords,

    descriptionWords,

    businessUserTotal: titleWords + descriptionWords,

    documentWords: uc.architectBrief?.wordCount ?? 0,

    hasDocument: Boolean(uc.architectBrief?.extractedText),

  };

}



function hasKeywords(text: string, keywords: string[]): boolean {

  return keywords.some((k) => text.includes(k));

}



function scoreCriteria(criteria: ReadinessCriterion[]): number {

  if (criteria.length === 0) return 0;

  const met = criteria.filter((c) => c.met).length;

  return Math.round((met / criteria.length) * 100);

}



function assessBusiness(uc: UseCase): ReadinessDimension {
  const keywords = analysisText(uc);

  const titleWords = countWords(uc.title);

  const descriptionWords = countWords(uc.description);

  const combinedWords = titleWords + descriptionWords;



  const criteria: ReadinessCriterion[] = [

    {

      label: "Business objective defined",

      met: descriptionWords >= 8 || (titleWords >= 3 && descriptionWords >= 4),

    },

    {

      label: "Problem clearly articulated",

      met: combinedWords >= 12 || descriptionWords >= 10,

    },

    {

      label: "Expected value identified",

      met: uc.impact !== "Low" || hasKeywords(keywords, ["value", "benefit", "roi", "saving", "revenue", "cost"]),

    },

    {

      label: "Stakeholders identified",

      met: hasKeywords(keywords, ["stakeholder", "sponsor", "team", "department", "business unit", "owner"]),

    },

    {

      label: "Success criteria identified",

      met: hasKeywords(keywords, ["kpi", "success", "target", "metric", "goal", "roi", "sla"]),

    },

    {

      label: "Existing process documented",

      met:

        combinedWords >= 25 ||

        hasKeywords(keywords, ["process", "workflow", "current", "as-is", "today", "manual"]),

    },

  ];



  // Surface word-count source in criteria labels when only business fields apply

  if (!uc.architectBrief) {

    criteria[0].label = `Business objective defined (${descriptionWords} desc. words)`;

    criteria[1].label = `Problem clearly articulated (${combinedWords} title+desc. words)`;

  }



  return { key: "business", title: "Business Understanding", score: scoreCriteria(criteria), criteria };

}



function assessData(uc: UseCase): ReadinessDimension {

  const text = analysisText(uc);

  const criteria: ReadinessCriterion[] = [

    { label: "Data source identified", met: hasKeywords(text, ["data", "database", "crm", "oss", "bss", "lake", "warehouse", "api"]) },

    { label: "Historical data exists", met: hasKeywords(text, ["historical", "archive", "years", "records", "logs", "transactions"]) },

    { label: "Data volume known", met: hasKeywords(text, ["million", "thousand", "volume", "records", "tb", "gb", "scale", "users"]) },

    { label: "Data quality understood", met: hasKeywords(text, ["quality", "clean", "labelled", "labeled", "validated", "accuracy"]) },

    { label: "Data ownership identified", met: hasKeywords(text, ["owner", "governance", "steward", "responsible", "domain"]) },

    { label: "GDPR classification identified", met: hasKeywords(text, ["gdpr", "privacy", "pii", "personal data", "consent", "retention"]) },

  ];

  return { key: "data", title: "Data Readiness", score: scoreCriteria(criteria), criteria };

}



function assessAI(uc: UseCase): ReadinessDimension {

  const text = analysisText(uc);

  const criteria: ReadinessCriterion[] = [

    { label: "Existing model available", met: hasKeywords(text, ["model", "pre-trained", "pretrained", "foundation", "gpt", "llm", "copilot"]) },

    { label: "Fine tuning required", met: hasKeywords(text, ["fine-tun", "finetun", "custom", "train", "domain-specific"]) },

    { label: "Human validation required", met: hasKeywords(text, ["human", "review", "validation", "supervision", "hitl", "agent"]) },

    { label: "Target accuracy identified", met: hasKeywords(text, ["accuracy", "precision", "recall", "f1", "quality", "threshold", "%"]) },

    { label: "Acceptance criteria defined", met: hasKeywords(text, ["acceptance", "criteria", "uat", "pilot", "benchmark", "sla"]) },

  ];

  return { key: "ai", title: "AI Readiness", score: scoreCriteria(criteria), criteria };

}



function assessSecurity(uc: UseCase): ReadinessDimension {

  const text = analysisText(uc);

  const criteria: ReadinessCriterion[] = [

    { label: "PII involved", met: hasKeywords(text, ["pii", "personal", "customer data", "subscriber", "identity"]) },

    { label: "Customer data involved", met: hasKeywords(text, ["customer", "subscriber", "consumer", "crm", "billing"]) },

    { label: "Critical infrastructure involved", met: hasKeywords(text, ["network", "core", "infrastructure", "oss", "ran", "5g", "fiber"]) },

    { label: "Network data involved", met: hasKeywords(text, ["network", "ran", "oss", "nms", "topology", "alarm", "kpi"]) },

    { label: "Security classification defined", met: hasKeywords(text, ["security", "classification", "confidential", "iso", "soc", "nist", "compliance"]) },

  ];

  const metCount = criteria.filter((c) => c.met).length;

  const base = metCount > 0 ? scoreCriteria(criteria) : 35;

  const telecomSecurity =

    uc.category === "Cybersecurity" || uc.category === "Fraud Detection" ? 70 : base;

  return {

    key: "security",

    title: "Security Readiness",

    score: Math.min(100, telecomSecurity + (metCount >= 3 ? 10 : 0)),

    criteria,

  };

}



function assessDelivery(uc: UseCase): ReadinessDimension {

  const text = analysisText(uc);

  const criteria: ReadinessCriterion[] = [

    { label: "Budget known", met: hasKeywords(text, ["budget", "cost", "investment", "capex", "opex", "€", "eur"]) },

    { label: "Timeline known", met: hasKeywords(text, ["timeline", "quarter", "month", "week", "phase", "roadmap", "milestone"]) },

    { label: "Team availability known", met: hasKeywords(text, ["team", "capacity", "resource", "fte", "availability"]) },

    { label: "Sponsor identified", met: hasKeywords(text, ["sponsor", "executive", "director", "steering", "owner"]) },

    { label: "Dependencies identified", met: hasKeywords(text, ["depend", "integration", "legacy", "vendor", "platform", "api"]) },

  ];

  return { key: "delivery", title: "Delivery Readiness", score: scoreCriteria(criteria), criteria };

}



function generateQuestions(uc: UseCase, dimensions: ReadinessDimension[]): string[] {

  const text = analysisText(uc);

  const questions: string[] = [];



  const unmet = (key: string) =>

    dimensions.find((d) => d.key === key)?.criteria.filter((c) => !c.met).map((c) => c.label) ?? [];



  for (const label of unmet("business")) {

    if (label.includes("Problem")) questions.push("What is the current pain point and how is it measured today?");

    if (label.includes("Success")) questions.push("What KPIs will define success for this initiative?");

    if (label.includes("Stakeholders")) questions.push("Who are the business sponsors and operational owners?");

  }



  for (const label of unmet("data")) {

    if (label.includes("Data source")) questions.push("Which systems hold the required data (OSS, BSS, CRM, data lake)?");

    if (label.includes("Historical")) questions.push("How much historical data is available and for what time period?");

    if (label.includes("volume")) questions.push("What is the expected data volume and growth rate?");

    if (label.includes("GDPR")) questions.push("What is the GDPR/privacy classification for the data involved?");

  }



  for (const label of unmet("ai")) {

    if (label.includes("accuracy")) questions.push("What target accuracy or quality threshold is required?");

    if (label.includes("Human")) questions.push("Is human-in-the-loop review required before actions are taken?");

  }



  if (hasKeywords(text, ["chatbot", "contact", "service", "care"])) {

    questions.push("Which languages are required for customer interactions?");

    questions.push("How many historical conversations exist for training or RAG?");

    questions.push("What channels are supported (voice, chat, app, social)?");

    questions.push("How many concurrent users are expected at peak?");

    questions.push("What response quality or CSAT target is expected?");

  }

  if (hasKeywords(text, ["churn", "retention", "subscriber"])) {

    questions.push("What churn definition and prediction horizon apply?");

    questions.push("Which customer segments are in scope?");

  }

  if (hasKeywords(text, ["field", "technician", "maintenance"])) {

    questions.push("How many field technicians will use the solution?");

    questions.push("What offline/connectivity constraints exist in the field?");

  }

  if (hasKeywords(text, ["network", "5g", "fiber", "ran"])) {

    questions.push("Which network domains are in scope (RAN, transport, core)?");

    questions.push("What real-time latency requirements apply?");

  }

  if (hasKeywords(text, ["fraud", "revenue"])) {

    questions.push("What fraud patterns or revenue leakage categories are targeted?");

    questions.push("What is the acceptable false-positive rate?");

  }



  if (questions.length === 0) {

    questions.push("What is the minimum viable scope for a pilot?");

    questions.push("What integration points with existing telecom platforms are required?");

    questions.push("What regulatory or compliance constraints apply?");

  }



  return [...new Set(questions)].slice(0, 8);

}



const IMPACT_KEYWORDS: Record<string, string[]> = {

  "Mobile Network": ["mobile", "5g", "ran", "radio", "lte", "spectrum"],

  "Fiber Network": ["fiber", "ftth", "fttx", "rollout", "passing", "pon"],

  OSS: ["oss", "network operations", "provisioning", "inventory", "alarm"],

  BSS: ["bss", "billing", "charging", "order", "subscription"],

  CRM: ["crm", "customer", "subscriber", "churn", "retention"],

  "Contact Center": ["contact", "call center", "chatbot", "ivr", "agent", "care"],

  Security: ["security", "cyber", "fraud", "threat", "siem", "soc"],

  "Data Platform": ["data", "analytics", "lake", "warehouse", "fabric", "databricks"],

  Wholesale: ["wholesale", "mvno", "interconnect", "carrier"],

  "TV Services": ["tv", "iptv", "ott", "entertainment", "streaming", "media"],

  IoT: ["iot", "m2m", "sensor", "connected", "device", "smart city"],

};



function assessTelecomImpact(uc: UseCase): TelecomImpactArea[] {

  const text = analysisText(uc);

  const results: TelecomImpactArea[] = [];



  for (const area of TELECOM_IMPACT_AREAS) {

    const keywords = IMPACT_KEYWORDS[area] ?? [area.toLowerCase()];

    let relevance = 0;

    for (const kw of keywords) {

      if (text.includes(kw)) relevance += 25;

    }

    if (area === "CRM" && uc.category === "Customer Experience") relevance += 40;

    if (area === "Contact Center" && uc.category === "Contact Center AI") relevance += 50;

    if (area === "Security" && (uc.category === "Cybersecurity" || uc.category === "Fraud Detection")) relevance += 50;

    if (area === "Data Platform" && uc.category === "Data & Analytics") relevance += 45;

    if (relevance > 0) {

      results.push({ area, relevance: Math.min(100, relevance) });

    }

  }



  if (results.length === 0) {

    results.push({ area: "Data Platform", relevance: 55 });

    results.push({ area: "CRM", relevance: 45 });

  }



  return results.sort((a, b) => b.relevance - a.relevance).slice(0, 6);

}



interface PatternRule {

  patterns: string[];

  pattern: string;

  technologies: string[];

  rationale: string;

}



const ARCHITECTURE_RULES: PatternRule[] = [

  {

    patterns: ["churn", "predict", "forecast", "anomaly", "scoring"],

    pattern: "Predictive Analytics",

    technologies: ["Azure ML", "Databricks", "Power BI"],

    rationale: "Structured prediction over subscriber or network telemetry suits a classical ML pipeline with MLOps and executive dashboards.",

  },

  {

    patterns: ["knowledge", "document", "policy", "faq", "assistant", "copilot", "rag"],

    pattern: "RAG Knowledge Assistant",

    technologies: ["Azure OpenAI", "Vector Database", "SharePoint"],

    rationale: "Unstructured enterprise knowledge retrieval benefits from RAG with governed document stores and semantic search.",

  },

  {

    patterns: ["agent", "autonomous", "workflow", "orchestrat", "technician", "field"],

    pattern: "Agentic AI",

    technologies: ["Azure OpenAI", "Mobile App", "Field Service Platform"],

    rationale: "Multi-step task automation with tool use fits an agentic architecture integrated with operational systems.",

  },

  {

    patterns: ["chatbot", "contact", "customer service", "conversational"],

    pattern: "Conversational AI",

    technologies: ["Azure OpenAI", "Bot Framework", "Contact Center Platform"],

    rationale: "Customer-facing dialogue requires orchestrated LLM responses with CRM integration and human handoff.",

  },

  {

    patterns: ["fraud", "security", "threat", "intrusion"],

    pattern: "Real-time Detection",

    technologies: ["Azure Stream Analytics", "SIEM", "Microsoft Sentinel"],

    rationale: "Fraud and security use cases need streaming detection with alerting and case management integration.",

  },

  {

    patterns: ["network", "5g", "fiber", "maintenance", "nms"],

    pattern: "Network Intelligence",

    technologies: ["Azure IoT", "Databricks", "Network OSS APIs"],

    rationale: "Telecom network optimization leverages telemetry ingestion, time-series analytics, and OSS/BSS integration.",

  },

];



function buildArchitectureRationale(
  uc: UseCase,
  pattern: string,
  technologies: string[],
  patternSummary: string
): string {
  const problem = uc.businessProblem.trim() || uc.description.trim();
  const solution = uc.proposedSolution.trim();
  const dept = uc.department?.trim() || "telecom operations";
  const stack = technologies.join(", ");

  const parts = [
    `Source systems from ${dept} and adjacent network or customer platforms feed ingestion pipelines into Microsoft Fabric and Azure Data Lake Storage with cataloguing and lineage.`,
    problem
      ? `This architecture addresses: ${problem.length > 180 ? `${problem.slice(0, 180)}…` : problem}`
      : `The design targets the ${uc.title} use case within ${uc.category}.`,
    solution
      ? `The proposed solution is realized through ${pattern}: ${solution.length > 140 ? `${solution.slice(0, 140)}…` : solution}`
      : patternSummary,
    `Processing, feature engineering, and model workflows run on Databricks and Azure Machine Learning; generative or copilot scenarios use Azure OpenAI with governed prompts and content safety.`,
    `Outputs integrate with OSS/BSS, CRM, or field operations via APIs and event streams; Power BI and operational dashboards expose KPIs to business and engineering stakeholders.`,
    `Security applies Azure AD, private networking, encryption, and role-based access aligned to subscriber and network data classification.`,
    `Recommended stack: ${stack}.`,
  ];

  return parts.filter(Boolean).join(" ");
}

function recommendArchitecture(uc: UseCase): ArchitectureRecommendation {

  const text = analysisText(uc);

  for (const rule of ARCHITECTURE_RULES) {

    if (hasKeywords(text, rule.patterns)) {

      const confidence = 75 + Math.min(20, rule.patterns.filter((p) => text.includes(p)).length * 5);

      return {
        pattern: rule.pattern,
        technologies: rule.technologies,
        confidence: Math.min(95, confidence),
        rationale: buildArchitectureRationale(uc, rule.pattern, rule.technologies, rule.rationale),
      };

    }

  }

  if (uc.category === "Generative AI" || uc.category === "AI Agents") {

    const pattern = "Generative AI Platform";
    const technologies = ["Azure OpenAI", "Azure AI Search", "API Management"];

    return {

      pattern,

      technologies,

      confidence: 78,

      rationale: buildArchitectureRationale(
        uc,
        pattern,
        technologies,
        "Generative workloads use a managed LLM platform with retrieval, guardrails, and API governance."
      ),

    };

  }

  const pattern = "Enterprise AI Foundation";
  const technologies = ["Microsoft Fabric", "Azure OpenAI", "Power BI"];

  return {

    pattern,

    technologies,

    confidence: 72,

    rationale: buildArchitectureRationale(
      uc,
      pattern,
      technologies,
      "A modular data and AI foundation supports iterative delivery aligned to CGI's Microsoft-centric telecom practice."
    ),

  };

}



function impactEffortMultiplier(uc: UseCase): number {

  const impact = { Low: 0.85, Medium: 1, High: 1.25 }[uc.impact];

  const effort = { Low: 0.8, Medium: 1, High: 1.35 }[uc.effort];

  return impact * effort;

}



function generateModelEstimates(uc: UseCase, arch: ArchitectureRecommendation): ModelEstimate[] {

  const mult = impactEffortMultiplier(uc);

  const baseWeeks = Math.round(
    (arch.pattern === "Agentic AI" ? 8 : arch.pattern === "RAG Knowledge Assistant" ? 6 : 5) * mult
  );

  const models: Omit<ModelEstimate, "weeks" | "confidence">[] = [

    { model: "GPT", complexity: "Medium" },

    { model: "Claude", complexity: "Medium" },

    { model: "Gemini", complexity: "Low" },

    { model: "DeepSeek", complexity: "Medium" },

  ];



  const variance = [0, 1.15, 0.88, 1.05];

  return models.map((m, i) => ({

    ...m,

    weeks: Math.max(4, Math.round(baseWeeks * variance[i])),
    confidence: Math.max(70, arch.confidence - i * 3),

  }));

}



function buildConsensus(estimates: ModelEstimate[]): ConsensusEstimate {

  const weeks = estimates.map((e) => e.weeks);
  const confidences = estimates.map((e) => e.confidence);
  return {
    timelineMin: Math.min(...weeks),
    timelineMax: Math.max(...weeks),
    confidence: Math.round(confidences.reduce((a, b) => a + b, 0) / confidences.length),
  };

}



function recommendDeliveryTeam(uc: UseCase, arch: ArchitectureRecommendation): {

  deliveryTeam: DeliveryRole[];

  requiredSkills: string[];

  totalTeamDays: number;

} {

  const mult = impactEffortMultiplier(uc);

  const deliveryTeam: DeliveryRole[] = [

    { role: "AI Architect", days: Math.round(10 * mult) },

    { role: "Business Analyst", days: Math.round(8 * mult) },

    { role: "Data Engineer", days: Math.round(15 * mult) },

    { role: "ML Engineer", days: Math.round(12 * mult) },

    { role: "Frontend Developer", days: Math.round(8 * mult) },

    { role: "Tester", days: Math.round(5 * mult) },

  ];



  if (arch.pattern === "Agentic AI") {

    deliveryTeam.push({ role: "Integration Specialist", days: Math.round(10 * mult) });

  }

  if (arch.pattern === "Real-time Detection") {

    deliveryTeam.push({ role: "Security Engineer", days: Math.round(7 * mult) });

  }



  const skillSet = new Set([

    "Azure OpenAI",

    "Databricks",

    "Microsoft Fabric",

    "Power BI",

    "MLOps",

    "AI Governance",

  ]);

  if (arch.technologies.some((t) => t.includes("SIEM") || t.includes("Sentinel"))) {

    skillSet.add("Microsoft Sentinel");

  }

  if (arch.technologies.some((t) => t.includes("Vector"))) {

    skillSet.add("Vector Search");

  }

  if (arch.technologies.some((t) => t.includes("IoT"))) {

    skillSet.add("Azure IoT");

  }

  if (uc.category === "5G Innovation" || uc.category === "Network Intelligence") {

    skillSet.add("Telecom OSS/BSS");

  }



  const totalTeamDays = deliveryTeam.reduce((sum, r) => sum + r.days, 0);

  return { deliveryTeam, requiredSkills: [...skillSet], totalTeamDays };

}



export function analyzeUseCase(uc: UseCase): ArchitectAssessment {

  const dimensions = [

    assessBusiness(uc),

    assessData(uc),

    assessAI(uc),

    assessSecurity(uc),

    assessDelivery(uc),

  ];

  const overallScore = Math.round(

    dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length

  );

  const architectQuestions = generateQuestions(uc, dimensions);

  const telecomImpactAreas = assessTelecomImpact(uc);

  const architecture = recommendArchitecture(uc);

  const modelEstimates = generateModelEstimates(uc, architecture);

  const consensus = buildConsensus(modelEstimates);

  const { deliveryTeam, requiredSkills, totalTeamDays } = recommendDeliveryTeam(uc, architecture);

  const discoveryQuestions = architectQuestions.map((question, index) => ({
    id: `Q${index + 1}`,
    question,
    rationale: "Follow-up question to close information gaps before architecture or estimation.",
    status: "missing" as const,
  }));

  const estimation = {
    locked: true,
    lockReason: "Insufficient information available.",
    modelEstimates,
    consensus,
    deliveryTeam,
    requiredSkills,
    totalTeamDays,
  };

  return {

    masterDiscoveryContext: { ...EMPTY_MASTER_DISCOVERY_CONTEXT },

    dimensions,

    overallScore,

    architectQuestions,

    discoveryQuestions,

    governance: {
      evidenceUsed: [],
      missingInformation: ["Rule-based preview only — OpenAI assessment required for workshop governance."],
      assumptions: [],
      risks: [],
      executiveSummary: "Use the discovery workshop with OpenAI assessment for consulting-grade output.",
    },

    architectureUnlocked: false,

    estimationUnlocked: false,

    telecomImpactAreas,

    architecture,

    estimation,

    modelEstimates,

    consensus,

    deliveryTeam,

    requiredSkills,

    totalTeamDays,

    wordCounts: getWordCountStats(uc),

  };

}



export function formatEur(amount: number): string {

  return new Intl.NumberFormat("nl-NL", {

    style: "currency",

    currency: "EUR",

    maximumFractionDigits: 0,

  }).format(amount);

}



export function getCompletenessBonus(uc: UseCase): number {

  let bonus = 0;

  const assessment = analyzeUseCase(uc);

  if (assessment.dimensions.find((d) => d.key === "business")!.score >= 70) bonus += 10;

  if (assessment.dimensions.find((d) => d.key === "data")!.score >= 50) bonus += 10;

  if (assessment.overallScore >= 60) bonus += 10;

  const wc = getWordCountStats(uc);

  if (wc.businessUserTotal >= 20) bonus += 10;

  if (uc.tags.length >= 2) bonus += 10;

  return bonus;

}


