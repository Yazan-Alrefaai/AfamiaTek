import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowUpRight, Clock, MapPin, MessageCircle, Phone } from "lucide-react";

import { ButtonAnchor } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { getDictionary } from "@/lib/dictionaries";
import { isLocale, locales, site, type Locale } from "@/lib/site";
import { mapsLink, telLink, waLink } from "@/lib/whatsapp";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "ar";
  const dict = getDictionary(locale);

  return {
    title: dict.contact.metaTitle,
    description: dict.contact.metaDescription,
    alternates: {
      canonical: `${site.url}/${locale}/contact`,
      languages: { ar: `${site.url}/ar/contact`, en: `${site.url}/en/contact` },
    },
    openGraph: {
      type: "website",
      title: dict.contact.metaTitle,
      description: dict.contact.metaDescription,
      url: `${site.url}/${locale}/contact`,
      siteName: site.name[locale],
      locale: locale === "ar" ? "ar_SY" : "en_US",
      images: [
        {
          url: `${site.url}/og.png`,
          width: 1200,
          height: 630,
          alt: dict.contact.metaTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.contact.metaTitle,
      description: dict.contact.metaDescription,
      images: [`${site.url}/og.png`],
    },
  };
}

/** lucide dropped brand marks, so the Facebook "f" is drawn here. */
function FacebookGlyph({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      focusable="false"
      className={className}
    >
      <path d="M14.7 8.6V6.98c0-.72.22-1.1 1.29-1.1h1.65V3.12c-.29-.04-1.28-.12-2.44-.12-2.42 0-4.08 1.44-4.08 4.09V8.6H8.36v2.94h2.76V19h3.35v-7.46h2.5l.39-2.94H14.7Z" />
    </svg>
  );
}

function InfoRow({
  icon,
  label,
  href,
  external = false,
  divider = false,
  ariaLabel,
  children,
}: {
  icon: ReactNode;
  label: string;
  href?: string;
  external?: boolean;
  divider?: boolean;
  ariaLabel?: string;
  children: ReactNode;
}) {
  const shell = `group flex items-start gap-4 p-5 sm:p-6 ${
    divider ? "hairline" : ""
  }`;

  const body = (
    <>
      <span
        aria-hidden
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-crimson-2/25 bg-crimson/10 text-crimson-2 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:border-crimson-2/60 group-hover:bg-crimson/20"
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[0.7rem] tracking-[0.2em] text-temple-3 uppercase">
          {label}
        </span>
        <span className="mt-2 block text-sm leading-relaxed text-temple transition-colors duration-300 group-hover:text-crimson-3">
          {children}
        </span>
      </span>
      {href ? (
        <ArrowUpRight
          aria-hidden
          className="mt-1 h-4 w-4 shrink-0 text-temple-3 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:text-crimson-2 rtl:-scale-x-100"
        />
      ) : null}
    </>
  );

  if (!href) {
    return <div className={shell}>{body}</div>;
  }

  return (
    <a
      href={href}
      aria-label={ariaLabel}
      className={`${shell} focus-crimson`}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {body}
    </a>
  );
}

/**
 * Stylised map plate. There is no Maps API key on this project, so the
 * neighbourhood is drawn: orontes ground, crimson street grid, a pulsing pin.
 */
function MapPlate({ district }: { district: string }) {
  return (
    <>
      <svg
        viewBox="0 0 600 700"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
        focusable="false"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <pattern
            id="plate-blocks"
            width="78"
            height="82"
            patternUnits="userSpaceOnUse"
          >
            <rect
              x="6"
              y="6"
              width="66"
              height="70"
              fill="#fffef6"
              fillOpacity="0.028"
              stroke="#ed1847"
              strokeOpacity="0.17"
              strokeWidth="1"
            />
          </pattern>
          <radialGradient id="plate-glow" cx="50%" cy="45%" r="46%">
            <stop offset="0%" stopColor="#ed1847" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#ed1847" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="plate-vignette" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a0a09" stopOpacity="0.55" />
            <stop offset="42%" stopColor="#0a0a09" stopOpacity="0" />
            <stop offset="100%" stopColor="#0a0a09" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        <rect width="600" height="700" fill="#0b0d11" />

        <g transform="rotate(-14 300 340)">
          <rect
            x="-280"
            y="-280"
            width="1160"
            height="1260"
            fill="url(#plate-blocks)"
          />
          {/* the avenues */}
          <g stroke="#ed1847" strokeOpacity="0.45" strokeLinecap="round">
            <line x1="-280" y1="252" x2="880" y2="252" strokeWidth="3" />
            <line x1="318" y1="-280" x2="318" y2="980" strokeWidth="3" />
            <line x1="-280" y1="580" x2="880" y2="580" strokeWidth="1.8" />
          </g>
        </g>

        {/* a boulevard cutting the grid, and the ring around the shop */}
        <path
          d="M-40 660 C 170 540, 250 392, 660 262"
          fill="none"
          stroke="#ed1847"
          strokeOpacity="0.32"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle
          cx="300"
          cy="316"
          r="104"
          fill="none"
          stroke="#ff416a"
          strokeOpacity="0.24"
          strokeWidth="1"
          strokeDasharray="3 9"
        />
        <circle cx="300" cy="316" r="170" fill="url(#plate-glow)" />
        <rect width="600" height="700" fill="url(#plate-vignette)" />
      </svg>

      {/* pulsing pin — centred without physical offsets so RTL is unaffected */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="relative flex h-16 w-16 items-center justify-center">
          <span className="animate-pulse-ring absolute h-16 w-16 rounded-full border border-crimson-2/70" />
          <span className="absolute h-8 w-8 rounded-full bg-crimson/25 blur-[2px]" />
          <MapPin
            aria-hidden
            strokeWidth={1.6}
            className="relative h-8 w-8 text-crimson-2 drop-shadow-[0_6px_14px_rgba(0,0,0,0.7)]"
          />
        </span>
      </div>

      {/* compass */}
      <span
        aria-hidden
        className="absolute end-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-temple/12 bg-orontes/70 text-[0.65rem] tracking-[0.1em] text-temple-3 backdrop-blur-sm"
      >
        N
      </span>

      {/* district plate */}
      <span className="absolute start-5 bottom-5 inline-flex items-center gap-2.5 rounded-full border border-crimson-2/30 bg-orontes/80 px-4 py-2 text-xs text-temple backdrop-blur-sm">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-crimson-2" />
        {district}
      </span>
    </>
  );
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const locale: Locale = lang;
  const dict = getDictionary(locale);

  return (
    <article className="relative overflow-x-clip">
      {/* ------------------------------------------------------------------ */}
      {/* header                                                              */}
      {/* ------------------------------------------------------------------ */}
      <header className="relative">
        <div
          aria-hidden
          className="colonnade pointer-events-none absolute inset-x-0 top-0 h-[32rem] opacity-60 [mask-image:linear-gradient(to_bottom,black_15%,transparent)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 end-[15%] h-72 w-72 rounded-full bg-crimson/10 blur-[130px]"
        />

        <div className="container-page relative pt-32 pb-12 lg:pt-44 lg:pb-16">
          <Reveal>
            <p className="eyebrow flex items-center gap-3">
              <span aria-hidden className="inline-block h-px w-8 bg-crimson-2/60" />
              {dict.contact.eyebrow}
            </p>
            <h1 className="text-display mt-6 max-w-[18ch] text-[clamp(2.4rem,8vw,5.5rem)] text-temple">
              {dict.contact.title}
            </h1>
            <p className="mt-7 max-w-[54ch] text-base leading-relaxed text-temple-2 sm:text-lg">
              {dict.contact.lead}
            </p>
          </Reveal>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* info stack + map plate                                              */}
      {/* ------------------------------------------------------------------ */}
      <section className="container-page relative pb-20 lg:pb-28">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
          <Reveal>
            <div className="card-surface overflow-hidden">
              <InfoRow
                divider
                icon={<MapPin className="h-5 w-5" strokeWidth={1.6} />}
                label={dict.contact.address}
                href={mapsLink()}
                external
                ariaLabel={`${dict.contact.address}: ${site.address[locale]} — ${dict.contact.directions}`}
              >
                {site.address[locale]}
              </InfoRow>

              <InfoRow
                divider
                icon={<Phone className="h-5 w-5" strokeWidth={1.6} />}
                label={dict.contact.phone}
                href={telLink()}
                ariaLabel={`${dict.contact.phone} ${site.phoneIntl}`}
              >
                <span className="num text-base">{site.phoneLocal}</span>
              </InfoRow>

              <InfoRow
                divider
                icon={<Clock className="h-5 w-5" strokeWidth={1.6} />}
                label={dict.contact.hours}
              >
                {site.hours[locale]}
              </InfoRow>

              <InfoRow
                icon={<FacebookGlyph className="h-5 w-5" />}
                label={dict.contact.social}
                href={site.facebook}
                external
                ariaLabel={`${site.name[locale]} — ${dict.contact.social}`}
              >
                {site.name[locale]}
              </InfoRow>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="flex h-full flex-col gap-4">
              <a
                href={mapsLink()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={dict.contact.mapLabel}
                className="card-surface focus-crimson group relative block min-h-[22rem] flex-1 overflow-hidden transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-crimson-2/40 sm:min-h-[28rem]"
              >
                <MapPlate district={site.addressShort[locale]} />
                <span
                  aria-hidden
                  className="absolute end-5 bottom-5 inline-flex items-center gap-2 rounded-full border border-temple/12 bg-orontes/80 px-3.5 py-2 text-xs text-temple-2 backdrop-blur-sm transition-colors duration-300 group-hover:border-crimson-2/50 group-hover:text-crimson-3"
                >
                  {dict.contact.directions}
                  <ArrowUpRight className="h-3.5 w-3.5 rtl:-scale-x-100" />
                </span>
              </a>

              <ButtonAnchor
                href={mapsLink()}
                target="_blank"
                rel="noopener noreferrer"
                variant="outline"
                size="lg"
                className="w-full"
              >
                <MapPin aria-hidden className="h-[1.05rem] w-[1.05rem]" />
                {dict.contact.directions}
              </ButtonAnchor>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* WhatsApp band                                                       */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden border-y border-temple/10 bg-orontes-2/70">
        <div
          aria-hidden
          className="colonnade pointer-events-none absolute inset-0 opacity-50"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(65%_120%_at_18%_0%,rgba(200,145,47,0.14),transparent_62%)]"
        />

        <div className="container-page relative py-20 lg:py-28">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <Reveal className="max-w-2xl">
              <h2 className="text-display text-3xl text-temple sm:text-4xl lg:text-[3.25rem]">
                {dict.contact.ctaTitle}
              </h2>
              <p className="mt-5 text-base leading-relaxed text-temple-2">
                {dict.contact.ctaLead}
              </p>
            </Reveal>

            <Reveal delay={130} className="shrink-0">
              <div className="flex flex-wrap gap-3">
                <ButtonAnchor
                  href={waLink(dict.whatsapp.generic)}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="crimson"
                  size="lg"
                >
                  <MessageCircle aria-hidden className="h-[1.15rem] w-[1.15rem]" />
                  {dict.contact.whatsapp}
                </ButtonAnchor>
                <ButtonAnchor href={telLink()} variant="outline" size="lg">
                  <Phone aria-hidden className="h-[1.05rem] w-[1.05rem]" />
                  <span className="num">{site.phoneLocal}</span>
                </ButtonAnchor>
              </div>
            </Reveal>
          </div>

          {/* opening hours, restated */}
          <Reveal delay={200}>
            <div className="mt-14 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-temple/10 pt-7">
              <span className="inline-flex items-center gap-2.5 text-[0.7rem] tracking-[0.2em] text-temple-3 uppercase">
                <Clock aria-hidden className="h-4 w-4 text-crimson-2" />
                {dict.contact.hours}
              </span>
              <span aria-hidden className="h-px flex-1 bg-temple/10" />
              <span className="text-sm text-temple">{site.hours[locale]}</span>
            </div>
          </Reveal>
        </div>
      </section>
    </article>
  );
}
