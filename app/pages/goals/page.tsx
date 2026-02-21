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

const currentYear = new Date().getFullYear();

const defaultGoals: Goal[] = [
  { id: "g1", name: "Retirement Corpus", targetAmount: 10000000, targetYear: currentYear + 20, priority: "high" },
  { id: "g2", name: "Child Education", targetAmount: 2500000, targetYear: currentYear + 10, priority: "high" },
  { id: "g3", name: "Home Down Payment", targetAmount: 2000000, targetYear: currentYear + 7, priority: "medium" },
];

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

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
  const points: ProjectionPoint[] = [{ year: currentYear, corpus, invested }];

  for (let yearIndex = 1; yearIndex <= years; yearIndex += 1) {
    for (let month = 0; month < 12; month += 1) {
      corpus = corpus * (1 + monthlyRate) + monthlyContribution;
      invested += monthlyContribution;
    }
    corpus += yearlyTopUp;
    invested += yearlyTopUp;
    points.push({ year: currentYear + yearIndex, corpus, invested });
  }

  return points;
}

function initialMonthly() {
  if (typeof window === "undefined") return 8000;
  const raw = localStorage.getItem("aulaUserData");
  if (!raw) return 8000;

  try {
    const profile = JSON.parse(raw) as { financialInfo?: { annualHouseholdIncome?: number | string } };
    const annualIncome = Number(profile.financialInfo?.annualHouseholdIncome ?? 0);
    if (Number.isFinite(annualIncome) && annualIncome > 0) {
      return Math.round((annualIncome * 0.15) / 12);
    }
  } catch {
    return 8000;
  }

  return 8000;
}

export default function GoalsPage() {
  const [appliedScheme, setAppliedScheme] = useState("Public Provident Fund (PPF)");
  const [currentCorpus, setCurrentCorpus] = useState(150000);
  const [monthlyContribution, setMonthlyContribution] = useState(() => initialMonthly());
  const [yearlyTopUp, setYearlyTopUp] = useState(50000);
  const [annualReturnPct, setAnnualReturnPct] = useState(8);
  const [inflationPct, setInflationPct] = useState(6);
  const [horizonYears, setHorizonYears] = useState(20);

  const [goals, setGoals] = useState<Goal[]>(defaultGoals);
  const [newGoal, setNewGoal] = useState<Omit<Goal, "id">>({
    name: "",
    targetAmount: 0,
    targetYear: currentYear + 5,
    priority: "medium",
  });

  const projection = useMemo(
    () =>
      buildProjection({
        currentCorpus,
        monthlyContribution,
        yearlyTopUp,
        annualReturnPct,
        years: horizonYears,
      }),
    [annualReturnPct, currentCorpus, horizonYears, monthlyContribution, yearlyTopUp],
  );

  const projectionByYear = useMemo(() => new Map(projection.map((point) => [point.year, point])), [projection]);
  const lastPoint = projection[projection.length - 1];
  const gains = lastPoint.corpus - lastPoint.invested;
  const realValue = lastPoint.corpus / Math.pow(1 + inflationPct / 100, horizonYears);

  const goalForecasts = useMemo(
    () =>
      goals.map((goal) => {
        const yearsFromNow = Math.max(goal.targetYear - currentYear, 0);
        const adjustedTarget = goal.targetAmount * Math.pow(1 + inflationPct / 100, yearsFromNow);
        const projectedAtGoalYear = projectionByYear.get(goal.targetYear)?.corpus ?? 0;
        const gap = projectedAtGoalYear - adjustedTarget;
        return { ...goal, adjustedTarget, projectedAtGoalYear, gap };
      }),
    [goals, inflationPct, projectionByYear],
  );

  const chartMax = Math.max(...projection.map((point) => point.corpus), 1);

  const addGoal = () => {
    if (!newGoal.name.trim() || newGoal.targetAmount <= 0 || newGoal.targetYear < currentYear) return;
    setGoals((prev) => [...prev, { id: `g-${Date.now()}`, ...newGoal }]);
    setNewGoal({
      name: "",
      targetAmount: 0,
      targetYear: currentYear + 5,
      priority: "medium",
    });
  };

  return (
    <main className="min-h-screen bg-blue-50/40 pt-20 text-slate-900">
      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="mb-2 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
            Goal Forecast
          </p>
          <h1 className="text-3xl font-bold text-blue-900 sm:text-4xl">Future Predictions & Financial Goals</h1>
          <p className="mt-2 text-slate-700">
            Since you already applied for a scheme, forecast your future corpus and check if your goals are on track.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <article className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900">Scheme Inputs</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Input label="Applied Scheme" value={appliedScheme} onChange={setAppliedScheme} />
              <Input label="Current Corpus (INR)" type="number" value={currentCorpus} onChange={setCurrentCorpus} />
              <Input
                label="Monthly Contribution"
                type="number"
                value={monthlyContribution}
                onChange={setMonthlyContribution}
              />
              <Input label="Yearly Top-up" type="number" value={yearlyTopUp} onChange={setYearlyTopUp} />
              <Input
                label="Expected Return % (annual)"
                type="number"
                value={annualReturnPct}
                onChange={setAnnualReturnPct}
              />
              <Input label="Inflation % (annual)" type="number" value={inflationPct} onChange={setInflationPct} />
              <label className="text-sm sm:col-span-2">
                <span className="mb-1 block text-slate-600">Forecast Horizon (Years)</span>
                <input
                  type="range"
                  min={1}
                  max={35}
                  value={horizonYears}
                  onChange={(e) => setHorizonYears(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-slate-500">{horizonYears} years</p>
              </label>
            </div>
          </article>

          <article className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900">Projection Summary</h2>
            <div className="mt-4 space-y-3">
              <SummaryRow label="Scheme" value={appliedScheme} />
              <SummaryRow label={`Projected Corpus (${currentYear + horizonYears})`} value={formatINR(lastPoint.corpus)} />
              <SummaryRow label="Total Invested" value={formatINR(lastPoint.invested)} />
              <SummaryRow label="Estimated Gains" value={formatINR(gains)} />
              <SummaryRow label="Inflation-adjusted Value" value={formatINR(realValue)} />
            </div>
            <p className="mt-4 text-xs text-slate-500">
              This is an estimate, not guaranteed returns. Actual outcomes vary by scheme terms and market performance.
            </p>
          </article>
        </div>

        <div className="mt-4 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">Yearly Forecast Curve</h2>
          <div className="mt-4 grid gap-2">
            {projection.slice(0, Math.min(projection.length, 12)).map((point) => (
              <div key={point.year} className="grid grid-cols-[80px_1fr_120px] items-center gap-3 text-sm">
                <span className="text-slate-600">{point.year}</span>
                <div className="h-3 rounded-full bg-slate-100">
                  <div
                    className="h-3 rounded-full bg-blue-600"
                    style={{ width: `${Math.max((point.corpus / chartMax) * 100, 2)}%` }}
                  />
                </div>
                <span className="text-right font-medium text-slate-800">{formatINR(point.corpus)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">My Future Goals</h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400"
              placeholder="Goal name"
              value={newGoal.name}
              onChange={(e) => setNewGoal((prev) => ({ ...prev, name: e.target.value }))}
            />
            <input
              type="number"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400"
              placeholder="Target amount"
              value={newGoal.targetAmount}
              onChange={(e) => setNewGoal((prev) => ({ ...prev, targetAmount: Number(e.target.value) }))}
            />
            <input
              type="number"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400"
              placeholder="Target year"
              value={newGoal.targetYear}
              onChange={(e) => setNewGoal((prev) => ({ ...prev, targetYear: Number(e.target.value) }))}
            />
            <button onClick={addGoal} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white">
              Add Goal
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {goalForecasts.map((goal) => (
              <div key={goal.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900">
                    {goal.name} <span className="text-xs text-slate-500">({goal.targetYear})</span>
                  </p>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      goal.gap >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {goal.gap >= 0 ? "On Track" : "Gap Exists"}
                  </span>
                </div>
                <div className="mt-2 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
                  <p>Adjusted target: {formatINR(goal.adjustedTarget)}</p>
                  <p>Projected at goal year: {formatINR(goal.projectedAtGoalYear)}</p>
                  <p className={goal.gap >= 0 ? "text-green-700" : "text-red-700"}>
                    {goal.gap >= 0 ? "Surplus" : "Shortfall"}: {formatINR(Math.abs(goal.gap))}
                  </p>
                </div>
                <p className="mt-2 text-xs text-slate-500">Priority: {goal.priority.toUpperCase()}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (value: number | string) => void;
  type?: "text" | "number";
}) {
  return (
    <label className="text-sm">
      <span className="mb-1 block text-slate-600">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-400"
      />
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}
