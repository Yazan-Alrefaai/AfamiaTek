import productsJson from "@/data/products.json";
import brandsJson from "@/data/brands.json";
import type { Brand, Product } from "./types";

if (!Array.isArray(productsJson) || !Array.isArray(brandsJson)) {
  throw new Error("Catalog products and brands must be JSON arrays.");
}

export const products = productsJson as Product[];
export const brands = brandsJson as Brand[];

const HEX_COLOUR = /^#[0-9a-f]{6}$/i;
const PRODUCT_IMAGE = /^\/products\/[a-z0-9/_-]+\.(?:avif|jpe?g|png|webp)$/i;

const SPEC_KEYS = [
  "display",
  "chipset",
  "ram",
  "storage",
  "camera",
  "battery",
  "os",
  "network",
] as const;

function validateCatalog(): void {
  const brandIds = new Set<string>();
  for (const brand of brands) {
    if (
      !brand ||
      typeof brand !== "object" ||
      typeof brand.id !== "string" ||
      !brand.id ||
      brandIds.has(brand.id)
    ) {
      throw new Error(`Catalog has a missing or duplicate brand id: ${brand.id}`);
    }
    brandIds.add(brand.id);
    if (
      typeof brand.name !== "string" ||
      !brand.name ||
      typeof brand.name_ar !== "string" ||
      !brand.name_ar ||
      typeof brand.accent !== "string" ||
      !HEX_COLOUR.test(brand.accent)
    ) {
      throw new Error(`Brand ${brand.id} is missing display data.`);
    }
  }

  const slugs = new Set<string>();
  for (const product of products) {
    if (!product || typeof product !== "object") {
      throw new Error("Catalog contains a product that is not an object.");
    }
    if (
      typeof product.slug !== "string" ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.slug) ||
      slugs.has(product.slug)
    ) {
      throw new Error(`Catalog has an invalid or duplicate slug: ${product.slug}`);
    }
    slugs.add(product.slug);

    if (typeof product.brand !== "string" || !brandIds.has(product.brand)) {
      throw new Error(`${product.slug} references unknown brand ${product.brand}.`);
    }
    if (
      typeof product.name !== "string" ||
      !product.name ||
      typeof product.tagline?.ar !== "string" ||
      !product.tagline.ar ||
      typeof product.tagline?.en !== "string" ||
      !product.tagline.en
    ) {
      throw new Error(`${product.slug} is missing localized product copy.`);
    }
    if (!Number.isFinite(product.priceUsd) || product.priceUsd <= 0) {
      throw new Error(`${product.slug} has an invalid price.`);
    }
    if (
      product.oldPriceUsd !== undefined &&
      (!Number.isFinite(product.oldPriceUsd) || product.oldPriceUsd <= product.priceUsd)
    ) {
      throw new Error(`${product.slug} has an invalid previous price.`);
    }
    if (product.condition !== "new" && product.condition !== "used") {
      throw new Error(`${product.slug} has an invalid condition.`);
    }
    if (typeof product.inStock !== "boolean") {
      throw new Error(`${product.slug} must declare inStock as a boolean.`);
    }
    if (product.featured !== undefined && typeof product.featured !== "boolean") {
      throw new Error(`${product.slug} has an invalid featured flag.`);
    }
    if (typeof product.accent !== "string" || !HEX_COLOUR.test(product.accent)) {
      throw new Error(`${product.slug} has an invalid accent colour.`);
    }
    if (
      product.condition === "used" &&
      (!Number.isFinite(product.batteryHealth) ||
        product.batteryHealth! < 0 ||
        product.batteryHealth! > 100)
    ) {
      throw new Error(`${product.slug} needs battery health between 0 and 100.`);
    }
    if (product.condition === "new" && product.batteryHealth !== undefined) {
      throw new Error(`${product.slug} cannot have battery health when sold new.`);
    }
    if (!Array.isArray(product.colors) || product.colors.length === 0) {
      throw new Error(`${product.slug} needs at least one colour.`);
    }
    for (const colour of product.colors) {
      if (
        !colour ||
        typeof colour !== "object" ||
        typeof colour.hex !== "string" ||
        !HEX_COLOUR.test(colour.hex) ||
        typeof colour.name?.ar !== "string" ||
        !colour.name.ar ||
        typeof colour.name?.en !== "string" ||
        !colour.name.en
      ) {
        throw new Error(`${product.slug} has invalid colour data.`);
      }
    }
    for (const key of SPEC_KEYS) {
      const value = product.specs?.[key];
      if (typeof value !== "string" || !value.trim()) {
        throw new Error(`${product.slug} is missing the ${key} specification.`);
      }
    }
    if (
      product.images !== undefined &&
      (!Array.isArray(product.images) ||
        product.images.length === 0 ||
        product.images.some(
          (image) => typeof image !== "string" || !PRODUCT_IMAGE.test(image),
        ))
    ) {
      throw new Error(
        `${product.slug} images must be public /products image paths.`,
      );
    }
  }
}

validateCatalog();

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getBrand(id: string): Brand | undefined {
  return brands.find((b) => b.id === id);
}

export function featuredProducts(limit = 6): Product[] {
  return products.filter((p) => p.featured && p.inStock).slice(0, limit);
}

export function relatedProducts(product: Product, limit = 3): Product[] {
  const sameBrand = products.filter(
    (p) => p.slug !== product.slug && p.brand === product.brand,
  );
  const closePrice = products
    .filter((p) => p.slug !== product.slug && p.brand !== product.brand)
    .sort(
      (a, b) =>
        Math.abs(a.priceUsd - product.priceUsd) -
        Math.abs(b.priceUsd - product.priceUsd),
    );
  return [...sameBrand, ...closePrice].slice(0, limit);
}

export const priceBounds = {
  min: Math.min(...products.map((p) => p.priceUsd)),
  max: Math.max(...products.map((p) => p.priceUsd)),
};

export const stockCount = products.filter((p) => p.inStock).length;
