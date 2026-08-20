import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  MessageCircle,
  ScanLine,
  Tags,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { Logo } from "@/components/Logo";
import { ButtonAnchor, ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { brands, products, stockCount } from "@/lib/catalog";
import { getDictionary } from "@/lib/dictionaries";
import { isLocale, locales, site, type Locale } from "@/lib/site";
import { waLink } from "@/lib/whatsapp";

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
  const dict = getDictionary(locale);

  return {
    title: dict.about.metaTitle,
    description: dict.about.metaDescription,
    alternates: {
      canonical: `${site.url}/${locale}/about`,
      languages: { ar: `${site.url}/ar/about`, en: `${site.url}/en/about` },
    },
    openGraph: {
      type: "website",
      title: dict.about.metaTitle,
      description: dict.about.metaDescription,
      url: `${site.url}/${locale}/about`,
      siteName: site.name[locale],
      locale: locale === "ar" ? "ar_SY" : "en_US",
      images: [
        {
          url: `${site.url}/og.png`,
          width: 1200,
          height: 630,
          alt: dict.about.metaTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.about.metaTitle,
      description: dict.about.metaDescription,
      images: [`${site.url}/og.png`],
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const locale: Locale = lang;
  const dict = getDictionary(locale);

  const usedCount = products.filter((p) => p.condition === "used").length;

  const values: { icon: LucideIcon; title: string; desc: string }[] = [
    { icon: ScanLine, title: dict.about.value1, desc: dict.about.value1Desc },
    { icon: Tags, title: dict.about.value2, desc: dict.about.value2Desc },
    { icon: Wrench, title: dict.about.value3, desc: dict.about.value3Desc },
  ];

  const figures: { value: number; label: string }[] = [
    { value: stockCount, label: dict.hero.stat2 },
    { value: brands.length, label: dict.hero.stat1 },
    { value: usedCount, label: dict.about.statUsed },
  ];

  /**
   * A drop-cap isolates the first glyph, which breaks the connected shape of
   * an Arabic word — so the crimson initial is English-only and Arabic keeps the
   * oversized opening line instead.
   */
  const dropCap =
    locale === "en"
      ? "first-letter:float-start first-letter:me-3.5 first-letter:mt-1.5 first-letter:[font-family:var(--font-display)] first-letter:text-[3.5rem] first-letter:leading-[0.72] first-letter:text-crimson-2"
      : "";

  return (
    <article className="relative overflow-x-clip">
      {/* ------------------------------------------------------------------ */}
      {/* opening — oversized title over a colonnade band                     */}
      {/* ------------------------------------------------------------------ */}
      <header className="relative">
        <div
          aria-hidden
          className="colonnade pointer-events-none absolute inset-x-0 top-0 h-[38rem] opacity-70 [mask-image:linear-gradient(to_bottom,black_20%,transparent)]"
          style={{ "--flute": "clamp(38px, 6vw, 74px)" } as CSSProperties}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 start-[18%] h-80 w-80 rounded-full bg-crimson/10 blur-[130px]"
        />

        <div className="container-page relative pt-32 pb-14 lg:pt-44 lg:pb-20">
          <Reveal>
            <p className="eyebrow flex items-center gap-3">
              <span aria-hidden className="inline-block h-px w-8 bg-crimson-2/60" />
              {dict.about.eyebrow}
            </p>
            <h1 className="text-display mt-6 max-w-[16ch] text-[clamp(2.6rem,10vw,7rem)] text-temple">
              {dict.about.title}
            </h1>
          </Reveal>
        </div>

        <div aria-hidden className="hairline container-page" />
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* the story + the name                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="container-page relative py-20 lg:py-28">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7 lg:col-start-1">
            <Reveal>
              <p
                className={`max-w-[62ch] text-xl leading-[1.75] text-temple sm:text-2xl sm:leading-[1.7] ${dropCap}`}
              >
                {dict.about.p1}
              </p>
            </Reveal>

            <Reveal delay={110}>
              <p className="mt-8 max-w-[62ch] text-base leading-[1.9] text-temple-2">
                {dict.about.p2}
              </p>
            </Reveal>

            <Reveal delay={190}>
              <p className="mt-6 max-w-[62ch] text-base leading-[1.9] text-temple-2">
                {dict.about.p3}
              </p>
            </Reveal>
          </div>

          {/* the name — Afamia is Apamea */}
          <Reveal delay={140} className="lg:col-span-4 lg:col-start-9">
            <aside className="card-surface relative overflow-hidden p-7 lg:sticky lg:top-28">
              <div
                aria-hidden
                className="colonnade pointer-events-none absolute inset-0 opacity-60"
                style={{ "--flute": "26px" } as CSSProperties}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 -top-16 h-40 bg-[radial-gradient(60%_100%_at_50%_100%,rgba(200,145,47,0.18),transparent_70%)]"
              />
              <div className="relative">
                <Logo className="h-10 w-auto text-crimson" />
                <p className="eyebrow mt-6">{dict.about.nameEyebrow}</p>
                <p className="mt-4 text-[0.95rem] leading-[1.95] text-temple-2">
                  {dict.about.apamea}
                </p>
              </div>
            </aside>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* the three rules                                                     */}
      {/* ------------------------------------------------------------------ */}
      <section className="container-page relative pb-20 lg:pb-28">
        <Reveal>
          <p className="eyebrow hairline flex items-center gap-3 pb-5">
            <span aria-hidden className="inline-block h-px w-8 bg-crimson-2/60" />
            {dict.about.valuesEyebrow}
          </p>
        </Reveal>

        <ul className="mt-10 grid sm:grid-cols-3">
          {values.map((value, index) => {
            const first = index === 0;
            const last = index === values.length - 1;
            return (
              <Reveal
                as="li"
                key={value.title}
                delay={index * 110}
                className={[
                  first ? "" : "border-t border-temple/10 pt-8",
                  first ? "" : "sm:border-t-0 sm:border-s sm:pt-0 sm:ps-8",
                  last ? "" : "sm:pe-8",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <value.icon
                  aria-hidden
                  className="h-6 w-6 text-crimson-2"
                  strokeWidth={1.4}
                />
                <h2 className="text-display mt-5 text-xl text-temple">
                  {value.title}
                </h2>
                <p className="mt-3 text-sm leading-[1.9] text-temple-2">
                  {value.desc}
                </p>
              </Reveal>
            );
          })}
        </ul>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* by the numbers                                                      */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative border-y border-temple/10 bg-orontes-2/60">
        <div
          aria-hidden
          className="colonnade pointer-events-none absolute inset-0 opacity-45"
        />
        <div className="container-page relative py-16 lg:py-20">
          <p className="eyebrow">{dict.about.statsEyebrow}</p>
          <dl className="mt-9 grid gap-y-9 sm:grid-cols-3 sm:gap-y-0">
            {figures.map((figure, index) => (
              <Reveal
                key={figure.label}
                delay={index * 100}
                className={
                  index > 0 ? "sm:border-s sm:border-temple/10 sm:ps-8" : ""
                }
              >
                <dt className="sr-only">{figure.label}</dt>
                <dd>
                  <span className="num block text-[clamp(2.75rem,7vw,4.5rem)] leading-none font-semibold text-crimson-2">
                    {figure.value}
                  </span>
                  <span
                    aria-hidden
                    className="mt-4 block h-px w-10 bg-crimson-2/40"
                  />
                  <span className="mt-4 block text-sm text-temple-2">
                    {figure.label}
                  </span>
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* closing band                                                        */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_120%_at_15%_0%,rgba(200,145,47,0.14),transparent_65%)]"
        />
        <div className="container-page relative py-20 lg:py-28">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <Reveal className="max-w-2xl">
              <h2 className="text-display text-3xl text-temple sm:text-4xl lg:text-[3.25rem]">
                {dict.about.ctaTitle}
              </h2>
              <p className="mt-5 text-base leading-relaxed text-temple-2">
                {dict.about.ctaLead}
              </p>
            </Reveal>

            <Reveal delay={140} className="shrink-0">
              <div className="flex flex-wrap gap-3">
                <ButtonLink
                  href={`/${locale}/shop`}
                  variant="crimson"
                  size="lg"
                >
                  {dict.hero.ctaPrimary}
                </ButtonLink>
                <ButtonAnchor
                  href={waLink(dict.whatsapp.generic)}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outline"
                  size="lg"
                >
                  <MessageCircle aria-hidden className="h-[1.05rem] w-[1.05rem]" />
                  {dict.contact.whatsapp}
                </ButtonAnchor>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </article>
  );
}
