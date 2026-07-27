import type { DSpaceItem, DSpaceMetadataValue, ImportConfig } from "@/types";
import { HttpError, NetworkError, withRetry } from "@/lib/retry";

export interface DSpaceClient {
  authenticate: () => Promise<string>;
  metadataFieldExists: (metadataField: string) => Promise<boolean>;
  ensureMetadataField: (metadataField: string) => Promise<{ created: boolean; metadataField: string }>;
  searchItemByMetadata: (metadataField: string, value: string) => Promise<DSpaceItem[]>;
  updateItemMetadata: (item: DSpaceItem, metadataField: string, value: string) => Promise<void>;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH";
  body?: BodyInit;
  headers?: HeadersInit;
  signal?: AbortSignal;
  retry?: boolean;
}

interface ProxyRequestPayload {
  restApiUrl: string;
  path: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
}

interface SearchObject {
  _embedded?: {
    indexableObject?: unknown;
  };
}

interface SearchResponse {
  _embedded?: {
    searchResult?: {
      _embedded?: {
        objects?: SearchObject[];
      };
      page?: {
        totalElements?: number;
      };
    };
    objects?: SearchObject[];
  };
  page?: {
    totalElements?: number;
  };
}

interface MetadataFieldResponse {
  element?: string;
  qualifier?: string | null;
  _embedded?: {
    schema?: {
      prefix?: string;
    };
  };
}

interface MetadataFieldsResponse {
  _embedded?: {
    metadatafields?: MetadataFieldResponse[];
  };
}

interface MetadataSchemaResponse {
  id?: number;
  prefix?: string;
}

interface MetadataSchemasResponse {
  _embedded?: {
    metadataschemas?: MetadataSchemaResponse[];
  };
}

interface ParsedMetadataField {
  schema: string;
  element: string;
  qualifier: string | null;
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

function isMetadataValue(value: unknown): value is DSpaceMetadataValue {
  return (
    isRecord(value) &&
    typeof value.value === "string" &&
    (typeof value.language === "string" || value.language === null || value.language === undefined) &&
    (typeof value.authority === "string" || value.authority === null || value.authority === undefined) &&
    (typeof value.confidence === "number" || value.confidence === undefined)
  );
}

function parseMetadata(value: unknown): Record<string, DSpaceMetadataValue[]> {
  if (!isRecord(value)) {
    return {};
  }

  const metadata: Record<string, DSpaceMetadataValue[]> = {};

  for (const [key, values] of Object.entries(value)) {
    if (!Array.isArray(values)) {
      continue;
    }

    metadata[key] = values.filter(isMetadataValue).map((entry) => ({
      value: entry.value,
      language: entry.language ?? null,
      authority: entry.authority ?? null,
      confidence: entry.confidence ?? -1,
      place: entry.place
    }));
  }

  return metadata;
}

function isDSpaceItem(value: unknown): value is DSpaceItem {
  return isRecord(value) && typeof value.uuid === "string" && value.type === "item";
}

function parseItem(value: unknown): DSpaceItem | null {
  if (!isDSpaceItem(value)) {
    return null;
  }

  return {
    uuid: value.uuid,
    handle: typeof value.handle === "string" ? value.handle : null,
    name: typeof value.name === "string" ? value.name : undefined,
    metadata: parseMetadata(value.metadata),
    type: "item",
    _links: value._links
  };
}

function extractItems(response: SearchResponse): DSpaceItem[] {
  const searchObjects = response._embedded?.searchResult?._embedded?.objects ?? response._embedded?.objects ?? [];
  return searchObjects
    .map((object) => parseItem(object._embedded?.indexableObject))
    .filter((item): item is DSpaceItem => item !== null);
}

function buildExactPhraseQuery(value: string): string {
  const escapedValue = value.replace(/(["\\])/g, "\\$1");
  return `"${escapedValue}"`;
}

function metadataFieldName(field: MetadataFieldResponse): string {
  return [field._embedded?.schema?.prefix, field.element, field.qualifier ?? undefined].filter(Boolean).join(".");
}

function parseMetadataFieldName(metadataField: string): ParsedMetadataField {
  const parts = metadataField
    .trim()
    .split(".")
    .map((part) => part.trim());

  if (parts.length < 2 || parts.length > 3 || parts.some((part) => part.length === 0)) {
    throw new Error(`Metadata field "${metadataField}" must use schema.element or schema.element.qualifier format.`);
  }

  const [schema, element, qualifier] = parts;
  const validPart = /^[A-Za-z0-9_-]+$/;

  if (!validPart.test(schema) || !validPart.test(element) || (qualifier !== undefined && !validPart.test(qualifier))) {
    throw new Error(`Metadata field "${metadataField}" contains invalid characters. Schema, element, and qualifier cannot contain dots, commas, or spaces.`);
  }

  return {
    schema,
    element,
    qualifier: qualifier ?? null
  };
}

function getCookie(name: string): string | null {
  const cookie = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.slice(name.length + 1));
}

function extractBearerToken(headerValue: string | null): string {
  if (!headerValue) {
    throw new Error("Authentication succeeded but no Authorization header was returned by DSpace.");
  }

  return headerValue.replace(/^Bearer\s+/i, "").trim();
}

function classifyHttpError(error: unknown): Error {
  if (error instanceof HttpError) {
    const detail = error.body.trim();
    if (error.status === 401) {
      return new Error(detail ? `Authentication failed or the token expired. DSpace response: ${detail}` : "Authentication failed or the token expired.");
    }

    if (error.status === 403) {
      return new Error(
        detail
          ? `DSpace returned 403 Forbidden. DSpace response: ${detail}`
          : "DSpace returned 403 Forbidden. This can mean insufficient permissions or a missing/invalid CSRF token."
      );
    }

    if (error.status === 404) {
      return new Error(detail ? `The requested DSpace endpoint or item was not found. DSpace response: ${detail}` : "The requested DSpace endpoint or item was not found.");
    }
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error("Unexpected DSpace API error.");
}

export function createDSpaceClient(config: ImportConfig, signal?: AbortSignal): DSpaceClient {
  const baseUrl = normalizeRestApiUrl(config.restApiUrl);
  let authToken = config.authMethod === "bearer" ? config.bearerToken.trim().replace(/^Bearer\s+/i, "") : "";
  let csrfToken = "";

  function headersToRecord(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  function bodyToString(body: BodyInit | null | undefined): string | undefined {
    if (!body) {
      return undefined;
    }

    if (typeof body === "string") {
      return body;
    }

    if (body instanceof URLSearchParams) {
      return body.toString();
    }

    throw new Error("Unsupported request body for the DSpace proxy.");
  }

  async function fetchFromDSpace(path: string, init: RequestInit): Promise<Response> {
    const method = init.method ?? "GET";
    const requestUrl = `${baseUrl}${path}`;

    if (config.useBackendProxy) {
      const proxyUrl = config.backendProxyUrl.trim();
      const headers = new Headers(init.headers);
      const payload: ProxyRequestPayload = {
        restApiUrl: baseUrl,
        path,
        method,
        headers: headersToRecord(headers),
        body: bodyToString(init.body)
      };

      try {
        return await fetch(proxyUrl, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload),
          signal: init.signal
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          throw error;
        }

        const originalMessage = error instanceof Error ? error.message : "Unknown browser fetch failure.";
        console.error("DSpace backend proxy request failed", {
          proxyUrl,
          targetMethod: method,
          targetUrl: requestUrl,
          error
        });
        throw new NetworkError("POST", `${proxyUrl} -> ${method} ${requestUrl}`, originalMessage);
      }
    }

    try {
      return await fetch(requestUrl, {
        ...init,
        credentials: "include"
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw error;
      }

      const originalMessage = error instanceof Error ? error.message : "Unknown browser fetch failure.";
      console.error("DSpace network request failed", {
        method,
        url: requestUrl,
        error
      });
      throw new NetworkError(method, requestUrl, originalMessage);
    }
  }

  function updateCsrfToken(response: Response): void {
    const nextToken = response.headers.get("DSPACE-XSRF-TOKEN") ?? response.headers.get("X-DSpace-XSRF-Token");
    if (nextToken) {
      csrfToken = nextToken;
    }
  }

  async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const requestUrl = `${baseUrl}${path}`;
    const method = options.method ?? "GET";

    const execute = async (): Promise<T> => {
      const headers = new Headers(options.headers);
      headers.set("Accept", "application/json");

      if (authToken) {
        headers.set("Authorization", `Bearer ${authToken}`);
      }

      const readableCookieToken = getCookie("XSRF-TOKEN") ?? getCookie("DSPACE-XSRF-TOKEN");
      const tokenForRequest = csrfToken || readableCookieToken;
      if (tokenForRequest && options.method && options.method !== "GET") {
        headers.set("X-XSRF-TOKEN", tokenForRequest);
      }

      const response = await fetchFromDSpace(path, {
        method,
        body: options.body,
        headers,
        signal: options.signal ?? signal
      });
      updateCsrfToken(response);

      if (!response.ok) {
        throw new HttpError(response.status, response.statusText, await response.text());
      }

      if (response.status === 204) {
        return undefined as T;
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        return undefined as T;
      }

      return (await response.json()) as T;
    };

    if (options.retry === false) {
      return execute();
    }

    return withRetry(execute, { attempts: 3, initialDelayMs: 600, signal: options.signal ?? signal });
  }

  async function ensureCsrfToken(): Promise<void> {
    if (csrfToken || getCookie("XSRF-TOKEN") || getCookie("DSPACE-XSRF-TOKEN")) {
      return;
    }

    await request<unknown>("/api/security/csrf", {
      method: "GET",
      retry: false
    });
  }

  return {
    authenticate: async () => {
      if (config.authMethod === "bearer") {
        return authToken;
      }

      await ensureCsrfToken();
      const requestUrl = `${baseUrl}/api/authn/login`;
      const body = new URLSearchParams();
      body.set("user", config.email.trim());
      body.set("password", config.password);

      const response = await fetchFromDSpace("/api/authn/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json"
        },
        body,
        signal
      });
      updateCsrfToken(response);

      if (!response.ok) {
        throw new HttpError(response.status, response.statusText, await response.text());
      }

      authToken = extractBearerToken(response.headers.get("Authorization"));
      return authToken;
    },
    searchItemByMetadata: async (_metadataField, value) => {
      const params = new URLSearchParams({
        query: buildExactPhraseQuery(value),
        dsoType: "item",
        size: "1"
      });

      try {
        const response = await request<SearchResponse>(`/api/discover/search/objects?${params.toString()}`);
        return extractItems(response);
      } catch (error) {
        throw classifyHttpError(error);
      }
    },
    metadataFieldExists: async (metadataField) => {
      try {
        const response = await request<MetadataFieldsResponse>("/api/core/metadatafields?size=1000", {
          retry: false
        });
        const fields = response._embedded?.metadatafields ?? [];
        return fields.some((field) => metadataFieldName(field) === metadataField);
      } catch (error) {
        throw classifyHttpError(error);
      }
    },
    ensureMetadataField: async (metadataField) => {
      const parsedField = parseMetadataFieldName(metadataField);

      try {
        const fieldsResponse = await request<MetadataFieldsResponse>("/api/core/metadatafields?size=1000", {
          retry: false
        });
        const fields = fieldsResponse._embedded?.metadatafields ?? [];
        if (fields.some((field) => metadataFieldName(field) === metadataField)) {
          return { created: false, metadataField };
        }

        const schemasResponse = await request<MetadataSchemasResponse>("/api/core/metadataschemas?size=1000", {
          retry: false
        });
        const schemas = schemasResponse._embedded?.metadataschemas ?? [];
        const schema = schemas.find((entry) => entry.prefix === parsedField.schema);

        if (typeof schema?.id !== "number") {
          throw new Error(`Metadata schema "${parsedField.schema}" does not exist. Create the schema before creating "${metadataField}".`);
        }

        await ensureCsrfToken();
        await request<MetadataFieldResponse>(`/api/core/metadatafields?schemaId=${encodeURIComponent(String(schema.id))}`, {
          method: "POST",
          body: JSON.stringify({
            element: parsedField.element,
            qualifier: parsedField.qualifier,
            scopeNote: `Created by DSpace Dark ID Import for ${metadataField}`
          }),
          headers: {
            "Content-Type": "application/json"
          },
          retry: false
        });

        return { created: true, metadataField };
      } catch (error) {
        if (error instanceof HttpError && error.status === 403) {
          throw new Error(
            `DSpace returned 403 while creating metadata field "${metadataField}". Creating metadata fields requires an administrator account and a valid CSRF token. DSpace response: ${error.body}`
          );
        }

        if (error instanceof HttpError && error.status === 422) {
          throw new Error(`DSpace rejected metadata field "${metadataField}" with HTTP 422. DSpace response: ${error.body}`);
        }

        throw classifyHttpError(error);
      }
    },
    updateItemMetadata: async (item, metadataField, value) => {
      await ensureCsrfToken();
      const metadataValue: DSpaceMetadataValue = {
        value,
        language: null,
        authority: null,
        confidence: -1
      };
      const hasExistingValues = (item.metadata[metadataField]?.length ?? 0) > 0;
      const patch = hasExistingValues
        ? [{ op: "add", path: `/metadata/${metadataField}/-`, value: metadataValue }]
        : [{ op: "add", path: `/metadata/${metadataField}`, value: [metadataValue] }];

      try {
        await request<unknown>(`/api/core/items/${encodeURIComponent(item.uuid)}`, {
          method: "PATCH",
          body: JSON.stringify(patch),
          headers: {
            "Content-Type": "application/json"
          }
        });
      } catch (error) {
        if (error instanceof HttpError && error.status === 422) {
          throw new Error(
            `DSpace rejected metadata field "${metadataField}" with HTTP 422. Confirm that "${metadataField}" exists in the metadata registry and is editable. DSpace response: ${error.body}`
          );
        }

        throw classifyHttpError(error);
      }
    }
  };
}
