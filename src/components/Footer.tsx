import Link from "next/link";
import { MapPin, Phone } from "lucide-react";

import { Logo } from "./Logo";
import { getDictionary } from "@/lib/dictionaries";
import { site, type Locale } from "@/lib/site";
import { mapsLink } from "@/lib/whatsapp";

/** lucide-react dropped brand glyphs, so the mark lives here. */
function FacebookGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.45 2.9h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  );
}

export function Footer({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const year = new Date().getFullYear();

  const links = [
    { href: `/${locale}`, label: dict.nav.home },
    { href: `/${locale}/shop`, label: dict.nav.products },
    { href: `/${locale}/about`, label: dict.nav.about },
    { href: `/${locale}/contact`, label: dict.nav.contact },
  ];

  return (
    <footer className="relative mt-20 overflow-hidden border-t border-temple/10 bg-orontes-2 sm:mt-24">
      <div
        className="colonnade pointer-events-none absolute inset-0 opacity-40"
        style={{ "--flute": "72px" } as React.CSSProperties}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-crimson-2/50 to-transparent"
        aria-hidden
      />

      <div className="container-page relative py-20">
        <div className="grid gap-14 md:grid-cols-[1.4fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-3">
              <Logo className="h-11 w-auto text-crimson" />
              <span className="flex flex-col leading-tight">
                <span className="text-display text-2xl text-temple">
                  {locale === "ar" ? (
                    site.name.ar
                  ) : (
                    <>
                      AFAMIA<span className="text-crimson-2">&nbsp;TEK.</span>
                    </>
                  )}
                </span>
                {/* the line printed on the shop's own bags */}
                <span className="mt-1.5 text-xs text-crimson-3">
                  {locale === "ar" ? site.tagline.ar : site.tagline.en}
                </span>
              </span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-temple-3">
              {dict.footer.tagline}
            </p>
            <a
              href={site.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-crimson mt-6 inline-flex items-center gap-2 rounded-full border border-temple/15 px-4 py-2 text-xs text-temple-2 transition-colors hover:border-crimson-2/60 hover:text-crimson-3"
            >
              <FacebookGlyph className="h-3.5 w-3.5" />
              Facebook
            </a>
          </div>

          <nav>
            <h3 className="eyebrow mb-5">{dict.footer.quick}</h3>
            <ul className="space-y-3">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="focus-crimson text-sm text-temple-2 transition-colors hover:text-crimson-3"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="eyebrow mb-5">{dict.footer.contact}</h3>
            <ul className="space-y-4 text-sm text-temple-2">
              <li>
                <a
                  href={mapsLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-crimson flex gap-3 transition-colors hover:text-crimson-3"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-crimson" />
                  <span className="leading-relaxed">{site.address[locale]}</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${site.phoneIntl}`}
                  className="focus-crimson flex items-center gap-3 transition-colors hover:text-crimson-3"
                >
                  <Phone className="h-4 w-4 shrink-0 text-crimson" />
                  <span className="num">{site.phoneLocal}</span>
                </a>
              </li>
              <li className="flex gap-3 text-temple-3">
                <span className="w-4" />
                <span>{site.hours[locale]}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-3 border-t border-temple/10 pt-8 text-xs text-temple-3 sm:flex-row">
          <p>
            <span className="num">© {year}</span>{" "}
            {locale === "ar" ? site.name.ar : site.name.en} — {dict.footer.rights}
          </p>
          <p className="text-temple-3">{dict.footer.built}</p>
        </div>
      </div>
    </footer>
  );
}
