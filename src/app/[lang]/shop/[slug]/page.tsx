import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  MessageCircle,
  Phone,
  ScanLine,
  ShieldCheck,
  Tags,
  type LucideIcon,
} from "lucide-react";

import { PhoneArt, seedFromSlug } from "@/components/PhoneArt";
import { ProductCard } from "@/components/shop/ProductCard";
import { ButtonAnchor, ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getBrand, getProduct, products, relatedProducts } from "@/lib/catalog";
import { getDictionary } from "@/lib/dictionaries";
import { isLocale, locales, site, type Locale } from "@/lib/site";
import type { Product } from "@/lib/types";
import { fillTemplate, telLink, waLink } from "@/lib/whatsapp";

/** Fixed reading order for the spec sheet — matches dict.product.specLabels. */
const SPEC_ORDER = [
  "display",
  "chipset",
  "ram",
  "storage",
  "camera",
  "battery",
  "os",
  "network",
] as const satisfies readonly (keyof Product["specs"])[];

type PageParams = { lang: string; slug: string };

/** Transparent press renders — what search engines index as the product. */
function productImageUrls(product: Product): string[] {
  if (product.images?.length) {
    return product.images.map((path) => `${site.url}${path}`);
  }

  return [`${site.url}/og.png`];
}

/**
 * Flattened 1200×630 card for link previews. The press renders are transparent
 * WebP, which WhatsApp — where nearly every order starts — previews badly, so
 * social gets a purpose-built PNG instead. Generated per slug; see README.
 */
function socialCardUrl(product: Product): string {
  return `${site.url}/products/og/${product.slug}.png`;
}

function localizedSpec(value: string, locale: Locale): string {
  if (locale === "en") return value;

  return value
    .replace(/\bDual SIM\b/g, "شريحتي اتصال")
    .replace(/\bnano SIM\b/g, "شريحة nano")
    .replace(/\bfront\b/g, "أمامية")
    .replace(/\bcover\b/g, "خارجية")
    .replace(/\bwireless\b/g, "لاسلكي");
}

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    products.map((product) => ({ lang, slug: product.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale: Locale = isLocale(lang) ? lang : "ar";
  const product = getProduct(slug);

  if (!product) {
    const dict = getDictionary(locale);
    return { title: dict.notFound.title };
  }

  const title = `${product.name} — $${product.priceUsd}`;
  const description =
    locale === "ar"
      ? `${product.name} — ${product.tagline.ar}. السعر ${product.priceUsd}$ في معرض أفاميا تك، فيكتوريا دمشق.`
      : `${product.name} — ${product.tagline.en}. $${product.priceUsd} at AFAMIA TEK, Victoria, Damascus.`;
  const path = `/shop/${product.slug}`;
  const socialImage = {
    url: socialCardUrl(product),
    alt: title,
    width: 1200,
    height: 630,
  };

  return {
    title,
    description,
    alternates: {
      canonical: `${site.url}/${locale}${path}`,
      languages: {
        ar: `${site.url}/ar${path}`,
        en: `${site.url}/en${path}`,
      },
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${site.url}/${locale}${path}`,
      siteName: site.name[locale],
      locale: locale === "ar" ? "ar_SY" : "en_US",
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const locale: Locale = lang;
  const product = getProduct(slug);
  if (!product) notFound();

  const dict = getDictionary(locale);
  const brand = getBrand(product.brand);
  const brandName = brand
    ? locale === "ar"
      ? brand.name_ar
      : brand.name
    : product.brand;

  const isUsed = product.condition === "used";
  const related = relatedProducts(product, 3);
  const seed = seedFromSlug(product.slug);
  const imageUrls = productImageUrls(product);

  const discount =
    product.oldPriceUsd && product.oldPriceUsd > product.priceUsd
      ? Math.round((1 - product.priceUsd / product.oldPriceUsd) * 100)
      : 0;

  const orderMessage = fillTemplate(dict.whatsapp.product, {
    name: product.name,
    price: product.priceUsd,
  });

  const trust: { icon: LucideIcon; label: string }[] = [
    ...(isUsed
      ? [{ icon: ScanLine, label: dict.why.items[0].title }]
      : []),
    { icon: ShieldCheck, label: dict.why.items[1].title },
    { icon: Tags, label: dict.why.items[2].title },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.tagline[locale],
    image: imageUrls,
    sku: product.slug,
    brand: { "@type": "Brand", name: brand?.name ?? product.brand },
    itemCondition: isUsed
      ? "https://schema.org/UsedCondition"
      : "https://schema.org/NewCondition",
    color: product.colors.map((colour) => colour.name.en).join(", "),
    url: `${site.url}/${locale}/shop/${product.slug}`,
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: product.priceUsd,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: isUsed
        ? "https://schema.org/UsedCondition"
        : "https://schema.org/NewCondition",
      url: `${site.url}/${locale}/shop/${product.slug}`,
      seller: { "@type": "Organization", name: site.name[locale] },
    },
  };

  return (
    <article className="relative overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* ground: colonnade band fading out behind the showpiece */}
      <div
        aria-hidden
        className="colonnade pointer-events-none absolute inset-x-0 top-0 h-[40rem] opacity-55 [mask-image:linear-gradient(to_bottom,black,transparent)]"
      />

      <div className="container-page relative pt-32 pb-24 lg:pt-40 lg:pb-32">
        {/* ---------------------------------------------------------------- */}
        {/* breadcrumb                                                        */}
        {/* ---------------------------------------------------------------- */}
        <div className="hairline flex flex-wrap items-center justify-between gap-4 pb-6">
          <Link
            href={`/${locale}/shop`}
            className="focus-crimson group inline-flex items-center gap-2.5 text-sm text-temple-3 transition-colors duration-300 hover:text-crimson-2"
          >
            <ArrowLeft
              aria-hidden
              className="h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-1 rtl:-scale-x-100 rtl:group-hover:translate-x-1"
            />
            {dict.product.back}
          </Link>

          <p className="hidden items-center gap-2.5 text-xs tracking-[0.16em] text-temple-3 sm:flex">
            <span>{dict.nav.products}</span>
            <span aria-hidden className="h-px w-4 bg-temple/20" />
            <span>{brandName}</span>
            <span aria-hidden className="h-px w-4 bg-temple/20" />
            <span className="text-temple-2">{product.name}</span>
          </p>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* main: showpiece / identity / spec sheet / CTA                     */}
        {/* ---------------------------------------------------------------- */}
        <div className="mt-10 grid gap-x-12 gap-y-14 lg:mt-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-x-16 xl:gap-x-24">
          {/* ---------------- showpiece ---------------- */}
          <Reveal className="lg:col-start-1 lg:row-start-1">
            <div className="card-surface grain relative isolate overflow-hidden">
              {/* accent wash */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10"
                style={{
                  background: `radial-gradient(115% 72% at 50% 4%, ${product.accent}2e, transparent 64%)`,
                }}
              />
              <div
                aria-hidden
                className="colonnade pointer-events-none absolute inset-0 -z-10 opacity-70"
                style={{ "--flute": "34px" } as CSSProperties}
              />
              {/* plinth glow under the device */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-10 bottom-0 -z-10 h-40 blur-3xl"
                style={{
                  background: `radial-gradient(60% 100% at 50% 100%, ${product.accent}26, transparent 70%)`,
                }}
              />

              {/* floating badges */}
              <div className="absolute start-5 top-5 z-10 flex flex-col items-start gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-crimson-2/45 bg-orontes/70 px-3 py-1.5 text-[0.7rem] tracking-[0.14em] text-crimson-2 backdrop-blur-sm">
                  {isUsed ? dict.product.used : dict.product.new}
                </span>
                {isUsed ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-jade/35 bg-jade/10 px-3 py-1.5 text-[0.7rem] text-jade backdrop-blur-sm">
                    <BadgeCheck aria-hidden className="h-3.5 w-3.5" />
                    {dict.product.inspected}
                  </span>
                ) : null}
              </div>

              {discount > 0 ? (
                <span className="absolute end-5 top-5 z-10 inline-flex items-center rounded-full bg-crimson-2 px-3 py-1.5 text-[0.7rem] font-semibold text-orontes">
                  <span className="num">-{discount}%</span>
                </span>
              ) : null}

              <div className="flex min-h-[24rem] items-center justify-center px-8 py-14 sm:min-h-[32rem] sm:py-20 lg:min-h-[38rem]">
                <div className="animate-drift w-[min(74%,19rem)] drop-shadow-[0_30px_60px_rgba(0,0,0,0.55)]">
                  <PhoneArt
                    accent={product.accent}
                    name={product.name}
                    seed={seed}
                    image={product.images?.[0]}
                    sizes="(min-width: 640px) 19rem, 74vw"
                    priority
                  />
                </div>
              </div>

              {/* stylobate */}
              <div
                aria-hidden
                className="absolute inset-x-8 bottom-6 h-px bg-gradient-to-r from-transparent via-temple/18 to-transparent"
              />
            </div>
          </Reveal>

          {/* ---------------- identity ---------------- */}
          <div className="lg:col-start-2 lg:row-start-1">
            <Reveal delay={90}>
              <div className="flex items-center gap-3">
                <span aria-hidden className="h-px w-8 bg-crimson-2/60" />
                <span className="text-display text-[0.7rem] tracking-[0.3em] text-crimson-2 uppercase">
                  {brandName}
                </span>
              </div>

              <h1 className="text-display mt-5 text-[clamp(2rem,6vw,3.5rem)] text-temple">
                {product.name}
              </h1>

              <p className="mt-5 max-w-[42ch] text-base leading-relaxed text-temple-2 sm:text-lg">
                {product.tagline[locale]}
              </p>
            </Reveal>

            {/* price */}
            <Reveal delay={150}>
              <div className="hairline mt-9 flex flex-wrap items-end gap-x-6 gap-y-3 border-t border-temple/10 pt-7 pb-7">
                <p className="flex items-baseline gap-1.5 text-crimson-2">
                  <span className="text-3xl font-normal text-crimson/80 sm:text-4xl">
                    $
                  </span>
                  <span className="num text-5xl font-semibold tracking-tight sm:text-6xl">
                    {product.priceUsd}
                  </span>
                </p>

                {product.oldPriceUsd ? (
                  <p className="flex items-baseline gap-3 pb-1.5">
                    <span className="inline-flex items-baseline gap-1 text-temple-3 line-through decoration-clay/70">
                      <span className="text-sm">$</span>
                      <span className="num text-lg">{product.oldPriceUsd}</span>
                    </span>
                    {discount > 0 ? (
                      <span className="inline-flex items-center rounded-full border border-crimson-2/40 bg-crimson/10 px-2.5 py-1 text-[0.7rem] text-crimson-2">
                        <span className="num">-{discount}%</span>
                      </span>
                    ) : null}
                  </p>
                ) : null}

                <span
                  className={`ms-auto inline-flex items-center gap-2.5 text-sm ${
                    product.inStock ? "text-jade" : "text-temple-3"
                  }`}
                >
                  {product.inStock ? (
                    <span aria-hidden className="relative flex h-2 w-2">
                      <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-jade/70" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-jade" />
                    </span>
                  ) : (
                    <span
                      aria-hidden
                      className="h-2 w-2 rounded-full bg-temple-3/70"
                    />
                  )}
                  {product.inStock
                    ? dict.product.inStock
                    : dict.product.outOfStock}
                </span>
              </div>
            </Reveal>

            {/* colours */}
            <Reveal delay={210}>
              <div className="mt-7">
                <p className="text-[0.7rem] tracking-[0.2em] text-temple-3 uppercase">
                  {dict.product.colors}
                </p>
                <ul className="mt-4 flex flex-wrap gap-2.5">
                  {product.colors.map((colour) => (
                    <li
                      key={colour.hex}
                      className="inline-flex items-center gap-2.5 rounded-full border border-temple/12 bg-orontes-3/70 py-1.5 pe-4 ps-2"
                    >
                      <span
                        aria-hidden
                        className="h-5 w-5 rounded-full ring-1 ring-temple/25 ring-inset"
                        style={{ backgroundColor: colour.hex }}
                      />
                      <span className="text-xs text-temple-2">
                        {colour.name[locale]}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {/* battery health meter — used units only */}
            {isUsed && typeof product.batteryHealth === "number" ? (
              <Reveal delay={260}>
                <div className="mt-8 max-w-sm">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-[0.7rem] tracking-[0.2em] text-temple-3 uppercase">
                      {dict.product.batteryHealth}
                    </span>
                    <span className="num text-sm font-medium text-jade">
                      {product.batteryHealth}%
                    </span>
                  </div>
                  <div
                    className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-stone"
                    role="meter"
                    aria-valuenow={product.batteryHealth}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={dict.product.batteryHealth}
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-jade/60 to-jade"
                      style={{ width: `${product.batteryHealth}%` }}
                    />
                  </div>
                </div>
              </Reveal>
            ) : null}
          </div>

          {/* ---------------- CTA (sticky beside the spec sheet) ---------------- */}
          <div className="lg:sticky lg:top-28 lg:col-start-2 lg:row-start-2 lg:self-start">
            <Reveal delay={120}>
              <div className="card-surface crimson-edge p-6 sm:p-7">
                <ButtonAnchor
                  href={waLink(orderMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="crimson"
                  size="lg"
                  className="w-full"
                >
                  <MessageCircle aria-hidden className="h-[1.15rem] w-[1.15rem]" />
                  {product.inStock
                    ? dict.product.order
                    : dict.product.askAvailability}
                </ButtonAnchor>

                <ButtonAnchor
                  href={telLink()}
                  variant="outline"
                  size="lg"
                  className="mt-3 w-full"
                >
                  <Phone aria-hidden className="h-[1.05rem] w-[1.05rem]" />
                  {dict.product.call}
                  <span className="num text-xs text-temple-3">
                    {site.phoneLocal}
                  </span>
                </ButtonAnchor>

                <p className="mt-5 text-xs leading-relaxed text-temple-3">
                  {dict.product.priceNote}
                </p>

                <ul className="mt-6 space-y-3.5 border-t border-temple/10 pt-5">
                  {trust.map((point) => (
                    <li
                      key={point.label}
                      className="flex items-start gap-3 text-xs leading-relaxed text-temple-2"
                    >
                      <point.icon
                        aria-hidden
                        className="mt-0.5 h-4 w-4 shrink-0 text-crimson-2"
                      />
                      {point.label}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          {/* ---------------- spec sheet ---------------- */}
          <section
            aria-labelledby="spec-heading"
            className="lg:col-start-1 lg:row-start-2"
          >
            <Reveal>
              <div className="hairline flex flex-wrap items-end justify-between gap-4 pb-5">
                <h2
                  id="spec-heading"
                  className="text-display text-2xl text-temple sm:text-3xl"
                >
                  {dict.product.specs}
                </h2>
                <p className="text-[0.7rem] tracking-[0.2em] text-temple-3 uppercase">
                  {brandName} ·{" "}
                  {isUsed ? dict.product.used : dict.product.new}
                </p>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <dl className="mt-1">
                {SPEC_ORDER.map((key) => {
                  const value = product.specs[key];
                  const displayValue = localizedSpec(value, locale);
                  const numeric = /\d/.test(displayValue);
                  return (
                    <div
                      key={key}
                      className="hairline grid grid-cols-[1.25rem_minmax(0,1fr)] items-baseline gap-x-3 gap-y-1.5 py-4 sm:grid-cols-[1.25rem_minmax(0,9.5rem)_minmax(0,1fr)]"
                    >
                      <Check
                        aria-hidden
                        className="h-3.5 w-3.5 translate-y-0.5 text-crimson/70"
                      />
                      <dt className="text-[0.7rem] tracking-[0.16em] text-temple-3 uppercase">
                        {dict.product.specLabels[key]}
                      </dt>
                      <dd className="col-start-2 text-sm text-temple sm:col-start-3 sm:text-[0.95rem]">
                        <span
                          dir="auto"
                          className={locale === "en" && numeric ? "num" : undefined}
                        >
                          {displayValue}
                        </span>
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </Reveal>
          </section>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* related                                                           */}
        {/* ---------------------------------------------------------------- */}
        {related.length > 0 ? (
          <section className="mt-28 lg:mt-36">
            <SectionHeading
              eyebrow={dict.nav.products}
              title={dict.product.related}
              action={
                <ButtonLink
                  href={`/${locale}/shop`}
                  variant="outline"
                  size="md"
                >
                  {dict.featured.all}
                </ButtonLink>
              }
            />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item, index) => (
                <ProductCard
                  key={item.slug}
                  product={item}
                  locale={locale}
                  index={index}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </article>
  );
}
