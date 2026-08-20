"use client";

import { useSearchParams } from "next/navigation";

import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/site";

/**
 * The catalog headline changes with `?condition=`, so it is read on the client
 * rather than from server `searchParams`. That keeps the page fully static —
 * the same HTML works behind a server and on a static host — while the heading
 * still tracks the filter the visitor arrived with.
 */
export function ShopHeading({ locale }: { locale: Locale }) {
  const params = useSearchParams();
  const condition = params.get("condition");
  const t = getDictionary(locale);

  const { title, lead } =
    condition === "used"
      ? { title: t.shop.usedTitle, lead: t.shop.usedLead }
      : condition === "new"
        ? { title: t.shop.newTitle, lead: t.shop.newLead }
        : { title: t.shop.title, lead: t.shop.lead };

  return (
    <>
      <h1 className="text-display mt-5 max-w-4xl text-[clamp(2.5rem,8.5vw,5.5rem)] text-temple">
        {title}
      </h1>

      <p className="mt-6 max-w-2xl text-sm leading-relaxed text-temple-2 sm:text-base">
        {lead}
      </p>
    </>
  );
}
