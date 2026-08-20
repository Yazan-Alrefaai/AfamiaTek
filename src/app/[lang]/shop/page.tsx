import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ShopClient } from "@/components/shop/ShopClient";
import { ShopHeading } from "@/components/shop/ShopHeading";
import { getDictionary } from "@/lib/dictionaries";
import { isLocale, site, type Locale } from "@/lib/site";

type PageParams = { params: Promise<{ lang: string }> };

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "ar";
  const t = getDictionary(locale);

  return {
    title: t.shop.metaTitle,
    description: t.shop.metaDescription,
    alternates: {
      canonical: `${site.url}/${locale}/shop`,
      languages: {
        ar: `${site.url}/ar/shop`,
        en: `${site.url}/en/shop`,
      },
    },
    openGraph: {
      title: t.shop.metaTitle,
      description: t.shop.metaDescription,
      url: `${site.url}/${locale}/shop`,
      siteName: site.name[locale],
      locale: locale === "ar" ? "ar_SY" : "en_US",
      type: "website",
      images: [
        {
          url: `${site.url}/og.png`,
          width: 1200,
          height: 630,
          alt: t.shop.metaTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t.shop.metaTitle,
      description: t.shop.metaDescription,
      images: [`${site.url}/og.png`],
    },
  };
}

export default async function ShopPage({ params }: PageParams) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const locale: Locale = lang;
  const t = getDictionary(locale);

  return (
    <div className="relative">
      <header className="relative overflow-hidden pt-32 pb-10 sm:pt-36">
        <div
          aria-hidden
          className="colonnade pointer-events-none absolute inset-0 opacity-55 [--flute:clamp(38px,6vw,74px)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 start-1/4 h-72 w-72 rounded-full bg-crimson/10 blur-[130px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-orontes to-transparent"
        />

        <div className="container-page relative">
          <p className="eyebrow flex items-center gap-3">
            <span aria-hidden className="inline-block h-px w-8 bg-crimson-2/60" />
            {t.shop.eyebrow}
          </p>

          <Suspense fallback={null}>
            <ShopHeading locale={locale} />
          </Suspense>

          <div
            aria-hidden
            className="mt-10 h-px bg-linear-to-r from-crimson/80 via-crimson/25 to-transparent rtl:bg-linear-to-l"
          />
        </div>
      </header>

      <Suspense fallback={null}>
        <ShopClient locale={locale} initialCondition="all" />
      </Suspense>
    </div>
  );
}
