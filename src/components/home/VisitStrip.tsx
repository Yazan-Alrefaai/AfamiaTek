import { Clock, MapPin, Phone } from "lucide-react";

import { ButtonAnchor, ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { getDictionary } from "@/lib/dictionaries";
import { site, type Locale } from "@/lib/site";
import { mapsLink, telLink, waLink } from "@/lib/whatsapp";

export function VisitStrip({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  const rows = [
    {
      icon: MapPin,
      label: dict.contact.address,
      value: site.address[locale],
      href: mapsLink(),
      external: true,
    },
    {
      icon: Phone,
      label: dict.contact.phone,
      value: site.phoneLocal,
      href: telLink(),
      external: false,
      num: true,
    },
    {
      icon: Clock,
      label: dict.contact.hours,
      value: site.hours[locale],
      href: undefined,
      external: false,
    },
  ];

  return (
    <section className="container-page pt-16 pb-20 sm:pt-20 sm:pb-24">
      <div className="card-surface crimson-edge relative overflow-hidden">
        <div
          className="colonnade pointer-events-none absolute inset-0 opacity-40"
          style={{ "--flute": "64px" } as React.CSSProperties}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -top-1/2 end-0 h-[36rem] w-[36rem] rounded-full opacity-25 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(200,145,47,0.55), transparent 65%)",
          }}
          aria-hidden
        />

        <div className="relative grid gap-12 p-8 sm:p-12 lg:grid-cols-[1.1fr_1fr] lg:p-16">
          <Reveal>
            <p className="eyebrow mb-4">{dict.contact.eyebrow}</p>
            <h2 className="text-display text-4xl text-temple sm:text-5xl">
              {dict.contact.title}
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-temple-2">
              {dict.contact.lead}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonAnchor
                href={waLink(dict.whatsapp.generic)}
                target="_blank"
                rel="noopener noreferrer"
                size="lg"
              >
                {dict.contact.whatsapp}
              </ButtonAnchor>
              <ButtonLink
                href={`/${locale}/contact`}
                variant="outline"
                size="lg"
              >
                {dict.nav.contact}
              </ButtonLink>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <ul className="divide-y divide-temple/10 border-y border-temple/10">
              {rows.map((row) => {
                const Icon = row.icon;
                const body = (
                  <span className="flex items-start gap-4 py-5">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-crimson/25 bg-crimson/8 text-crimson-2">
                      <Icon className="h-4 w-4" strokeWidth={1.7} />
                    </span>
                    <span className="flex flex-col gap-1">
                      <span className="eyebrow">{row.label}</span>
                      <span
                        className={`text-sm leading-relaxed text-temple ${row.num ? "num" : ""}`}
                      >
                        {row.value}
                      </span>
                    </span>
                  </span>
                );

                return (
                  <li key={row.label}>
                    {row.href ? (
                      <a
                        href={row.href}
                        {...(row.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className="focus-crimson block transition-colors duration-300 hover:text-crimson-3"
                      >
                        {body}
                      </a>
                    ) : (
                      body
                    )}
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
