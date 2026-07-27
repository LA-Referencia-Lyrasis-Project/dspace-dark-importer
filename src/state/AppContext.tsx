"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { CsvDataset, ImportConfig, ImportReportRow, ValidationSummary } from "@/types";
import { defaultConfig, loadConfig, saveConfig } from "@/lib/storage";

interface ResultsSnapshot {
  rows: ImportReportRow[];
  elapsedMs: number;
}

interface AppContextValue {
  config: ImportConfig;
  setConfig: (config: ImportConfig) => void;
  dataset: CsvDataset | null;
  setDataset: (dataset: CsvDataset | null) => void;
  validation: ValidationSummary | null;
  setValidation: (validation: ValidationSummary | null) => void;
  startRequested: boolean;
  setStartRequested: (value: boolean) => void;
  results: ResultsSnapshot;
  setResults: (results: ResultsSnapshot) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<ImportConfig>(() => {
    if (typeof window === "undefined") {
      return defaultConfig;
    }

    return loadConfig();
  });
  const [dataset, setDataset] = useState<CsvDataset | null>(null);
  const [validation, setValidation] = useState<ValidationSummary | null>(null);
  const [startRequested, setStartRequested] = useState(false);
  const [results, setResults] = useState<ResultsSnapshot>({ rows: [], elapsedMs: 0 });

  const value = useMemo<AppContextValue>(
    () => ({
      config,
      setConfig: (nextConfig) => {
        setConfigState(nextConfig);
        saveConfig(nextConfig);
      },
      dataset,
      setDataset,
      validation,
      setValidation,
      startRequested,
      setStartRequested,
      results,
      setResults
    }),
    [config, dataset, results, startRequested, validation]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be used inside AppProvider.");
  }

  return context;
}
