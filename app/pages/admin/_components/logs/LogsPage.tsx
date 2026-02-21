"use client";

import { useState } from "react";
import Script from "next/script";
import { BarChart } from "../../_components/Charts";
import { Card } from "../../_components/ui";
import { initialLogs, generateTopSchemes, initialSchemes, LogOutcome } from "../../_lib/data";
import { useSchemes } from "../../_lib/schemeStore";

const OUTCOME = {
  accepted: { color: "text-green-600",  label: "ACCEPTED" },
  rejected: { color: "text-red-500",    label: "REJECTED" },
  pending:  { color: "text-orange-500", label: "PENDING"  },
};
const SCORE_COLOR = (s: number) => s >= 80 ? "text-green-600" : s >= 65 ? "text-orange-500" : "text-red-500";
const RANK_STYLE = ["text-yellow-600 font-bold", "text-slate-500 font-bold", "text-amber-700 font-bold"];
  
export default function LogsPage() {
  const { schemes } = useSchemes();
  const [filter, setFilter] = useState<LogOutcome | "all">("all");
  const [chartsReady, setChartsReady] = useState(false);
  const logs = initialLogs;

  const filtered = filter === "all" ? logs : logs.filter((l) => l.outcome === filter);
  const topSchemes = generateTopSchemes(schemes, logs);

  return (
    <>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js" onLoad={() => setChartsReady(true)} />

      <div className="grid grid-cols-[3fr_2fr] gap-4">
        {/* Logs */}
        <Card>
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm font-bold text-slate-900">Recommendation Logs</p>
              <p className="text-xs text-slate-500 mt-0.5">Recent chatbot recommendation events</p>
            </div>
            <div className="flex gap-1.5">
              {(["all","accepted","rejected","pending"] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border capitalize transition-all
                    ${filter === f ? "bg-blue-50 border-blue-200 text-[#0a66c2]" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div>
            {filtered.map((log) => (
              <div key={log.id} className="flex items-start gap-3 px-5 py-3.5 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 font-mono" style={{ background: log.grad }}>
                  {log.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{log.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">→ {log.schemes}</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">
                    Age {log.age} · {log.income} income · {log.dep} dependant{log.dep !== 1 ? "s" : ""} · {log.time}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-xl font-bold font-mono ${SCORE_COLOR(log.score)}`}>{log.score}</p>
                  <p className={`text-[10px] font-bold font-mono mt-0.5 ${OUTCOME[log.outcome].color}`}>{OUTCOME[log.outcome].label}</p>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="px-5 py-10 text-center text-sm text-slate-400">No logs found</div>}
          </div>
        </Card>

        {/* Right */}
        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <p className="text-sm font-bold text-slate-900 mb-0.5">Outcome Breakdown</p>
            <p className="text-xs text-slate-500 mb-4">Last 7 days</p>
            {chartsReady && <BarChart />}
          </Card>

          <Card>
            <div className="px-5 py-3.5 border-b border-slate-100">
              <p className="text-sm font-bold text-slate-900">Top Recommended</p>
              <p className="text-xs text-slate-500 mt-0.5">Derived from log history</p>
            </div>
            <div>
              {topSchemes.map((s, i) => (
                <div key={s.rank} className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <span className={`text-[11px] font-mono w-5 text-center flex-shrink-0 ${RANK_STYLE[i] ?? "text-slate-400"}`}>#{s.rank}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{s.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{s.type}</p>
                  </div>
                  <span className="text-sm font-bold font-mono text-[#0a66c2] flex-shrink-0">{s.count}</span>
                </div>
              ))}
              {topSchemes.length === 0 && <div className="px-5 py-6 text-center text-xs text-slate-400">No data yet</div>}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
