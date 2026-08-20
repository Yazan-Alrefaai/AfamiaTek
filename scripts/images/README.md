# Product imagery pipeline

One-off Python tooling that produced everything under `public/products`. It is
**not** part of `npm run build` — the outputs are committed, and these scripts
only run when the catalog gains a product or a render needs replacing.

## What lives where

| Path | What it is |
| --- | --- |
| `public/products/<slug>.webp` | 900×1125 transparent card render |
| `public/products/og/<slug>.png` | 1200×630 link-preview card |
| `public/og.png` | site-wide link-preview card |
| `sources.json` | the manufacturer page each render came from |

Card renders are transparent so the accent wash behind them shows through.
Link-preview cards are flat PNG because WhatsApp — where nearly every order
starts — previews transparent WebP badly.

## Setup

```bash
python3 -m venv /tmp/afamia-venv && /tmp/afamia-venv/bin/pip install Pillow numpy scipy
```

## Adding a product

1. Find the official press render on the manufacturer's own site — see
   `sources.json` for the pattern each brand uses. Samsung gallery URLs come off
   the `/buy/` page and take a `?$1300_1038_PNG$` suffix; Xiaomi and OPPO expose
   theirs through `og:image`; Apple's are on `store.storeimages.cdn-apple.com`
   with `?wid=2000&fmt=png-alpha`.
2. Normalise it onto the shared 4:5 frame:

   ```bash
   /tmp/afamia-venv/bin/python scripts/images/prep.py IN.png public/products/<slug>.png --tol 14
   ```

   Add `--no-key` when the source is already transparent, `--crop l,t,r,b` to
   keep one device out of a side-by-side press shot.
3. If the brand only ships single views, build the back+front pair first:

   ```bash
   /tmp/afamia-venv/bin/python scripts/images/pair.py BACK.png FRONT.png pair.png
   ```
4. Convert to WebP and drop the PNG:

   ```bash
   cwebp -q 94 -alpha_q 100 -m 6 -sharp_yuv public/products/<slug>.png -o public/products/<slug>.webp
   ```
5. Regenerate the link-preview cards, then record the source URL:

   ```bash
   /tmp/afamia-venv/bin/python scripts/images/og-products.py
   ```

`npm run validate:catalog` fails the build if either file is missing, so a
product cannot ship without both.

## Licensing

These are manufacturer press renders, reproduced to advertise the devices the
shop actually sells. That is the ordinary reseller use they are published for,
but it is not a licence — if a brand objects, replace its entries with the
shop's own photographs and re-run the steps above.
