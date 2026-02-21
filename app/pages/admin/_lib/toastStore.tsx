"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle, XCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";
interface Toast { id: number; message: string; type: ToastType; }
interface ToastCtx { showToast: (message: string, type?: ToastType) => void; }

const ToastContext = createContext<ToastCtx | null>(null);
let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  const iconMap = {
    success: <CheckCircle size={14} className="text-white" />,
    error:   <XCircle    size={14} className="text-white" />,
    info:    <Info       size={14} className="text-white" />,
  };
  const bgMap = { success: "bg-green-500", error: "bg-red-500", info: "bg-[#0a66c2]" };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-xl text-sm font-medium shadow-2xl animate-slideUp pointer-events-auto">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${bgMap[t.type]}`}>{iconMap[t.type]}</span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
