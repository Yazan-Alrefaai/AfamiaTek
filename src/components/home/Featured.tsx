import { ProductCard } from "@/components/shop/ProductCard";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { featuredProducts } from "@/lib/catalog";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/site";

export function Featured({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const items = featuredProducts(6);

  return (
    <section className="container-page pt-24 pb-16 sm:pt-32 sm:pb-20">
      <SectionHeading
        eyebrow={dict.featured.eyebrow}
        title={dict.featured.title}
        lead={dict.featured.lead}
        action={
          <ButtonLink href={`/${locale}/shop`} variant="outline">
            {dict.featured.all}
          </ButtonLink>
        }
      />

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((product, i) => (
          <Reveal key={product.slug} delay={(i % 3) * 90}>
            <ProductCard product={product} locale={locale} index={i} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
