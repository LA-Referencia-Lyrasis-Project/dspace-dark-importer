import type { ImportConfig, RecentConfig } from "@/types";

const CONFIG_KEY = "dspace-darkid-import:config";
const RECENT_KEY = "dspace-darkid-import:recent";

export const defaultConfig: ImportConfig = {
  restApiUrl: "",
  handleBaseUrl: "",
  useBackendProxy: false,
  backendProxyUrl: "http://localhost:8787/api/dspace/proxy",
  authMethod: "bearer",
  bearerToken: "",
  email: "",
  password: "",
  metadataSearchField: "dc.identifier.uri",
  metadataUpdateField: "dc.identifier.darkid"
};

const defaultRecent: RecentConfig = {
  restApiUrls: [],
  handleBaseUrls: []
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function loadConfig(): ImportConfig {
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
      ...defaultConfig,
      ...parsed,
      password: "",
      bearerToken: typeof parsed.bearerToken === "string" ? parsed.bearerToken : ""
    };
  } catch {
    return defaultConfig;
  }
}

export function saveConfig(config: ImportConfig): void {
  window.localStorage.setItem(CONFIG_KEY, JSON.stringify({ ...config, password: "" }));
  saveRecent(config);
}

export function loadRecent(): RecentConfig {
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
  const recent = loadRecent();
  const nextRecent: RecentConfig = {
    restApiUrls: addRecentValue(recent.restApiUrls, config.restApiUrl),
    handleBaseUrls: addRecentValue(recent.handleBaseUrls, config.handleBaseUrl)
  };
  window.localStorage.setItem(RECENT_KEY, JSON.stringify(nextRecent));
}
