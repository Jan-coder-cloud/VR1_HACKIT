"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "./supabase";
import { Scheme } from "./data";

interface SchemeStore {
  schemes: Scheme[];
  addScheme: (
    data: Omit<Scheme, "id" | "recRate" | "totalRecommended" | "totalAccepted" | "tag">
  ) => Promise<void>;
  updateScheme: (id: string, data: Partial<Scheme>) => Promise<void>;
  deleteScheme: (id: string) => Promise<void>;
}

const SchemeContext = createContext<SchemeStore | null>(null);

const STORAGE_KEY = "schemeos_schemes";

/* ------------------------------
   DB → Frontend mapper
--------------------------------*/
function mapFromDB(row: any): Scheme {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    type: row.type,
    provider: row.provider,
    premium: row.premium,
    coverage: row.coverage,
    summary: row.summary,
    benefits: row.benefits,
    keyNotes: row.key_notes,
    minAge: row.min_age,
    maxAge: row.max_age,
    eligibility: row.eligibility,
    eligibilityText: row.eligibility_text,
    recRate: row.rec_rate,
    totalRecommended: row.total_recommended,
    totalAccepted: row.total_accepted,
    tag: row.tag,
    status: row.status,
  };
}

/* ------------------------------
   Frontend → DB mapper
--------------------------------*/
function mapToDB(data: Partial<Scheme>) {
  return {
    name: data.name,
    category: data.category,
    type: data.type,
    provider: data.provider,
    premium: data.premium,
    coverage: data.coverage,
    summary: data.summary,
    benefits: data.benefits ?? null,
    key_notes: data.keyNotes ?? null,
    min_age: data.minAge ?? null,
    max_age: data.maxAge ?? null,
    eligibility: data.eligibility ?? null,
    eligibility_text: data.eligibilityText ?? null,
    rec_rate: data.recRate ?? 0,
    total_recommended: data.totalRecommended ?? 0,
    total_accepted: data.totalAccepted ?? 0,
    tag: data.tag,
    status: data.status,
  };
}

export function SchemeProvider({ children }: { children: ReactNode }) {
  const [schemes, setSchemes] = useState<Scheme[]>([]);

  /* ------------------------------
     Load from Supabase on mount
  --------------------------------*/
  useEffect(() => {
    async function loadSchemes() {
      const { data, error } = await supabase.from("schemes").select("*");

      if (error) {
        console.error("Load Error:", error);
        return;
      }

      const mapped = data.map(mapFromDB);
      setSchemes(mapped);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
    }

    loadSchemes();
  }, []);

  /* ------------------------------
     Add Scheme
  --------------------------------*/
  const addScheme = async (
    data: Omit<Scheme, "id" | "recRate" | "totalRecommended" | "totalAccepted" | "tag">
  ) => {
    const tag = `${(data.type ?? data.category).toUpperCase()} · ${(data.provider ?? "").toUpperCase()}`;

    const { data: inserted, error } = await supabase
      .from("schemes")
      .insert({
        ...mapToDB({ ...data, tag }),
      })
      .select()
      .single();

    if (error) {
      console.error("Insert Error:", JSON.stringify(error, null, 2));
      return;
    }

    const mapped = mapFromDB(inserted);

    setSchemes((prev) => {
      const updated = [...prev, mapped];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  /* ------------------------------
     Update Scheme
  --------------------------------*/
  const updateScheme = async (id: string, data: Partial<Scheme>) => {
    const { data: updatedRow, error } = await supabase
      .from("schemes")
      .update(mapToDB(data))
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Update Error:", JSON.stringify(error, null, 2));
      return;
    }

    const mapped = mapFromDB(updatedRow);

    setSchemes((prev) => {
      const updated = prev.map((s) => (s.id === id ? mapped : s));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  /* ------------------------------
     Delete Scheme
  --------------------------------*/
  const deleteScheme = async (id: string) => {
    const { error } = await supabase.from("schemes").delete().eq("id", id);

    if (error) {
      console.error("Delete Error:", error);
      return;
    }

    setSchemes((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <SchemeContext.Provider value={{ schemes, addScheme, updateScheme, deleteScheme }}>
      {children}
    </SchemeContext.Provider>
  );
}

export function useSchemes() {
  const ctx = useContext(SchemeContext);
  if (!ctx) throw new Error("useSchemes must be used within SchemeProvider");
  return ctx;
}