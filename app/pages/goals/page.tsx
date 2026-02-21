"use client";

import { useMemo, useState } from "react";

type GoalPriority = "high" | "medium" | "low";

type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  targetYear: number;
  priority: GoalPriority;
};

type ProjectionPoint = {
  year: number;
  corpus: number;
  invested: number;
};

const nowYear = new Date().getFullYear();

const defaultGoals: Goal[] = [
  { id: "retirement", name: "Retirement Corpus", targetAmount: 10000000, targetYear: nowYear + 20, priority: "high" },
  { id: "education", name: "Child Education", targetAmount: 2500000, targetYear: nowYear + 10, priority: "high" },
  { id: "home", name: "Home Down Payment", targetAmount: 2000000, targetYear: nowYear + 7, priority: "medium" },
];

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

function buildProjection({
  currentCorpus,
  monthlyContribution,
  yearlyTopUp,
  annualReturnPct,
  years,
}: {
  currentCorpus: number;
  monthlyContribution: number;
  yearlyTopUp: number;
  annualReturnPct: number;
  years: number;
}): ProjectionPoint[] {
  const monthlyRate = annualReturnPct / 100 / 12;
  let corpus = currentCorpus;
  let invested = currentCorpus;
  const points: ProjectionPoint[] = [{ year: nowYear, corpus, invested }];

  for (let i = 1; i <= years; i += 1) {
    for (let m = 0; m < 12; m += 1) {
      corpus = corpus * (1 + monthlyRate) + monthlyContribution;
      invested += monthlyContribution;
    }
    corpus += yearlyTopUp;
    invested += yearlyTopUp;
    points.push({ year: nowYear + i, corpus, invested });
  }

  return points;
}

function getInitialMonthlyContribution(defaultValue: number) {
  if (typeof window === "undefined") return defaultValue;
  const raw = localStorage.getItem("aulaUserData");
  if (!raw) return defaultValue;

  try {
    const profile = JSON.parse(raw) as { financialInfo?: { annualHouseholdIncome?: string | number } };
    const annualIncome = Number(profile.financialInfo?.annualHous