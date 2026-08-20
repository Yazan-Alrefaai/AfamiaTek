#!/usr/bin/env python3
"""
Render one 1200x630 social card per catalog entry.

Product links are shared on WhatsApp, and a transparent WebP render previews
badly there, so every product gets a real card: brand palette, the mark, the
device, and the name. Deliberately no price — prices move faster than these
files would be regenerated.
"""
import json
import pathlib
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from og import CRIMSON, CRIMSON_2, ORONTES, TEMPLE, TEMPLE_3, mark, ground  # noqa: E402

W, H = 1200, 630
REPO = pathlib.Path(__file__).resolve().parents[2]
FONTS = pathlib.Path(__file__).resolve().parent / "fonts"
OUT = REPO / "public/products/og"

BRANDS = {b["id"]: b["name"] for b in json.loads((REPO / "src/data/brands.json").read_text())}


def fit(text: str, font_path: str, size: int, max_w: int) -> ImageFont.FreeTypeFont:
    """Shrink until the line fits — device names vary a lot in length."""
    while size > 30:
        font = ImageFont.truetype(font_path, size)
        if font.getlength(text) <= max_w:
            return font
        size -= 2
    return ImageFont.truetype(font_path, size)


def card(product: dict) -> Image.Image:
    img = ground().convert("RGBA")

    render = REPO / "public/products" / f"{product['slug']}.webp"
    if render.exists():
        art = Image.open(render).convert("RGBA")
        scale = 560 / art.height
        art = art.resize((round(art.width * scale), round(art.height * scale)), Image.LANCZOS)
        img.alpha_composite(art, (W - art.width - 70, (H - art.height) // 2))

    # let the copy column win over the render behind it
    veil = np.zeros((H, W, 4), dtype=np.float64)
    xx = np.mgrid[0:H, 0:W][1]
    veil[:, :, :3] = ORONTES
    veil[:, :, 3] = np.clip((640 - xx) / 260, 0, 1) * 232
    img.alpha_composite(Image.fromarray(veil.astype(np.uint8), "RGBA"))

    img = img.convert("RGB")
    d = ImageDraw.Draw(img)

    m = mark(78)
    img.paste(m, (72, 62), m)
    d.text((172, 78), "AFAMIA", font=ImageFont.truetype(str(FONTS / "Unbounded-Bold.ttf"), 30), fill=TEMPLE)
    d.text((172, 112), "TEK.", font=ImageFont.truetype(str(FONTS / "Unbounded-Bold.ttf"), 30), fill=CRIMSON_2)

    brand = BRANDS.get(product["brand"], product["brand"]).upper()
    used = product["condition"] == "used"
    sora = str(FONTS / "Sora-Regular.ttf")

    d.text((72, 250), f"{brand}  ·  {'PRE-OWNED' if used else 'NEW'}",
           font=ImageFont.truetype(sora, 22), fill=CRIMSON_2)

    name_font = fit(product["name"], str(FONTS / "Unbounded-Bold.ttf"), 62, 520)
    d.text((72, 292), product["name"], font=name_font, fill=TEMPLE)

    d.line([(72, 420), (190, 420)], fill=CRIMSON, width=3)
    d.text((72, 452), product["tagline"]["en"][:52], font=ImageFont.truetype(sora, 23), fill=TEMPLE)
    d.text((72, 500), "Victoria, Damascus  ·  afamiatek.com",
           font=ImageFont.truetype(sora, 20), fill=TEMPLE_3)
    return img


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    products = json.loads((REPO / "src/data/products.json").read_text())
    for p in products:
        card(p).save(OUT / f"{p['slug']}.png", "PNG", optimize=True)
    print(f"wrote {len(products)} cards to {OUT}")


if __name__ == "__main__":
    main()
