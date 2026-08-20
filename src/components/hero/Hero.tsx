import type { CSSProperties } from "react";
import { ArrowUpRight, ChevronDown, MapPin, ShieldCheck } from "lucide-react";

import SceneLoader from "@/components/hero/SceneLoader";
import { ButtonAnchor, ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { brands, stockCount } from "@/lib/catalog";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/site";
import { waLink } from "@/lib/whatsapp";

/** Wide flutes up here — the colonnade should read as architecture, not texture. */
const fluteWide = { "--flute": "clamp(64px, 7vw, 118px)" } as CSSProperties;

export function Hero({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <section className="relative isolate flex min-h-[92dvh] flex-col justify-center overflow-hidden">
      {/* ---------------------------------------------------------------- */}
      {/* background: colonnade → crimson glow → horizon → vignette          */}
      {/* ---------------------------------------------------------------- */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="colonnade absolute inset-0 opacity-55" style={fluteWide} />

        <div className="absolute top-[4%] end-[-18%] h-[44rem] w-[44rem] rounded-full bg-crimson/7 blur-[150px] lg:end-[-8%]" />
        <div className="absolute top-[24%] end-[0%] h-[22rem] w-[22rem] rounded-full bg-crimson-2/6 blur-[110px] lg:end-[8%]" />
        <div className="absolute -bottom-56 start-[-14%] h-[30rem] w-[34rem] rounded-full bg-crimson/5 blur-[140px]" />

        <div className="absolute inset-x-0 top-[70%] h-px bg-[linear-gradient(to_right,transparent,color-mix(in_oklab,var(--color-temple)_16%,transparent),transparent)]" />

        <div className="absolute inset-0 bg-[radial-gradient(125%_95%_at_50%_38%,transparent_28%,var(--color-orontes)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(to_bottom,transparent,var(--color-orontes))]" />
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* content                                                          */}
      {/* ---------------------------------------------------------------- */}
      <div className="container-page grid grid-cols-1 items-center gap-y-8 pt-24 pb-20 lg:grid-cols-12 lg:gap-x-10 lg:pt-32 lg:pb-32">
        {/* stage — follows the sales message on mobile, balances it on desktop */}
        <div className="relative row-start-2 h-[30vh] min-h-[210px] w-full sm:h-[40vh] lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:h-[74vh] lg:min-h-[520px]">
          <SceneLoader />
        </div>

        {/* copy — inline-start */}
        <div className="relative row-start-1 lg:col-span-7 lg:col-start-1 lg:row-start-1">
          <Reveal>
            <span className="inline-flex items-center gap-2.5 rounded-full border border-temple/12 bg-orontes-2/60 px-4 py-2 backdrop-blur-sm">
              <MapPin aria-hidden className="size-3.5 shrink-0 text-crimson-2" />
              <span className="eyebrow leading-none">{dict.hero.eyebrow}</span>
            </span>
          </Reveal>

          <Reveal delay={110}>
            <h1 className="text-display mt-8 text-[clamp(3.25rem,11.5vw,9rem)] text-temple">
              <span className="block">{dict.hero.titleTop}</span>
              <span className="block text-crimson-2">{dict.hero.titleBottom}</span>
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <div
              aria-hidden
              className="mt-9 h-px w-40 bg-[linear-gradient(to_right,transparent,var(--color-crimson-2),transparent)]"
            />
          </Reveal>

          <Reveal delay={280}>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-temple-2 sm:text-lg">
              {dict.hero.lead}
            </p>
          </Reveal>

          <Reveal delay={400}>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <ButtonLink href={`/${locale}/shop`} variant="crimson" size="lg">
                {dict.hero.ctaPrimary}
                <ArrowUpRight
                  aria-hidden
                  className="size-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 rtl:-scale-x-100"
                />
              </ButtonLink>

              <ButtonAnchor
                href={waLink(dict.whatsapp.generic)}
                target="_blank"
                rel="noopener noreferrer"
                variant="outline"
                size="lg"
              >
                {dict.hero.ctaSecondary}
              </ButtonAnchor>
            </div>
          </Reveal>

          <Reveal delay={520}>
            <dl className="mt-14 grid max-w-2xl grid-cols-3 border-t border-temple/10 pt-8">
              <div className="pe-3">
                <dt className="text-display text-3xl leading-none text-crimson-2 sm:text-4xl">
                  <span className="num">{brands.length}</span>
                </dt>
                <dd className="mt-3 text-xs leading-snug text-temple-3">
                  {dict.hero.stat1}
                </dd>
              </div>

              <div className="border-s border-temple/10 ps-4 pe-3">
                <dt className="text-display text-3xl leading-none text-crimson-2 sm:text-4xl">
                  <span className="num">{stockCount}</span>
                </dt>
                <dd className="mt-3 text-xs leading-snug text-temple-3">
                  {dict.hero.stat2}
                </dd>
              </div>

              <div className="border-s border-temple/10 ps-4">
                <dt className="text-crimson-2">
                  <ShieldCheck aria-hidden className="size-8 sm:size-9" />
                </dt>
                <dd className="mt-3 text-xs leading-snug text-temple-3">
                  {dict.hero.stat3}
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </div>

      {/* scroll cue */}
      <div className="pointer-events-none absolute inset-x-0 bottom-7 z-10">
        <div className="container-page">
          <Reveal delay={700}>
            <span className="inline-flex items-center gap-3">
              <span className="eyebrow">{dict.hero.scroll}</span>
              <span
                aria-hidden
                className="inline-flex size-9 items-center justify-center rounded-full border border-temple/12"
              >
                <ChevronDown className="size-4 animate-bounce text-crimson-2 [animation-duration:2.6s]" />
              </span>
            </span>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
