import type { DSpaceItem, DSpaceMetadataValue, ImportConfig } from "@/types";
import { withBasePath } from "@/lib/basePath";
import { HttpError, NetworkError, withRetry } from "@/lib/retry";

export interface DSpaceClient {
  resolveObjectByHandle: (handle: string, fallbackHandleUri: string) => Promise<{ objects: DSpaceItem[]; source: "pid" | "discovery" }>;
}

interface SearchObject {
  _embedded?: { indexableObject?: unknown };
}

interface SearchResponse {
  _embedded?: {
    searchResult?: { _embedded?: { objects?: SearchObject[] } };
    objects?: SearchObject[];
  };
}

function normalizeRestApiUrl(restApiUrl: string): string {
  const parsed = new URL(restApiUrl.trim());
  parsed.pathname = parsed.pathname.replace(/\/+$/, "");
  parsed.search = "";
  parsed.hash = "";
  return parsed.toString().replace(/\/+$/, "");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseMetadata(value: unknown): Record<string, DSpaceMetadataValue[]> {
  if (!isRecord(value)) return {};
  const metadata: Record<string, DSpaceMetadataValue[]> = {};
  for (const [key, values] of Object.entries(value)) {
    if (!Array.isArray(values)) continue;
    metadata[key] = values
      .filter((entry): entry is Record<string, unknown> => isRecord(entry) && typeof entry.value === "string")
      .map((entry) => ({
        value: entry.value as string,
        language: typeof entry.language === "string" ? entry.language : null,
        authority: typeof entry.authority === "string" ? entry.authority : null,
        confidence: typeof entry.confidence === "number" ? entry.confidence : -1,
        place: typeof entry.place === "number" ? entry.place : undefined
      }));
  }
  return metadata;
}

function parseDspaceObject(value: unknown): DSpaceItem | null {
  if (!isRecord(value) || typeof value.uuid !== "string") return null;
  return {
    uuid: value.uuid,
    handle: typeof value.handle === "string" ? value.handle : null,
    name: typeof value.name === "string" ? value.name : undefined,
    metadata: parseMetadata(value.metadata),
    type: typeof value.type === "string" ? value.type : undefined
  };
}

function extractItems(response: SearchResponse): DSpaceItem[] {
  const objects = response._embedded?.searchResult?._embedded?.objects ?? response._embedded?.objects ?? [];
  return objects.map((object) => parseDspaceObject(object._embedded?.indexableObject)).filter((item): item is DSpaceItem => item !== null);
}

function buildExactPhraseQuery(value: string): string {
  return `"${value.replace(/(["\\])/g, "\\$1")}"`;
}

function classifyHttpError(error: unknown): Error {
  if (error instanceof HttpError) {
    const detail = error.body.trim();
    if (error.status === 401) return new Error(detail ? `DSpace authentication failed. ${detail}` : "DSpace authentication failed.");
    if (error.status === 403) return new Error(detail ? `DSpace returned 403 Forbidden. ${detail}` : "DSpace returned 403 Forbidden.");
    if (error.status === 404) return new Error(detail ? `The DSpace endpoint was not found. ${detail}` : "The DSpace endpoint was not found.");
  }
  return error instanceof Error ? error : new Error("Unexpected DSpace API error.");
}

export function createDSpaceClient(config: ImportConfig, signal?: AbortSignal): DSpaceClient {
  const baseUrl = normalizeRestApiUrl(config.restApiUrl);
  const proxyUrl = withBasePath("/api/dspace/proxy");

  async function request<T>(path: string): Promise<T> {
    const payload = { restApiUrl: baseUrl, path, method: "GET", headers: {} };
    const execute = async (): Promise<T> => {
      let response: Response;
      try {
        response = await fetch(proxyUrl, {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") throw error;
        throw new NetworkError("POST", `${proxyUrl} -> GET ${baseUrl}${path}`, error instanceof Error ? error.message : "Unknown browser fetch failure.");
      }
      if (!response.ok) throw new HttpError(response.status, response.statusText, await response.text());
      return (await response.json()) as T;
    };
    return withRetry(execute, { attempts: 3, initialDelayMs: 600, signal });
  }

  return {
    resolveObjectByHandle: async (handle, fallbackHandleUri) => {
      const pidParams = new URLSearchParams({ id: `hdl:${handle}` });
      try {
        const object = parseDspaceObject(await request<unknown>(`/api/pid/find?${pidParams.toString()}`));
        return { objects: object ? [object] : [], source: "pid" };
      } catch (error) {
        if (error instanceof HttpError && (error.status === 404 || error.status === 501)) {
          const searchParams = new URLSearchParams({ query: buildExactPhraseQuery(fallbackHandleUri), size: "2" });
          try {
            return { objects: extractItems(await request<SearchResponse>(`/api/discover/search/objects?${searchParams.toString()}`)), source: "discovery" };
          } catch (fallbackError) {
            throw classifyHttpError(fallbackError);
          }
        }
        throw classifyHttpError(error);
      }
    }
  };
}
