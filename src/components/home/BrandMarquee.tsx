"use client";

import { useState } from "react";
import { Pause, Play } from "lucide-react";

import { brands } from "@/lib/catalog";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/site";

export function BrandMarquee({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const row = [...brands, ...brands];
  const [paused, setPaused] = useState(false);

  return (
    <section
      className="relative overflow-hidden border-y border-temple/10 bg-orontes-2 py-8"
      aria-label={dict.marquee}
    >
      <div
        className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-orontes-2 via-transparent to-orontes-2"
        aria-hidden
      />
      <div className="container-page mb-6 flex items-center justify-between gap-4">
        <p className="eyebrow">{dict.marquee}</p>
        <button
          type="button"
          aria-pressed={paused}
          aria-label={paused ? dict.marqueePlay : dict.marqueePause}
          onClick={() => setPaused((current) => !current)}
          className="focus-crimson inline-flex h-9 w-9 items-center justify-center rounded-full border border-temple/15 text-temple-2 transition-colors hover:border-crimson-2/60 hover:text-crimson-2"
        >
          {paused ? (
            <Play aria-hidden className="h-3.5 w-3.5" />
          ) : (
            <Pause aria-hidden className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      <div
        className="flex w-max marquee-track animate-[marquee_42s_linear_infinite] items-center gap-16 px-8 hover:[animation-play-state:paused]"
        style={{ animationPlayState: paused ? "paused" : undefined }}
      >
        {row.map((brand, i) => (
          <span
            key={`${brand.id}-${i}`}
            aria-hidden={i >= brands.length}
            className="group flex shrink-0 items-center gap-3 text-2xl tracking-tight text-temple-3 transition-colors duration-500 hover:text-temple sm:text-3xl"
            style={{
              fontFamily:
                locale === "ar"
                  ? "var(--font-tajawal), system-ui, sans-serif"
                  : "var(--font-sora), system-ui, sans-serif",
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full transition-all duration-500 group-hover:scale-150"
              style={{ backgroundColor: brand.accent }}
              aria-hidden
            />
            {locale === "ar" ? brand.name_ar : brand.name}
          </span>
        ))}
      </div>
    </section>
  );
}
