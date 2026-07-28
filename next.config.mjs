function normalizeBasePath(value) {
  const trimmed = (value ?? "").trim();

  if (!trimmed || trimmed === "/") {
    return "";
  }

  if (/^https?:\/\//i.test(trimmed)) {
    throw new Error("NEXT_PUBLIC_BASE_PATH must be a path like /dark-importer, not a full URL.");
  }

  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeadingSlash.replace(/\/+$/, "");
}

const basePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH ?? process.env.BASE_PATH);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  ...(basePath ? { assetPrefix: basePath, basePath } : {})
};

export default nextConfig;
