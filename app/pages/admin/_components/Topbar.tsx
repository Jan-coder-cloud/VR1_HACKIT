"use client";

import { usePathname } from "next/navigation";
import { Search, Bell, Settings } from "lucide-react";
import { useToast } from "../_lib/toastStore";

const PAGE_META: Record<string, { title: string; sub: string }> = {
  "/pages/admin":         { title: "Overview",            sub: "Finance & Insurance Scheme Management"      },
  "/pages/admin/schemes": { title: "Scheme Management",   sub: "Create, edit and manage all schemes"        },
  "/pages/admin/logs":    { title: "Recommendation Logs", sub: "Chatbot recommendation events and outcomes" },
};

export default function Topbar() {
  const pathname = usePathname();
  const { showToast } = useToast();
  const meta = PAGE_META[pathname] ?? { title: "Admin", sub: "SchemeOS Console" };

  return (
    <header className="h-14 px-7 bg-white border-b border-slate-200 flex items-center justify-between flex-shrink-0 shadow-sm">
      <div>
        <h1 className="text-[17px] font-bold text-slate-900 tracking-tight">{meta.title}</h1>
        <p className="text-[11px] text-slate-500 mt-0.5">{meta.sub}</p>
      </div>
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus-within:border-[#0a66c2] focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <Search size={13} className="text-slate-400 flex-shrink-0" />
          <input type="text" placeholder="Search schemes, users..." className="bg-transparent border-none outline-none text-sm text-slate-900 placeholder:text-slate-400 w-44" />
        </div>
        <button onClick={() => showToast("No new notifications", "info")} className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-50 hover:border-slate-300 transition-all relative">
          <Bell size={15} className="text-slate-500" strokeWidth={1.8} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500 border-2 border-white" />
        </button>
        <button onClick={() => showToast("Settings coming soon", "info")} className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-50 hover:border-slate-300 transition-all">
          <Settings size={15} className="text-slate-500" strokeWidth={1.8} />
        </button>
      </div>
    </header>
  );
}
