function normalizeBasePath(value: string | undefined): string {
  const trimmed = value?.trim() ?? "";

  if (!trimmed || trimmed === "/") {
    return "";
  }

  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeadingSlash.replace(/\/+$/, "");
}

export function withBasePath(path: `/${string}`): string {
  return `${normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH)}${path}`;
}
