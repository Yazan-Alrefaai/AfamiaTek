import Link from "next/link";
import { ArrowRight, BatteryMedium } from "lucide-react";

import { PhoneArt, seedFromSlug } from "@/components/PhoneArt";
import { getBrand } from "@/lib/catalog";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/site";
import type { Product } from "@/lib/types";

/**
 * The workhorse of the site: catalog grid, home featured row and related
 * products all render this. Whole card is one link — there is no cart, so the
 * only journey is card → product page → WhatsApp.
 */
export function ProductCard({
  product,
  locale,
  index = 0,
}: {
  product: Product;
  locale: Locale;
  /** position in its grid — the first row is eagerly loaded */
  index?: number;
}) {
  const t = getDictionary(locale);
  const brand = getBrand(product.brand);
  const isUsed = product.condition === "used";
  const soldOut = product.inStock === false;

  const discount =
    product.oldPriceUsd && product.oldPriceUsd > product.priceUsd
      ? Math.round((1 - product.priceUsd / product.oldPriceUsd) * 100)
      : 0;

  /* -------------------------------------------------------------- render */
  return (
    <div className="h-full">
      <div
        className="card-surface group relative h-full overflow-hidden transition-[border-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-crimson/35 hover:shadow-[0_28px_70px_-32px_rgba(0,0,0,0.9)] focus-within:border-crimson-2/70 focus-within:shadow-[inset_0_0_0_1px_rgba(237,24,71,0.65)]"
      >
        {/* crimson hairline wiping across the top edge */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px origin-left scale-x-0 bg-linear-to-r from-transparent via-crimson-2 to-transparent transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 group-focus-within:scale-x-100 rtl:origin-right"
        />

        <Link
          href={`/${locale}/shop/${product.slug}`}
          className="flex h-full flex-col focus-visible:outline-none"
        >
          {/* ------------------------------------------------------- art */}
          <div className="relative aspect-4/5 overflow-hidden [perspective:900px]">
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background: `radial-gradient(115% 78% at 50% 10%, ${product.accent}33, transparent 62%)`,
              }}
            />
            <div
              aria-hidden
              className="colonnade absolute inset-0 opacity-35 [--flute:34px]"
            />
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-orontes-2 to-transparent"
            />

            <div
              className={`absolute inset-0 px-9 pt-8 pb-2 transition-[filter,opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1.5 group-hover:scale-[1.015] ${
                soldOut ? "opacity-40 grayscale" : ""
              }`}
            >
              <PhoneArt
                accent={product.accent}
                name={product.name}
                seed={seedFromSlug(product.slug)}
                image={product.images?.[0]}
                priority={index < 3}
                sizes="(min-width: 1024px) 21rem, (min-width: 640px) 44vw, 84vw"
                className="drop-shadow-[0_26px_44px_rgba(0,0,0,0.65)]"
              />
            </div>

            {/* badges */}
            <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-4">
              <span
                className={`rounded-full border px-2.5 py-1 text-xs leading-none font-medium tracking-wide backdrop-blur-sm ${
                  isUsed
                    ? "border-jade/35 bg-jade/12 text-jade"
                    : "border-crimson/40 bg-crimson/12 text-crimson-2"
                }`}
              >
                {isUsed ? t.product.used : t.product.new}
              </span>

              {soldOut ? (
                <span className="rounded-full border border-temple/15 bg-orontes/80 px-2.5 py-1 text-xs leading-none text-temple-2 backdrop-blur-sm">
                  {t.product.outOfStock}
                </span>
              ) : discount > 0 ? (
                <span className="rounded-full bg-crimson-2 px-2.5 py-1 text-xs leading-none font-semibold text-orontes">
                  <span className="num">−{discount}%</span>
                </span>
              ) : null}
            </div>
          </div>

          {/* ------------------------------------------------------ body */}
          <div className="relative z-10 flex flex-1 flex-col px-5 pt-1 pb-5">
            <div className="flex items-center gap-2.5">
              {brand ? (
                <span className="text-xs tracking-[0.15em] text-temple-3 uppercase">
                  {locale === "ar" ? brand.name_ar : brand.name}
                </span>
              ) : null}
              <span aria-hidden className="h-px flex-1 bg-temple/8" />
              {product.colors.length > 0 ? (
                <>
                  <span aria-hidden className="flex items-center gap-1">
                    {product.colors.slice(0, 4).map((colour) => (
                      <span
                        key={colour.hex}
                        className="h-2.5 w-2.5 rounded-full ring-1 ring-temple/20"
                        style={{ backgroundColor: colour.hex }}
                      />
                    ))}
                    {product.colors.length > 4 ? (
                      <span className="num ms-0.5 text-xs text-temple-3">
                        +{product.colors.length - 4}
                      </span>
                    ) : null}
                  </span>
                  <span className="sr-only">
                    {t.product.colors}:{" "}
                    {product.colors
                      .map((c) => c.name[locale])
                      .join(locale === "ar" ? "، " : ", ")}
                  </span>
                </>
              ) : null}
            </div>

            <h3 className="text-display mt-3 text-lg text-temple transition-colors duration-300 group-hover:text-crimson-3">
              {product.name}
            </h3>

            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-temple-2">
              {product.tagline[locale]}
            </p>

            {isUsed && typeof product.batteryHealth === "number" ? (
              <div className="mt-4">
                <div className="flex items-center justify-between gap-2 text-xs text-temple-3">
                  <span className="inline-flex items-center gap-1.5">
                    <BatteryMedium aria-hidden className="h-3.5 w-3.5" />
                    {t.product.batteryHealth}
                  </span>
                  <span className="num text-jade">{product.batteryHealth}%</span>
                </div>
                <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-stone">
                  <div
                    className="h-full rounded-full bg-jade/75"
                    style={{ width: `${product.batteryHealth}%` }}
                  />
                </div>
              </div>
            ) : null}

            <div className="mt-auto flex items-end justify-between gap-3 pt-5">
              <div className="flex items-baseline gap-2">
                <span className="num text-2xl font-semibold text-temple">
                  ${product.priceUsd}
                </span>
                {product.oldPriceUsd ? (
                  <span className="num text-sm text-temple-3 line-through">
                    ${product.oldPriceUsd}
                  </span>
                ) : null}
              </div>

              <span
                aria-hidden
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-temple/12 text-temple-2 transition-colors duration-300 group-hover:border-crimson-2/60 group-hover:text-crimson-2 rtl:-scale-x-100"
              >
                <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1" />
              </span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
