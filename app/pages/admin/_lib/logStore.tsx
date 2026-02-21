"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import { RecommendationLog, initialLogs } from "./data";

interface LogStore {
  logs: RecommendationLog[];
  addLog: (log: RecommendationLog) => void;
}

const LogContext = createContext<LogStore | null>(null);

const STORAGE_KEY = "schemeos_logs";

export function LogProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<RecommendationLog[]>(initialLogs);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setLogs(JSON.parse(stored));
      } catch {
        setLogs(initialLogs);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  }, [logs]);

  const addLog = (log: RecommendationLog) => {
    setLogs((prev) => [...prev, log]);
  };

  return (
    <LogContext.Provider value={{ logs, addLog }}>
      {children}
    </LogContext.Provider>
  );
}

export function useLogs() {
  const ctx = useContext(LogContext);
  if (!ctx) throw new Error("useLogs must be used within LogProvider");
  return ctx;
}