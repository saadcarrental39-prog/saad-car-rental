#!/usr/bin/env python3
"""Turns the photos in page-images-src/ into website images.
  page-images-src/murree__3_.jpg  ->  public/assets/pages/murree-3.webp (+ -640.webp) and the manifest
  and builds the share image (1200x630 jpg) for every page in src/seo/data/pageImages.json.
To change a picture: put the new .jpg in page-images-src/ with the SAME name (or a new name listed in pageImages.json), then run:  python scripts/make-page-images.py
Name -> key: lower case, every group of other characters becomes '-'  (f6_super_market.jpg -> f6-super-market)."""
import json, re, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps
R = Path(__file__).resolve().parent.parent
SRC, OUT, OG = R / "page-images-src", R / "public/assets/pages", R / "public/images/og"
OUT.mkdir(parents=True, exist_ok=True)
key = lambda n: re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", n.lower())).strip("-")
man = {}
for f in sorted(SRC.glob("*.jpg")) + sorted(SRC.glob("*.jpeg")) + sorted(SRC.glob("*.png")):
    k = key(f.stem); im = ImageOps.exif_transpose(Image.open(f)).convert("RGB")
    if im.width > 1280: im = im.resize((1280, round(im.height * 1280 / im.width)), Image.LANCZOS)
    im.save(OUT / f"{k}.webp", "WEBP", quality=80, method=6)
    sm = [im.width]
    if im.width > 760:
        s = im.resize((640, round(im.height * 640 / im.width)), Image.LANCZOS); s.save(OUT / f"{k}-640.webp", "WEBP", quality=78, method=6); sm = [640, im.width]
    man[k] = {"w": im.width, "h": im.height, "sizes": sm}
    print("image", k, im.size)
(R / "src/seo/data/pageImageManifest.json").write_text(json.dumps(man, indent=1))
def font(size, bold=True):
    for p in ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "C:/Windows/Fonts/arialbd.ttf", "/Library/Fonts/Arial Bold.ttf"):
        try: return ImageFont.truetype(p, size)
        except Exception: pass
    return ImageFont.load_default()
pages = json.loads((R / "src/seo/data/pageImages.json").read_text(encoding="utf-8"))
for path, p in pages.items():
    k = p.get("og")
    if k not in man: print("skip share image (photo missing):", path, k); continue
    im = Image.open(OUT / f"{k}.webp").convert("RGB"); W, H = 1200, 630
    im = ImageOps.fit(im, (W, H), Image.LANCZOS, centering=(0.5, p.get("focus", 0.5)))
    g = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(g)
    for y in range(H // 2, H): d.line([(0, y), (W, y)], fill=(8, 9, 12, int(215 * (y - H // 2) / (H // 2))))
    im = Image.alpha_composite(im.convert("RGBA"), g); d = ImageDraw.Draw(im)
    d.text((56, 400), "SAAD CAR RENTAL SERVICES", font=font(24), fill=(235, 200, 120, 255))
    t, lines, fnt = p.get("ogTitle", ""), [], font(54)
    cur = ""
    for w in t.split():
        if d.textlength((cur + " " + w).strip(), font=fnt) > W - 112 and cur: lines.append(cur); cur = w
        else: cur = (cur + " " + w).strip()
    lines.append(cur)
    y = 440
    for ln in lines[:2]: d.text((56, y), ln, font=fnt, fill=(255, 255, 255, 255)); y += 66
    d.text((56, 575), "Professional drivers  |  Islamabad, Pakistan", font=font(24), fill=(210, 210, 215, 255))
    name = "saad-car-rental-og" if path == "/" else path.strip("/").replace("/", "-")
    im.convert("RGB").save(OG / f"{name}.jpg", "JPEG", quality=84, optimize=True); print("share image", name)
