"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, MessageCircle, X } from "lucide-react";

import { Logo } from "./Logo";
import { getDictionary } from "@/lib/dictionaries";
import { locales, site, type Locale } from "@/lib/site";
import { waLink } from "@/lib/whatsapp";

export function Nav({ locale }: { locale: Locale }) {
  const searchParams = useSearchParams();
  return <Navigation locale={locale} queryString={searchParams.toString()} />;
}

/** Static navigation shown while a query-aware navigation hydrates. */
export function NavFallback({ locale }: { locale: Locale }) {
  return <Navigation locale={locale} queryString="" />;
}

function Navigation({
  locale,
  queryString,
}: {
  locale: Locale;
  queryString: string;
}) {
  const dict = getDictionary(locale);
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setOpen(false));
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, queryString]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus(), 30);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      return;
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      menuButtonRef.current?.focus({ preventScroll: true });
    }
  }, [open]);

  const links = [
    { key: "home", href: `/${locale}`, label: dict.nav.home },
    { key: "shop", href: `/${locale}/shop`, label: dict.nav.products },
    { key: "used", href: `/${locale}/shop?condition=used`, label: dict.nav.used },
    { key: "about", href: `/${locale}/about`, label: dict.nav.about },
    { key: "contact", href: `/${locale}/contact`, label: dict.nav.contact },
  ];

  const currentQuery = new URLSearchParams(queryString);
  const shopPath = `/${locale}/shop`;
  const usedView = pathname === shopPath && currentQuery.get("condition") === "used";
  const isActive = (key: string, href: string) => {
    if (key === "home") return pathname === `/${locale}`;
    if (key === "used") return usedView;
    if (key === "shop") {
      const insideShop = pathname === shopPath || pathname.startsWith(`${shopPath}/`);
      return insideShop && !usedView;
    }
    return pathname === href;
  };

  const other = locales.find((l) => l !== locale) as Locale;
  const swappedPath = pathname.replace(`/${locale}`, `/${other}`);
  const swapped = queryString ? `${swappedPath}?${queryString}` : swappedPath;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          scrolled
            ? "glass-panel border-x-0 border-t-0 py-2.5"
            : "border-transparent bg-transparent py-5"
        }`}
      >
        <nav className="container-page flex items-center justify-between gap-6">
          <Link
            href={`/${locale}`}
            className="focus-crimson group flex items-center gap-3"
          >
            <Logo className="h-9 w-auto text-crimson transition-transform duration-500 group-hover:rotate-3" />
            <span className="flex flex-col leading-none">
              {/* the book's lockup: AFAMIA in Temple White, TEK. in crimson */}
              <span className="text-display text-[1.05rem] text-temple">
                {locale === "ar" ? (
                  site.name.ar
                ) : (
                  <>
                    AFAMIA<span className="text-crimson-2">&nbsp;TEK.</span>
                  </>
                )}
              </span>
              <span className="mt-1 text-[0.6rem] tracking-[0.2em] text-temple-3 uppercase">
                {dict.common.city}
              </span>
            </span>
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {links.map((link) => {
              const active = isActive(link.key, link.href);
              return (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`focus-crimson relative rounded-full px-4 py-2 text-sm transition-colors duration-300 ${
                      active
                        ? "text-crimson-3"
                        : "text-temple-2 hover:text-temple"
                    }`}
                  >
                    {link.label}
                    {active ? (
                      <span className="absolute inset-x-4 -bottom-0.5 h-px bg-crimson-2/70" />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            <Link
              href={swapped}
              hrefLang={other}
              className="focus-crimson rounded-full border border-temple/15 px-3.5 py-1.5 text-xs text-temple-2 transition-colors duration-300 hover:border-crimson-2/60 hover:text-crimson-3"
            >
              {dict.common.langSwitch}
            </Link>

            <a
              href={waLink(dict.whatsapp.generic)}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-crimson hidden items-center gap-2 rounded-full bg-crimson-ink px-5 py-2.5 text-sm font-medium text-temple transition-all duration-300 hover:-translate-y-0.5 hover:bg-crimson hover:shadow-[0_10px_30px_-10px_rgba(237,24,71,0.75)] sm:inline-flex"
            >
              <MessageCircle className="h-4 w-4" strokeWidth={2.2} />
              {dict.nav.cta}
            </a>

            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setOpen(true)}
              aria-label={dict.nav.menu}
              aria-expanded={open}
              aria-controls="mobile-navigation"
              className="focus-crimson rounded-full border border-temple/15 p-2.5 text-temple transition-colors hover:border-crimson-2/60 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </header>

      {/* mobile drawer */}
      <div
        ref={dialogRef}
        id="mobile-navigation"
        role="dialog"
        aria-modal="true"
        aria-label={dict.nav.menu}
        className={`fixed inset-0 z-60 lg:hidden ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
        inert={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-orontes/80 backdrop-blur-sm transition-opacity duration-400 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`colonnade absolute inset-y-0 end-0 flex min-h-0 w-[min(88vw,24rem)] flex-col overflow-hidden bg-orontes-2 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            open ? "translate-x-0" : "translate-x-full rtl:-translate-x-full"
          }`}
          style={{ "--flute": "38px" } as React.CSSProperties}
        >
          <div className="flex items-center justify-between border-b border-temple/10 px-6 py-5">
            <span className="eyebrow">{dict.nav.menu}</span>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setOpen(false)}
              aria-label={dict.nav.close}
              className="focus-crimson rounded-full border border-temple/15 p-2 text-temple"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <ul className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-4 py-6">
            {links.map((link, i) => {
              const active = isActive(link.key, link.href);
              return (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={`focus-crimson block rounded-xl px-4 py-3.5 text-display text-xl transition-colors hover:bg-temple/5 hover:text-crimson-3 ${
                      active ? "bg-crimson/10 text-crimson-3" : "text-temple"
                    }`}
                    style={{ transitionDelay: `${i * 30}ms` }}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="border-t border-temple/10 px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <a
              href={waLink(dict.whatsapp.generic)}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-crimson flex h-12 w-full items-center justify-center gap-2 rounded-full bg-crimson-ink text-sm font-medium text-temple"
            >
              <MessageCircle className="h-4 w-4" strokeWidth={2.2} />
              {dict.nav.cta}
            </a>
            <p className="num mt-4 text-center text-sm text-temple-3">
              {site.phoneLocal}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
