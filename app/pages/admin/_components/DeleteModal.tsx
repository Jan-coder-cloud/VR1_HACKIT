"use client";

import { Trash2 } from "lucide-react";
import { useSchemes } from "../_lib/schemeStore";
import { useToast } from "../_lib/toastStore";

interface Props { open: boolean; schemeId: string | null; schemeName: string; onClose: () => void; }

export default function DeleteModal({ open, schemeId, schemeName, onClose }: Props) {
  const { deleteScheme } = useSchemes();
  const { showToast } = useToast();

  const handleDelete = () => {
    if (!schemeId) return;
    deleteScheme(schemeId);
    showToast("Scheme deleted", "success");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-[400px] max-w-[92vw] shadow-2xl border border-slate-200 animate-modalIn">
        <div className="px-6 py-6 text-center">
          <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4 border border-red-100">
            <Trash2 size={22} className="text-red-500" />
          </div>
          <h2 className="text-base font-bold text-slate-900 mb-2">Delete Scheme?</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Are you sure you want to delete <span className="font-semibold text-slate-700">&ldquo;{schemeName}&rdquo;</span>?
            This action cannot be undone.
          </p>
        </div>
        <div className="px-6 pb-5 flex justify-center gap-2.5">
          <button onClick={onClose} className="px-5 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={handleDelete} className="px-5 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors shadow-sm">Delete</button>
        </div>
      </div>
    </div>
  );
}
