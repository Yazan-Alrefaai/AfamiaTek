import { NextResponse, type NextRequest } from "next/server";

import { defaultLocale, isLocale, locales, type Locale } from "@/lib/site";

const PUBLIC_FILE = /\.(.*)$/;

/** Pick the highest-quality language this site supports. */
function preferredLocale(acceptLanguage: string): Locale {
  const ranked = acceptLanguage
    .split(",")
    .map((entry, index) => {
      const [rawTag, ...rawParams] = entry.trim().split(";");
      const language = rawTag?.toLowerCase().split("-")[0] ?? "";
      const qualityParam = rawParams
        .map((value) => value.trim())
        .find((value) => value.startsWith("q="));
      const parsedQuality = qualityParam
        ? Number.parseFloat(qualityParam.slice(2))
        : 1;
      const quality = Number.isFinite(parsedQuality) ? parsedQuality : 0;

      return { language, quality, index };
    })
    .filter(
      (entry): entry is { language: Locale; quality: number; index: number } =>
        entry.quality > 0 && isLocale(entry.language),
    )
    .sort((a, b) => b.quality - a.quality || a.index - b.index);

  return ranked[0]?.language ?? defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return NextResponse.next();

  const locale = preferredLocale(request.headers.get("accept-language") ?? "");
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
