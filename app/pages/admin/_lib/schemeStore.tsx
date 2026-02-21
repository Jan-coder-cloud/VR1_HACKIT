"use client";
import { RecommendationLog } from "../_lib/data";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";

import { Scheme, initialSchemes, initialLogs } from "./data";

interface SchemeStore {
  schemes: Scheme[];
  addScheme: (
    data: Omit<Scheme, "id" | "recRate" | "totalRecommended" | "totalAccepted" | "tag">
  ) => void;
  updateScheme: (id: string, data: Partial<Scheme>) => void;
  deleteScheme: (id: string) => void;
}

const SchemeContext = createContext<SchemeStore | null>(null);

const STORAGE_KEY = "schemeos_schemes";

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "") +
    "-" +
    Date.now()
  );
}

export function SchemeProvider({ children }: { children: ReactNode }) {
  const [schemes, setSchemes] = useState<Scheme[]>(initialSchemes);

  // ✅ LOAD from localStorage (client only)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSchemes(JSON.parse(stored));
      } catch {
        setSchemes(initialSchemes);
      }
    }
  }, []);

  // ✅ SAVE whenever schemes change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schemes));
  }, [schemes]);

  const addScheme = useCallback(
    (
      data: Omit<
        Scheme,
        "id" | "recRate" | "totalRecommended" | "totalAccepted" | "tag"
      >
    ) => {
      const tag = `${(data.type ?? data.category).toUpperCase()} · ${(
        data.provider ?? ""
      ).toUpperCase()}`;

      setSchemes((prev) => [
        ...prev,
        {
          ...data,
          id: slugify(data.name),
          recRate: 0,
          totalRecommended: 0,
          totalAccepted: 0,
          tag,
        },
      ]);
    },
    []
  );

  const updateScheme = useCallback((id: string, data: Partial<Scheme>) => {
    setSchemes((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const updated = { ...s, ...data };
        updated.tag = `${(updated.type ?? updated.category).toUpperCase()} · ${(
          updated.provider ?? ""
        ).toUpperCase()}`;
        return updated;
      })
    );
  }, []);

  const deleteScheme = useCallback((id: string) => {
    setSchemes((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return (
    <SchemeContext.Provider
      value={{ schemes, addScheme, updateScheme, deleteScheme }}
    >
      {children}
    </SchemeContext.Provider>
  );
}

export function useSchemes() {
  const ctx = useContext(SchemeContext);
  if (!ctx) throw new Error("useSchemes must be used within SchemeProvider");
  return ctx;
}