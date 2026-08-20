/**
 * Resolve a `/public` path against the deployment's base path.
 *
 * On the real domain the base path is empty and this is a no-op. On a GitHub
 * Pages project site everything is served from `/<repo>`, and `next/image`
 * does not prefix `src` itself once `unoptimized` is on — so any raw path we
 * hand it has to be resolved here or it 404s.
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(path: string): string {
  return path.startsWith("/") ? `${BASE}${path}` : path;
}
