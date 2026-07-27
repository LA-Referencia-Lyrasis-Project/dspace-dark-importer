import type { TranslationDictionary } from "@/lib/i18n";

type OaiMessages = TranslationDictionary["oai"];

const defaultOaiMessages: OaiMessages = {
  handleBaseUrlRequired: "Handle Base URL is required.",
  handleBaseUrlInvalid: "Handle Base URL must be a valid HTTP or HTTPS URL.",
  handleBaseUrlProtocol: "Handle Base URL must use HTTP or HTTPS.",
  invalidOaiIdentifier: (value) => `Invalid OAI identifier "${value}". Expected format: oai:<repository-domain>:<handle>.`,
  missingRepositoryDomain: "OAI identifier is missing the repository domain.",
  missingHandleSuffix: "OAI identifier is missing the handle suffix.",
  handleSuffixRequiresSlash: (value) => `Invalid OAI identifier "${value}". Handle suffix must include a slash, such as prefix/id.`
};

export function normalizeHandleBaseUrl(handleBaseUrl: string, messages: OaiMessages = defaultOaiMessages): string {
  const trimmed = handleBaseUrl.trim();

  if (!trimmed) {
    throw new Error(messages.handleBaseUrlRequired);
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error(messages.handleBaseUrlInvalid);
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(messages.handleBaseUrlProtocol);
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
  return extractHandleSuffixWithMessages(oaiIdentifier, defaultOaiMessages);
}

function extractHandleSuffixWithMessages(oaiIdentifier: string, messages: OaiMessages): string {
  const trimmed = oaiIdentifier.trim();

  if (!trimmed.startsWith("oai:")) {
    throw new Error(messages.invalidOaiIdentifier(oaiIdentifier));
  }

  const withoutScheme = trimmed.slice("oai:".length);
  const separatorIndex = withoutScheme.lastIndexOf(":");

  if (separatorIndex <= 0 || separatorIndex === withoutScheme.length - 1) {
    throw new Error(messages.invalidOaiIdentifier(oaiIdentifier));
  }

  const repositoryDomain = withoutScheme.slice(0, separatorIndex).trim();
  const handleSuffix = withoutScheme.slice(separatorIndex + 1).trim();

  if (!repositoryDomain) {
    throw new Error(messages.missingRepositoryDomain);
  }

  if (!handleSuffix) {
    throw new Error(messages.missingHandleSuffix);
  }

  if (!handleSuffix.includes("/")) {
    throw new Error(messages.handleSuffixRequiresSlash(oaiIdentifier));
  }

  return handleSuffix.replace(/^\/+/, "");
}

export function buildHandleUri(oaiIdentifier: string, handleBaseUrl: string, messages: OaiMessages = defaultOaiMessages): string {
  const suffix = extractHandleSuffixWithMessages(oaiIdentifier, messages);
  const normalizedBaseUrl = normalizeHandleBaseUrl(handleBaseUrl, messages);
  return `${normalizedBaseUrl}${suffix}`;
}
