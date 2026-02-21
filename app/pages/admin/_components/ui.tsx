import { SchemeStatus, SchemeType, SchemeCategory, StatCardData } from "../_lib/data";

// ─── CATEGORY BADGE ───
const CATEGORY_STYLES: Record<SchemeCategory, string> = {
  Insurance:  "bg-blue-50 text-blue-700 border border-blue-100",
  Savings:    "bg-emerald-50 text-emerald-700 border border-emerald-100",
  Investment: "bg-orange-50 text-orange-700 border border-orange-100",
  Pension:    "bg-purple-50 text-purple-700 border border-purple-100",
  Welfare:    "bg-teal-50 text-teal-700 border border-teal-100",
};
export function CategoryBadge({ category }: { category: SchemeCategory }) {
  return (
    <span className={`text-[10px] px-2.5 py-1 rounded-full font-mono font-semibold ${CATEGORY_STYLES[category]}`}>
      {category}
    </span>
  );
}

// ─── TYPE BADGE ───
const TYPE_STYLES: Record<SchemeType, string> = {
  Life:       "bg-blue-50 text-blue-700 border border-blue-100",
  Health:     "bg-green-50 text-green-700 border border-green-100",
  Investment: "bg-orange-50 text-orange-700 border border-orange-100",
  Pension:    "bg-purple-50 text-purple-700 border border-purple-100",
  Critical:   "bg-red-50 text-red-700 border border-red-100",
  General:    "bg-slate-100 text-slate-600 border border-slate-200",
};
export function TypeBadge({ type }: { type: SchemeType }) {
  return (
    <span className={`text-[10px] px-2.5 py-1 rounded-full font-mono font-semibold ${TYPE_STYLES[type]}`}>
      {type}
    </span>
  );
}

// ─── STATUS BADGE ───
const STATUS_STYLES: Record<SchemeStatus, { bg: string; text: string; dot: string }> = {
  active:   { bg: "bg-green-50 border border-green-100",   text: "text-green-700",  dot: "bg-green-500"  },
  draft:    { bg: "bg-slate-100 border border-slate-200",  text: "text-slate-500",  dot: "bg-slate-400"  },
  review:   { bg: "bg-orange-50 border border-orange-100", text: "text-orange-700", dot: "bg-orange-500" },
  archived: { bg: "bg-red-50 border border-red-100",       text: "text-red-700",    dot: "bg-red-500"    },
};
export function StatusBadge({ status }: { status: SchemeStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ─── PROGRESS BAR ───
export function ProgressBar({ value }: { value: number }) {
  const color = value >= 70 ? "from-green-500 to-emerald-400" : value >= 40 ? "from-[#0a66c2] to-sky-400" : "from-orange-400 to-red-400";
  return (
    <div>
      <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1">
        <div className={`h-full bg-gradient-to-r ${color} rounded-full transition-all`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[11px] text-slate-500 font-mono">{value}%</span>
    </div>
  );
}

// ─── ACCEPTANCE RATE (totalAccepted / totalRecommended) ───
export function AcceptanceRate({ accepted, recommended }: { accepted?: number; recommended?: number }) {
  const rate = !recommended ? 0 : Math.round(((accepted ?? 0) / recommended) * 100);
  const color = rate >= 70 ? "text-green-600" : rate >= 50 ? "text-orange-500" : "text-red-500";
  return <span className={`text-sm font-bold font-mono ${color}`}>{rate}%</span>;
}

// ─── STAT CARD ───
const STAT_CONFIG = {
  blue:   { val: "text-[#0a66c2]", bg: "bg-blue-50",   icon: "text-blue-500"   },
  green:  { val: "text-green-600", bg: "bg-green-50",  icon: "text-green-500"  },
  orange: { val: "text-orange-600",bg: "bg-orange-50", icon: "text-orange-500" },
  red:    { val: "text-red-600",   bg: "bg-red-50",    icon: "text-red-500"    },
};
export function StatCard({ label, value, change, changeType, color }: StatCardData) {
  const c = STAT_CONFIG[color];
  const changeColor = changeType === "up" ? "text-green-600" : changeType === "down" ? "text-red-500" : "text-orange-500";
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-default">
      <div className="text-[10px] font-semibold tracking-wider uppercase text-slate-500 font-mono">{label}</div>
      <div className={`text-3xl font-bold font-mono tracking-tight my-2 leading-none ${c.val}`}>{value}</div>
      {change && <div className={`text-xs font-semibold ${changeColor}`}>{change}</div>}
    </div>
  );
}

// ─── SECTION LABEL ───
export function SectionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 whitespace-nowrap font-mono">{text}</span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

// ─── CARD ───
export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white border border-slate-200 rounded-xl shadow-sm ${className}`}>{children}</div>;
}

// ─── TABLE HEADER CELL ───
export function TH({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-[10px] uppercase tracking-widest text-slate-500 font-mono font-medium px-5 py-2.5 text-left border-b border-slate-100 bg-slate-50 whitespace-nowrap">
      {children}
    </th>
  );
}

// ─── EMPTY STATE ───
export function EmptyState({ message = "No data found" }: { message?: string }) {
  return (
    <tr>
      <td colSpan={20} className="px-5 py-12 text-center">
        <p className="text-slate-400 text-sm">{message}</p>
      </td>
    </tr>
  );
}
