# Generates the 1200x630 share images (WhatsApp / Facebook / Telegram / LinkedIn previews) into public/images/og/.
# Run `npm run seo:og` after adding pages. Uses real vehicle photos from public/assets/vehicles and the real logo.
import json, os, textwrap
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W, H = 1200, 630
FONT_B = next(p for p in ["/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"] if os.path.exists(p))
FONT_M = next(p for p in ["/usr/share/fonts/opentype/inter/Inter-Medium.otf", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"] if os.path.exists(p))
data = json.load(open(".seo-build/pages.json")); os.makedirs("public/images/og", exist_ok=True)
logo = Image.open("public/assets/brand/saadcar-logo-light-1200.png").convert("RGBA")
def bg():
    im = Image.new("RGB", (W, H)); px = im.load()
    for y in range(H):
        for x in range(W):
            t = (x / W * 0.6 + y / H * 0.4); px[x, y] = (int(13 + 26 * t), int(13 + 26 * t), int(16 + 28 * t))
    glow = Image.new("RGB", (W, H), (0, 0, 0)); d = ImageDraw.Draw(glow); d.ellipse((560, 60, 1260, 700), fill=(60, 62, 72)); glow = glow.filter(ImageFilter.GaussianBlur(120))
    return Image.blend(im, Image.composite(glow, im, glow.convert("L")), 0.55)
BASE = bg()
def fit(draw, text, maxw, start, minsz=34):
    for sz in range(start, minsz - 1, -2):
        f = ImageFont.truetype(FONT_B, sz)
        words, lines, cur = text.split(), [], ""
        for w in words:
            t = (cur + " " + w).strip()
            if draw.textlength(t, font=f) <= maxw: cur = t
            else: lines.append(cur); cur = w
        lines.append(cur)
        if len(lines) <= 2: return f, lines
    return f, lines
for p in data["pages"]:
    im = BASE.copy().convert("RGBA"); d = ImageDraw.Draw(im)
    # vehicle photo, right side, with soft shadow
    if p.get("vehicle") and os.path.exists("public" + p["vehicle"]):
        car = Image.open("public" + p["vehicle"]).convert("RGBA"); w = 640; car = car.resize((w, int(car.height * w / car.width)))
        sh = Image.new("RGBA", im.size, (0, 0, 0, 0)); a = car.split()[3].point(lambda v: int(v * 0.55)); blk = Image.new("RGBA", car.size, (0, 0, 0, 255)); sh.paste(blk, (540, 250), a)
        im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(22))); im.alpha_composite(car, (540, 215))
    lg = logo.resize((200, int(logo.height * 200 / logo.width))); im.alpha_composite(lg, (60, 48))
    f, lines = fit(d, p["a"], 600, 76)
    y = 190
    for ln in lines: d.text((60, y), ln, font=f, fill=(255, 255, 255)); y += int(f.size * 1.08)
    d.text((60, y + 10), p["b"], font=ImageFont.truetype(FONT_M, 30), fill=(190, 194, 205))
    if p.get("c"): d.text((60, y + 56), p["c"], font=ImageFont.truetype(FONT_M, 24), fill=(150, 154, 166))
    # bottom bar
    d.rectangle((0, 560, W, H), fill=(10, 10, 12)); d.text((60, 582), "SAAD CAR RENTAL WITH DRIVER · Islamabad", font=ImageFont.truetype(FONT_M, 22), fill=(205, 208, 216))
    tw = d.textlength("Call / WhatsApp  " + data["phone"], font=ImageFont.truetype(FONT_B, 26))
    d.rounded_rectangle((W - 60 - tw - 40, 574, W - 60, 618), radius=22, fill=(37, 211, 102)); d.text((W - 60 - tw - 20, 580), "Call / WhatsApp  " + data["phone"], font=ImageFont.truetype(FONT_B, 26), fill=(7, 33, 15))
    im.convert("RGB").save(f"public/images/og/{p['key']}.jpg", "JPEG", quality=84, optimize=True, progressive=True)
print("og images:", len(data["pages"]))
