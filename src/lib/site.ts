export const site = {
  /** as set in the brand book: the wordmark is AFAMIA + TEK. */
  name: { ar: "أفاميا تك", en: "AFAMIA TEK" },
  tagline: { ar: "تجربة تترك أثراً", en: "An experience that leaves a mark" },
  domain: "www.afamiatek.com",
  url: "https://www.afamiatek.com",
  phoneLocal: "0930865918",
  phoneIntl: "+963930865918",
  /** wa.me needs digits only, no plus sign */
  whatsapp: "963930865918",
  facebook: "https://www.facebook.com/profile.php?id=61591699493143",
  address: {
    ar: "فيكتوريا — برج دمشق للاتصالات — خلف بناء مديرية الأوقاف، دمشق، سوريا",
    en: "Victoria — Damascus Telecom Tower — behind the Awqaf Directorate building, Damascus, Syria",
  },
  addressShort: {
    ar: "فيكتوريا، دمشق",
    en: "Victoria, Damascus",
  },
  hours: {
    ar: "السبت — الخميس · ١٠:٠٠ ص — ٩:٠٠ م",
    en: "Sat — Thu · 10:00 — 21:00",
  },
  mapsQuery: "Damascus Telecom Tower, Victoria, Damascus",
} as const;

export const locales = ["ar", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ar";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
