export type LogOutcome = "accepted" | "rejected" | "pending";

export type SchemeStatus = "active" | "draft" | "review" | "archived";

export type SchemeCategory = "Insurance" | "Savings" | "Investment" | "Pension" | "Welfare";

export type SchemeType = "Life" | "Health" | "Investment" | "Pension" | "Critical" | "General";

export interface EligibilityCriteria {
  minIncome?: number;
  maxIncome?: number;
  maxHouseholdIncome?: number;
  allowedMaritalStatus?: ("Single" | "Married")[];
  allowedGender?: ("Male" | "Female" | "Other")[];
  allowedAreaType?: ("Urban" | "Rural" | "Semi-Urban")[];
  requiredRationCard?: ("APL" | "BPL" | "Antyodaya")[];
  allowedLivelihood?: (
    | "Student"
    | "Working Professional"
    | "Self-Employed"
    | "Farmer"
    | "Unemployed"
    | "Senior Citizen"
    | "Homemaker"
  )[];
  requiresDisability?: boolean;
  requiresSeniorCitizen?: boolean;
  requiresDependents?: boolean;
}

export interface Scheme {
  id: string;
  name: string;
  category: SchemeCategory;
  type?: SchemeType;
  provider?: string;
  premium?: string;
  coverage?: string;
  summary?: string;
  benefits?: string[];
  keyNotes?: string[];
  minAge?: number;
  maxAge?: number;
  eligibility?: EligibilityCriteria;
  eligibilityText?: string;
  recRate?: number;
  totalRecommended?: number;
  totalAccepted?: number;
  tag?: string;
  status: SchemeStatus;
}

export interface RecommendationLog {
  id: number;
  name: string;
  initials: string;
  grad: string;
  schemes: string;
  age: number;
  income: string;
  dep: number;
  time: string;
  score: number;
  outcome: LogOutcome;
}

export interface StatCardData {
  label: string;
  value: string;
  change: string;
  changeType: "up" | "down" | "warn";
  color: "blue" | "green" | "orange" | "red";
}

export const initialSchemes: Scheme[] = [
  {
    id: "shieldmax-term",
    name: "ShieldMax Term Life",
    category: "Insurance",
    type: "Life",
    provider: "LIC",
    minAge: 18,
    maxAge: 65,
    premium: "₹800–₹4,200",
    coverage: "Up to ₹1 Cr",
    summary: "Affordable term life cover for individuals and families.",
    benefits: ["Death benefit up to ₹1 Cr", "Tax benefit under 80C", "Critical illness rider available"],
    keyNotes: ["No maturity benefit", "Medical exam required above 50L cover"],
    eligibility: {
      allowedLivelihood: ["Working Professional", "Self-Employed", "Farmer"],
      allowedAreaType: ["Urban", "Rural", "Semi-Urban"],
    },
    eligibilityText: "Indian residents aged 18–65 with stable income.",
    recRate: 88,
    totalRecommended: 120,
    totalAccepted: 90,
    tag: "TERM · LIC",
    status: "active",
  },
  {
    id: "medicare-plus",
    name: "MediCare Plus Health",
    category: "Insurance",
    type: "Health",
    provider: "HDFC ERGO",
    minAge: 18,
    maxAge: 70,
    premium: "₹1,200–₹6,800",
    coverage: "₹5L–₹50L",
    summary: "Comprehensive health insurance with wide hospital network.",
    benefits: ["Cashless hospitalisation", "Pre & post hospitalization cover", "Day care procedures covered"],
    keyNotes: ["2-year waiting period for pre-existing conditions", "No-claim bonus up to 50%"],
    eligibility: { allowedAreaType: ["Urban", "Semi-Urban"] },
    eligibilityText: "Individuals and families aged 18–70.",
    recRate: 76,
    totalRecommended: 95,
    totalAccepted: 65,
    tag: "HEALTH · HDFC",
    status: "active",
  },
  {
    id: "wealthgrow-ulip",
    name: "WealthGrow ULIP",
    category: "Investment",
    type: "Investment",
    provider: "SBI Life",
    minAge: 21,
    maxAge: 55,
    premium: "₹2,000–₹15,000",
    coverage: "Market-linked",
    summary: "Unit-linked insurance plan combining investment with life cover.",
    benefits: ["Market-linked returns", "Life cover included", "Flexible fund switching"],
    keyNotes: ["5-year lock-in period", "Returns not guaranteed"],
    eligibility: { allowedLivelihood: ["Working Professional", "Self-Employed"], minIncome: 300000 },
    eligibilityText: "Salaried/self-employed individuals with annual income above ₹3L.",
    recRate: 54,
    totalRecommended: 80,
    totalAccepted: 40,
    tag: "INVESTMENT · SBI",
    status: "review",
  },
  {
    id: "secure-retire",
    name: "SecureRetire Pension",
    category: "Pension",
    type: "Pension",
    provider: "LIC",
    minAge: 25,
    maxAge: 60,
    premium: "₹3,000–₹20,000",
    coverage: "Annuity",
    summary: "Retirement pension scheme with guaranteed monthly income.",
    benefits: ["Guaranteed monthly pension", "Joint life option", "Return of purchase price"],
    keyNotes: ["Pension begins at 60", "No premature withdrawal before 5 years"],
    eligibility: {
      allowedLivelihood: ["Working Professional", "Self-Employed", "Farmer"],
      requiresSeniorCitizen: false,
    },
    eligibilityText: "Indian residents aged 25–60 planning for retirement.",
    recRate: 62,
    totalRecommended: 75,
    totalAccepted: 53,
    tag: "PENSION · LIC",
    status: "active",
  },
  {
    id: "familyshield-group",
    name: "FamilyShield Group",
    category: "Insurance",
    type: "Health",
    provider: "Star Health",
    minAge: 18,
    maxAge: 65,
    premium: "₹900–₹3,500",
    coverage: "₹3L–₹25L",
    summary: "Group health insurance plan for entire family at affordable rates.",
    benefits: ["Family floater benefit", "Maternity cover", "New-born cover from day 1"],
    keyNotes: ["Min 2 members required", "Sub-limits apply for specific treatments"],
    eligibility: { requiresDependents: true, allowedAreaType: ["Urban", "Rural", "Semi-Urban"] },
    eligibilityText: "Families with at least 2 members.",
    recRate: 58,
    totalRecommended: 60,
    totalAccepted: 39,
    tag: "HEALTH · STAR",
    status: "active",
  },
  {
    id: "criticalcare-rider",
    name: "CriticalCare Rider",
    category: "Insurance",
    type: "Critical",
    provider: "ICICI Pru",
    minAge: 18,
    maxAge: 60,
    premium: "₹500–₹2,800",
    coverage: "₹10L–₹1Cr",
    summary: "Lump-sum payout on diagnosis of 34 critical illnesses.",
    benefits: ["34 critical illnesses covered", "Lump-sum payout on diagnosis", "Can be added as rider"],
    keyNotes: ["90-day survival period after diagnosis", "Pre-existing conditions excluded for 2 years"],
    eligibility: { allowedLivelihood: ["Working Professional", "Self-Employed"] },
    eligibilityText: "Working individuals aged 18–60.",
    recRate: 22,
    totalRecommended: 30,
    totalAccepted: 5,
    tag: "CRITICAL · ICICI",
    status: "draft",
  },
  {
    id: "pm-jan-dhan",
    name: "PM Jan Dhan Yojana",
    category: "Welfare",
    type: "General",
    provider: "Govt of India",
    summary: "Financial inclusion scheme offering zero-balance bank accounts with insurance cover.",
    benefits: ["Zero-balance account", "₹1L accident insurance", "₹30K life cover", "Overdraft facility up to ₹10,000"],
    keyNotes: ["Aadhaar linked account required", "RuPay debit card provided"],
    eligibility: { requiredRationCard: ["BPL", "Antyodaya"], allowedAreaType: ["Rural", "Semi-Urban"] },
    eligibilityText: "BPL households and unbanked citizens.",
    recRate: 70,
    totalRecommended: 110,
    totalAccepted: 80,
    tag: "WELFARE · GOVT",
    status: "active",
  },
  {
    id: "ppf-scheme",
    name: "Public Provident Fund",
    category: "Savings",
    type: "General",
    provider: "Govt of India",
    summary: "Long-term government-backed savings scheme with tax benefits.",
    benefits: ["7.1% annual interest (current)", "Fully tax-exempt (EEE)", "Loan facility after 3 years"],
    keyNotes: ["15-year lock-in", "Max ₹1.5L deposit per year"],
    eligibility: { allowedLivelihood: ["Working Professional", "Self-Employed", "Homemaker", "Student"] },
    eligibilityText: "All Indian citizens (not NRIs).",
    recRate: 80,
    totalRecommended: 100,
    totalAccepted: 75,
    tag: "SAVINGS · GOVT",
    status: "active",
  },
];

export const logs: RecommendationLog[] = [
  {
    id: 1,
    name: "Rahul Kumar",
    initials: "RK",
    grad: "linear-gradient(135deg,#2563eb,#0891b2)",
    schemes: "ShieldMax Term Life + MediCare Plus",
    age: 34,
    income: "₹8L",
    dep: 2,
    time: "4 mins ago",
    score: 92,
    outcome: "accepted",
  },
  {
    id: 2,
    name: "Priya Mehta",
    initials: "PM",
    grad: "linear-gradient(135deg,#ea580c,#dc2626)",
    schemes: "WealthGrow ULIP",
    age: 28,
    income: "₹5L",
    dep: 0,
    time: "18 mins ago",
    score: 61,
    outcome: "rejected",
  },
  {
    id: 3,
    name: "Arjun Singh",
    initials: "AS",
    grad: "linear-gradient(135deg,#7c3aed,#2563eb)",
    schemes: "SecureRetire Pension",
    age: 52,
    income: "₹18L",
    dep: 3,
    time: "31 mins ago",
    score: 88,
    outcome: "accepted",
  },
  {
    id: 4,
    name: "Neha Joshi",
    initials: "NJ",
    grad: "linear-gradient(135deg,#0891b2,#7c3aed)",
    schemes: "FamilyShield Group Health",
    age: 41,
    income: "₹12L",
    dep: 4,
    time: "1 hr ago",
    score: 74,
    outcome: "pending",
  },
  {
    id: 5,
    name: "Vikram Rao",
    initials: "VR",
    grad: "linear-gradient(135deg,#dc2626,#ea580c)",
    schemes: "CriticalCare Rider",
    age: 45,
    income: "₹22L",
    dep: 2,
    time: "2 hrs ago",
    score: 55,
    outcome: "rejected",
  },
  {
    id: 6,
    name: "Sunita Kaur",
    initials: "SK",
    grad: "linear-gradient(135deg,#2563eb,#7c3aed)",
    schemes: "ShieldMax Term Life",
    age: 31,
    income: "₹6L",
    dep: 1,
    time: "3 hrs ago",
    score: 85,
    outcome: "accepted",
  },
];

export function generateTopSchemes(schemes: Scheme[], logs: RecommendationLog[]) {
  const counts: Record<string, number> = {};
  logs.forEach((log) => {
    log.schemes.split(" + ").forEach((name) => {
      counts[name.trim()] = (counts[name.trim()] || 0) + 1;
    });
  });

  return schemes
    .map((s) => ({ name: s.name, type: s.tag ?? `${s.category} · ${s.provider ?? ""}`, count: counts[s.name] || 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((item, index) => ({ rank: index + 1, ...item }));
}

export function generateStats(schemes: Scheme[], logs: RecommendationLog[]): StatCardData[] {
  const totalSchemes = schemes.length;
  const activeSchemes = schemes.filter((s) => s.status === "active").length;
  const totalRecommendations = logs.length;
  const acceptedLogs = logs.filter((l) => l.outcome === "accepted").length;
  const acceptanceRate = totalRecommendations === 0 ? 0 : Math.round((acceptedLogs / totalRecommendations) * 100);
  const avgRecRate = totalSchemes === 0 ? 0 : Math.round(schemes.reduce((sum, s) => sum + (s.recRate ?? 0), 0) / totalSchemes);

  return [
    {
      label: "Total Schemes",
      value: String(totalSchemes),
      change: `${activeSchemes} active`,
      changeType: "up",
      color: "blue",
    },
    {
      label: "Active Schemes",
      value: String(activeSchemes),
      change: `of ${totalSchemes} total`,
      changeType: "up",
      color: "green",
    },
    {
      label: "Acceptance Rate",
      value: `${acceptanceRate}%`,
      change: `${acceptedLogs} of ${totalRecommendations} logs`,
      changeType: acceptanceRate >= 60 ? "up" : "down",
      color: "orange",
    },
    {
      label: "Avg Recommendation Score",
      value: `${avgRecRate}%`,
      change: avgRecRate >= 60 ? "Performing well" : "Needs review",
      changeType: avgRecRate >= 60 ? "up" : "warn",
      color: "red",
    },
  ];
}
