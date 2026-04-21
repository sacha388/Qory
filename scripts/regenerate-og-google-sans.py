#!/usr/bin/env python3
"""
Régénère `public/fonts/og-google-sans/*.ttf` à partir des Google Sans du site.

Les tables GSUB / GPOS posent problème à Satori (@vercel/og) ; on les retire
pour du texte latin statique (Open Graph). Relancer si vous mettez à jour les
fichiers dans `public/fonts/google sans/static/`.
"""
from pathlib import Path

from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public/fonts/google sans/static"
OUT = ROOT / "public/fonts/og-google-sans"
FILES = [
    "GoogleSans-Medium.ttf",
    "GoogleSans-SemiBold.ttf",
    "GoogleSans-Bold.ttf",
]


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for name in FILES:
        font = TTFont(str(SRC / name))
        for tag in ("GSUB", "GPOS", "JSTF"):
            if tag in font:
                del font[tag]
        font.save(str(OUT / name))
        print(f"OK {OUT / name}")


if __name__ == "__main__":
    main()
