"use client";

import { useEffect, useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Scheme, SchemeCategory, SchemeType, SchemeStatus } from "../_lib/data";
import { useSchemes } from "../_lib/schemeStore";
import { useToast } from "../_lib/toastStore";

interface Props { open: boolean; onClose: () => void; editScheme?: Scheme | null; }

const CATEGORIES: SchemeCategory[] = ["Insurance", "Savings", "Investment", "Pension", "Welfare"];
const TYPES: SchemeType[] = ["Life", "Health", "Investment", "Pension", "Critical", "General"];
const STATUSES: SchemeStatus[] = ["active", "draft", "review", "archived"];
const LIVELIHOODS = ["Student","Working Professional","Self-Employed","Farmer","Unemployed","Senior Citizen","Homemaker"] as const;
const AREA_TYPES = ["Urban","Rural","Semi-Urban"] as const;
const RATION_CARDS = ["APL","BPL","Antyodaya"] as const;
const GENDERS = ["Male","Female","Other"] as const;
const MARITAL = ["Single","Married"] as const;

const inp = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white outline-none focus:border-[#0a66c2] focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400";
const lbl = "block text-xs font-semibold text-slate-700 mb-1.5";

type Tab = "basic" | "eligibility" | "details";

const EMPTY: Omit<Scheme, "id" | "recRate" | "totalRecommended" | "totalAccepted" | "tag"> = {
  name: "", category: "Insurance", type: "Life", provider: "",
  minAge: 18, maxAge: 65, premium: "", coverage: "", summary: "",
  benefits: [], keyNotes: [], eligibilityText: "", status: "active",
  eligibility: {},
};

export default function SchemeModal({ open, onClose, editScheme }: Props) {
  const { addScheme, updateScheme } = useSchemes();
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>("basic");
  const [form, setForm] = useState({ ...EMPTY });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [benefitInput, setBenefitInput] = useState("");
  const [noteInput, setNoteInput] = useState("");

  useEffect(() => {
    if (!open) return;
    setTab("basic");
    setErrors({});
    if (editScheme) {
      setForm({
        name: editScheme.name, category: editScheme.category,
        type: editScheme.type ?? "General", provider: editScheme.provider ?? "",
        minAge: editScheme.minAge ?? 18, maxAge: editScheme.maxAge ?? 65,
        premium: editScheme.premium ?? "", coverage: editScheme.coverage ?? "",
        summary: editScheme.summary ?? "", benefits: editScheme.benefits ?? [],
        keyNotes: editScheme.keyNotes ?? [], eligibilityText: editScheme.eligibilityText ?? "",
        status: editScheme.status, eligibility: editScheme.eligibility ?? {},
      });
    } else {
      setForm({ ...EMPTY, benefits: [], keyNotes: [], eligibility: {} });
    }
  }, [editScheme, open]);

  const set = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }));
  const setElig = (k: string, v: unknown) => setForm((p) => ({ ...p, eligibility: { ...p.eligibility, [k]: v } }));

  const toggleArray = <T,>(arr: T[] | undefined, val: T): T[] => {
    const a = arr ?? [];
    return a.includes(val) ? a.filter((x) => x !== val) : [...a, val];
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    if ((form.minAge ?? 0) >= (form.maxAge ?? 0)) e.maxAge = "Must be greater than min age";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) { setTab("basic"); return; }
    if (editScheme) { updateScheme(editScheme.id, form); showToast("Scheme updated", "success"); }
    else { addScheme(form); showToast("Scheme added", "success"); }
    onClose();
  };

  const addBenefit = () => {
    if (benefitInput.trim()) { set("benefits", [...(form.benefits ?? []), benefitInput.trim()]); setBenefitInput(""); }
  };
  const addNote = () => {
    if (noteInput.trim()) { set("keyNotes", [...(form.keyNotes ?? []), noteInput.trim()]); setNoteInput(""); }
  };

  if (!open) return null;

  const tabs: { id: Tab; label: string }[] = [
    { id: "basic", label: "Basic Info" },
    { id: "eligibility", label: "Eligibility" },
    { id: "details", label: "Benefits & Notes" },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-[600px] max-w-full shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] animate-modalIn">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <h2 className="text-base font-bold text-slate-900">{editScheme ? "Edit Scheme" : "Add New Scheme"}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all">
            <X size={14} />
          </button>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 px-6 pt-3 flex-shrink-0">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${tab === t.id ? "bg-[#0a66c2] text-white" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1">

          {/* ── TAB: BASIC ── */}
          {tab === "basic" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={lbl}>Scheme Name *</label>
                <input className={`${inp} ${errors.name ? "border-red-400" : ""}`} placeholder="e.g. ShieldMax Term Life" value={form.name} onChange={(e) => set("name", e.target.value)} />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className={lbl}>Category</label>
                <select className={inp} value={form.category} onChange={(e) => set("category", e.target.value)}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Type</label>
                <select className={inp} value={form.type} onChange={(e) => set("type", e.target.value)}>
                  {TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Provider</label>
                <input className={inp} placeholder="e.g. LIC, Govt of India" value={form.provider} onChange={(e) => set("provider", e.target.value)} />
              </div>
              <div>
                <label className={lbl}>Status</label>
                <select className={inp} value={form.status} onChange={(e) => set("status", e.target.value as SchemeStatus)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Min Age</label>
                <input className={inp} type="number" min={0} max={100} value={form.minAge} onChange={(e) => set("minAge", Number(e.target.value))} />
              </div>
              <div>
                <label className={lbl}>Max Age</label>
                <input className={`${inp} ${errors.maxAge ? "border-red-400" : ""}`} type="number" min={0} max={100} value={form.maxAge} onChange={(e) => set("maxAge", Number(e.target.value))} />
                {errors.maxAge && <p className="text-xs text-red-500 mt-1">{errors.maxAge}</p>}
              </div>
              <div>
                <label className={lbl}>Premium Range</label>
                <input className={inp} placeholder="₹800–₹4,200" value={form.premium} onChange={(e) => set("premium", e.target.value)} />
              </div>
              <div>
                <label className={lbl}>Coverage</label>
                <input className={inp} placeholder="Up to ₹1 Cr" value={form.coverage} onChange={(e) => set("coverage", e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className={lbl}>Summary</label>
                <textarea className={`${inp} resize-none`} rows={2} placeholder="Brief description of the scheme..." value={form.summary} onChange={(e) => set("summary", e.target.value)} />
              </div>
            </div>
          )}

          {/* ── TAB: ELIGIBILITY ── */}
          {tab === "eligibility" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Min Income (₹/year)</label>
                  <input className={inp} type="number" placeholder="e.g. 200000" value={form.eligibility?.minIncome ?? ""} onChange={(e) => setElig("minIncome", e.target.value ? Number(e.target.value) : undefined)} />
                </div>
                <div>
                  <label className={lbl}>Max Income (₹/year)</label>
                  <input className={inp} type="number" placeholder="e.g. 1000000" value={form.eligibility?.maxIncome ?? ""} onChange={(e) => setElig("maxIncome", e.target.value ? Number(e.target.value) : undefined)} />
                </div>
              </div>

              <div>
                <label className={lbl}>Allowed Livelihood</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {LIVELIHOODS.map((l) => {
                    const active = form.eligibility?.allowedLivelihood?.includes(l);
                    return (
                      <button key={l} type="button" onClick={() => setElig("allowedLivelihood", toggleArray(form.eligibility?.allowedLivelihood, l))}
                        className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${active ? "bg-blue-50 border-blue-300 text-[#0a66c2]" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                        {l}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className={lbl}>Area Type</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {AREA_TYPES.map((a) => {
                    const active = form.eligibility?.allowedAreaType?.includes(a);
                    return (
                      <button key={a} type="button" onClick={() => setElig("allowedAreaType", toggleArray(form.eligibility?.allowedAreaType, a))}
                        className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${active ? "bg-blue-50 border-blue-300 text-[#0a66c2]" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                        {a}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className={lbl}>Ration Card</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {RATION_CARDS.map((r) => {
                    const active = form.eligibility?.requiredRationCard?.includes(r);
                    return (
                      <button key={r} type="button" onClick={() => setElig("requiredRationCard", toggleArray(form.eligibility?.requiredRationCard, r))}
                        className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${active ? "bg-blue-50 border-blue-300 text-[#0a66c2]" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className={lbl}>Gender</label>
                <div className="flex gap-2 mt-1">
                  {GENDERS.map((g) => {
                    const active = form.eligibility?.allowedGender?.includes(g);
                    return (
                      <button key={g} type="button" onClick={() => setElig("allowedGender", toggleArray(form.eligibility?.allowedGender, g))}
                        className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${active ? "bg-blue-50 border-blue-300 text-[#0a66c2]" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className={lbl}>Marital Status</label>
                <div className="flex gap-2 mt-1">
                  {MARITAL.map((m) => {
                    const active = form.eligibility?.allowedMaritalStatus?.includes(m);
                    return (
                      <button key={m} type="button" onClick={() => setElig("allowedMaritalStatus", toggleArray(form.eligibility?.allowedMaritalStatus, m))}
                        className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${active ? "bg-blue-50 border-blue-300 text-[#0a66c2]" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-4">
                {[
                  { key: "requiresDisability", label: "Requires Disability" },
                  { key: "requiresSeniorCitizen", label: "Senior Citizen Only" },
                  { key: "requiresDependents", label: "Requires Dependents" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox"
                      checked={!!(form.eligibility as Record<string, unknown>)?.[key]}
                      onChange={(e) => setElig(key, e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 accent-[#0a66c2]" />
                    <span className="text-xs font-medium text-slate-700">{label}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className={lbl}>Eligibility Text (summary for chatbot)</label>
                <textarea className={`${inp} resize-none`} rows={2} placeholder="Plain-text eligibility summary..." value={form.eligibilityText} onChange={(e) => set("eligibilityText", e.target.value)} />
              </div>
            </div>
          )}

          {/* ── TAB: DETAILS ── */}
          {tab === "details" && (
            <div className="space-y-5">
              <div>
                <label className={lbl}>Benefits</label>
                <div className="flex gap-2 mb-2">
                  <input className={inp} placeholder="Add a benefit..." value={benefitInput} onChange={(e) => setBenefitInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addBenefit())} />
                  <button onClick={addBenefit} type="button" className="px-3 py-2 bg-[#0a66c2] text-white rounded-lg text-sm hover:bg-[#084d93] transition-colors flex-shrink-0">
                    <Plus size={14} />
                  </button>
                </div>
                <div className="space-y-1.5">
                  {(form.benefits ?? []).map((b, i) => (
                    <div key={i} className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                      <span className="text-sm text-green-800 flex-1">✓ {b}</span>
                      <button onClick={() => set("benefits", form.benefits?.filter((_, j) => j !== i))} className="text-green-400 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                    </div>
                  ))}
                  {(form.benefits ?? []).length === 0 && <p className="text-xs text-slate-400 italic">No benefits added yet</p>}
                </div>
              </div>

              <div>
                <label className={lbl}>Key Notes</label>
                <div className="flex gap-2 mb-2">
                  <input className={inp} placeholder="Add a key note..." value={noteInput} onChange={(e) => setNoteInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addNote())} />
                  <button onClick={addNote} type="button" className="px-3 py-2 bg-slate-700 text-white rounded-lg text-sm hover:bg-slate-800 transition-colors flex-shrink-0">
                    <Plus size={14} />
                  </button>
                </div>
                <div className="space-y-1.5">
                  {(form.keyNotes ?? []).map((n, i) => (
                    <div key={i} className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                      <span className="text-sm text-amber-800 flex-1">⚠ {n}</span>
                      <button onClick={() => set("keyNotes", form.keyNotes?.filter((_, j) => j !== i))} className="text-amber-400 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                    </div>
                  ))}
                  {(form.keyNotes ?? []).length === 0 && <p className="text-xs text-slate-400 italic">No key notes added yet</p>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center flex-shrink-0">
          <div className="flex gap-1">
            {tabs.map((t, i) => (
              <span key={t.id} className={`w-2 h-2 rounded-full transition-all ${tab === t.id ? "bg-[#0a66c2]" : "bg-slate-200"}`} />
            ))}
          </div>
          <div className="flex gap-2.5">
            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
            {tab !== "details" ? (
              <button onClick={() => setTab(tab === "basic" ? "eligibility" : "details")} className="px-4 py-2 text-sm font-semibold text-white bg-[#0a66c2] rounded-lg hover:bg-[#084d93] transition-colors">
                Next →
              </button>
            ) : (
              <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold text-white bg-[#0a66c2] rounded-lg hover:bg-[#084d93] transition-colors shadow-sm">
                {editScheme ? "Save Changes" : "Add Scheme"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
