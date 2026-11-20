#!/usr/bin/env python3
"""
Generates the placeholder pixel-art used by the game.

    pip install pillow
    python3 tools/generate_sprites.py

Everything is drawn at 16 px per tile. The game scales it up 3x (to 48 px)
with image smoothing turned off, which is what gives the crisp pixel look.

You do NOT need this script once real artwork exists. Overwrite the PNGs in
assets/sprites/ with your own files (keep the file names, or update
src/game/assets.js). See README.md -> "Swapping in real art".
"""
import os
import random
from PIL import Image, ImageDraw

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "sprites")
os.makedirs(OUT, exist_ok=True)

# --------------------------------------------------------------------------
# Frog: drawn as half a sprite and mirrored, so it is always symmetrical.
# Each row is 8 characters (the left half of a 16 px wide frame).
# --------------------------------------------------------------------------
PAL = {
    ".": (0, 0, 0, 0),
    "D": (24, 92, 38, 255),     # dark green outline
    "G": (72, 186, 64, 255),    # body green
    "L": (150, 230, 112, 255),  # highlight
    "W": (255, 255, 255, 255),  # eye white
    "K": (16, 16, 16, 255),     # pupil
    "R": (176, 48, 48, 255),    # splat red
}

FROG_IDLE = [
    "........",
    "..DDD...",
    ".DWWWD..",
    ".DWKWDDD",
    "..DGGGGG",
    "..DGGLLG",
    ".DDGGLLG",
    "DGGDGGGG",
    "DGDDGGGG",
    ".DDGGGGG",
    "..DGGLLG",
    ".DDGGGGG",
    "DGGDGGGG",
    "DGGDGGGG",
    ".DDDDDDD",
    "........",
]

FROG_HOP = [  # legs stretched out: used while the frog is mid-jump
    "..DDD...",
    ".DWWWD..",
    ".DWKWDDD",
    "DGDGGGGG",
    "DGGDGGGG",
    ".DDDGGLL",
    "...DGGLL",
    "...DGGGG",
    "...DGGGG",
    "...DGGGG",
    "..DGGGGG",
    ".DGDGGGG",
    "DGGDGGGG",
    "DGDDDDDD",
    "DDD.....",
    "........",
]

FROG_DEAD = [  # squashed
    "........",
    "...R....",
    ".R.RR.R.",
    "..RRGRR.",
    ".RGGGGGR",
    "RRGKGGKG",
    ".RGGGGGG",
    "RGGGDGGG",
    "RGGGGGGG",
    ".RGGGGGG",
    "RRGGDGGG",
    ".RGGGGGG",
    "..RGGRRR",
    ".R.RRG.R",
    "...R....",
    "........",
]


def frame_from_half(rows):
    """Mirror an 8-wide half-sprite into a full 16x16 RGBA frame."""
    img = Image.new("RGBA", (16, 16))
    for y, row in enumerate(rows):
        assert len(row) == 8, f"row {y} must have 8 characters: {row!r}"
        full = row + row[::-1]
        for x, ch in enumerate(full):
            img.putpixel((x, y), PAL[ch])
    return img


def save_frog_sheet():
    sheet = Image.new("RGBA", (48, 16))
    for i, rows in enumerate((FROG_IDLE, FROG_HOP, FROG_DEAD)):
        sheet.paste(frame_from_half(rows), (i * 16, 0))
    sheet.save(os.path.join(OUT, "frog.png"))


# --------------------------------------------------------------------------
# Vehicles: top-down, facing RIGHT. The game flips them for left-moving lanes.
# --------------------------------------------------------------------------
def shade(c, f):
    return tuple(max(0, min(255, int(v * f))) for v in c[:3]) + (255,)


def car(name, body, tiles_wide=2, taxi=False):
    w, h = 16 * tiles_wide, 16
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    tyre = (22, 22, 24, 255)
    glass = (150, 205, 235, 255)
    for wx in (int(w * 0.16), int(w * 0.62)):          # wheels peek out above/below
        d.rectangle([wx, 1, wx + 5, h - 2], fill=tyre)
    d.rounded_rectangle([1, 2, w - 2, h - 3], radius=3, fill=body, outline=shade(body, 0.6))
    d.rectangle([int(w * 0.30), 4, int(w * 0.60), h - 5], fill=shade(body, 1.18))   # roof
    d.rectangle([int(w * 0.62), 4, int(w * 0.72), h - 5], fill=glass)               # windscreen
    d.rectangle([int(w * 0.22), 4, int(w * 0.28), h - 5], fill=shade(glass, 0.7))   # rear glass
    for y in (3, h - 5):                                                            # lights
        d.rectangle([w - 3, y, w - 2, y + 1], fill=(255, 236, 140, 255))
        d.rectangle([1, y, 2, y + 1], fill=(220, 40, 40, 255))
    if taxi:
        d.rectangle([int(w * 0.38), 6, int(w * 0.52), h - 7], fill=(30, 30, 30, 255))
        d.rectangle([int(w * 0.40), 7, int(w * 0.50), 8], fill=(255, 255, 255, 255))
    img.save(os.path.join(OUT, name))


def truck(name, cab, tiles_wide=3):
    w, h = 16 * tiles_wide, 16
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    tyre = (22, 22, 24, 255)
    for wx in (5, 15, 24, 36):
        d.rectangle([wx, 1, wx + 5, h - 2], fill=tyre)
    box = (226, 228, 232, 255)
    d.rounded_rectangle([1, 2, 30, h - 3], radius=2, fill=box, outline=(120, 124, 132, 255))
    for x in range(6, 30, 6):                                  # cargo ribs
        d.line([x, 3, x, h - 4], fill=(190, 194, 202, 255))
    d.rectangle([2, 7, 29, 8], fill=shade(cab, 1.0))           # stripe in the cab colour
    d.rounded_rectangle([32, 2, w - 2, h - 3], radius=3, fill=cab, outline=shade(cab, 0.6))
    d.rectangle([w - 8, 4, w - 5, h - 5], fill=(150, 205, 235, 255))   # windscreen
    d.rectangle([34, 4, 38, h - 5], fill=shade(cab, 1.2))              # cab roof
    for y in (3, h - 5):
        d.rectangle([w - 3, y, w - 2, y + 1], fill=(255, 236, 140, 255))
        d.rectangle([1, y, 2, y + 1], fill=(220, 40, 40, 255))
    img.save(os.path.join(OUT, name))


# --------------------------------------------------------------------------
# 16x16 background tiles with a little seeded noise so they are not flat.
# --------------------------------------------------------------------------
def noisy_tile(base, spots, density, seed):
    rng = random.Random(seed)
    img = Image.new("RGBA", (16, 16), base)
    for y in range(16):
        for x in range(16):
            if rng.random() < density:
                img.putpixel((x, y), rng.choice(spots))
    return img


def save_tiles():
    grass = noisy_tile((76, 160, 58, 255), [(62, 138, 48, 255), (98, 184, 72, 255)], 0.18, 1)
    for x, y in ((3, 4), (11, 10)):                              # tiny flowers
        grass.putpixel((x, y), (255, 244, 170, 255))
    grass.save(os.path.join(OUT, "grass.png"))

    road = noisy_tile((60, 60, 68, 255), [(54, 54, 62, 255), (68, 68, 76, 255)], 0.14, 2)
    road.save(os.path.join(OUT, "road.png"))

    marked = road.copy()                                         # dashed lane divider on the top edge
    for x in list(range(0, 4)) + list(range(8, 12)):
        marked.putpixel((x, 0), (232, 232, 220, 255))
    marked.save(os.path.join(OUT, "roadLine.png"))

    pave = Image.new("RGBA", (16, 16), (176, 176, 184, 255))     # brick-pattern median
    d = ImageDraw.Draw(pave)
    for y in (0, 4, 8, 12):
        d.line([0, y, 15, y], fill=(140, 140, 152, 255))
    for row, y in enumerate((0, 4, 8, 12)):
        for x in range(row % 2 * 4, 16, 8):
            d.line([x, y, x, y + 3], fill=(140, 140, 152, 255))
    pave.save(os.path.join(OUT, "pavement.png"))

    hedge = noisy_tile((28, 94, 48, 255), [(22, 78, 40, 255), (44, 128, 62, 255), (66, 156, 78, 255)], 0.35, 3)
    d = ImageDraw.Draw(hedge)
    d.line([0, 15, 15, 15], fill=(16, 56, 30, 255))              # shadow edge towards the road
    hedge.save(os.path.join(OUT, "hedge.png"))


if __name__ == "__main__":
    save_frog_sheet()
    car("carRed.png", (212, 52, 52, 255))
    car("carBlue.png", (58, 112, 214, 255))
    car("taxi.png", (246, 202, 52, 255), taxi=True)
    truck("truck.png", (222, 120, 40, 255))
    save_tiles()
    print("Sprites written to", os.path.normpath(OUT))
