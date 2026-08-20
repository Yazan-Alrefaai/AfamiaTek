import type { MetadataRoute } from "next";

import { site } from "@/lib/site";

/** Required for `output: "export"`: emit this as a file, not a route. */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
