import type { MetadataRoute } from "next";

import { products } from "@/lib/catalog";
import { locales, site } from "@/lib/site";

/** Required for `output: "export"`: emit this as a file, not a route. */
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["", "/shop", "/about", "/contact"];

  const pages = locales.flatMap((locale) =>
    staticPaths.map((path) => ({
      url: `${site.url}/${locale}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    })),
  );

  const productPages = locales.flatMap((locale) =>
    products.map((product) => ({
      url: `${site.url}/${locale}/shop/${product.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  );

  return [...pages, ...productPages];
}
