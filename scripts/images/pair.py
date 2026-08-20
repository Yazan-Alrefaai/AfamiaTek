#!/usr/bin/env python3
"""
Compose a back + front render into the side-by-side pair every other brand in
the catalog ships, so the shop grid reads as one set instead of a patchwork.

Usage: pair.py BACK FRONT OUT [--overlap 0.14] [--drop 0.03]
"""
import argparse

from PIL import Image


def trimmed(path: str) -> Image.Image:
    img = Image.open(path).convert("RGBA")
    box = img.getbbox()
    return img.crop(box) if box else img


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("back")
    ap.add_argument("front")
    ap.add_argument("dst")
    ap.add_argument("--overlap", type=float, default=0.14, help="fraction of the back tile the front covers")
    ap.add_argument("--drop", type=float, default=0.03, help="how much lower the front sits")
    ap.add_argument("--scale", type=float, default=1.0, help="front size relative to back")
    args = ap.parse_args()

    back = trimmed(args.back)
    front = trimmed(args.front)

    # match heights first, then apply the requested front/back size ratio
    target_h = max(back.height, front.height)
    def fit(img: Image.Image, h: int) -> Image.Image:
        return img.resize((max(1, round(img.width * h / img.height)), h), Image.LANCZOS)

    back = fit(back, target_h)
    front = fit(front, round(target_h * args.scale))

    drop = round(target_h * args.drop)
    x_front = round(back.width * (1 - args.overlap))
    w = x_front + front.width
    h = max(back.height, front.height + drop)

    canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    canvas.alpha_composite(back, (0, 0))
    canvas.alpha_composite(front, (x_front, drop))

    box = canvas.getbbox()
    if box:
        canvas = canvas.crop(box)
    canvas.save(args.dst, "PNG", optimize=True)
    print(f"{args.dst}  {canvas.width}x{canvas.height}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
