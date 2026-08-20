"use client";

import { useEffect, useState } from "react";

import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/site";
import { waLink } from "@/lib/whatsapp";

export function WhatsAppFab({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href={waLink(dict.whatsapp.generic)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={dict.nav.cta}
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
      className={`focus-crimson fixed bottom-6 end-6 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-[#05310f] shadow-[0_14px_40px_-12px_rgba(37,211,102,0.8)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-110 ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
    >
      <span className="absolute inset-0 animate-[pulse-ring_2.6s_ease-out_infinite] rounded-full bg-[#25D366]/40" />
      <svg viewBox="0 0 24 24" className="relative h-7 w-7" fill="currentColor">
        <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.61-.92-2.2-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.52.07-.79.38-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.71 2-1.4.25-.69.25-1.28.17-1.4-.07-.13-.27-.2-.57-.35Z" />
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm0 18.02h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.17 8.17 0 0 1-1.26-4.36c0-4.53 3.7-8.22 8.25-8.22a8.22 8.22 0 0 1 0 16.44Z" />
      </svg>
    </a>
  );
}
