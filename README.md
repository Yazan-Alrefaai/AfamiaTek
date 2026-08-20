# AFAMIA TEK — أفاميا تك

Website for AFAMIA TEK, a mobile phone shop in Victoria, Damascus (Damascus Telecom Tower,
behind the Awqaf Directorate building). New and used handsets — TECNO, Infinix, Samsung,
Xiaomi, Apple, HONOR, OPPO, realme.

Bilingual: Arabic (RTL, default) and English (LTR). No cart — every call to action opens
WhatsApp on `+963 930 865 918`.

## Run it

```bash
npm run dev
```

Then open <http://localhost:3000> — you are redirected to `/ar` (or `/en` if your browser
asks for English).

```bash
npm run build && npm start   # production build
npm run lint                 # catalog checks + ESLint
```

## Editing the shop

### Prices and phones

Everything the shop sells lives in one file: **`src/data/products.json`**.

Each entry looks like this:

```jsonc
{
  "slug": "tecno-camon-30-pro-5g",   // becomes /ar/shop/tecno-camon-30-pro-5g — keep it unique, lowercase, dashes only
  "brand": "tecno",                  // must match an id in src/data/brands.json
  "name": "TECNO Camon 30 Pro 5G",
  "tagline": { "ar": "…", "en": "…" },
  "condition": "new",                // "new" or "used"
  "batteryHealth": 92,               // used phones only, 0–100
  "priceUsd": 329,
  "oldPriceUsd": 369,                // optional — shows a struck-through price and a discount chip
  "inStock": true,                   // false greys the card out
  "featured": true,                  // shows it on the home page
  "accent": "#2FB8E6",               // tints the glow behind the render
  "colors": [{ "hex": "#1B2A4A", "name": { "ar": "أزرق داكن", "en": "Dark Blue" } }],
  "specs": {
    "display": "…", "chipset": "…", "ram": "…", "storage": "…",
    "camera": "…", "battery": "…", "os": "…", "network": "…"
  },
  "images": ["/products/tecno-camon-30-pro-5g.webp"]   // see "Photos" below
}
```

To change a price, edit `priceUsd` and redeploy. Nothing else to touch.

### Photos

Every phone ships two images, both committed:

- `public/products/<slug>.webp` — the 900×1125 transparent render on the cards
- `public/products/og/<slug>.png` — the 1200×630 card WhatsApp shows when the
  link is shared

`npm run validate:catalog` fails the build if either is missing, so a product
cannot go live without both. **`scripts/images/README.md`** has the recipe for
adding a phone, and `scripts/images/sources.json` records which manufacturer
page each render came from.

A product with no `images` falls back to generated vector artwork tinted with
its `accent` colour.

### Brands

`src/data/brands.json` — `id`, `name`, `name_ar`, `accent`. Adding one makes it appear in
the home marquee and the shop's brand filter automatically.

### Wording, phone number, address

- All site copy: `src/lib/dictionaries.ts` (an `ar` object and an `en` object — change both).
- Phone, address, opening hours, Facebook link: `src/lib/site.ts`.

## Design system

Straight from the AFAMIA TEK brand book:

| | | |
| --- | --- | --- |
| Apama Crimson | `#ED1847` | primary |
| Orontes Stone | `#1D1D1B` | near-black |
| Temple White | `#FFFEF6` | warm off-white |

Everything else on the page is a tint or shade of those three. The repeating
vertical lines throughout the site are the colonnade of Apamea (أفاميا), the
ancient Syrian city the shop is named after — the same colonnade the logo mark
is built from.

Tokens and custom utilities live in `src/app/globals.css` (Tailwind v4, CSS-first — there is
no `tailwind.config.js`). Colour classes: `bg-orontes*`, `text-temple*`, `crimson*`, `jade`,
`clay`. Utilities: `container-page`, `colonnade`, `grain`, `text-display`, `eyebrow`,
`card-surface`, `glass-panel`, `crimson-edge`, `focus-crimson`.

`crimson-ink` (`#C2113A`) exists only for filled buttons: plain `#ED1847` under Temple White
is 4.3:1 and misses AA for body-size labels, `crimson-ink` clears 6:1.

Fonts: Reem Kufi + Tajawal for Arabic, Unbounded + Sora for English.

## Layout of the code

```
src/
  app/[lang]/            ar/en routes: home, shop, shop/[slug], about, contact
  app/globals.css        design tokens + utilities
  components/hero/       the 3D hero (react-three-fiber, procedural — no model files)
  components/Logo.tsx    the colonnade mark, from the brand book
  components/shop/       product card, filters, catalog client
  components/home/       home page sections
  components/ui/         Button, Reveal, SectionHeading
  data/                  products.json, brands.json  ← the shop's stock
  lib/                   site facts, dictionaries, catalog helpers, WhatsApp links
  proxy.ts               sends "/" to /ar or /en
scripts/
  validate-catalog.mjs   runs before build and lint
  images/                one-off pipeline for the product renders and social cards
```

## Deploying

Push to GitHub, import the repo on [Vercel](https://vercel.com), deploy. No environment
variables are needed. Point `www.afamiatek.com` at it from the Vercel domains tab.

If you change the domain, update `site.url` in `src/lib/site.ts` so the sitemap and social
previews stay correct.
