import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BODY_LIMIT_BYTES = Number(process.env.REQUEST_BODY_LIMIT_BYTES ?? 1024 * 1024);
const RESPONSE_LIMIT_BYTES = Number(process.env.PROXY_RESPONSE_LIMIT_BYTES ?? 25 * 1024 * 1024);
const PROXY_TIMEOUT_MS = Number(process.env.PROXY_TIMEOUT_MS ?? 30000);
const PROXY_SESSION_COOKIE = "dspace_import_proxy_sid";
const PROXY_SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "content-length",
  "host",
  "keep-alive",
  "origin",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade"
]);

const dspaceCookieJars = new Map<string, Map<string, string>>();

interface ProxyRequestPayload {
  restApiUrl: string;
  path: string;
  method: string;
  headers?: Record<string, unknown>;
  body?: unknown;
}

interface ValidatedProxyPayload {
  restApiUrl: string;
  path: string;
  method: "GET" | "POST" | "PATCH";
  headers: Record<string, string>;
  body?: string;
}

function logInfo(event: string, data: Record<string, unknown>): void {
  console.log(JSON.stringify({ level: "info", event, time: new Date().toISOString(), ...data }));
}

function logError(event: string, data: Record<string, unknown>): void {
  console.error(JSON.stringify({ level: "error", event, time: new Date().toISOString(), ...data }));
}

function setProxySessionCookie(headers: Headers, sessionId: string): void {
  headers.append(
    "Set-Cookie",
    `${PROXY_SESSION_COOKIE}=${encodeURIComponent(sessionId)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${PROXY_SESSION_MAX_AGE_SECONDS}`
  );
}

function jsonResponse(status: number, payload: Record<string, unknown>, requestId: string, sessionId: string): NextResponse {
  const headers = new Headers();
  headers.set("X-Request-ID", requestId);
  setProxySessionCookie(headers, sessionId);
  return NextResponse.json(payload, { status, headers });
}

function normalizeRestApiUrl(restApiUrl: string): string {
  const parsed = new URL(restApiUrl);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only HTTP and HTTPS DSpace URLs are supported.");
  }

  parsed.pathname = parsed.pathname.replace(/\/+$/, "");
  parsed.search = "";
  parsed.hash = "";
  return parsed.toString().replace(/\/+$/, "");
}

function validateProxyPayload(value: unknown): ValidatedProxyPayload {
  if (typeof value !== "object" || value === null) {
    throw new Error("Proxy payload must be an object.");
  }

  const payload = value as ProxyRequestPayload;
  if (typeof payload.restApiUrl !== "string" || typeof payload.path !== "string" || typeof payload.method !== "string") {
    throw new Error("Proxy payload requires restApiUrl, path, and method.");
  }

  if (!payload.path.startsWith("/api/")) {
    throw new Error("Proxy path must start with /api/.");
  }

  const method = payload.method.toUpperCase();
  if (method !== "GET" && method !== "POST" && method !== "PATCH") {
    throw new Error(`Unsupported DSpace method: ${method}.`);
  }

  const headers: Record<string, string> = {};
  if (payload.headers && typeof payload.headers === "object") {
    for (const [key, value] of Object.entries(payload.headers)) {
      if (typeof value === "string" && !HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
        headers[key] = value;
      }
    }
  }

  return {
    restApiUrl: normalizeRestApiUrl(payload.restApiUrl),
    path: payload.path,
    method,
    headers,
    body: typeof payload.body === "string" ? payload.body : undefined
  };
}

function createTimeoutSignal(timeoutMs: number): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeout)
  };
}

function readSetCookieHeaders(headers: Headers): string[] {
  if ("getSetCookie" in headers && typeof headers.getSetCookie === "function") {
    return headers.getSetCookie();
  }

  const singleHeader = headers.get("set-cookie");
  return singleHeader ? [singleHeader] : [];
}

function getProxySessionId(request: NextRequest): string {
  const existingSessionId = request.cookies.get(PROXY_SESSION_COOKIE)?.value;
  if (existingSessionId && /^[0-9a-f-]{36}$/i.test(existingSessionId)) {
    return existingSessionId;
  }

  return crypto.randomUUID();
}

function getCookieJar(sessionId: string, restApiUrl: string): Map<string, string> {
  const key = `${sessionId}:${restApiUrl}`;
  const existingJar = dspaceCookieJars.get(key);
  if (existingJar) {
    return existingJar;
  }

  const nextJar = new Map<string, string>();
  dspaceCookieJars.set(key, nextJar);
  return nextJar;
}

function storeDspaceCookies(headers: Headers, cookieJar: Map<string, string>): void {
  for (const setCookieHeader of readSetCookieHeaders(headers)) {
    const [cookiePair] = setCookieHeader.split(";");
    const separatorIndex = cookiePair.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    cookieJar.set(cookiePair.slice(0, separatorIndex), cookiePair.slice(separatorIndex + 1));
  }
}

function applyDspaceCookies(headers: Headers, cookieJar: Map<string, string>): void {
  if (cookieJar.size === 0) {
    return;
  }

  headers.set("Cookie", [...cookieJar.entries()].map(([name, value]) => `${name}=${value}`).join("; "));
}

async function readLimitedJson(request: NextRequest): Promise<unknown> {
  const text = await request.text();
  if (Buffer.byteLength(text, "utf8") > BODY_LIMIT_BYTES) {
    throw new Error("Request body is too large.");
  }

  return JSON.parse(text) as unknown;
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204
  });
}

export async function POST(request: NextRequest): Promise<Response> {
  const requestId = crypto.randomUUID();
  const sessionId = getProxySessionId(request);
  const startedAt = Date.now();
  let payload: ValidatedProxyPayload;

  try {
    payload = validateProxyPayload(await readLimitedJson(request));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid proxy request.";
    logError("proxy.validation_failed", { requestId, message });
    return jsonResponse(400, { message }, requestId, sessionId);
  }

  const targetUrl = `${payload.restApiUrl}${payload.path}`;
  const cookieJar = getCookieJar(sessionId, payload.restApiUrl);

  try {
    const headers = new Headers(payload.headers);
    applyDspaceCookies(headers, cookieJar);
    const timeout = createTimeoutSignal(PROXY_TIMEOUT_MS);

    let dspaceResponse: Response;
    try {
      dspaceResponse = await fetch(targetUrl, {
        method: payload.method,
        headers,
        body: payload.body,
        signal: timeout.signal
      });
    } finally {
      timeout.clear();
    }

    storeDspaceCookies(dspaceResponse.headers, cookieJar);

    const contentLength = Number(dspaceResponse.headers.get("content-length") ?? 0);
    if (contentLength > RESPONSE_LIMIT_BYTES) {
      throw new Error(`DSpace response is too large (${contentLength} bytes).`);
    }

    const body = Buffer.from(await dspaceResponse.arrayBuffer());
    if (body.byteLength > RESPONSE_LIMIT_BYTES) {
      throw new Error(`DSpace response is too large (${body.byteLength} bytes).`);
    }

    const responseHeaders = new Headers();
    responseHeaders.set("X-Request-ID", requestId);
    setProxySessionCookie(responseHeaders, sessionId);

    const contentType = dspaceResponse.headers.get("content-type");
    const authorization = dspaceResponse.headers.get("authorization");
    const csrfToken = dspaceResponse.headers.get("dspace-xsrf-token");

    if (contentType) {
      responseHeaders.set("Content-Type", contentType);
    }

    if (authorization) {
      responseHeaders.set("Authorization", authorization);
      responseHeaders.set("X-DSpace-Authorization", authorization);
    }

    if (csrfToken) {
      responseHeaders.set("DSPACE-XSRF-TOKEN", csrfToken);
      responseHeaders.set("X-DSpace-XSRF-Token", csrfToken);
    }

    logInfo("proxy.request", {
      requestId,
      method: payload.method,
      targetUrl,
      status: dspaceResponse.status,
      durationMs: Date.now() - startedAt
    });

    return new Response(body, {
      status: dspaceResponse.status,
      headers: responseHeaders
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown proxy error.";
    logError("proxy.request_failed", {
      requestId,
      method: payload.method,
      targetUrl,
      durationMs: Date.now() - startedAt,
      message
    });
    return jsonResponse(502, { message: "The proxy could not reach DSpace.", targetUrl, error: message }, requestId, sessionId);
  }
}
