"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { X } from "lucide-react";

import { ProductCard } from "@/components/shop/ProductCard";
import {
  DEFAULT_FILTERS,
  Filters,
  isDefaultFilters,
  type ShopFilters,
} from "@/components/shop/Filters";
import { Button } from "@/components/ui/Button";
import { brands, getBrand, priceBounds, products } from "@/lib/catalog";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/site";
import type { Condition, Product } from "@/lib/types";

const SORTS: ShopFilters["sort"][] = ["featured", "price-asc", "price-desc"];

function readFilters(
  params: Pick<ReadonlyURLSearchParams, "get">,
  initialCondition: "all" | Condition,
): ShopFilters {
  const brand = params.get("brand");
  const condition = params.get("condition");
  const sort = params.get("sort");
  const min = Number(params.get("min"));
  const max = Number(params.get("max"));

  const maxPrice =
    Number.isFinite(max) && max >= priceBounds.min && max <= priceBounds.max
      ? max
      : priceBounds.max;
  const minPrice =
    Number.isFinite(min) &&
    min >= priceBounds.min &&
    min <= maxPrice
      ? min
      : priceBounds.min;

  return {
    query: params.get("q") ?? "",
    brand: brand && brands.some((b) => b.id === brand) ? brand : "all",
    condition:
      condition === "new" || condition === "used" ? condition : initialCondition,
    minPrice,
    maxPrice,
    sort:
      sort && (SORTS as string[]).includes(sort)
        ? (sort as ShopFilters["sort"])
        : "featured",
  };
}

function sameFilters(a: ShopFilters, b: ShopFilters): boolean {
  return (
    a.query === b.query &&
    a.brand === b.brand &&
    a.condition === b.condition &&
    a.minPrice === b.minPrice &&
    a.maxPrice === b.maxPrice &&
    a.sort === b.sort
  );
}

/** Featured first, then anything in stock, sold-out units sink to the bottom. */
function featuredRank(product: Product): number {
  return (product.inStock ? 0 : 100) + (product.featured ? 0 : 10);
}

export function ShopClient({
  locale,
  initialCondition,
}: {
  locale: Locale;
  initialCondition: "all" | Condition;
}) {
  const t = getDictionary(locale);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const serializedParams = searchParams.toString();

  const [filters, setFilters] = useState<ShopFilters>(() =>
    readFilters(searchParams, initialCondition),
  );

  /* the input stays instant; matching waits for the typing to settle */
  const [debouncedQuery, setDebouncedQuery] = useState(filters.query);
  const seenParams = useRef(serializedParams);
  const synchronizingParams = useRef<string | null>(null);

  /* External navigation (links, Back/Forward) must update the visible catalog. */
  useEffect(() => {
    if (seenParams.current === serializedParams) return;
    seenParams.current = serializedParams;
    synchronizingParams.current = serializedParams;

    const next = readFilters(new URLSearchParams(serializedParams), "all");
    const frame = window.requestAnimationFrame(() => {
      setFilters((current) => (sameFilters(current, next) ? current : next));
      setDebouncedQuery((current) =>
        current === next.query ? current : next.query,
      );
      synchronizingParams.current = null;
    });
    return () => {
      window.cancelAnimationFrame(frame);
      if (synchronizingParams.current === serializedParams) {
        synchronizingParams.current = null;
      }
    };
  }, [serializedParams]);

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedQuery(filters.query), 220);
    return () => window.clearTimeout(id);
  }, [filters.query]);

  /* shareable URL — defaults are left out so a clean view stays a clean link */
  useEffect(() => {
    if (synchronizingParams.current === serializedParams) return;

    const next = new URLSearchParams(serializedParams);
    for (const key of ["q", "brand", "condition", "min", "max", "sort"]) {
      next.delete(key);
    }
    const q = debouncedQuery.trim();
    if (q) next.set("q", q);
    if (filters.brand !== "all") next.set("brand", filters.brand);
    if (filters.condition !== "all") next.set("condition", filters.condition);
    if (filters.minPrice > priceBounds.min)
      next.set("min", String(filters.minPrice));
    if (filters.maxPrice < priceBounds.max)
      next.set("max", String(filters.maxPrice));
    if (filters.sort !== "featured") next.set("sort", filters.sort);

    const qs = next.toString();
    if (qs === serializedParams) return;
    const currentCondition = new URLSearchParams(serializedParams).get(
      "condition",
    );
    const desiredCondition =
      filters.condition === "all" ? null : filters.condition;
    const href = qs ? `${pathname}?${qs}` : pathname;

    if (currentCondition !== desiredCondition) {
      router.replace(href, { scroll: false });
      return;
    }

    window.history.replaceState(null, "", href);
  }, [
    debouncedQuery,
    filters.brand,
    filters.condition,
    filters.minPrice,
    filters.maxPrice,
    filters.sort,
    pathname,
    router,
    serializedParams,
  ]);

  const visible = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase();

    const matched = products.filter((product) => {
      if (filters.brand !== "all" && product.brand !== filters.brand)
        return false;
      if (filters.condition !== "all" && product.condition !== filters.condition)
        return false;
      if (product.priceUsd < filters.minPrice) return false;
      if (product.priceUsd > filters.maxPrice) return false;
      if (!needle) return true;

      const brand = getBrand(product.brand);
      const haystack = [
        product.name,
        product.brand,
        brand?.name ?? "",
        brand?.name_ar ?? "",
        product.tagline.ar,
        product.tagline.en,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(needle);
    });

    if (filters.sort === "price-asc")
      return [...matched].sort((a, b) => a.priceUsd - b.priceUsd);
    if (filters.sort === "price-desc")
      return [...matched].sort((a, b) => b.priceUsd - a.priceUsd);
    return [...matched].sort((a, b) => featuredRank(a) - featuredRank(b));
  }, [
    debouncedQuery,
    filters.brand,
    filters.condition,
    filters.minPrice,
    filters.maxPrice,
    filters.sort,
  ]);

  /* remounting the grid on a filter change is what re-runs the stagger */
  const gridKey = [
    debouncedQuery.trim(),
    filters.brand,
    filters.condition,
    filters.minPrice,
    filters.maxPrice,
    filters.sort,
  ].join("|");

  const dirty = !isDefaultFilters(filters);
  const resultLabel =
    locale === "ar"
      ? visible.length === 1
        ? t.filters.resultOne
        : visible.length === 2
          ? t.filters.resultTwo
          : visible.length >= 3 && visible.length <= 10
            ? t.filters.resultFew
            : t.filters.resultMany
      : visible.length === 1
        ? t.filters.resultOne
        : t.filters.resultMany;

  return (
    <div className="container-page pb-28">
      <Filters
        value={filters}
        onChange={setFilters}
        onReset={() => setFilters({ ...DEFAULT_FILTERS })}
        locale={locale}
        resultCount={visible.length}
      />

      <div className="mt-8 flex items-center gap-4">
        <p aria-live="polite" className="text-xs text-temple-3">
          <span className="num text-sm font-semibold text-temple">
            {visible.length}
          </span>{" "}
          {resultLabel}
        </p>
        {filters.minPrice > priceBounds.min ? (
          <button
            type="button"
            onClick={() =>
              setFilters((current) => ({
                ...current,
                minPrice: priceBounds.min,
              }))
            }
            aria-label={`${t.filters.reset}: $${filters.minPrice}+`}
            className="focus-crimson inline-flex min-h-8 items-center gap-1.5 rounded-full border border-crimson/35 bg-crimson/10 px-3 text-xs text-crimson-2 transition-colors hover:border-crimson/60 hover:bg-crimson/15"
          >
            <span dir="ltr" className="num">
              ${filters.minPrice}+
            </span>
            <X aria-hidden className="h-3.5 w-3.5" />
          </button>
        ) : null}
        <span aria-hidden className="h-px flex-1 bg-temple/8" />
      </div>

      {visible.length > 0 ? (
        <div
          key={gridKey}
          className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
        >
          {visible.map((product, index) => (
            <ProductCard
              key={product.slug}
              product={product}
              locale={locale}
              index={index}
            />
          ))}
        </div>
      ) : (
        <div className="relative mt-6 overflow-hidden rounded-[var(--radius-card)] border border-dashed border-temple/15">
          <div
            aria-hidden
            className="colonnade pointer-events-none absolute inset-0 opacity-45 [--flute:52px]"
          />
          <div className="relative flex flex-col items-start gap-5 px-6 py-16 sm:px-12 sm:py-24">
            <span aria-hidden className="h-px w-12 bg-crimson/70" />
            <p className="text-display max-w-md text-xl text-temple sm:text-2xl">
              {t.filters.empty}
            </p>
            {dirty ? (
              <Button
                variant="outline"
                onClick={() => setFilters({ ...DEFAULT_FILTERS })}
              >
                {t.filters.reset}
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
