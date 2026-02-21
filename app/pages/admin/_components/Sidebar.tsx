"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Layers, MessageSquare, Bot, BarChart3, Settings } from "lucide-react";
import { useToast } from "../_lib/toastStore";

const mainNav = [
  { href: "/pages/admin",         label: "Overview",  icon: LayoutDashboard, badge: null,  badgeColor: ""             },
  { href: "/pages/admin/schemes", label: "Schemes",   icon: Layers,          badge: null,  badgeColor: ""             },
  { href: "/pages/admin/logs",    label: "Rec. Logs", icon: MessageSquare,   badge: "3",   badgeColor: "bg-orange-500" },
  {href:"/pages/admin/chatbot" , label:"Chatbot",icon:MessageSquare,badge:null ,badgeColor:""}
];

export default function Sidebar() {
  const pathname = usePathname();
  const { showToast } = useToast();
  const isActive = (href: string) => href === "/pages/admin" ? pathname === "/pages/admin" : pathname.startsWith(href);

  return (
    <aside className="w-[236px] min-h-screen bg-white border-r border-slate-200 flex flex-col flex-shrink-0 shadow-sm">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 bg-[#0a66c2] rounded-lg flex items-center justify-center text-white font-bold text-sm font-mono flex-shrink-0">S</div>
        <div>
          <div className="text-[15px] font-bold text-slate-900 tracking-tight">AULA</div>
          <div className="text-[10px] text-slate-500">Admin Console</div>
        </div>
      </div>

      <nav className="px-3 py-3 flex-1">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 px-2 py-2 font-mono">Main</p>
        {mainNav.map(({ href, label, icon: Icon, badge, badgeColor }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium mb-0.5 transition-all duration-150
                ${active ? "bg-blue-50 text-[#0a66c2] font-semibold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
              <Icon size={16} className={active ? "text-[#0a66c2]" : "text-slate-400"} strokeWidth={active ? 2 : 1.8} />
              <span>{label}</span>
              {badge && <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full text-white font-mono ${badgeColor}`}>{badge}</span>}
            </Link>
          );
        })}

        <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 px-2 py-2 mt-3 font-mono">System</p>
        {[{ label: "Chatbot Config", icon: Bot }, { label: "Analytics", icon: BarChart3 }, { label: "Settings", icon: Settings }].map(({ label, icon: Icon }) => (
          <button key={label} onClick={() => showToast(`${label} coming soon`, "info")}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium mb-0.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all text-left">
            <Icon size={16} className="text-slate-400" strokeWidth={1.8} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-slate-100 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0a66c2] to-sky-500 flex items-center justify-center text-white text-xs font-bold font-mono flex-shrink-0">AD</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-900 truncate">Admin User</div>
          <div className="text-[10px] text-slate-500">Super Admin</div>
        </div>
      </div>
    </aside>
  );
}
