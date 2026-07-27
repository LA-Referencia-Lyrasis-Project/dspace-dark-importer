export function normalizeHandleBaseUrl(handleBaseUrl: string): string {
  const trimmed = handleBaseUrl.trim();

  if (!trimmed) {
    throw new Error("Handle Base URL is required.");
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error("Handle Base URL must be a valid HTTP or HTTPS URL.");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Handle Base URL must use HTTP or HTTPS.");
  }

  const normalizedPath = parsed.pathname
    .split("/")
    .filter((segment) => segment.length > 0)
    .join("/");

  parsed.pathname = normalizedPath ? `/${normalizedPath}/` : "/";
  parsed.search = "";
  parsed.hash = "";

  return parsed.toString();
}

export function extractHandleSuffix(oaiIdentifier: string): string {
  const trimmed = oaiIdentifier.trim();

  if (!trimmed.startsWith("oai:")) {
    throw new Error(`Invalid OAI identifier "${oaiIdentifier}". Expected format: oai:<repository-domain>:<handle>.`);
  }

  const withoutScheme = trimmed.slice("oai:".length);
  const separatorIndex = withoutScheme.lastIndexOf(":");

  if (separatorIndex <= 0 || separatorIndex === withoutScheme.length - 1) {
    throw new Error(`Invalid OAI identifier "${oaiIdentifier}". Expected format: oai:<repository-domain>:<handle>.`);
  }

  const repositoryDomain = withoutScheme.slice(0, separatorIndex).trim();
  const handleSuffix = withoutScheme.slice(separatorIndex + 1).trim();

  if (!repositoryDomain) {
    throw new Error("OAI identifier is missing the repository domain.");
  }

  if (!handleSuffix) {
    throw new Error("OAI identifier is missing the handle suffix.");
  }

  if (!handleSuffix.includes("/")) {
    throw new Error(`Invalid OAI identifier "${oaiIdentifier}". Handle suffix must include a slash, such as prefix/id.`);
  }

  return handleSuffix.replace(/^\/+/, "");
}

export function buildHandleUri(oaiIdentifier: string, handleBaseUrl: string): string {
  const suffix = extractHandleSuffix(oaiIdentifier);
  const normalizedBaseUrl = normalizeHandleBaseUrl(handleBaseUrl);
  return `${normalizedBaseUrl}${suffix}`;
}
