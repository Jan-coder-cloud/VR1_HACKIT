"use client";

import { useMemo, useState } from "react";

type SchemeCategory = "Savings" | "Pension" | "Insurance" | "Income Support";
type SchemeStatus = "Active" | "Paused" | "Upcoming";

interface EligibilityCriteria {
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

interface Scheme {
  id: string;
  name: string;
  category: SchemeCategory;
  provider?: string;
  summary?: string;
  benefits?: string[];
  keyNotes?: string[];
  minAge?: number;
  maxAge?: number;
  eligibility?: EligibilityCriteria;
  eligibilityText?: string;
  status: SchemeStatus;
}

const formatCurrency = (value?: number) => {
  if (value === undefined) return "Not specified";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatList = (value?: string[]) => (value && value.length > 0 ? value.join(", ") : "Not specified");

const formatBooleanRequirement = (value?: boolean, label = "Required") => {
  if (value === undefined) return "Not specified";
  return value ? `${label}: Yes` : `${label}: No`;
};

const schemes: Scheme[] = [
  {
    id: "ppf",
    name: "Public Provident Fund (PPF)",
    category: "Savings",
    provider: "Government of India",
    summary:
      "A government-backed long-term savings scheme with tax benefits and fixed annual interest declared by the Government of India. It is widely used for low-risk wealth creation and long-horizon goals.",
    minAge: 18,
    eligibility: {
      allowedLivelihood: [
        "Student",
        "Working Professional",
        "Self-Employed",
        "Homemaker",
        "Senior Citizen",
      ],
    },
    eligibilityText: "Resident Indian individuals can open one account in their own name.",
    benefits: [
      "Long tenure supports disciplined saving",
      "Tax-efficient under applicable rules",
      "Government-backed safety",
      "Useful for retirement and legacy planning",
    ],
    keyNotes: [
      "Has a long lock-in period suitable for patient investors.",
      "Partial withdrawals and loans are available under specified rules.",
      "Annual minimum contribution must be maintained to keep account active.",
    ],
    status: "Active",
  },
  {
    id: "nps",
    name: "National Pension System (NPS)",
    category: "Pension",
    provider: "PFRDA / Government of India",
    summary:
      "A retirement-oriented, market-linked scheme regulated by PFRDA for building a pension corpus over the long term. It allows diversified allocation across asset classes with lifecycle planning flexibility.",
    minAge: 18,
    maxAge: 70,
    eligibility: {
      allowedLivelihood: [
        "Working Professional",
        "Self-Employed",
        "Farmer",
        "Homemaker",
        "Unemployed",
      ],
    },
    eligibilityText: "Eligible Indian citizens as per NPS account opening guidelines.",
    benefits: [
      "Designed specifically for retirement planning",
      "Potential for market-linked growth",
      "Tiered structure for contribution flexibility",
      "Tax benefits under applicable sections",
    ],
    keyNotes: [
      "Returns depend on market performance and chosen allocation.",
      "Withdrawal and annuity rules apply at exit.",
      "Ideal for disciplined, long-term contribution planning.",
    ],
    status: "Active",
  },
  {
    id: "apy",
    name: "Atal Pension Yojana (APY)",
    category: "Pension",
    provider: "Government of India",
    summary:
      "A pension scheme focused on income security in old age, especially useful for workers in the unorganized sector. It encourages early and consistent pension contributions.",
    minAge: 18,
    maxAge: 40,
    eligibility: {
      allowedLivelihood: ["Farmer", "Self-Employed", "Unemployed", "Working Professional"],
      allowedAreaType: ["Urban", "Rural", "Semi-Urban"],
    },
    eligibilityText: "Bank account holders meeting APY age and contribution criteria.",
    benefits: [
      "Structured pension-focused contributions",
      "Simple enrollment through banks",
      "Encourages early retirement planning",
      "Accessible to a broad base of small contributors",
    ],
    keyNotes: [
      "Monthly contribution depends on age at entry and target pension slab.",
      "Continuation and contribution discipline are important.",
      "Best suited for subscribers seeking predictable pension outcomes.",
    ],
    status: "Active",
  },
  {
    id: "pmjjby",
    name: "Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)",
    category: "Insurance",
    provider: "Government of India",
    summary:
      "A low-cost life insurance scheme available through participating banks for basic financial protection. It helps families create a minimum protection base at very low annual premium.",
    minAge: 18,
    maxAge: 50,
    eligibility: {
      allowedMaritalStatus: ["Single", "Married"],
      allowedLivelihood: [
        "Working Professional",
        "Self-Employed",
        "Farmer",
        "Homemaker",
        "Unemployed",
      ],
    },
    eligibilityText: "Eligible bank account holders within the notified age bracket.",
    benefits: [
      "Affordable annual premium",
      "Simple enrollment through bank linkage",
      "Useful as a base life cover layer",
      "Improves insurance penetration for first-time policyholders",
    ],
    keyNotes: [
      "Coverage terms and renewal timelines should be reviewed each year.",
      "Can be combined with additional private term insurance for larger needs.",
      "Keep bank account and auto-debit status active to avoid policy lapse.",
    ],
    status: "Active",
  },
  {
    id: "pmsby",
    name: "Pradhan Mantri Suraksha Bima Yojana (PMSBY)",
    category: "Insurance",
    provider: "Government of India",
    summary:
      "An affordable accident insurance scheme providing financial support in case of accidental death or disability. It is designed as a foundational accident risk cover for individuals and families.",
    minAge: 18,
    maxAge: 70,
    eligibility: {
      allowedMaritalStatus: ["Single", "Married"],
      allowedAreaType: ["Urban", "Rural", "Semi-Urban"],
    },
    eligibilityText: "Eligible savings bank account holders under scheme rules.",
    benefits: [
      "Very low premium structure",
      "Supports accidental risk protection",
      "Accessible via bank auto-debit enrollment",
      "Complements life and health insurance plans",
    ],
    keyNotes: [
      "Coverage applies to accidental events as per policy conditions.",
      "Review claim conditions and documentation requirements in advance.",
      "Nominee details should be kept updated for smooth claims.",
    ],
    status: "Active",
  },
  {
    id: "ssy",
    name: "Sukanya Samriddhi Yojana (SSY)",
    category: "Savings",
    provider: "Government of India",
    summary:
      "A small savings scheme for the girl child, aimed at long-term education and future financial needs. It supports goal-based corpus building for key milestones.",
    maxAge: 10,
    eligibility: {
      allowedGender: ["Female"],
      requiresDependents: true,
    },
    eligibilityText: "Parent or guardian of eligible girl child as per notified conditions.",
    benefits: [
      "Goal-oriented long-term savings",
      "Government-backed framework",
      "Useful for education/marriage planning corpus",
      "Encourages early, structured family savings discipline",
    ],
    keyNotes: [
      "Has specific age and account opening conditions.",
      "Contribution window and maturity rules apply.",
      "Ideal for families starting early financial planning for daughters.",
    ],
    status: "Active",
  },
  {
    id: "scss",
    name: "Senior Citizens Savings Scheme (SCSS)",
    category: "Savings",
    provider: "Government of India",
    summary:
      "A fixed-income oriented small savings scheme for senior citizens seeking regular returns with sovereign backing. It is commonly used to generate predictable post-retirement cash flow.",
    minAge: 60,
    eligibility: {
      allowedLivelihood: ["Senior Citizen"],
      requiresSeniorCitizen: true,
    },
    eligibilityText: "Primarily for individuals aged 60 years and above as per scheme rules.",
    benefits: [
      "Regular interest payout option",
      "Suitable for retirement cash-flow planning",
      "Government-backed deposit safety",
      "Low complexity for conservative investors",
    ],
    keyNotes: [
      "Has a fixed tenure with extension provisions under rules.",
      "Deposit limits and tax treatment apply as notified.",
      "Useful when combined with emergency and medical contingency funds.",
    ],
    status: "Active",
  },
  {
    id: "pm-kisan",
    name: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
    category: "Income Support",
    provider: "Government of India",
    summary:
      "A direct income support scheme for eligible farmer families to support agricultural and household expenses. The benefit is transferred directly into beneficiary bank accounts.",
    minAge: 18,
    eligibility: {
      allowedLivelihood: ["Farmer"],
      allowedAreaType: ["Rural", "Semi-Urban"],
      maxHouseholdIncome: 800000,
    },
    eligibilityText: "Eligible farmer families subject to PM-KISAN inclusion and exclusion criteria.",
    benefits: [
      "Direct benefit transfer to beneficiary account",
      "Supports seasonal cash requirements",
      "Improves income stability for small farmers",
      "Helps reduce short-term cash pressure in crop cycles",
    ],
    keyNotes: [
      "Land and beneficiary records must be updated correctly.",
      "Eligibility exclusions apply to specific taxpayer and institutional categories.",
      "eKYC and account details should remain updated for uninterrupted transfers.",
    ],
    status: "Active",
  },
];

export default function SchemesPage() {
  const [selectedSchemeId, setSelectedSchemeId] = useState(schemes[0].id);

  const selectedScheme = useMemo(
    () => schemes.find((scheme) => scheme.id === selectedSchemeId) ?? schemes[0],
    [selectedSchemeId],
  );

  return (
    <main className="min-h-screen bg-blue-50/40 pt-20 text-slate-900">
      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="mb-2 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
            India Scheme Explorer
          </p>
          <h1 className="text-3xl font-bold text-blue-900 sm:text-4xl">Savings, Pension & Insurance Schemes</h1>
          <p className="mt-2 text-slate-700">
            Browse Indian schemes and view complete details for the selected scheme.
          </p>
        </div>

        <div className="mb-4 rounded-xl border border-blue-100 bg-white p-4 lg:hidden">
          <label htmlFor="scheme-select" className="mb-2 block text-sm font-semibold text-slate-700">
            Select a scheme
          </label>
          <select
            id="scheme-select"
            value={selectedSchemeId}
            onChange={(event) => setSelectedSchemeId(event.target.value)}
            className="w-full rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900 outline-none ring-blue-300 focus:ring-2"
          >
            {schemes.map((scheme) => (
              <option key={scheme.id} value={scheme.id}>
                {scheme.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <aside className="hidden rounded-2xl border border-blue-100 bg-white p-3 lg:block">
            <h2 className="px-2 py-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Scheme List
            </h2>
            <div className="mt-2 space-y-2">
              {schemes.map((scheme) => (
                <button
                  key={scheme.id}
                  onClick={() => setSelectedSchemeId(scheme.id)}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                    selectedScheme.id === scheme.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/60"
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-900">{scheme.name}</p>
                  <p className="mt-1 text-xs text-slate-600">{scheme.category}</p>
                </button>
              ))}
            </div>
          </aside>

          <article className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                {selectedScheme.category}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {selectedScheme.status}
              </span>
              <span className="text-xs text-slate-500">Selected Scheme</span>
            </div>

            <h2 className="text-2xl font-bold text-slate-900">{selectedScheme.name}</h2>
            <p className="mt-3 text-slate-700">{selectedScheme.summary ?? "No summary available."}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Provider</p>
                <p className="mt-2 text-sm text-slate-800">{selectedScheme.provider ?? "Not specified"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Eligibility</p>
                <p className="mt-2 text-sm text-slate-800">
                  {selectedScheme.eligibilityText ?? "See criteria below."}
                </p>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Age Band</p>
              <p className="mt-2 text-sm text-slate-800">
                Min: {selectedScheme.minAge ?? "N/A"} | Max: {selectedScheme.maxAge ?? "N/A"}
              </p>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-slate-900">Key Benefits</h3>
              <ul className="mt-3 space-y-2">
                {(selectedScheme.benefits ?? []).map((benefit) => (
                  <li key={benefit} className="rounded-lg border border-blue-100 bg-blue-50/50 px-3 py-2 text-sm text-slate-800">
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-slate-900">Important Notes</h3>
              <ul className="mt-3 space-y-2">
                {(selectedScheme.keyNotes ?? []).map((note) => (
                  <li key={note} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                    {note}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-slate-900">Detailed Eligibility</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Income Range</p>
                  <p className="mt-1">
                    Min: {formatCurrency(selectedScheme.eligibility?.minIncome)} | Max:{" "}
                    {formatCurrency(selectedScheme.eligibility?.maxIncome)}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Max Household Income</p>
                  <p className="mt-1">{formatCurrency(selectedScheme.eligibility?.maxHouseholdIncome)}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Marital Status</p>
                  <p className="mt-1">{formatList(selectedScheme.eligibility?.allowedMaritalStatus)}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Gender</p>
                  <p className="mt-1">{formatList(selectedScheme.eligibility?.allowedGender)}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Area Type</p>
                  <p className="mt-1">{formatList(selectedScheme.eligibility?.allowedAreaType)}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ration Card</p>
                  <p className="mt-1">{formatList(selectedScheme.eligibility?.requiredRationCard)}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Livelihood Categories</p>
                  <p className="mt-1">{formatList(selectedScheme.eligibility?.allowedLivelihood)}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Disability Condition</p>
                  <p className="mt-1">
                    {formatBooleanRequirement(selectedScheme.eligibility?.requiresDisability, "Disability")}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Senior Citizen Condition</p>
                  <p className="mt-1">
                    {formatBooleanRequirement(selectedScheme.eligibility?.requiresSeniorCitizen, "Senior citizen")}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Dependent Condition</p>
                  <p className="mt-1">
                    {formatBooleanRequirement(selectedScheme.eligibility?.requiresDependents, "Dependents")}
                  </p>
                </div>
              </div>
            </div>

          </article>
        </div>
      </section>
    </main>
  );
}
