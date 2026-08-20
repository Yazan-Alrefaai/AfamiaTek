#!/usr/bin/env python3
"""
Normalise raw manufacturer renders into card-ready transparent PNGs.

  1. knock out a flat background by flood-filling inward from the border
  2. trim to the alpha bounding box
  3. letterbox onto a fixed 4:5 canvas with a consistent margin

Usage: prep.py IN OUT [--no-key] [--width 900] [--pad 0.06]
"""
import argparse
import sys

import numpy as np
from PIL import Image
from scipy import ndimage

CANVAS_W = 900
CANVAS_H = 1125  # 4:5


def flood_key(rgba: np.ndarray, tol: int) -> np.ndarray:
    """Return alpha mask (uint8) with border-connected background removed."""
    h, w = rgba.shape[:2]
    rgb = rgba[:, :, :3].astype(np.int16)

    # background reference = median of the four corner patches
    patch = 8
    corners = np.concatenate([
        rgb[:patch, :patch].reshape(-1, 3),
        rgb[:patch, -patch:].reshape(-1, 3),
        rgb[-patch:, :patch].reshape(-1, 3),
        rgb[-patch:, -patch:].reshape(-1, 3),
    ])
    ref = np.median(corners, axis=0)

    close = (np.abs(rgb - ref).max(axis=2) <= tol)

    # only background *connected to the border* goes — a white shirt or a pale
    # screen in the middle of the render has to survive
    labels, count = ndimage.label(close)
    border = np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]])
    keep = np.zeros(count + 1, dtype=bool)
    keep[np.unique(border[border > 0])] = True
    visited = keep[labels]

    alpha = rgba[:, :, 3].copy()
    alpha[visited] = 0

    # soften the 1px halo left by hard keying
    dist = np.abs(rgb - ref).max(axis=2)
    edge = (~visited) & (dist <= tol * 2)
    ramp = np.clip((dist[edge] - tol * 0.5) / max(tol * 1.5, 1) * 255, 0, 255)
    alpha[edge] = np.minimum(alpha[edge], ramp.astype(np.uint8))
    return alpha


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("dst")
    ap.add_argument("--no-key", action="store_true", help="source is already transparent")
    ap.add_argument("--tol", type=int, default=14)
    ap.add_argument("--passes", type=int, default=3)
    ap.add_argument("--crop", help="l,t,r,b fractions applied after trimming")
    ap.add_argument("--pad", type=float, default=0.04, help="margin as a fraction of the canvas")
    ap.add_argument("--width", type=int, default=CANVAS_W)
    args = ap.parse_args()

    img = Image.open(args.src).convert("RGBA")

    # keying a 3.5k-wide key visual is pointless when the canvas is 900px
    cap = args.width * 3
    if max(img.size) > cap:
        scale = cap / max(img.size)
        img = img.resize(
            (round(img.width * scale), round(img.height * scale)), Image.LANCZOS
        )

    # some CDNs pad the render onto a plate on top of a second flat colour,
    # so keep keying + trimming until the border stops being background
    passes = 0 if args.no_key else args.passes
    for _ in range(passes):
        arr = np.array(img)
        arr[:, :, 3] = flood_key(arr, args.tol)
        img = Image.fromarray(arr, "RGBA")
        bbox = img.getbbox()
        if bbox is None:
            print(f"!! {args.src}: fully transparent after keying", file=sys.stderr)
            return 1
        img = img.crop(bbox)

    bbox = img.getbbox()
    if bbox is None:
        print(f"!! {args.src}: empty image", file=sys.stderr)
        return 1
    img = img.crop(bbox)

    # keep one device out of a side-by-side press render: --crop l,t,r,b (0-1)
    if args.crop:
        l, t, r, b = (float(v) for v in args.crop.split(","))
        img = img.crop((
            round(img.width * l), round(img.height * t),
            round(img.width * r), round(img.height * b),
        ))
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)

    cw = args.width
    ch = round(cw * CANVAS_H / CANVAS_W)
    inner_w = cw * (1 - 2 * args.pad)
    inner_h = ch * (1 - 2 * args.pad)
    scale = min(inner_w / img.width, inner_h / img.height)
    new = (max(1, round(img.width * scale)), max(1, round(img.height * scale)))
    img = img.resize(new, Image.LANCZOS)

    canvas = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    canvas.paste(img, ((cw - new[0]) // 2, (ch - new[1]) // 2), img)
    canvas.save(args.dst, "PNG", optimize=True)

    filled = (np.array(canvas)[:, :, 3] > 8).mean()
    print(f"{args.dst}  {cw}x{ch}  coverage={filled:.1%}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
