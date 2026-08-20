import { BadgeCheck, ScanLine, ShieldCheck, Wrench } from "lucide-react";

import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/site";

const icons = [ScanLine, ShieldCheck, BadgeCheck, Wrench];

export function WhyUs({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div
        className="colonnade pointer-events-none absolute inset-0 opacity-50"
        style={{ "--flute": "88px" } as React.CSSProperties}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-1/3 h-px bg-gradient-to-r from-transparent via-crimson/30 to-transparent"
        aria-hidden
      />

      <div className="container-page relative">
        <SectionHeading eyebrow={dict.why.eyebrow} title={dict.why.title} />

        <ol className="mt-16 grid gap-px overflow-hidden rounded-[1.5rem] border border-temple/10 bg-temple/10 sm:grid-cols-2">
          {dict.why.items.map((item, i) => {
            const Icon = icons[i] ?? ShieldCheck;
            return (
              <li key={item.title} className="bg-orontes-2">
                <Reveal
                  delay={i * 90}
                  className="group relative flex h-full flex-col gap-5 p-8 transition-colors duration-500 hover:bg-orontes-3 sm:p-10"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-xl border border-crimson/25 bg-crimson/8 text-crimson-2 transition-all duration-500 group-hover:border-crimson-2/60 group-hover:bg-crimson/15">
                      <Icon className="h-5 w-5" strokeWidth={1.7} />
                    </span>
                    <span className="num text-display text-4xl text-temple/8 transition-colors duration-500 group-hover:text-crimson/25">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="text-display text-xl text-temple sm:text-2xl">
                    {item.title}
                  </h3>
                  <p className="max-w-md text-sm leading-relaxed text-temple-2">
                    {item.desc}
                  </p>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
