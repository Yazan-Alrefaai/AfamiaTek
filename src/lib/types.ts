import type { Locale } from "./site";

export type Localized = Record<Locale, string>;

export type Condition = "new" | "used";

export type Brand = {
  id: string;
  name: string;
  /** shown in the marquee + used as the fallback wordmark */
  name_ar: string;
  accent: string;
};

export type Product = {
  slug: string;
  brand: string;
  name: string;
  tagline: Localized;
  condition: Condition;
  /** for used devices only: 0-100 */
  batteryHealth?: number;
  priceUsd: number;
  oldPriceUsd?: number;
  inStock: boolean;
  featured?: boolean;
  /** drives the generated artwork when no photo exists */
  accent: string;
  colors: { hex: string; name: Localized }[];
  specs: {
    display: string;
    chipset: string;
    ram: string;
    storage: string;
    camera: string;
    battery: string;
    os: string;
    network: string;
  };
  /** optional real photos, dropped into /public/products */
  images?: string[];
};
