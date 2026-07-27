"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { defaultLanguage, translations, type Language, type TranslationDictionary } from "@/lib/i18n";

const LANGUAGE_KEY = "dspace-darkid-import:language";

interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: TranslationDictionary;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function loadLanguage(): Language {
  if (typeof window === "undefined") {
    return defaultLanguage;
  }

  const stored = window.localStorage.getItem(LANGUAGE_KEY);
  return stored === "pt" || stored === "en" ? stored : defaultLanguage;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);
  const [hasLoadedStoredLanguage, setHasLoadedStoredLanguage] = useState(false);

  useEffect(() => {
    setLanguageState(loadLanguage());
    setHasLoadedStoredLanguage(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedStoredLanguage) {
      return;
    }

    document.documentElement.lang = language === "pt" ? "pt-BR" : "en";
    window.localStorage.setItem(LANGUAGE_KEY, language);
  }, [hasLoadedStoredLanguage, language]);

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage: setLanguageState,
      t: translations[language]
    }),
    [language]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider.");
  }

  return context;
}
