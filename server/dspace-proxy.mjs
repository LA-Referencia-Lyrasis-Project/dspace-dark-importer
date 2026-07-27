import { createServer } from "node:http";
import { createReadStream, existsSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";

const PORT = Number(process.env.PORT ?? 8787);
const HOST = process.env.HOST ?? "127.0.0.1";
const DIST_DIR = resolve(process.cwd(), "dist");
const ALLOWED_ORIGINS = new Set(
  (process.env.PROXY_ALLOWED_ORIGINS ?? "http://127.0.0.1:5173,http://localhost:5173,http://127.0.0.1:8787,http://localhost:8787")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
);

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

const MIME_TYPES = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".ico", "image/x-icon"]
]);

const dspaceCookieJar = new Map();

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8"
  });
  response.end(JSON.stringify(payload));
}

function applyCors(request, response) {
  const origin = request.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
    response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    response.setHeader("Access-Control-Expose-Headers", "Authorization, X-DSpace-Authorization, DSPACE-XSRF-TOKEN, X-DSpace-XSRF-Token, Content-Type");
  }
}

function readRequestBody(request) {
  return new Promise((resolveBody, rejectBody) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 10 * 1024 * 1024) {
        rejectBody(new Error("Request body is too large."));
        request.destroy();
      }
    });
    request.on("end", () => resolveBody(body));
    request.on("error", rejectBody);
  });
}

function normalizeRestApiUrl(restApiUrl) {
  const parsed = new URL(restApiUrl);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only HTTP and HTTPS DSpace URLs are supported.");
  }
  parsed.pathname = parsed.pathname.replace(/\/+$/, "");
  parsed.search = "";
  parsed.hash = "";
  return parsed.toString().replace(/\/+$/, "");
}

function validateProxyPayload(value) {
  if (typeof value !== "object" || value === null) {
    throw new Error("Proxy payload must be an object.");
  }

  if (typeof value.restApiUrl !== "string" || typeof value.path !== "string" || typeof value.method !== "string") {
    throw new Error("Proxy payload requires restApiUrl, path, and method.");
  }

  if (!value.path.startsWith("/api/")) {
    throw new Error("Proxy path must start with /api/.");
  }

  const method = value.method.toUpperCase();
  if (!["GET", "POST", "PATCH"].includes(method)) {
    throw new Error(`Unsupported DSpace method: ${method}.`);
  }

  return {
    restApiUrl: normalizeRestApiUrl(value.restApiUrl),
    path: value.path,
    method,
    headers: typeof value.headers === "object" && value.headers !== null ? value.headers : {},
    body: typeof value.body === "string" ? value.body : undefined
  };
}

function proxyHeaders(headers) {
  const result = new Headers();
  for (const [key, value] of Object.entries(headers)) {
    if (typeof value !== "string") {
      continue;
    }

    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      result.set(key, value);
    }
  }
  return result;
}

function readSetCookieHeaders(headers) {
  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie();
  }

  const singleHeader = headers.get("set-cookie");
  return singleHeader ? [singleHeader] : [];
}

function storeDspaceCookies(headers) {
  for (const setCookieHeader of readSetCookieHeaders(headers)) {
    const [cookiePair] = setCookieHeader.split(";");
    const separatorIndex = cookiePair.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    dspaceCookieJar.set(cookiePair.slice(0, separatorIndex), cookiePair.slice(separatorIndex + 1));
  }
}

function applyDspaceCookies(headers) {
  if (dspaceCookieJar.size === 0) {
    return;
  }

  const cookieHeader = [...dspaceCookieJar.entries()].map(([name, value]) => `${name}=${value}`).join("; ");
  headers.set("Cookie", cookieHeader);
}

async function handleProxy(request, response) {
  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method !== "POST") {
    sendJson(response, 405, { message: "Use POST for the DSpace proxy endpoint." });
    return;
  }

  let payload;
  try {
    payload = validateProxyPayload(JSON.parse(await readRequestBody(request)));
  } catch (error) {
    sendJson(response, 400, { message: error instanceof Error ? error.message : "Invalid proxy request." });
    return;
  }

  const targetUrl = `${payload.restApiUrl}${payload.path}`;

  try {
    const headers = proxyHeaders(payload.headers);
    applyDspaceCookies(headers);

    const dspaceResponse = await fetch(targetUrl, {
      method: payload.method,
      headers,
      body: payload.body
    });
    storeDspaceCookies(dspaceResponse.headers);

    const body = Buffer.from(await dspaceResponse.arrayBuffer());
    const responseHeaders = {};

    const contentType = dspaceResponse.headers.get("content-type");
    const authorization = dspaceResponse.headers.get("authorization");
    const csrfToken = dspaceResponse.headers.get("dspace-xsrf-token");
    if (contentType) {
      responseHeaders["Content-Type"] = contentType;
    }
    if (authorization) {
      responseHeaders.Authorization = authorization;
      responseHeaders["X-DSpace-Authorization"] = authorization;
    }
    if (csrfToken) {
      responseHeaders["DSPACE-XSRF-TOKEN"] = csrfToken;
      responseHeaders["X-DSpace-XSRF-Token"] = csrfToken;
    }

    response.writeHead(dspaceResponse.status, responseHeaders);
    response.end(body);
  } catch (error) {
    sendJson(response, 502, {
      message: "The proxy could not reach DSpace.",
      targetUrl,
      error: error instanceof Error ? error.message : "Unknown proxy error."
    });
  }
}

function safeStaticPath(pathname) {
  const decoded = decodeURIComponent(pathname);
  const normalized = normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(DIST_DIR, normalized === "/" ? "index.html" : normalized);
  return filePath.startsWith(DIST_DIR) ? filePath : join(DIST_DIR, "index.html");
}

async function handleStatic(request, response) {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
  const filePath = safeStaticPath(url.pathname);
  const fallbackPath = join(DIST_DIR, "index.html");
  const finalPath = existsSync(filePath) ? filePath : fallbackPath;

  if (!existsSync(finalPath)) {
    sendJson(response, 404, { message: "Build the frontend with npm run build, or run npm run dev separately." });
    return;
  }

  response.writeHead(200, {
    "Content-Type": MIME_TYPES.get(extname(finalPath)) ?? "application/octet-stream"
  });
  createReadStream(finalPath).pipe(response);
}

const server = createServer(async (request, response) => {
  applyCors(request, response);

  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

  if (url.pathname === "/api/dspace/proxy") {
    await handleProxy(request, response);
    return;
  }

  if (request.method === "GET" || request.method === "HEAD") {
    await handleStatic(request, response);
    return;
  }

  sendJson(response, 404, { message: "Not found." });
});

server.listen(PORT, HOST, () => {
  console.log(`DSpace import proxy listening at http://${HOST}:${PORT}/`);
});
