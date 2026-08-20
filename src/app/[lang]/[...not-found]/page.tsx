import { notFound } from "next/navigation";

import { locales } from "@/lib/site";

/**
 * Any unknown path under a locale renders that locale's not-found page.
 *
 * On the server build nothing needs prerendering — the route is matched on
 * demand. `output: "export"` has no such fallback and refuses to build a
 * dynamic route with no params, so the export prerenders one concrete path per
 * locale (`/ar/404/`, `/en/404/`). `scripts/finish-pages-build.mjs` then lifts
 * the Arabic one to `out/404.html`, which is the document GitHub Pages serves
 * for anything it cannot resolve.
 */
export function generateStaticParams() {
  if (process.env.STATIC_EXPORT !== "1") return [];
  return locales.map((lang) => ({ lang, "not-found": ["404"] }));
}

export default function LocalizedCatchAll() {
  notFound();
}
