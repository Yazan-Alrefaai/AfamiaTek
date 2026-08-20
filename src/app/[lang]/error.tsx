"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button, ButtonLink } from "@/components/ui/Button";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const pathname = usePathname();
  const locale = pathname.startsWith("/en") ? "en" : "ar";
  const ar = locale === "ar";

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="container-page flex min-h-[72dvh] items-center pt-28 pb-20">
      <div className="card-surface crimson-edge relative w-full overflow-hidden p-8 sm:p-12">
        <div
          aria-hidden
          className="colonnade pointer-events-none absolute inset-0 opacity-40"
        />
        <div className="relative max-w-2xl">
          <p className="eyebrow">{ar ? "خطأ غير متوقع" : "Unexpected error"}</p>
          <h1 className="text-display mt-5 text-3xl text-temple sm:text-5xl">
            {ar ? "ما قدرنا نكمّل الصفحة" : "This page hit a snag"}
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-temple-2 sm:text-base">
            {ar
              ? "جرّب تحميل الصفحة من جديد. إذا استمرت المشكلة، ارجع للرئيسية وتابع من هناك."
              : "Try loading this page again. If the problem continues, return home and carry on from there."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={() => retry()}>
              <RefreshCw aria-hidden className="h-4 w-4" />
              {ar ? "أعد المحاولة" : "Try again"}
            </Button>
            <ButtonLink href={`/${locale}`} variant="outline">
              {ar ? "الصفحة الرئيسية" : "Home page"}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
