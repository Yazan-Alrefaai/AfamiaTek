import { notFound } from "next/navigation";

import { Hero } from "@/components/hero/Hero";
import { BrandMarquee } from "@/components/home/BrandMarquee";
import { Categories } from "@/components/home/Categories";
import { Featured } from "@/components/home/Featured";
import { VisitStrip } from "@/components/home/VisitStrip";
import { WhyUs } from "@/components/home/WhyUs";
import { isLocale } from "@/lib/site";

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <>
      <Hero locale={lang} />
      <BrandMarquee locale={lang} />
      <Featured locale={lang} />
      <Categories locale={lang} />
      <WhyUs locale={lang} />
      <VisitStrip locale={lang} />
    </>
  );
}
