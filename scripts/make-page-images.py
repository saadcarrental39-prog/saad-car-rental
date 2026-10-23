#!/usr/bin/env python3
"""Turns the photos in page-images-src/ into website images.
  page-images-src/murree__3_.jpg  ->  public/assets/pages/murree-3.webp (+ -640.webp) and the manifest
  and builds the share image (1200x630 jpg) for every page in src/seo/data/pageImages.json.
To change a picture: put the new .jpg in page-images-src/ with the SAME name (or a new name listed in pageImages.json), then run:  python scripts/make-page-images.py
Name -> key: lower case, every group of other characters becomes '-'  (f6_super_market.jpg -> f6-super-market)."""
import json, re, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps
R = Path(__file__).resolve().parent.parent
SRC, OUT, OG = R / "page-images-src", R / "public/assets/pages", R / "public/images/og"
OUT.mkdir(parents=True, exist_ok=True)
key = lambda n: re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", n.lower())).strip("-")
man = {}
for f in sorted(SRC.glob("*.jpg")) + sorted(SRC.glob("*.jpeg")) + sorted(SRC.glob("*.png")) + sorted(SRC.glob("*.webp")):
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
W, H = 1200, 630
def wrap(d, t, fnt, maxw):
    lines, cur = [], ""
    for w in t.split():
        if d.textlength((cur + " " + w).strip(), font=fnt) > maxw and cur: lines.append(cur); cur = w
        else: cur = (cur + " " + w).strip()
    return lines + [cur]
def save_jpg(im, path):
    for q in (86, 80, 74, 68):                       # WhatsApp ignores share images that are too heavy: keep them small
        im.save(path, "JPEG", quality=q, optimize=True, progressive=True)
        if path.stat().st_size < 230_000: break
for path, p in pages.items():
    k = p.get("og")
    if k not in man: print("skip share image (photo missing):", path, k); continue
    src = Image.open(OUT / f"{k}.webp").convert("RGB")
    if man[k]["w"] >= 1000:                          # sharp photo: full-bleed with the title on a dark gradient
        im = ImageOps.fit(src, (W, H), Image.LANCZOS, centering=(0.5, p.get("focus", 0.5)))
        g = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(g)
        for y in range(H // 2, H): d.line([(0, y), (W, y)], fill=(8, 9, 12, int(215 * (y - H // 2) / (H // 2))))
        im = Image.alpha_composite(im.convert("RGBA"), g); d = ImageDraw.Draw(im)
        d.text((56, 400), "SAAD CAR RENTAL SERVICES", font=font(24), fill=(235, 200, 120, 255))
        y = 440
        for ln in wrap(d, p.get("ogTitle", ""), font(54), W - 112)[:2]: d.text((56, y), ln, font=font(54), fill=(255, 255, 255, 255)); y += 66
        d.text((56, 575), "Professional drivers  |  Islamabad, Pakistan", font=font(24), fill=(210, 210, 215, 255))
    else:                                            # smaller photo: blurred copy as background + the sharp photo as a framed card (never stretched)
        bg = ImageOps.fit(src, (W, H), Image.LANCZOS).filter(ImageFilter.GaussianBlur(26)).point(lambda v: int(v * 0.42))
        im = bg.convert("RGBA"); d = ImageDraw.Draw(im)
        ph = src.copy(); ph.thumbnail((560, 400), Image.LANCZOS)
        mask = Image.new("L", ph.size, 0); ImageDraw.Draw(mask).rounded_rectangle((0, 0, ph.width - 1, ph.height - 1), 22, fill=255)
        oy = 125 + (400 - ph.height) // 2
        sh = Image.new("RGBA", (W, H), (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle((600, oy, 600 + ph.width, oy + ph.height), 22, fill=(0, 0, 0, 170))
        im = Image.alpha_composite(im, sh.filter(ImageFilter.GaussianBlur(18))); im.paste(ph, (600, oy), mask); d = ImageDraw.Draw(im)
        d.text((56, 130), "SAAD CAR RENTAL SERVICES", font=font(24), fill=(235, 200, 120, 255))
        y = 190
        for ln in wrap(d, p.get("ogTitle", ""), font(50), 500)[:4]: d.text((56, y), ln, font=font(50), fill=(255, 255, 255, 255)); y += 62
        d.text((56, 560), "Professional drivers  |  Islamabad, Pakistan", font=font(24), fill=(210, 210, 215, 255))
    name = "saad-car-rental-og" if path == "/" else path.strip("/").replace("/", "-")
    save_jpg(im.convert("RGB"), OG / f"{name}.jpg"); print("share image", name)
# small card thumbnails of every share image (used by the link cards on hub pages) + the list of which exist
TH = OG / "thumb"; TH.mkdir(exist_ok=True); names = []
for f in sorted(OG.glob("*.jpg")):
    Image.open(f).convert("RGB").resize((480, 252), Image.LANCZOS).save(TH / f"{f.stem}.webp", "WEBP", quality=74, method=6); names.append(f.stem)
(R / "src/seo/data/thumbManifest.json").write_text(json.dumps(names))
print("thumbs", len(names))
