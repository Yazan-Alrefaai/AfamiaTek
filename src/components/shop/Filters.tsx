"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";

import { brands, priceBounds } from "@/lib/catalog";
import { getDictionary, type Dictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/site";
import type { Condition } from "@/lib/types";

export type ShopFilters = {
  query: string;
  brand: string;
  condition: "all" | Condition;
  minPrice: number;
  maxPrice: number;
  sort: "featured" | "price-asc" | "price-desc";
};

export const DEFAULT_FILTERS: ShopFilters = {
  query: "",
  brand: "all",
  condition: "all",
  minPrice: priceBounds.min,
  maxPrice: priceBounds.max,
  sort: "featured",
};

/** How many of the drawer-owned controls are away from their default. */
export function countActiveFilters(value: ShopFilters): number {
  let n = 0;
  if (value.brand !== DEFAULT_FILTERS.brand) n += 1;
  if (value.condition !== DEFAULT_FILTERS.condition) n += 1;
  if (value.minPrice > DEFAULT_FILTERS.minPrice) n += 1;
  if (value.maxPrice < DEFAULT_FILTERS.maxPrice) n += 1;
  if (value.sort !== DEFAULT_FILTERS.sort) n += 1;
  return n;
}

export function isDefaultFilters(value: ShopFilters): boolean {
  return countActiveFilters(value) === 0 && value.query.trim() === "";
}

const EASE = [0.22, 1, 0.36, 1] as const;

const control =
  "focus-crimson rounded-full border border-temple/12 bg-orontes/60 text-temple " +
  "transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-temple/25";

/* ========================================================================== */
/*  Pieces — each takes a unique id suffix so the bar and the sheet can both   */
/*  render a copy without colliding label ids.                                 */
/* ========================================================================== */

function SearchField({
  id,
  value,
  onChange,
  t,
  className = "",
}: {
  id: string;
  value: string;
  onChange: (next: string) => void;
  t: Dictionary;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <label htmlFor={id} className="sr-only">
        {t.filters.search}
      </label>
      <Search
        aria-hidden
        className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-temple-3"
      />
      <input
        id={id}
        type="text"
        inputMode="search"
        autoComplete="off"
        value={value}
        placeholder={t.filters.search}
        onChange={(event) => onChange(event.target.value)}
        className={`${control} h-11 w-full ps-11 pe-11 text-sm placeholder:text-temple-3`}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label={t.filters.clearSearch}
          className="focus-crimson absolute end-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-temple-3 transition-colors duration-200 hover:text-temple"
        >
          <X aria-hidden className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}

function BrandPills({
  value,
  onChange,
  locale,
  t,
}: {
  value: string;
  onChange: (next: string) => void;
  locale: Locale;
  t: Dictionary;
}) {
  const options = [
    { id: "all", label: t.filters.all, accent: "#ff416a" },
    ...brands.map((b) => ({
      id: b.id,
      label: locale === "ar" ? b.name_ar : b.name,
      accent: b.accent,
    })),
  ];

  return (
    <div
      role="group"
      aria-label={t.filters.brand}
      className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {options.map((option) => {
        const active = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.id)}
            style={
              active
                ? {
                    color: option.accent,
                    borderColor: `${option.accent}80`,
                    backgroundColor: `${option.accent}16`,
                    boxShadow: `0 0 26px -10px ${option.accent}`,
                  }
                : undefined
            }
            className={`focus-crimson shrink-0 rounded-full border px-4 py-2 text-xs whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              active
                ? "font-medium"
                : "border-temple/12 text-temple-2 hover:border-temple/30 hover:text-temple"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function ConditionSegment({
  value,
  onChange,
  t,
  className = "",
}: {
  value: ShopFilters["condition"];
  onChange: (next: ShopFilters["condition"]) => void;
  t: Dictionary;
  className?: string;
}) {
  const options: { key: ShopFilters["condition"]; label: string }[] = [
    { key: "all", label: t.filters.all },
    { key: "new", label: t.filters.new },
    { key: "used", label: t.filters.used },
  ];

  return (
    <div
      role="group"
      aria-label={t.filters.condition}
      className={`inline-flex rounded-full border border-temple/12 bg-orontes/60 p-1 ${className}`}
    >
      {options.map((option) => {
        const active = value === option.key;
        return (
          <button
            key={option.key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.key)}
            className={`focus-crimson flex-1 rounded-full px-4 py-1.5 text-xs whitespace-nowrap transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              active
                ? "bg-crimson-2 font-medium text-orontes"
                : "text-temple-2 hover:text-temple"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function PriceRange({
  id,
  minimum,
  value,
  onChange,
  t,
  className = "",
}: {
  id: string;
  minimum: number;
  value: number;
  onChange: (next: number) => void;
  t: Dictionary;
  className?: string;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="flex items-baseline justify-between gap-3 text-xs text-temple-3"
      >
        <span>{t.filters.price}</span>
        <span className="num text-sm font-semibold text-crimson-2">${value}</span>
      </label>
      <input
        id={id}
        type="range"
        min={minimum}
        max={priceBounds.max}
        step={5}
        value={value}
        onChange={(event) =>
          onChange(Math.max(minimum, Number(event.target.value)))
        }
        className="focus-crimson mt-1 h-8 w-full cursor-pointer accent-crimson-2"
      />
      <div className="mt-1.5 flex justify-between text-[0.65rem] text-temple-3">
        <span className="num">${minimum}</span>
        <span className="num">${priceBounds.max}</span>
      </div>
    </div>
  );
}

function SortSelect({
  id,
  value,
  onChange,
  t,
  className = "",
}: {
  id: string;
  value: ShopFilters["sort"];
  onChange: (next: ShopFilters["sort"]) => void;
  t: Dictionary;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <label htmlFor={id} className="sr-only">
        {t.filters.sort}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) =>
          onChange(event.target.value as ShopFilters["sort"])
        }
        className={`${control} h-11 w-full appearance-none ps-4 pe-10 text-xs [color-scheme:dark]`}
      >
        <option value="featured" className="bg-orontes-2 text-temple">
          {t.filters.sortFeatured}
        </option>
        <option value="price-asc" className="bg-orontes-2 text-temple">
          {t.filters.sortPriceAsc}
        </option>
        <option value="price-desc" className="bg-orontes-2 text-temple">
          {t.filters.sortPriceDesc}
        </option>
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute end-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-temple-3"
      />
    </div>
  );
}

function ResetButton({
  onReset,
  label,
  className = "",
}: {
  onReset: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onReset}
      className={`focus-crimson inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-xs text-temple-3 transition-colors duration-300 hover:text-crimson-2 ${className}`}
    >
      <X aria-hidden className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

/* ========================================================================== */
/*  Filters                                                                    */
/* ========================================================================== */

export function Filters({
  value,
  onChange,
  onReset,
  locale,
  resultCount,
}: {
  value: ShopFilters;
  onChange: (next: ShopFilters) => void;
  onReset: () => void;
  locale: Locale;
  resultCount: number;
}) {
  const t = getDictionary(locale);
  const uid = useId().replace(/:/g, "");
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  const activeCount = countActiveFilters(value);
  const dirty = !isDefaultFilters(value);

  const patch = useCallback(
    (part: Partial<ShopFilters>) => onChange({ ...value, ...part }),
    [onChange, value],
  );

  /* sheet: escape to close, scroll lock, focus handling */
  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        setOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 60);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  /* return focus to the opener, but only once the sheet has actually been used */
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      return;
    }
    if (wasOpen.current) openerRef.current?.focus({ preventScroll: true });
  }, [open]);

  const trapTab = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab" || !panelRef.current) return;
    const focusables = panelRef.current.querySelectorAll<HTMLElement>(
      'button, input, select, a[href], [tabindex]:not([tabindex="-1"])',
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const resetSheet = () => {
    onReset();
    window.requestAnimationFrame(() => closeRef.current?.focus());
  };

  return (
    <>
      <div className="sticky top-[4.5rem] z-30 lg:top-[5.25rem]">
        <div className="glass-panel rounded-2xl p-3 sm:p-4">
          {/* ------------------------------------------------ mobile bar */}
          <div className="flex items-center gap-2 xl:hidden">
            <SearchField
              id={`q-bar-${uid}`}
              value={value.query}
              onChange={(query) => patch({ query })}
              t={t}
              className="min-w-0 flex-1"
            />
            <button
              ref={openerRef}
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls={`sheet-${uid}`}
              className={`${control} inline-flex h-11 shrink-0 items-center gap-2 px-4 text-xs`}
            >
              <SlidersHorizontal aria-hidden className="h-4 w-4" />
              <span>{t.filters.title}</span>
              {activeCount > 0 ? (
                <span
                  className="num flex h-5 min-w-5 items-center justify-center rounded-full bg-crimson-2 px-1 text-[0.65rem] font-semibold text-orontes"
                  aria-label={`${activeCount} ${t.filters.activeFilters}`}
                >
                  {activeCount}
                </span>
              ) : null}
            </button>
          </div>

          {/* ----------------------------------------------- desktop bar */}
          <div className="hidden xl:block">
            <div className="flex items-center gap-3">
              <SearchField
                id={`q-rail-${uid}`}
                value={value.query}
                onChange={(query) => patch({ query })}
                t={t}
                className="w-72"
              />
              <ConditionSegment
                value={value.condition}
                onChange={(condition) => patch({ condition })}
                t={t}
              />
              <div className="ms-auto flex items-center gap-4">
                <PriceRange
                  id={`price-rail-${uid}`}
                  minimum={value.minPrice}
                  value={value.maxPrice}
                  onChange={(maxPrice) => patch({ maxPrice })}
                  t={t}
                  className="w-52"
                />
                <SortSelect
                  id={`sort-rail-${uid}`}
                  value={value.sort}
                  onChange={(sort) => patch({ sort })}
                  t={t}
                  className="w-44"
                />
                {dirty ? (
                  <ResetButton onReset={onReset} label={t.filters.reset} />
                ) : null}
              </div>
            </div>

            <div className="mt-4 border-t border-temple/8 pt-4">
              <BrandPills
                value={value.brand}
                onChange={(brand) => patch({ brand })}
                locale={locale}
                t={t}
              />
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------- mobile sheet */}
      <AnimatePresence>
        {open ? (
          <motion.div key="filter-sheet" className="fixed inset-0 z-50 xl:hidden">
            <motion.button
              type="button"
              aria-label={t.filters.close}
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.3, ease: EASE }}
              className="absolute inset-0 h-full w-full cursor-default bg-orontes/80 backdrop-blur-sm"
            />

            <motion.div
              ref={panelRef}
              id={`sheet-${uid}`}
              role="dialog"
              aria-modal="true"
              aria-label={t.filters.title}
              onKeyDown={trapTab}
              initial={reduceMotion ? false : { y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: reduceMotion ? 0 : 0.45, ease: EASE }}
              className="grain absolute inset-x-0 bottom-0 flex max-h-[90dvh] flex-col rounded-t-3xl border-t border-temple/12 bg-orontes-2 shadow-[0_-30px_80px_-30px_rgba(0,0,0,0.9)]"
            >
              <div className="relative shrink-0 px-5 pt-3 pb-4">
                <span
                  aria-hidden
                  className="mx-auto mb-4 block h-1 w-10 rounded-full bg-temple/15"
                />
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-display text-lg text-temple">
                    {t.filters.title}
                  </h2>
                  <button
                    ref={closeRef}
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label={t.filters.close}
                    className="focus-crimson flex h-9 w-9 items-center justify-center rounded-full border border-temple/12 text-temple-2 transition-colors duration-300 hover:border-crimson-2/60 hover:text-crimson-2"
                  >
                    <X aria-hidden className="h-4 w-4" />
                  </button>
                </div>
                <span
                  aria-hidden
                  className="absolute inset-x-5 bottom-0 h-px bg-linear-to-r from-crimson/50 to-transparent rtl:bg-linear-to-l"
                />
              </div>

              <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-5 py-6">
                <section>
                  <h3 className="eyebrow mb-3">{t.filters.brand}</h3>
                  <BrandPills
                    value={value.brand}
                    onChange={(brand) => patch({ brand })}
                    locale={locale}
                    t={t}
                  />
                </section>

                <section>
                  <h3 className="eyebrow mb-3">{t.filters.condition}</h3>
                  <ConditionSegment
                    value={value.condition}
                    onChange={(condition) => patch({ condition })}
                    t={t}
                    className="flex w-full"
                  />
                </section>

                <section>
                  <PriceRange
                    id={`price-sheet-${uid}`}
                    minimum={value.minPrice}
                    value={value.maxPrice}
                    onChange={(maxPrice) => patch({ maxPrice })}
                    t={t}
                  />
                </section>

                <section>
                  <h3 className="eyebrow mb-3">{t.filters.sort}</h3>
                  <SortSelect
                    id={`sort-sheet-${uid}`}
                    value={value.sort}
                    onChange={(sort) => patch({ sort })}
                    t={t}
                  />
                </section>
              </div>

              <div className="shrink-0 border-t border-temple/8 px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                <div className="flex items-center gap-3">
                  {dirty ? (
                    <ResetButton
                      onReset={resetSheet}
                      label={t.filters.reset}
                      className="border border-temple/12"
                    />
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="focus-crimson ms-auto inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-crimson-ink px-6 text-sm font-medium text-temple transition-colors duration-300 hover:bg-crimson"
                  >
                    {t.filters.apply}
                    <span className="num opacity-70">({resultCount})</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
