import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { products } from "@/lib/catalog";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/site";

export function Categories({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  const cards = [
    {
      href: `/${locale}/shop?condition=new`,
      title: dict.categories.newTitle,
      desc: dict.categories.newDesc,
      count: products.filter((p) => p.condition === "new").length,
      accent: "#ff416a",
      span: "lg:col-span-7",
      height: "min-h-[19rem]",
    },
    {
      href: `/${locale}/shop?condition=used`,
      title: dict.categories.usedTitle,
      desc: dict.categories.usedDesc,
      count: products.filter((p) => p.condition === "used").length,
      accent: "#35c99a",
      span: "lg:col-span-5",
      height: "min-h-[19rem]",
    },
    {
      href: `/${locale}/shop?max=150`,
      title: dict.categories.budgetTitle,
      desc: dict.categories.budgetDesc,
      count: products.filter((p) => p.priceUsd <= 150).length,
      accent: "#b8603f",
      span: "lg:col-span-5",
      height: "min-h-[16rem]",
    },
    {
      href: `/${locale}/shop?min=500&sort=price-desc`,
      title: dict.categories.flagshipTitle,
      desc: dict.categories.flagshipDesc,
      count: products.filter((p) => p.priceUsd >= 500).length,
      accent: "#6d9bff",
      span: "lg:col-span-7",
      height: "min-h-[16rem]",
    },
  ];

  return (
    <section className="container-page py-16 sm:py-20">
      <SectionHeading
        eyebrow={dict.categories.eyebrow}
        title={dict.categories.title}
      />

      <div className="mt-14 grid gap-5 lg:grid-cols-12">
        {cards.map((card, i) => (
          <Reveal key={card.href} delay={i * 80} className={card.span}>
            <Link
              href={card.href}
              className={`card-surface focus-crimson group relative flex ${card.height} h-full flex-col justify-between overflow-hidden p-8 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 sm:p-10`}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(120% 90% at 80% 110%, ${card.accent}22, transparent 70%)`,
                }}
                aria-hidden
              />
              <div
                className="colonnade pointer-events-none absolute inset-0 opacity-40"
                style={{ "--flute": "54px" } as React.CSSProperties}
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px scale-x-0 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
                style={{
                  background: `linear-gradient(90deg, transparent, ${card.accent}, transparent)`,
                }}
                aria-hidden
              />

              <div className="relative flex items-start justify-between gap-4">
                <span
                  className="num rounded-full border px-3 py-1 text-xs"
                  style={{
                    borderColor: `${card.accent}55`,
                    color: card.accent,
                  }}
                >
                  {card.count}
                </span>
                <ArrowUpRight
                  className="h-5 w-5 shrink-0 text-temple-3 transition-all duration-500 group-hover:-translate-y-1 group-hover:text-crimson-2 rtl:-scale-x-100"
                  strokeWidth={1.6}
                />
              </div>

              <div className="relative">
                <h3 className="text-display text-2xl text-temple sm:text-3xl">
                  {card.title}
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-temple-2">
                  {card.desc}
                </p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
