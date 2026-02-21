"use client";

import { useMemo, useState } from "react";
import { initialSchemes, type Scheme } from "./schema";

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

const formatStatus = (value: Scheme["status"]) => value.charAt(0).toUpperCase() + value.slice(1);
const schemes = initialSchemes;

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
                {formatStatus(selectedScheme.status)}
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
