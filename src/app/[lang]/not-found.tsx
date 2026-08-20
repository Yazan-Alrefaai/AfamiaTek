"use client";

import type { CSSProperties } from "react";
import { usePathname } from "next/navigation";
import { House, Store } from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/Logo";
import { getDictionary } from "@/lib/dictionaries";
import { isLocale } from "@/lib/site";

export default function NotFound() {
  const pathname = usePathname();
  const segment = pathname.split("/")[1] ?? "";
  const locale = isLocale(segment) ? segment : "ar";
  const dict = getDictionary(locale);

  return (
    <section className="relative flex min-h-[80dvh] items-center overflow-x-clip">
      <div
        aria-hidden
        className="colonnade pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(70%_60%_at_50%_40%,black,transparent)]"
        style={{ "--flute": "clamp(40px, 7vw, 88px)" } as CSSProperties}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/4 start-1/4 h-80 w-80 rounded-full bg-crimson/10 blur-[140px]"
      />

      <div className="container-page relative py-32 lg:py-40">
        <div className="grid items-center gap-12 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-20">
          {/* the numeral */}
          <p
            aria-hidden
            className="num bg-gradient-to-b from-crimson-3 via-crimson-2 to-crimson/25 bg-clip-text text-[clamp(6rem,22vw,15rem)] leading-[0.8] font-semibold text-transparent"
          >
            404
          </p>

          <div className="lg:border-s lg:border-temple/10 lg:ps-16">
            <Logo className="h-10 w-auto text-crimson" />

            <div dir={dict.dir} lang={locale} className="mt-7">
              <h1 className="text-display text-3xl text-temple sm:text-4xl">
                {dict.notFound.title}
              </h1>
              <p className="mt-4 max-w-[46ch] text-base leading-[1.9] text-temple-2">
                {dict.notFound.lead}
              </p>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <ButtonLink href={`/${locale}`} variant="crimson" size="lg">
                <House aria-hidden className="h-[1.05rem] w-[1.05rem]" />
                {dict.notFound.home}
              </ButtonLink>
              <ButtonLink href={`/${locale}/shop`} variant="outline" size="lg">
                <Store aria-hidden className="h-[1.05rem] w-[1.05rem]" />
                {dict.notFound.shop}
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
