"use client";

import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { CategoryBadge, TypeBadge, StatusBadge, ProgressBar, AcceptanceRate, Card, TH, EmptyState } from "../../_components/ui";
import { useSchemes } from "../../_lib/schemeStore";
import { Scheme, SchemeCategory, SchemeStatus } from "../../_lib/data";
import SchemeModal from "../../_components/SchemeModal";
import DeleteModal from "../../_components/DeleteModal";

const CATEGORIES: (SchemeCategory | "All")[] = ["All", "Insurance", "Savings", "Investment", "Pension", "Welfare"];
const STATUSES: (SchemeStatus | "All")[] = ["All", "active", "draft", "review", "archived"];

export default function SchemesPage() {
  const { schemes } = useSchemes();
  const [categoryFilter, setCategoryFilter] = useState<SchemeCategory | "All">("All");
  const [statusFilter, setStatusFilter] = useState<SchemeStatus | "All">("All");
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editScheme, setEditScheme] = useState<Scheme | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return schemes.filter((s) => {
      const matchCat = categoryFilter === "All" || s.category === categoryFilter;
      const matchStatus = statusFilter === "All" || s.status === statusFilter;
      const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || (s.provider ?? "").toLowerCase().includes(search.toLowerCase());
      return matchCat && matchStatus && matchSearch;
    });
  }, [schemes, categoryFilter, statusFilter, search]);

  const deleteName = schemes.find((s) => s.id === deleteId)?.name ?? "";

  return (
    <>
      <Card>
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
            <div>
              <p className="text-sm font-bold text-slate-900">All Schemes</p>
              <p className="text-xs text-slate-500 mt-0.5">{schemes.length} schemes · {filtered.length} shown</p>
            </div>
            <button onClick={() => setAddOpen(true)}
              className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 bg-[#0a66c2] text-white rounded-lg hover:bg-[#084d93] transition-colors shadow-sm whitespace-nowrap">
              <Plus size={14} /> New Scheme
            </button>
          </div>

          {/* Search + Filters row */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus-within:border-[#0a66c2] transition-all">
              <Search size={13} className="text-slate-400 flex-shrink-0" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or provider..." className="bg-transparent border-none outline-none text-sm text-slate-900 placeholder:text-slate-400 w-48" />
            </div>

            <div className="h-4 w-px bg-slate-200" />

            {/* Category filter */}
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORIES.map((c) => (
                <button key={c} onClick={() => setCategoryFilter(c)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all
                    ${categoryFilter === c ? "bg-blue-50 border-blue-200 text-[#0a66c2]" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                  {c}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-slate-200" />

            {/* Status filter */}
            <div className="flex gap-1.5 flex-wrap">
              {STATUSES.map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border capitalize transition-all
                    ${statusFilter === s ? "bg-blue-50 border-blue-200 text-[#0a66c2]" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <TH>Scheme Name</TH>
                <TH>Category</TH>
                <TH>Type</TH>
                <TH>Provider</TH>
                <TH>Age Range</TH>
                <TH>Premium / mo</TH>
                <TH>Coverage</TH>
                <TH>Rec. Rate</TH>
                <TH>Acceptance</TH>
                <TH>Status</TH>
                <TH>Actions</TH>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <EmptyState message="No schemes match your filters" />}
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 min-w-[180px]">
                    <p className="text-sm font-semibold text-slate-900">{s.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{s.tag ?? "—"}</p>
                    {s.summary && <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{s.summary}</p>}
                  </td>
                  <td className="px-5 py-3.5"><CategoryBadge category={s.category} /></td>
                  <td className="px-5 py-3.5">{s.type ? <TypeBadge type={s.type} /> : <span className="text-slate-400 text-xs">—</span>}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600 whitespace-nowrap">{s.provider ?? "—"}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600 font-mono whitespace-nowrap">
                    {s.minAge != null && s.maxAge != null ? `${s.minAge}–${s.maxAge} yrs` : "—"}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600 whitespace-nowrap">{s.premium ?? "—"}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600 whitespace-nowrap">{s.coverage ?? "—"}</td>
                  <td className="px-5 py-3.5"><ProgressBar value={s.recRate ?? 0} /></td>
                  <td className="px-5 py-3.5"><AcceptanceRate accepted={s.totalAccepted} recommended={s.totalRecommended} /></td>
                  <td className="px-5 py-3.5"><StatusBadge status={s.status} /></td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1.5">
                      <button onClick={() => setEditScheme(s)} className="w-7 h-7 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all">
                        <Pencil size={11} />
                      </button>
                      <button onClick={() => setDeleteId(s.id)} className="w-7 h-7 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all">
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50 rounded-b-xl">
          <span className="text-xs text-slate-400 font-mono">Showing {filtered.length} of {schemes.length} schemes</span>
          <div className="flex gap-1">
            {[1, 2, 3].map((p) => (
              <button key={p} className={`w-7 h-7 rounded-md border text-xs font-mono transition-all
                ${p === 1 ? "bg-[#0a66c2] border-[#0a66c2] text-white" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <SchemeModal open={addOpen || !!editScheme} onClose={() => { setAddOpen(false); setEditScheme(null); }} editScheme={editScheme} />
      <DeleteModal open={!!deleteId} schemeId={deleteId} schemeName={deleteName} onClose={() => setDeleteId(null)} />
    </>
  );
}
