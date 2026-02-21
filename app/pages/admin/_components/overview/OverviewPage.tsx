"use client";

import { useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { StatCard, CategoryBadge, TypeBadge, StatusBadge, ProgressBar, AcceptanceRate, SectionLabel, Card, TH, EmptyState } from "../../_components/ui";
import { LineChart, DoughnutChart } from "../../_components/Charts";
import { useSchemes } from "../../_lib/schemeStore";
import { initialLogs, generateStats, generateTopSchemes } from "../../_lib/data";
import SchemeModal from "../../_components/SchemeModal";
import DeleteModal from "../../_components/DeleteModal";
import { Scheme } from "../../_lib/data";

const TIME_TABS = ["Today", "This Week", "This Month", "All Time"];

const CATEGORY_COLORS: Record<string, string> = {
  Insurance:  "#0a66c2",
  Savings:    "#059669",
  Investment: "#ea580c",
  Pension:    "#7c3aed",
  Welfare:    "#0891b2",
};

export default function OverviewPage() {
  const { schemes } = useSchemes();
  const [activeTime, setActiveTime] = useState("Today");
  const [chartsReady, setChartsReady] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editScheme, setEditScheme] = useState<Scheme | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
const logs = initialLogs;
  const stats = generateStats(schemes, logs);
  const topSchemes = generateTopSchemes(schemes, logs);
  const deleteName = schemes.find((s) => s.id === deleteId)?.name ?? "";

  // Build doughnut data from categories
  const categoryCount = schemes.reduce<Record<string, number>>((acc, s) => {
    acc[s.category] = (acc[s.category] ?? 0) + 1;
    return acc;
  }, {});
  const doughnutData = {
    labels: Object.keys(categoryCount),
    values: Object.values(categoryCount),
    colors: Object.keys(categoryCount).map((k) => CATEGORY_COLORS[k] ?? "#94a3b8"),
  };

  return (
    <>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js" onLoad={() => setChartsReady(true)} />

      {/* Time tabs */}
      <div className="flex gap-0.5 bg-white border border-slate-200 rounded-xl p-1 w-fit mb-6 shadow-sm">
        {TIME_TABS.map((t) => (
          <button key={t} onClick={() => setActiveTime(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150
              ${activeTime === t ? "bg-[#0a66c2] text-white shadow-sm" : "text-slate-500 hover:text-slate-900"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3.5 mb-5">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-[2fr_1fr] gap-3.5 mb-5">
        <Card className="p-5">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-sm font-bold text-slate-900">Recommendations Over Time</p>
              <p className="text-xs text-slate-500 mt-0.5">Daily volume · last 30 days</p>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-100 font-mono font-semibold">↑ 12% MoM</span>
          </div>
          {chartsReady && <LineChart />}
        </Card>
        <Card className="p-5">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-sm font-bold text-slate-900">Schemes by Category</p>
              <p className="text-xs text-slate-500 mt-0.5">{schemes.length} total across {Object.keys(categoryCount).length} categories</p>
            </div>
          </div>
          {chartsReady && <DoughnutChart data={doughnutData} />}
        </Card>
      </div>

      <SectionLabel text="Top Schemes by Recommendation" />

      <Card>
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-900">Scheme Performance</p>
            <p className="text-xs text-slate-500 mt-0.5">Ranked by chatbot recommendation frequency</p>
          </div>
          <button onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 bg-[#0a66c2] text-white rounded-lg hover:bg-[#084d93] transition-colors shadow-sm hover:shadow-md">
            <Plus size={14} /> Add Scheme
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead><tr><TH>Scheme</TH><TH>Category</TH><TH>Provider</TH><TH>Status</TH><TH>Rec. Rate</TH><TH>Acceptance</TH><TH>Actions</TH></tr></thead>
            <tbody>
              {schemes.slice(0, 5).length === 0 && <EmptyState />}
              {schemes.slice(0, 5).map((s) => (
                <tr key={s.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-semibold text-slate-900">{s.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{s.tag}</p>
                  </td>
                  <td className="px-5 py-3.5"><CategoryBadge category={s.category} /></td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{s.provider ?? "—"}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={s.status} /></td>
                  <td className="px-5 py-3.5"><ProgressBar value={s.recRate ?? 0} /></td>
                  <td className="px-5 py-3.5"><AcceptanceRate accepted={s.totalAccepted} recommended={s.totalRecommended} /></td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1.5">
                      <button className="w-7 h-7 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all"><Eye size={11} /></button>
                      <button onClick={() => setEditScheme(s)} className="w-7 h-7 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all"><Pencil size={11} /></button>
                      <button onClick={() => setDeleteId(s.id)} className="w-7 h-7 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={11} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50 rounded-b-xl">
          <span className="text-xs text-slate-400 font-mono">Showing {Math.min(5, schemes.length)} of {schemes.length} schemes</span>
          <Link href="/admin/schemes" className="text-xs font-semibold text-[#0a66c2] hover:underline">View all →</Link>
        </div>
      </Card>

      <SchemeModal open={addOpen || !!editScheme} onClose={() => { setAddOpen(false); setEditScheme(null); }} editScheme={editScheme} />
      <DeleteModal open={!!deleteId} schemeId={deleteId} schemeName={deleteName} onClose={() => setDeleteId(null)} />
    </>
  );
}
