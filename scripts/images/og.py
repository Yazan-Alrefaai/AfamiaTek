#!/usr/bin/env python3
"""Render the AFAMIA TEK social card (1200x630) from the brand book palette."""
import pathlib

import numpy as np
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
CRIMSON = (237, 24, 71)
CRIMSON_2 = (255, 65, 106)
ORONTES = (10, 10, 9)
ORONTES_3 = (29, 29, 27)
TEMPLE = (255, 254, 246)
TEMPLE_3 = (142, 140, 131)

REPO = pathlib.Path(__file__).resolve().parents[2]
FONTS = pathlib.Path(__file__).resolve().parent / "fonts"
SHOP = REPO / "public/products"


def mark(size: int) -> Image.Image:
    """The colonnade mark, drawn at 6x and downsampled."""
    s = 6
    w, h = 104 * s, 128 * s
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)

    d.polygon(
        [(x * s, y * s) for x, y in
         ((52, 5), (102, 29), (102, 37), (98, 37), (98, 53),
          (6, 53), (6, 37), (2, 37), (2, 29))],
        fill=CRIMSON + (255,),
    )
    # punch the arch back out
    d.pieslice([36 * s, 37 * s, 68 * s, 69 * s], 180, 360, fill=(0, 0, 0, 0))

    cols = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    dc = ImageDraw.Draw(cols)
    for x in (13, 32.5, 52, 71.5, 91):
        dc.rectangle([(x - 7.5) * s, 57 * s, (x + 7.5) * s, 64 * s], fill=CRIMSON + (255,))
        dc.rectangle([(x - 4) * s, 64 * s, (x + 4) * s, 128 * s], fill=CRIMSON + (255,))

    # one diagonal shear turns the five shafts into the signal wave
    arr = np.array(cols)
    yy, xx = np.mgrid[0:h, 0:w]
    arr[:, :, 3] = np.where(yy > 64 * s + xx * (120 - 64) / 104, 0, arr[:, :, 3])
    layer.alpha_composite(Image.fromarray(arr, "RGBA"))

    layer = layer.resize((round(size * 104 / 128), size), Image.LANCZOS)
    return layer


def ground() -> Image.Image:
    img = Image.new("RGB", (W, H), ORONTES)
    a = np.array(img, dtype=np.float64)
    yy, xx = np.mgrid[0:H, 0:W]

    # a slow lift toward the top-right, so the card is not a flat rectangle
    lift = np.clip(1 - ((xx / W - 0.92) ** 2 * 3.2 + (yy / H - 0.05) ** 2 * 3.6), 0, 1) ** 2
    for i, c in enumerate(ORONTES_3):
        a[:, :, i] += lift * (c - ORONTES[i]) * 1.5

    # Apama Crimson bloom, kept faint
    bloom = np.exp(-(((xx - W * 0.93) / (W * 0.42)) ** 2 + ((yy - H * 0.1) / (H * 0.6)) ** 2))
    for i, c in enumerate(CRIMSON):
        a[:, :, i] += bloom * c * 0.22

    img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))

    # the colonnade: fluting lifted from Apamea's columns
    d = ImageDraw.Draw(img, "RGBA")
    for x in range(0, W, 46):
        d.line([(x, 0), (x, H)], fill=TEMPLE + (14,), width=1)
    return img


def main() -> None:
    img = ground()

    # ---- the devices, angled into the right third ------------------------
    picks = ["tecno-camon-30-pro-5g", "samsung-galaxy-a35-5g", "iphone-15-pro-max"]
    for i, (slug, scale, xy, rot) in enumerate(
        zip(picks, (0.86, 0.72, 0.78), ((790, 92), (990, 210), (640, 250)), (-8, 7, 14))
    ):
        f = SHOP / f"{slug}.webp"
        if not f.exists():
            continue
        d = Image.open(f).convert("RGBA")
        d = d.resize((round(d.width * scale * 0.62), round(d.height * scale * 0.62)), Image.LANCZOS)
        d = d.rotate(rot, resample=Image.BICUBIC, expand=True)
        if i == 2:  # the one behind sits back in the haze
            faded = np.array(d, dtype=np.float64)
            faded[:, :, 3] *= 0.4
            d = Image.fromarray(faded.astype(np.uint8), "RGBA")
        img.paste(d, xy, d)

    # keep the right edge from crowding the frame
    veil = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    dv = ImageDraw.Draw(veil)
    for x in range(W - 90, W):
        dv.line([(x, 0), (x, H)], fill=ORONTES + (int(255 * (x - (W - 90)) / 90),))
    img = Image.alpha_composite(img.convert("RGBA"), veil).convert("RGB")

    # ---- lockup ----------------------------------------------------------
    m = mark(132)
    img.paste(m, (72, 74), m)

    d = ImageDraw.Draw(img)
    display = ImageFont.truetype(str(FONTS / "Unbounded-Bold.ttf"), 84)
    small = ImageFont.truetype(str(FONTS / "Sora-Regular.ttf"), 25)
    tiny = ImageFont.truetype(str(FONTS / "Sora-Regular.ttf"), 21)

    x0, y0 = 72, 248
    d.text((x0, y0), "AFAMIA", font=display, fill=TEMPLE)
    afamia_w = d.textlength("AFAMIA", font=display)
    d.text((x0, y0 + 96), "TEK.", font=display, fill=CRIMSON_2)
    tek_w = d.textlength("TEK.", font=display)

    rule_y = y0 + 208
    d.line([(x0, rule_y), (x0 + 118, rule_y)], fill=CRIMSON, width=3)

    d.text((x0, rule_y + 30), "New & used handsets — Victoria, Damascus", font=small, fill=TEMPLE)
    d.text((x0, rule_y + 72), "TECNO · Infinix · Samsung · Xiaomi · Apple", font=tiny, fill=TEMPLE_3)

    out = REPO / "public/og.png"
    img.save(out, "PNG", optimize=True)
    print(f"{out}  {img.size}  wordmark {afamia_w:.0f}/{tek_w:.0f}px")


if __name__ == "__main__":
    main()
