import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Reem_Kufi, Sora, Tajawal, Unbounded } from "next/font/google";
import { Suspense } from "react";

import "../globals.css";
import { Nav, NavFallback } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { getDictionary } from "@/lib/dictionaries";
import { isLocale, locales, site, type Locale } from "@/lib/site";

const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-unbounded",
  display: "swap",
  preload: false,
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
  preload: false,
});

const reem = Reem_Kufi({
  subsets: ["arabic", "latin"],
  variable: "--font-reem",
  display: "swap",
  preload: false,
});

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-tajawal",
  display: "swap",
  preload: false,
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "ar";
  const ar = locale === "ar";

  const title = ar
    ? "أفاميا تك — بيع الأجهزة الخلوية الجديدة والمستعملة في دمشق"
    : "AFAMIA TEK — New & used mobile phones in Damascus";
  const description = ar
    ? "معرض أفاميا تك في فيكتوريا، برج دمشق للاتصالات. تكنو، إنفينكس، سامسونغ، شاومي وآبل — أجهزة جديدة ومستعملة مفحوصة، مع تفاصيل الحالة والضمان حسب الجهاز."
    : "AFAMIA TEK in Victoria, Damascus Telecom Tower. TECNO, Infinix, Samsung, Xiaomi and Apple — new and inspected pre-owned handsets, with condition and warranty details stated by device.";

  return {
    metadataBase: new URL(site.url),
    title: {
      default: title,
      template: ar ? `%s · أفاميا تك` : `%s · AFAMIA TEK`,
    },
    description,
    keywords: ar
      ? ["موبايلات دمشق", "تكنو سوريا", "أفاميا تك", "هواتف مستعملة دمشق", "فيكتوريا دمشق"]
      : ["mobile shop Damascus", "TECNO Syria", "AFAMIA TEK", "used iPhone Damascus"],
    alternates: {
      canonical: `${site.url}/${locale}`,
      languages: { ar: `${site.url}/ar`, en: `${site.url}/en` },
    },
    openGraph: {
      type: "website",
      locale: ar ? "ar_SY" : "en_US",
      url: `${site.url}/${locale}`,
      siteName: ar ? site.name.ar : site.name.en,
      title,
      description,
      images: [
        {
          url: `${site.url}/og.png`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${site.url}/og.png`],
    },
    icons: { icon: "/icon.svg" },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const locale: Locale = lang;
  const dict = getDictionary(locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MobilePhoneStore",
    name: locale === "ar" ? site.name.ar : site.name.en,
    image: `${site.url}/og.png`,
    url: site.url,
    telephone: site.phoneIntl,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address[locale],
      addressLocality: "Damascus",
      addressCountry: "SY",
    },
    sameAs: [site.facebook],
    priceRange: "$$",
  };

  return (
    <html
      lang={locale}
      dir={dict.dir}
      className={`${unbounded.variable} ${sora.variable} ${reem.variable} ${tajawal.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Without JS nothing ever adds `is-visible`, so the reveal must not
            hide anything. Crawlers and reader modes land here too. */}
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<style>.reveal{opacity:1!important;transform:none!important}</style>`,
          }}
        />
      </head>
      <body className="grain min-h-dvh antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:inset-inline-start-4 focus:top-4 focus:z-100 focus:rounded-full focus:bg-crimson-2 focus:px-5 focus:py-2 focus:text-orontes"
        >
          {locale === "ar" ? "تخطَّ إلى المحتوى" : "Skip to content"}
        </a>
        <Suspense fallback={<NavFallback locale={locale} />}>
          <Nav locale={locale} />
        </Suspense>
        <main id="main">{children}</main>
        <Footer locale={locale} />
        <WhatsAppFab locale={locale} />
      </body>
    </html>
  );
}
