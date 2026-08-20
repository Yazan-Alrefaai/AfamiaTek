import type { NextConfig } from "next";

/**
 * Two build targets share this config.
 *
 * Default (`npm run build`) is the normal server build for the real domain:
 * the proxy handles locale negotiation and next/image optimises on the fly.
 *
 * `npm run build:pages` sets STATIC_EXPORT=1 and BASE_PATH=/<repo>, producing
 * a fully static `out/` for GitHub Pages. There is no server there, so the
 * proxy never runs and images cannot be optimised on request — hence the two
 * overrides below. Nothing else about the app changes between the two.
 */
const isExport = process.env.STATIC_EXPORT === "1";
const basePath = process.env.BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // read by src/lib/asset.ts on both the server and the client
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  turbopack: {
    // Keep Turbopack scoped to this app even when a lockfile exists higher up.
    root: process.cwd(),
  },
  images: {
    formats: ["image/avif", "image/webp"],
    unoptimized: isExport,
  },
  ...(isExport
    ? {
        output: "export" as const,
        // GitHub Pages serves /path/ as /path/index.html
        trailingSlash: true,
        basePath,
        assetPrefix: basePath || undefined,
      }
    : {}),
};

export default nextConfig;
