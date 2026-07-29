import type { ImportConfig, RecentConfig } from "@/types";

const CONFIG_KEY = "dspace-darkid-import:config";
const RECENT_KEY = "dspace-darkid-import:recent";

export const defaultConfig: ImportConfig = {
  restApiUrl: "",
  handleBaseUrl: "",
  bearerToken: "",
  metadataSearchField: "dc.identifier.uri",
  metadataUpdateField: "dc.identifier.dark"
};

const defaultRecent: RecentConfig = {
  restApiUrls: [],
  handleBaseUrls: []
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function loadConfig(): ImportConfig {
  if (typeof window === "undefined") {
    return defaultConfig;
  }

  const raw = window.localStorage.getItem(CONFIG_KEY);
  if (!raw) {
    return defaultConfig;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) {
      return defaultConfig;
    }

    return {
      restApiUrl: typeof parsed.restApiUrl === "string" ? parsed.restApiUrl : defaultConfig.restApiUrl,
      handleBaseUrl: typeof parsed.handleBaseUrl === "string" ? parsed.handleBaseUrl : defaultConfig.handleBaseUrl,
      bearerToken: typeof parsed.bearerToken === "string" ? parsed.bearerToken : defaultConfig.bearerToken,
      metadataSearchField: typeof parsed.metadataSearchField === "string" ? parsed.metadataSearchField : defaultConfig.metadataSearchField,
      metadataUpdateField: typeof parsed.metadataUpdateField === "string" ? parsed.metadataUpdateField : defaultConfig.metadataUpdateField
    };
  } catch {
    return defaultConfig;
  }
}

export function saveConfig(config: ImportConfig): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  saveRecent(config);
}

export function loadRecent(): RecentConfig {
  if (typeof window === "undefined") {
    return defaultRecent;
  }

  const raw = window.localStorage.getItem(RECENT_KEY);
  if (!raw) {
    return defaultRecent;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) {
      return defaultRecent;
    }

    return {
      restApiUrls: Array.isArray(parsed.restApiUrls) ? parsed.restApiUrls.filter((value): value is string => typeof value === "string") : [],
      handleBaseUrls: Array.isArray(parsed.handleBaseUrls) ? parsed.handleBaseUrls.filter((value): value is string => typeof value === "string") : []
    };
  } catch {
    return defaultRecent;
  }
}

function addRecentValue(values: string[], nextValue: string): string[] {
  const trimmed = nextValue.trim();
  if (!trimmed) {
    return values;
  }

  return [trimmed, ...values.filter((value) => value !== trimmed)].slice(0, 5);
}

export function saveRecent(config: ImportConfig): void {
  if (typeof window === "undefined") {
    return;
  }

  const recent = loadRecent();
  const nextRecent: RecentConfig = {
    restApiUrls: addRecentValue(recent.restApiUrls, config.restApiUrl),
    handleBaseUrls: addRecentValue(recent.handleBaseUrls, config.handleBaseUrl)
  };
  window.localStorage.setItem(RECENT_KEY, JSON.stringify(nextRecent));
}
