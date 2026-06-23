/** Aggregated discovery facts extracted from all use case sources before readiness scoring. */
export interface MasterDiscoveryContext {
  businessObjectives: string[];
  businessProblems: string[];
  expectedBenefits: string[];
  stakeholders: string[];
  successCriteria: string[];
  dataSources: string[];
  dataVolumes: string[];
  integrations: string[];
  complianceRequirements: string[];
  securityRequirements: string[];
  architectureIndicators: string[];
  assumptions: string[];
  risks: string[];
}

export const EMPTY_MASTER_DISCOVERY_CONTEXT: MasterDiscoveryContext = {
  businessObjectives: [],
  businessProblems: [],
  expectedBenefits: [],
  stakeholders: [],
  successCriteria: [],
  dataSources: [],
  dataVolumes: [],
  integrations: [],
  complianceRequirements: [],
  securityRequirements: [],
  architectureIndicators: [],
  assumptions: [],
  risks: [],
};

export const MASTER_DISCOVERY_CONTEXT_SCHEMA = `{
  "businessObjectives": ["string — extracted from ANY source"],
  "businessProblems": ["string"],
  "expectedBenefits": ["string — KPIs, % improvements, value statements"],
  "stakeholders": ["string — roles, teams, sponsors"],
  "successCriteria": ["string"],
  "dataSources": ["string — systems, datasets, APIs"],
  "dataVolumes": ["string — scale, history, refresh rates"],
  "integrations": ["string — OSS/BSS, CRM, network systems"],
  "complianceRequirements": ["string — GDPR, regulatory"],
  "securityRequirements": ["string"],
  "architectureIndicators": ["string — patterns, tech hints"],
  "assumptions": ["string — label unresolved if not evidenced"],
  "risks": ["string"]
}`;

export function parseMasterDiscoveryContext(raw: unknown): MasterDiscoveryContext {
  if (!raw || typeof raw !== "object") return { ...EMPTY_MASTER_DISCOVERY_CONTEXT };

  const o = raw as Record<string, unknown>;
  const list = (key: keyof MasterDiscoveryContext) =>
    Array.isArray(o[key])
      ? (o[key] as unknown[])
          .map((item) => String(item).trim())
          .filter(Boolean)
          .slice(0, 12)
      : [];

  return {
    businessObjectives: list("businessObjectives"),
    businessProblems: list("businessProblems"),
    expectedBenefits: list("expectedBenefits"),
    stakeholders: list("stakeholders"),
    successCriteria: list("successCriteria"),
    dataSources: list("dataSources"),
    dataVolumes: list("dataVolumes"),
    integrations: list("integrations"),
    complianceRequirements: list("complianceRequirements"),
    securityRequirements: list("securityRequirements"),
    architectureIndicators: list("architectureIndicators"),
    assumptions: list("assumptions"),
    risks: list("risks"),
  };
}

export function masterContextHasContent(ctx: MasterDiscoveryContext): boolean {
  return Object.values(ctx).some((arr) => arr.length > 0);
}
