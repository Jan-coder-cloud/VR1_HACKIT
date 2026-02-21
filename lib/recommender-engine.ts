import { createEmbedding } from "@/lib/embeddings";
import { generateChatCompletion } from "@/lib/groq";
import { sendTelegramMessages } from "@/lib/telegram";
import {
  BeneficiaryUser,
  SchemeRecord,
  listBeneficiaryUsersDetailed,
  listRecommendationLogs,
  listSchemesDetailed,
  queueNotifications,
} from "@/lib/vector-store";

export type RecommenderIntent =
  | "analyze"
  | "recommend"
  | "notify"
  | "list_users"
  | "list_schemes"
  | "general";

export type RecommenderContext = {
  schemeTitle: string | null;
  recommendedUserIds: string[];
  rankingSnapshot: Array<{
    userId: string;
    finalScore: number;
    acceptanceProbability: number;
    bundle: string[];
  }>;
  lastIntent: RecommenderIntent | null;
};

type IntentExtraction = {
  intent: RecommenderIntent;
  schemeName: string | null;
  customMessage: string | null;
};

type EligibilityRules = {
  minAge: number | null;
  maxAge: number | null;
  minIncome: number | null;
  maxIncome: number | null;
  requiredLivelihood: string | null;
  areaType: "rural" | "urban" | null;
  requiredRationCard: string | null;
  seniorCitizenRequired: boolean;
  minDependents: number | null;
  minCibilScore: number | null;
  minTransactionCount: number | null;
};

type SchemeMetadata = {
  eligibilityRules: EligibilityRules;
  benefits: string[];
  targetDemographics: string[];
  riskCategory: string;
  urgencyIndicators: string[];
};

type RankedUser = {
  id: string;
  name: string;
  email: string;
  mobile: string | null;
  telegramChatId: string | null;
  annualIncome: number | null;
  householdSize: number | null;
  location: string | null;
  category: string | null;
  isVulnerable: boolean;
  vectorSimilarity: number;
  vulnerabilityScore: number;
  financialReadinessScore: number;
  acceptanceProbability: number;
  finalScore: number;
  explanation: string;
  bundle: string[];
  age: number | null;
  cibilScore: number | null;
  transactionCount: number | null;
};

type FairnessMetrics = {
  genderDistribution: Record<string, number>;
  ruralUrbanDistribution: Record<string, number>;
  incomeGroupCoverage: Record<string, number>;
  imbalanceDetected: boolean;
  vulnerabilityWeightAdjustment: number;
};

type RecommendationResponse = {
  answer: string;
  scheme: Record<string, unknown> | null;
  eligibleUsers: Array<Record<string, unknown>>;
  rankedUsers: Array<Record<string, unknown>>;
  acceptanceInsights: Array<Record<string, unknown>>;
  fairnessMetrics: FairnessMetrics;
  telegramResult: Record<string, unknown> | null;
  notifications: { queued: number };
  context: RecommenderContext;
};

type ChatHistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

type FollowupQueryType = "selection_basis" | "scheme_details" | "list_context_users" | "none";

const scoreWeights = {
  eligibility: 0.2,
  vectorSimilarity: 0.25,
  vulnerability: 0.25,
  acceptance: 0.3,
} as const;

function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function normalizeMessage(text: string) {
  return text.trim().toLowerCase();
}

function isGreetingMessage(text: string) {
  const lower = normalizeMessage(text);
  return ["hi", "hello", "hey", "namaste", "good morning", "good evening"].includes(lower);
}

function asksSelectionBasis(text: string) {
  const lower = normalizeMessage(text);
  return (
    lower.includes("basis") ||
    lower.includes("why selected") ||
    lower.includes("why them") ||
    lower.includes("how selected") ||
    lower.includes("on what basis") ||
    lower.includes("shortlisted") ||
    lower.includes("rationale") ||
    lower.includes("why these users") ||
    lower.includes("selection criteria") ||
    lower.includes("why this ranking")
  );
}

function asksSchemeDetails(text: string) {
  const lower = normalizeMessage(text);
  return (
    lower.includes("eligibility") ||
    lower.includes("details") ||
    lower.includes("detail") ||
    lower.includes("benefits") ||
    lower.includes("criteria") ||
    lower.includes("who can apply") ||
    lower.includes("requirements")
  );
}

function asksContextUserList(text: string) {
  const lower = normalizeMessage(text);
  return (
    lower.includes("eligible user") ||
    lower.includes("list users") ||
    lower.includes("who are eligible") ||
    lower.includes("who can avail") ||
    lower.includes("show shortlisted")
  );
}

async function classifyFollowupQuery(args: {
  message: string;
  history?: ChatHistoryMessage[];
  hasContextScheme: boolean;
  hasRankingSnapshot: boolean;
}): Promise<FollowupQueryType> {
  if (asksSelectionBasis(args.message)) return "selection_basis";
  if (asksSchemeDetails(args.message)) return "scheme_details";
  if (asksContextUserList(args.message) && args.hasRankingSnapshot) return "list_context_users";

  const historyText =
    args.history && args.history.length > 0
      ? args.history
          .slice(-8)
          .map((item, idx) => `${idx + 1}. ${item.role}: ${item.content}`)
          .join("\n")
      : "No prior chat history.";

  const prompt = `Message: ${args.message}
Has context scheme: ${args.hasContextScheme ? "yes" : "no"}
Has ranking snapshot: ${args.hasRankingSnapshot ? "yes" : "no"}
Recent history:
${historyText}

Classify message into one:
- selection_basis (asks why/how users were selected/ranked/shortlisted or version which has similar meanings)
- scheme_details (asks benefits/eligibility/requirements of scheme)

- list_context_users (asks to list eligible/shortlisted users from current context)
- none

Return strict JSON:
{"type":"selection_basis|scheme_details|list_context_users|none"}`;

  try {
    const content = await generateChatCompletion({
      systemPrompt:
        "Classify admin follow-up intent for a welfare recommendation chatbot. Output JSON only.",
      userPrompt: prompt,
      temperature: 0,
    });
    const parsed = parseJsonObject<{ type?: FollowupQueryType }>(content);
    const value = parsed?.type;
    if (
      value === "selection_basis" ||
      value === "scheme_details" ||
      value === "list_context_users" ||
      value === "none"
    ) {
      return value;
    }
  } catch {
    // Intentionally fallback to deterministic heuristics below.
  }

  return "none";
}

async function conversationalAnswer(args: {
  message: string;
  baseAnswer: string;
  history?: ChatHistoryMessage[];
  schemeName?: string | null;
  rankedPreview?: Array<{ name: string; score: number; acceptance: number }>;
  strictRules?: EligibilityRules | null;
}) {
  const historyText =
    args.history && args.history.length > 0
      ? args.history
          .slice(-8)
          .map((item, idx) => `${idx + 1}. ${item.role}: ${item.content}`)
          .join("\n")
      : "No prior chat history.";

  const rankedText =
    args.rankedPreview && args.rankedPreview.length > 0
      ? args.rankedPreview
          .map(
            (row, idx) =>
              `${idx + 1}. ${row.name} (score=${row.score.toFixed(2)}, acceptance=${row.acceptance}%)`
          )
          .join("\n")
      : "No ranking preview available.";

  const strictRulesText = args.strictRules
    ? JSON.stringify(args.strictRules)
    : "No strict eligibility rules in this turn.";

  const prompt = `User message: ${args.message}
Current scheme: ${args.schemeName ?? "none"}
Deterministic engine answer: ${args.baseAnswer}
Strict rules snapshot: ${strictRulesText}
Ranking preview: ${rankedText}
Conversation history:
${historyText}

Rewrite the deterministic answer to sound like an intelligent assistant in ongoing conversation.
Rules:
- Keep facts exactly aligned to deterministic engine answer.
- Do not invent users/schemes/scores.
- Keep concise and helpful, but not vague.
- If ranking evidence exists, include concrete score/acceptance numbers in the response.
- If deterministic answer is "sorry not found", return exactly "sorry not found".`;

  try {
    const content = await generateChatCompletion({
      systemPrompt:
        "You are a contextual financial admin chatbot. Preserve factual grounding from provided deterministic evidence.",
      userPrompt: prompt,
      temperature: 0.2,
    });
    const normalized = normalizeString(content);
    if (!normalized) return args.baseAnswer;
    if (args.baseAnswer === "sorry not found") return "sorry not found";
    return normalized;
  } catch {
    return args.baseAnswer;
  }
}

function toSafeNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^\d.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizeNumber(value: number | null, min: number, max: number) {
  if (value === null) return 0;
  if (max <= min) return 0;
  return clamp((value - min) / (max - min));
}

function normalizeString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeBool(value: unknown): boolean {
  return value === true || value === "true";
}

function getCriteriaValue(user: BeneficiaryUser, key: string): unknown {
  const criteria = user.criteria as Record<string, unknown> | null;
  return criteria?.[key];
}

function getUserAge(user: BeneficiaryUser): number | null {
  return toSafeNumber(getCriteriaValue(user, "age"));
}

function getUserCibilScore(user: BeneficiaryUser): number | null {
  const direct = toSafeNumber(getCriteriaValue(user, "cibilScore"));
  return direct ?? toSafeNumber(getCriteriaValue(user, "creditScore"));
}

function getUserTransactionCount(user: BeneficiaryUser): number | null {
  const count = toSafeNumber(getCriteriaValue(user, "pastTransactionCount"));
  return count ?? toSafeNumber(getCriteriaValue(user, "transactionCount"));
}

function getUserAverageTransactionAmount(user: BeneficiaryUser): number | null {
  return toSafeNumber(getCriteriaValue(user, "avgTransactionAmount"));
}

function getUserTransactionRecencyDays(user: BeneficiaryUser): number | null {
  return toSafeNumber(getCriteriaValue(user, "lastTransactionDaysAgo"));
}

function getAreaType(user: BeneficiaryUser): "rural" | "urban" | null {
  const direct = normalizeString(getCriteriaValue(user, "areaType"));
  if (direct?.toLowerCase() === "rural") return "rural";
  if (direct?.toLowerCase() === "urban") return "urban";

  const tags = user.eligibility_tags.map((tag) => tag.toLowerCase());
  if (tags.includes("rural")) return "rural";
  if (tags.includes("urban")) return "urban";
  return null;
}

function parseEligibilityRules(scheme: SchemeRecord): EligibilityRules {
  const raw = (scheme.eligibility ?? {}) as Record<string, unknown>;
  const requiredLivelihoodRaw =
    normalizeString(raw.requiredLivelihood) ?? normalizeString(raw.allowedLivelihood);
  const rationCardRaw = normalizeString(raw.requiredRationCard) ?? normalizeString(raw.rationCard);
  const areaRaw = normalizeString(raw.areaType)?.toLowerCase() ?? null;

  return {
    minAge: toSafeNumber(raw.minAge) ?? scheme.min_age ?? null,
    maxAge: toSafeNumber(raw.maxAge) ?? scheme.max_age ?? null,
    minIncome: toSafeNumber(raw.minIncome),
    maxIncome: toSafeNumber(raw.maxIncome),
    requiredLivelihood: requiredLivelihoodRaw?.toLowerCase() ?? null,
    areaType: areaRaw === "rural" || areaRaw === "urban" ? areaRaw : null,
    requiredRationCard: rationCardRaw?.toLowerCase() ?? null,
    seniorCitizenRequired: normalizeBool(raw.seniorCitizenRequired),
    minDependents: toSafeNumber(raw.minDependents),
    minCibilScore: toSafeNumber(raw.minCibilScore),
    minTransactionCount: toSafeNumber(raw.minTransactionCount),
  };
}

function passStrictEligibility(user: BeneficiaryUser, rules: EligibilityRules) {
  const age = getUserAge(user);
  if (rules.minAge !== null && (age === null || age < rules.minAge)) return false;
  if (rules.maxAge !== null && (age === null || age > rules.maxAge)) return false;

  const income = user.annual_income ?? null;
  if (rules.minIncome !== null && (income === null || income < rules.minIncome)) return false;
  if (rules.maxIncome !== null && (income === null || income > rules.maxIncome)) return false;

  if (rules.requiredLivelihood) {
    const category = (user.category ?? "").toLowerCase();
    const tags = user.eligibility_tags.map((tag) => tag.toLowerCase());
    if (category !== rules.requiredLivelihood && !tags.includes(rules.requiredLivelihood)) {
      return false;
    }
  }

  if (rules.areaType) {
    const userArea = getAreaType(user);
    if (userArea !== rules.areaType) {
      return false;
    }
  }

  if (rules.requiredRationCard) {
    const rationCardType = normalizeString(getCriteriaValue(user, "rationCardType"))?.toLowerCase();
    if (!rationCardType || rationCardType !== rules.requiredRationCard) {
      return false;
    }
  }

  if (rules.seniorCitizenRequired) {
    const ageValue = getUserAge(user);
    if (ageValue === null || ageValue < 60) return false;
  }

  if (rules.minDependents !== null) {
    const dependents = toSafeNumber(getCriteriaValue(user, "dependents"));
    if (dependents === null || dependents < rules.minDependents) return false;
  }

  if (rules.minCibilScore !== null) {
    const cibil = getUserCibilScore(user);
    if (cibil === null || cibil < rules.minCibilScore) return false;
  }

  if (rules.minTransactionCount !== null) {
    const transactions = getUserTransactionCount(user);
    if (transactions === null || transactions < rules.minTransactionCount) return false;
  }

  return true;
}

function cosineSimilarity(a: number[], b: number[]) {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let aNorm = 0;
  let bNorm = 0;

  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    aNorm += a[i] * a[i];
    bNorm += b[i] * b[i];
  }

  if (aNorm === 0 || bNorm === 0) return 0;
  return clamp(dot / (Math.sqrt(aNorm) * Math.sqrt(bNorm)));
}

function userProfileText(user: BeneficiaryUser) {
  return [
    `name: ${user.name}`,
    `category: ${user.category ?? "unknown"}`,
    `tags: ${user.eligibility_tags.join(", ")}`,
    `income: ${user.annual_income ?? "unknown"}`,
    `household: ${user.household_size ?? "unknown"}`,
    `location: ${user.location ?? "unknown"}`,
    `vulnerable: ${user.is_vulnerable ? "yes" : "no"}`,
  ].join("\n");
}

function schemeText(scheme: SchemeRecord) {
  return [
    `name: ${scheme.name}`,
    `category: ${scheme.category}`,
    `type: ${scheme.type ?? "unknown"}`,
    `summary: ${scheme.summary ?? ""}`,
    `benefits: ${(scheme.benefits ?? []).join(", ")}`,
    `eligibility: ${JSON.stringify(scheme.eligibility ?? {})}`,
    `eligibility text: ${scheme.eligibility_text ?? ""}`,
  ].join("\n");
}

function vulnerabilityScore(user: BeneficiaryUser) {
  const income = user.annual_income ?? 0;
  const incomeComponent = income > 0 ? clamp((300000 - income) / 300000) : 0.2;
  const householdComponent = clamp((user.household_size ?? 1) / 8);
  const ruralComponent = getAreaType(user) === "rural" ? 1 : 0;
  const vulnerableComponent = user.is_vulnerable ? 1 : 0;
  const age = getUserAge(user);
  const ageComponent = age !== null && age >= 60 ? 1 : age !== null && age <= 25 ? 0.5 : 0;

  return (
    vulnerableComponent * 0.4 +
    incomeComponent * 0.22 +
    householdComponent * 0.18 +
    ruralComponent * 0.1 +
    ageComponent * 0.1
  );
}

function financialReadinessScore(user: BeneficiaryUser) {
  const cibil = normalizeNumber(getUserCibilScore(user), 300, 900);
  const txCount = normalizeNumber(getUserTransactionCount(user), 0, 50);
  const avgTx = normalizeNumber(getUserAverageTransactionAmount(user), 0, 50000);
  const txRecencyDays = getUserTransactionRecencyDays(user);
  const recency = txRecencyDays === null ? 0.4 : clamp((120 - txRecencyDays) / 120);

  return cibil * 0.45 + txCount * 0.25 + avgTx * 0.15 + recency * 0.15;
}

function acceptanceProbability(args: {
  user: BeneficiaryUser;
  scheme: SchemeRecord;
  logs: Awaited<ReturnType<typeof listRecommendationLogs>>;
  financialReadiness: number;
}) {
  const userLogs = args.logs.filter((row) => row.name.toLowerCase() === args.user.name.toLowerCase());
  const schemeLogs = args.logs.filter((row) =>
    row.schemes.toLowerCase().includes(args.scheme.name.toLowerCase())
  );
  const acceptedUser = userLogs.filter((row) => row.outcome === "accepted").length;
  const acceptedScheme = schemeLogs.filter((row) => row.outcome === "accepted").length;

  const userRate = userLogs.length > 0 ? acceptedUser / userLogs.length : 0.5;
  const schemeRate = schemeLogs.length > 0 ? acceptedScheme / schemeLogs.length : 0.5;
  const recRate = clamp((args.scheme.rec_rate ?? 50) / 100);
  const engagementFrequency = clamp(userLogs.length / 10);
  const transactionEngagement = normalizeNumber(getUserTransactionCount(args.user), 0, 50);

  const probability =
    userRate * 0.28 +
    schemeRate * 0.2 +
    recRate * 0.2 +
    engagementFrequency * 0.12 +
    transactionEngagement * 0.1 +
    args.financialReadiness * 0.1;
  return Math.round(clamp(probability) * 100);
}

function incomeGroup(income: number | null) {
  if (income === null) return "unknown";
  if (income < 150000) return "low";
  if (income <= 400000) return "mid";
  return "high";
}

function fairnessForUsers(users: BeneficiaryUser[]): FairnessMetrics {
  const genderCounts: Record<string, number> = {};
  const areaCounts: Record<string, number> = {};
  const incomeCounts: Record<string, number> = {};

  for (const user of users) {
    const gender = normalizeString(getCriteriaValue(user, "gender"))?.toLowerCase() ?? "unknown";
    const area = getAreaType(user) ?? "unknown";
    const group = incomeGroup(user.annual_income ?? null);
    genderCounts[gender] = (genderCounts[gender] ?? 0) + 1;
    areaCounts[area] = (areaCounts[area] ?? 0) + 1;
    incomeCounts[group] = (incomeCounts[group] ?? 0) + 1;
  }

  const total = Math.max(users.length, 1);
  const normalize = (map: Record<string, number>) =>
    Object.fromEntries(Object.entries(map).map(([key, value]) => [key, Number((value / total).toFixed(4))]));

  const normalizedArea = normalize(areaCounts);
  const values = Object.values(normalizedArea);
  const minShare = values.length > 0 ? Math.min(...values) : 0;
  const maxShare = values.length > 0 ? Math.max(...values) : 0;
  const imbalanceDetected = maxShare >= 0.8 || minShare <= 0.1;
  const vulnerabilityWeightAdjustment = imbalanceDetected ? 0.92 : 1;

  return {
    genderDistribution: normalize(genderCounts),
    ruralUrbanDistribution: normalizedArea,
    incomeGroupCoverage: normalize(incomeCounts),
    imbalanceDetected,
    vulnerabilityWeightAdjustment,
  };
}

function parseJsonObject<T>(text: string): T | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as T;
  } catch {
    return null;
  }
}

async function extractIntent(message: string, schemeNames: string[]): Promise<IntentExtraction> {
  const fallback: IntentExtraction = {
    intent: "general",
    schemeName: null,
    customMessage: null,
  };

  const prompt = `Message: ${message}

Available scheme names:
${schemeNames.map((item, index) => `${index + 1}. ${item}`).join("\n")}

Return strict JSON only:
{
  "intent": "analyze|recommend|notify|list_users|list_schemes|general",
  "schemeName": "<exact scheme name from list or null>",
  "customMessage": "<string or null>"
}`;

  const content = await generateChatCompletion({
    systemPrompt:
      "Extract admin intent as strict JSON. Never invent scheme names. Keep deterministic and concise.",
    userPrompt: prompt,
    temperature: 0,
  });

  const parsed = parseJsonObject<IntentExtraction>(content);
  if (!parsed) return fallback;

  const intent = parsed.intent;
  const validIntent: RecommenderIntent = [
    "analyze",
    "recommend",
    "notify",
    "list_users",
    "list_schemes",
    "general",
  ].includes(intent)
    ? intent
    : "general";

  const parsedSchemeName = normalizeString(parsed.schemeName);
  const matchedScheme = parsedSchemeName
    ? schemeNames.find((name) => name.toLowerCase() === parsedSchemeName.toLowerCase()) ?? null
    : null;

  return {
    intent: validIntent,
    schemeName: matchedScheme,
    customMessage: normalizeString(parsed.customMessage),
  };
}

async function extractSchemeMetadata(scheme: SchemeRecord): Promise<SchemeMetadata> {
  const fallbackRules = parseEligibilityRules(scheme);
  const prompt = `Extract structured metadata from this scheme. Output strict JSON only.

${schemeText(scheme)}

JSON format:
{
  "benefits": ["..."],
  "targetDemographics": ["..."],
  "riskCategory": "low|medium|high",
  "urgencyIndicators": ["..."],
  "eligibilityRules": {
    "minAge": number|null,
    "maxAge": number|null,
    "minIncome": number|null,
    "maxIncome": number|null,
    "requiredLivelihood": string|null,
    "areaType": "rural"|"urban"|null,
    "requiredRationCard": string|null,
    "seniorCitizenRequired": boolean,
    "minDependents": number|null
  }
}`;

  const content = await generateChatCompletion({
    systemPrompt:
      "You extract metadata from scheme text. Never infer unsupported strict eligibility values. Output JSON only.",
    userPrompt: prompt,
    temperature: 0,
  });

  const parsed = parseJsonObject<Partial<SchemeMetadata>>(content);
  if (!parsed) {
    return {
      eligibilityRules: fallbackRules,
      benefits: scheme.benefits ?? [],
      targetDemographics: [],
      riskCategory: "medium",
      urgencyIndicators: [],
    };
  }

  const llmRules = (parsed.eligibilityRules ?? {}) as Record<string, unknown>;
  const mergedRules: EligibilityRules = {
    minAge: fallbackRules.minAge ?? toSafeNumber(llmRules.minAge),
    maxAge: fallbackRules.maxAge ?? toSafeNumber(llmRules.maxAge),
    minIncome: fallbackRules.minIncome ?? toSafeNumber(llmRules.minIncome),
    maxIncome: fallbackRules.maxIncome ?? toSafeNumber(llmRules.maxIncome),
    requiredLivelihood:
      fallbackRules.requiredLivelihood ??
      normalizeString(llmRules.requiredLivelihood)?.toLowerCase() ??
      null,
    areaType:
      fallbackRules.areaType ??
      (normalizeString(llmRules.areaType)?.toLowerCase() === "rural"
        ? "rural"
        : normalizeString(llmRules.areaType)?.toLowerCase() === "urban"
        ? "urban"
        : null),
    requiredRationCard:
      fallbackRules.requiredRationCard ??
      normalizeString(llmRules.requiredRationCard)?.toLowerCase() ??
      null,
    seniorCitizenRequired: fallbackRules.seniorCitizenRequired || normalizeBool(llmRules.seniorCitizenRequired),
    minDependents: fallbackRules.minDependents ?? toSafeNumber(llmRules.minDependents),
    minCibilScore: fallbackRules.minCibilScore ?? toSafeNumber(llmRules.minCibilScore),
    minTransactionCount:
      fallbackRules.minTransactionCount ?? toSafeNumber(llmRules.minTransactionCount),
  };

  return {
    eligibilityRules: mergedRules,
    benefits:
      Array.isArray(parsed.benefits) && parsed.benefits.every((item) => typeof item === "string")
        ? parsed.benefits
        : scheme.benefits ?? [],
    targetDemographics:
      Array.isArray(parsed.targetDemographics) &&
      parsed.targetDemographics.every((item) => typeof item === "string")
        ? parsed.targetDemographics
        : [],
    riskCategory: normalizeString(parsed.riskCategory) ?? "medium",
    urgencyIndicators:
      Array.isArray(parsed.urgencyIndicators) &&
      parsed.urgencyIndicators.every((item) => typeof item === "string")
        ? parsed.urgencyIndicators
        : [],
  };
}

async function explainRecommendation(args: {
  user: BeneficiaryUser;
  scheme: SchemeRecord;
  acceptanceProbability: number;
  vectorSimilarity: number;
  vulnerabilityScoreValue: number;
}) {
  const deterministicReason = `Eligible by strict criteria; strong profile match (${Math.round(
    args.vectorSimilarity * 100
  )}%) and vulnerability priority (${Math.round(args.vulnerabilityScoreValue * 100)}%). Predicted acceptance: ${
    args.acceptanceProbability
  }%.`;

  const prompt = `Create one short explanation sentence for this recommendation.
User: ${args.user.name}
Scheme: ${args.scheme.name}
Details: ${deterministicReason}
Constraints: professional, concise, no markdown.`;

  const content = await generateChatCompletion({
    systemPrompt: "Write concise explainable recommendation reasons.",
    userPrompt: prompt,
    temperature: 0,
  });

  const normalized = normalizeString(content);
  return normalized ?? deterministicReason;
}

function buildResponseContext(args: {
  previous: RecommenderContext | null;
  schemeTitle: string | null;
  rankedUsers: RankedUser[];
  intent: RecommenderIntent;
}): RecommenderContext {
  return {
    ...(args.previous ?? {}),
    schemeTitle: args.schemeTitle,
    recommendedUserIds: args.rankedUsers.map((user) => user.id),
    rankingSnapshot: args.rankedUsers.map((user) => ({
      userId: user.id,
      finalScore: Number(user.finalScore.toFixed(3)),
      acceptanceProbability: user.acceptanceProbability,
      bundle: user.bundle,
    })),
    lastIntent: args.intent,
  };
}

function findSchemeByName(schemes: SchemeRecord[], schemeName: string | null, message: string) {
  if (schemeName) {
    return schemes.find((scheme) => scheme.name.toLowerCase() === schemeName.toLowerCase()) ?? null;
  }
  const lowerMessage = message.toLowerCase();
  return schemes.find((scheme) => lowerMessage.includes(scheme.name.toLowerCase())) ?? null;
}

function deterministicExplainability(args: {
  user: BeneficiaryUser;
  scheme: SchemeRecord;
  acceptanceProbability: number;
  vectorSimilarity: number;
  financialReadiness: number;
}) {
  const area = getAreaType(args.user) ?? "unknown area";
  const income = args.user.annual_income ?? 0;
  const age = getUserAge(args.user);
  const cibil = getUserCibilScore(args.user);
  const txCount = getUserTransactionCount(args.user);
  return `Eligible due to rules alignment (income ${income}, ${area}). Profile signals: age ${age ?? "N/A"}, CIBIL ${
    cibil ?? "N/A"
  }, transactions ${txCount ?? "N/A"}. Financial readiness ${Math.round(
    args.financialReadiness * 100
  )}%. Predicted acceptance: ${args.acceptanceProbability}%. Vector match: ${Math.round(
    args.vectorSimilarity * 100
  )}%.`;
}

function buildActionTrace(args: {
  message: string;
  schemeName: string;
  eligibleCount: number;
  rankedUsers: RankedUser[];
  strictRules: EligibilityRules;
}) {
  const top = args.rankedUsers.slice(0, 3);
  const topText =
    top.length > 0
      ? top
          .map(
            (item, idx) =>
              `${idx + 1}) ${item.name}: final=${item.finalScore.toFixed(2)}, accept=${
                item.acceptanceProbability
              }%, vector=${(item.vectorSimilarity * 100).toFixed(1)}%, vulnerability=${(
                item.vulnerabilityScore * 100
              ).toFixed(1)}%, financial=${(item.financialReadinessScore * 100).toFixed(1)}%`
          )
          .join("\n")
      : "No ranked users.";

  return `Action Trace
1. Parsed intent from query: "${args.message}".
2. Resolved scheme context: ${args.schemeName}.
3. Applied strict filters: age, income, livelihood, area, ration card, dependents, senior-citizen, CIBIL, past transactions.
4. Strict eligibility passed: ${args.eligibleCount} user(s).
5. Calculated scoring signals per eligible user:
   - Vector similarity
   - Vulnerability score (income + household + rural + vulnerability + age)
   - Acceptance probability (history + rec rate + engagement + transaction behavior + financial readiness)
6. Final score = 0.20*eligibility + 0.25*vector + 0.25*vulnerability + 0.30*acceptance.
7. Ranked output (top users):
${topText}
8. Strict rule snapshot: ${JSON.stringify(args.strictRules)}.`;
}

export async function runFinancialRecommender(args: {
  message: string;
  topK?: number;
  context?: RecommenderContext | null;
  history?: ChatHistoryMessage[];
}): Promise<RecommendationResponse> {
  const topK = Math.min(Math.max(args.topK ?? 5, 1), 20);
  const schemes = await listSchemesDetailed(500);
  const activeSchemes = schemes.filter((scheme) => scheme.status === "active" || scheme.status === "review");
  const users = await listBeneficiaryUsersDetailed(1000);
  const usersById = new Map(users.map((user) => [user.id, user]));
  const logs = await listRecommendationLogs(1000);
  const schemeNames = activeSchemes.map((scheme) => scheme.name);
  const intent = await extractIntent(args.message, schemeNames);
  const contextSchemeName = normalizeString(args.context?.schemeTitle);
  const contextScheme =
    contextSchemeName
      ? activeSchemes.find((scheme) => scheme.name.toLowerCase() === contextSchemeName.toLowerCase()) ?? null
      : null;
  const followupQueryType = await classifyFollowupQuery({
    message: args.message,
    history: args.history,
    hasContextScheme: Boolean(contextScheme),
    hasRankingSnapshot: (args.context?.rankingSnapshot?.length ?? 0) > 0,
  });

  if (isGreetingMessage(args.message)) {
    const baseAnswer =
      "Hello. I can list schemes, explain eligibility, rank beneficiaries, and send personalized notifications. Try: recommend for Ayushman Bharat PM-JAY, why were these users selected, or notify shortlisted users.";
    return {
      answer: await conversationalAnswer({
        message: args.message,
        baseAnswer,
        history: args.history,
        schemeName: contextScheme?.name ?? null,
      }),
      scheme: null,
      eligibleUsers: [],
      rankedUsers: [],
      acceptanceInsights: [],
      fairnessMetrics: fairnessForUsers([]),
      telegramResult: null,
      notifications: { queued: 0 },
      context: buildResponseContext({
        previous: args.context ?? null,
        schemeTitle: contextScheme?.name ?? null,
        rankedUsers: [],
        intent: "general",
      }),
    };
  }

  if (intent.intent === "list_schemes") {
    const baseAnswer =
      activeSchemes.length > 0
        ? activeSchemes.map((scheme) => scheme.name).join("\n")
        : "sorry not found";
    return {
      answer: await conversationalAnswer({
        message: args.message,
        baseAnswer,
        history: args.history,
      }),
      scheme: null,
      eligibleUsers: [],
      rankedUsers: [],
      acceptanceInsights: [],
      fairnessMetrics: fairnessForUsers([]),
      telegramResult: null,
      notifications: { queued: 0 },
      context: buildResponseContext({
        previous: args.context ?? null,
        schemeTitle: null,
        rankedUsers: [],
        intent: "list_schemes",
      }),
    };
  }

  if (
    (followupQueryType === "list_context_users" || (intent.intent === "list_users" && !intent.schemeName)) &&
    followupQueryType !== "selection_basis" &&
    followupQueryType !== "scheme_details" &&
    !intent.schemeName
  ) {
    const contextUserIds = args.context?.recommendedUserIds ?? [];
    const contextUsers = contextUserIds
      .map((id) => usersById.get(id))
      .filter((item): item is BeneficiaryUser => Boolean(item));
    const resultUsers = contextUsers.length > 0 ? contextUsers : users.slice(0, topK);

    const baseAnswer =
      resultUsers.length > 0 ? resultUsers.map((user) => user.name).join("\n") : "sorry not found";
    return {
      answer: await conversationalAnswer({
        message: args.message,
        baseAnswer,
        history: args.history,
        schemeName: contextScheme?.name ?? null,
      }),
      scheme: contextScheme
        ? {
            id: contextScheme.id,
            name: contextScheme.name,
            category: contextScheme.category,
          }
        : null,
      eligibleUsers: resultUsers.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        telegramChatId: user.telegram_chat_id,
      })),
      rankedUsers: [],
      acceptanceInsights: [],
      fairnessMetrics: fairnessForUsers(resultUsers),
      telegramResult: null,
      notifications: { queued: 0 },
      context: buildResponseContext({
        previous: args.context ?? null,
        schemeTitle: contextScheme?.name ?? null,
        rankedUsers: [],
        intent: "list_users",
      }),
    };
  }

  if (followupQueryType === "selection_basis" && (args.context?.rankingSnapshot?.length ?? 0) > 0) {
    const top = (args.context?.rankingSnapshot ?? []).slice(0, 5);
    const basisText = top
      .map((row, index) => {
        const user = usersById.get(row.userId);
        const label = user?.name ?? row.userId;
        return `${index + 1}. ${label}: score ${row.finalScore.toFixed(
          2
        )}, acceptance ${row.acceptanceProbability}%`;
      })
      .join("\n");

    const schemeLabel = contextScheme?.name ?? args.context?.schemeTitle ?? "current scheme";
    const baseAnswer = `Selection basis for ${schemeLabel}:
- Strict eligibility checks (age, income, livelihood, area, ration card, senior citizen, dependents)
- CIBIL score and transaction minimums when configured
- Vector similarity between scheme and user profile
- Vulnerability prioritization (income, household size, rural, vulnerable status, age)
- Acceptance probability from history + engagement + transaction behavior + financial readiness
Final ranking is weighted and deterministic.

Top ranked users:
${basisText}`;
    return {
      answer: await conversationalAnswer({
        message: args.message,
        baseAnswer,
        history: args.history,
        schemeName: schemeLabel,
        rankedPreview: top.map((row) => {
          const user = usersById.get(row.userId);
          return {
            name: user?.name ?? row.userId,
            score: row.finalScore,
            acceptance: row.acceptanceProbability,
          };
        }),
      }),
      scheme: contextScheme
        ? {
            id: contextScheme.id,
            name: contextScheme.name,
            category: contextScheme.category,
          }
        : null,
      eligibleUsers: [],
      rankedUsers: top.map((row) => ({
        userId: row.userId,
        finalScore: row.finalScore,
        acceptanceProbability: row.acceptanceProbability,
        bundle: row.bundle,
      })),
      acceptanceInsights: [],
      fairnessMetrics: fairnessForUsers([]),
      telegramResult: null,
      notifications: { queued: 0 },
      context: buildResponseContext({
        previous: args.context ?? null,
        schemeTitle: contextScheme?.name ?? args.context?.schemeTitle ?? null,
        rankedUsers: [],
        intent: "general",
      }),
    };
  }

  const scheme = findSchemeByName(activeSchemes, intent.schemeName, args.message) ?? contextScheme;
  if (!scheme) {
    return {
      answer: "sorry not found",
      scheme: null,
      eligibleUsers: [],
      rankedUsers: [],
      acceptanceInsights: [],
      fairnessMetrics: fairnessForUsers([]),
      telegramResult: null,
      notifications: { queued: 0 },
      context: buildResponseContext({
        previous: args.context ?? null,
        schemeTitle: null,
        rankedUsers: [],
        intent: intent.intent,
      }),
    };
  }

  const strictRules = parseEligibilityRules(scheme);
  const schemeMetadata = await extractSchemeMetadata(scheme);

  if (
    (followupQueryType === "scheme_details" || intent.intent === "general") &&
    (followupQueryType === "scheme_details" || asksSchemeDetails(args.message))
  ) {
    const benefits = schemeMetadata.benefits.length > 0 ? schemeMetadata.benefits.join(", ") : "Not specified";
    const rules = schemeMetadata.eligibilityRules;
    const ruleText = [
      `Age: ${rules.minAge ?? "-"} to ${rules.maxAge ?? "-"}`,
      `Income: ${rules.minIncome ?? "-"} to ${rules.maxIncome ?? "-"}`,
      `Livelihood: ${rules.requiredLivelihood ?? "-"}`,
      `Area: ${rules.areaType ?? "-"}`,
      `Ration card: ${rules.requiredRationCard ?? "-"}`,
      `Senior citizen required: ${rules.seniorCitizenRequired ? "yes" : "no"}`,
      `Min dependents: ${rules.minDependents ?? "-"}`,
      `Min CIBIL: ${rules.minCibilScore ?? "-"}`,
      `Min transaction count: ${rules.minTransactionCount ?? "-"}`,
    ].join("\n");

    const baseAnswer = `${scheme.name} details:
Benefits: ${benefits}
Eligibility:
${ruleText}`;
    return {
      answer: await conversationalAnswer({
        message: args.message,
        baseAnswer,
        history: args.history,
        schemeName: scheme.name,
        strictRules,
      }),
      scheme: {
        id: scheme.id,
        name: scheme.name,
        category: scheme.category,
        metadata: schemeMetadata,
      },
      eligibleUsers: [],
      rankedUsers: [],
      acceptanceInsights: [],
      fairnessMetrics: fairnessForUsers([]),
      telegramResult: null,
      notifications: { queued: 0 },
      context: buildResponseContext({
        previous: args.context ?? null,
        schemeTitle: scheme.name,
        rankedUsers: [],
        intent: "general",
      }),
    };
  }

  const strictEligibleUsers = users.filter((user) => passStrictEligibility(user, strictRules));
  if (strictEligibleUsers.length === 0) {
    return {
      answer: "sorry not found",
      scheme: {
        id: scheme.id,
        name: scheme.name,
        metadata: schemeMetadata,
      },
      eligibleUsers: [],
      rankedUsers: [],
      acceptanceInsights: [],
      fairnessMetrics: fairnessForUsers([]),
      telegramResult: null,
      notifications: { queued: 0 },
      context: buildResponseContext({
        previous: args.context ?? null,
        schemeTitle: scheme.name,
        rankedUsers: [],
        intent: intent.intent,
      }),
    };
  }

  const schemeEmbeddings = await Promise.all(
    activeSchemes.map(async (item) => ({
      scheme: item,
      embedding: await createEmbedding(schemeText(item)),
      rules: parseEligibilityRules(item),
    }))
  );
  const mainSchemeEmbedding = schemeEmbeddings.find((item) => item.scheme.id === scheme.id)?.embedding;
  if (!mainSchemeEmbedding) {
    throw new Error("Failed to prepare scheme embedding.");
  }

  const fairnessBaseline = fairnessForUsers(strictEligibleUsers);
  const vulnerabilityWeightAdjustment = fairnessBaseline.vulnerabilityWeightAdjustment;

  const ranked: RankedUser[] = [];
  for (const user of strictEligibleUsers) {
    const userEmbedding = await createEmbedding(userProfileText(user));
    const similarity = cosineSimilarity(mainSchemeEmbedding, userEmbedding);
    const userVulnerability = vulnerabilityScore(user) * vulnerabilityWeightAdjustment;
    const financialScore = financialReadinessScore(user);
    const acceptance = acceptanceProbability({
      user,
      scheme,
      logs,
      financialReadiness: financialScore,
    });

    const eligibleBundles = schemeEmbeddings
      .filter((item) => passStrictEligibility(user, item.rules))
      .map((item) => ({
        schemeName: item.scheme.name,
        similarity: cosineSimilarity(item.embedding, userEmbedding),
      }))
      .filter((item) => item.similarity >= 0.45)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3)
      .map((item) => item.schemeName);

    const finalScore = 100 * (
      scoreWeights.eligibility * 1 +
      scoreWeights.vectorSimilarity * similarity +
      scoreWeights.vulnerability * userVulnerability +
      scoreWeights.acceptance * (acceptance / 100)
    );

    const deterministicText = deterministicExplainability({
      user,
      scheme,
      acceptanceProbability: acceptance,
      vectorSimilarity: similarity,
      financialReadiness: financialScore,
    });

    ranked.push({
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      telegramChatId: user.telegram_chat_id,
      annualIncome: user.annual_income,
      householdSize: user.household_size,
      location: user.location,
      category: user.category,
      isVulnerable: user.is_vulnerable,
      vectorSimilarity: Number(similarity.toFixed(4)),
      vulnerabilityScore: Number(userVulnerability.toFixed(4)),
      financialReadinessScore: Number(financialScore.toFixed(4)),
      acceptanceProbability: acceptance,
      finalScore: Number(finalScore.toFixed(4)),
      explanation: deterministicText,
      bundle: eligibleBundles.length > 0 ? eligibleBundles : [scheme.name],
      age: getUserAge(user),
      cibilScore: getUserCibilScore(user),
      transactionCount: getUserTransactionCount(user),
    });
  }

  ranked.sort((a, b) => {
    if (b.finalScore !== a.finalScore) return b.finalScore - a.finalScore;
    return a.id.localeCompare(b.id);
  });

  const limitedRanked = ranked.slice(0, topK);
  const explanationPromises = limitedRanked.map(async (item) =>
    explainRecommendation({
      user: strictEligibleUsers.find((user) => user.id === item.id) ?? strictEligibleUsers[0],
      scheme,
      acceptanceProbability: item.acceptanceProbability,
      vectorSimilarity: item.vectorSimilarity,
      vulnerabilityScoreValue: item.vulnerabilityScore,
    })
  );
  const explanations = await Promise.all(explanationPromises);
  for (let i = 0; i < limitedRanked.length; i += 1) {
    limitedRanked[i].explanation = explanations[i] || limitedRanked[i].explanation;
  }

  let telegramResult: Record<string, unknown> | null = null;
  let queued = 0;
  if (intent.intent === "notify") {
    const schemeBenefits = (schemeMetadata.benefits ?? []).slice(0, 2).join("; ") || "Check scheme details";
    const sendResults: Array<{ userId: string; attempted: number; sent: number; failedChatIds: string[] }> = [];

    for (const user of limitedRanked) {
      if (!user.telegramChatId) continue;
      const reason = user.explanation;
      const custom = intent.customMessage ? `${intent.customMessage}\n` : "";
      const message = `${custom}Hello ${user.name},\n${scheme.name} is recommended for you.\nWhy you qualify: ${reason}\nKey benefits: ${schemeBenefits}\nAction: Reply YES to proceed with enrollment support.`;
      const send = await sendTelegramMessages({
        chatIds: [user.telegramChatId],
        message,
      });
      sendResults.push({
        userId: user.id,
        attempted: send.attempted,
        sent: send.sent,
        failedChatIds: send.failedChatIds,
      });

      const queuedResult = await queueNotifications({
        schemeTitle: scheme.name,
        users: strictEligibleUsers.filter((row) => row.id === user.id),
        message,
        channels: ["telegram"],
        status: send.success ? "sent" : "failed",
      });
      queued += queuedResult.queued;
    }

    const attempted = sendResults.reduce((sum, item) => sum + item.attempted, 0);
    const sent = sendResults.reduce((sum, item) => sum + item.sent, 0);
    const failedChatIds = sendResults.flatMap((item) => item.failedChatIds);
    telegramResult = {
      provider: "telegram",
      attempted,
      sent,
      failedChatIds,
      perUser: sendResults,
    };
  }

  const updatedContext = buildResponseContext({
    previous: args.context ?? null,
    schemeTitle: scheme.name,
    rankedUsers: limitedRanked,
    intent: intent.intent,
  });
  const actionTrace = buildActionTrace({
    message: args.message,
    schemeName: scheme.name,
    eligibleCount: strictEligibleUsers.length,
    rankedUsers: limitedRanked,
    strictRules,
  });

  return {
    answer: await conversationalAnswer({
      message: args.message,
      history: args.history,
      schemeName: scheme.name,
      strictRules,
      rankedPreview: limitedRanked.map((user) => ({
        name: user.name,
        score: user.finalScore,
        acceptance: user.acceptanceProbability,
      })),
      baseAnswer:
      intent.intent === "analyze"
        ? `Scheme analyzed for ${scheme.name}. ${strictEligibleUsers.length} users passed strict eligibility.
${actionTrace}
Ask 'why selected' for ranking basis or 'notify them' to send messages.`
        : `Top recommendations generated for ${scheme.name}. ${limitedRanked.length} users ranked.
${actionTrace}
Ask follow-up questions for any user and I will explain each score component.`,
    }),
    scheme: {
      id: scheme.id,
      name: scheme.name,
      category: scheme.category,
      metadata: schemeMetadata,
    },
    eligibleUsers: strictEligibleUsers.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      telegramChatId: user.telegram_chat_id,
      annualIncome: user.annual_income,
      householdSize: user.household_size,
      location: user.location,
      category: user.category,
      isVulnerable: user.is_vulnerable,
    })),
    rankedUsers: limitedRanked.map((user) => ({
      id: user.id,
      name: user.name,
      finalScore: user.finalScore,
      vectorSimilarity: user.vectorSimilarity,
      vulnerabilityScore: user.vulnerabilityScore,
      financialReadinessScore: user.financialReadinessScore,
      acceptanceProbability: user.acceptanceProbability,
      age: user.age,
      cibilScore: user.cibilScore,
      transactionCount: user.transactionCount,
      explanation: user.explanation,
      bundle: user.bundle,
    })),
    acceptanceInsights: limitedRanked.map((user) => ({
      userId: user.id,
      userName: user.name,
      acceptanceProbability: user.acceptanceProbability,
      factors: {
        schemeRecRate: scheme.rec_rate ?? 50,
        vulnerable: user.isVulnerable,
        annualIncome: user.annualIncome,
        age: user.age,
        cibilScore: user.cibilScore,
        transactionCount: user.transactionCount,
        financialReadinessScore: user.financialReadinessScore,
      },
    })),
    fairnessMetrics: fairnessBaseline,
    telegramResult,
    notifications: { queued },
    context: updatedContext,
  };
}
