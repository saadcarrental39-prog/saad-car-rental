// Google-thumbnail readiness check. Run after `npm run build`:   node scripts/check-thumbnails.mjs
// For every indexable page in the sitemap it checks: canonical, robots (max-image-preview:large), og:image (https, file exists, size), twitter:image,
// a real <img src> main picture near the top that is not lazy and has width/height/alt, JSON-LD primaryImageOfPage / image, and the image sitemap.
// Writes thumbnail-audit.csv and prints every page that still has a problem.
import { readFileSync, existsSync, statSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const dist = new URL("../dist", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const sitemaps = readdirSync(dist).filter((f) => /^sitemap-.*\.xml$/.test(f) && !/images/.test(f));
const urls = sitemaps.flatMap((f) => [...readFileSync(join(dist, f), "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
const imgMap = existsSync(join(dist, "sitemap-images.xml")) ? readFileSync(join(dist, "sitemap-images.xml"), "utf8") : "";
const dims = (buf) => {
  try {
    if (buf[0] === 0xff && buf[1] === 0xd8) { let i = 2; while (i < buf.length) { if (buf[i] !== 0xff) { i++; continue; } const m = buf[i + 1]; if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return [buf.readUInt16BE(i + 7), buf.readUInt16BE(i + 5)]; i += 2 + buf.readUInt16BE(i + 2); } }
    if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") { const t = buf.toString("ascii", 12, 16); if (t === "VP8X") return [1 + buf.readUIntLE(24, 3), 1 + buf.readUIntLE(27, 3)]; if (t === "VP8 ") return [buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff]; if (t === "VP8L") { const b = buf.readUInt32LE(21); return [(b & 0x3fff) + 1, ((b >> 14) & 0x3fff) + 1]; } }
    if (buf[0] === 0x89 && buf[1] === 0x50) return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
  } catch { /* unknown format */ }
  return [0, 0];
};
const rows = []; let bad = 0;
for (const u of urls) {
  const path = new URL(u).pathname; const file = path === "/" ? "index.html" : path.replace(/^\//, "") + ".html";
  const fp = join(dist, file); if (!existsSync(fp)) { rows.push([u, "NO FILE"]); bad++; continue; }
  const h = readFileSync(fp, "utf8"); const meta = (re) => (h.match(re) || [])[1] || "";
  const canon = meta(/rel="canonical" href="([^"]+)"/), robots = meta(/name="robots" content="([^"]+)"/), og = meta(/property="og:image" content="([^"]+)"/), tw = meta(/name="twitter:image" content="([^"]+)"/);
  const body = h.replace(/<head>[\s\S]*?<\/head>/, ""); const imgs = [...body.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]).filter((t) => !/brand\/|alt=""/.test(t));
  const main = imgs[0] || ""; const attr = (t, a) => (t.match(new RegExp(a + '="([^"]*)"')) || [])[1] || "";
  const ogLocal = og ? join(dist, new URL(og).pathname) : ""; const ogOk = ogLocal && existsSync(ogLocal); const ogSize = ogOk ? statSync(ogLocal).size : 0; const [ow, oh] = ogOk ? dims(readFileSync(ogLocal)) : [0, 0];
  const ld = [...h.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]).join(" ");
  const p = [];
  if (canon !== u) p.push("canonical differs");
  if (!/max-image-preview:large/.test(robots)) p.push("no max-image-preview:large");
  if (!/^https:\/\/www\./.test(og)) p.push("og:image not absolute www"); else if (!ogOk) p.push("og:image file missing"); else if (ogSize > 300000) p.push("og:image over 300KB");
  if (ogOk && (ow < 1200 || oh < 600)) p.push(`og:image ${ow}x${oh}`);
  if (!tw) p.push("no twitter:image");
  if (!main) p.push("no crawlable main <img>"); else { if (/lazy/.test(main) && imgs.indexOf(main) === 0) p.push("main image is lazy"); if (!attr(main, "width") || !attr(main, "height")) p.push("main image without width/height"); if (!attr(main, "alt")) p.push("main image without alt"); }
  if (!/primaryImageOfPage/.test(ld)) p.push("no primaryImageOfPage");
  const mainSrc = attr(main, "src"); const inImgMap = imgMap.includes(`<loc>${u}</loc>`);
  if (!inImgMap) p.push("not in image sitemap");
  if (p.length) bad++;
  rows.push([u, canon === u ? "ok" : canon, /max-image-preview:large/.test(robots) ? "yes" : "NO", og.split("/").pop(), `${ow}x${oh}`, ogSize, tw ? "yes" : "NO", mainSrc.split("/").pop(), /lazy/.test(main) ? "lazy" : "eager", attr(main, "width") + "x" + attr(main, "height"), (attr(main, "alt") || "").slice(0, 60), /primaryImageOfPage/.test(ld) ? "yes" : "NO", inImgMap ? "yes" : "NO", p.join("; ")]);
}
const head = ["URL", "canonical", "max-image-preview", "og:image", "og size px", "og bytes", "twitter:image", "main <img> file", "loading", "w x h", "alt", "primaryImageOfPage", "in image sitemap", "problems"];
writeFileSync(new URL("../thumbnail-audit.csv", import.meta.url), [head, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n"));
console.log(`${urls.length} indexable pages checked, ${bad} with something to fix.`);
rows.filter((r) => r[r.length - 1]).forEach((r) => console.log(r[0].replace(/^https:\/\/www\.saadcarremtal\.com/, "") || "/", "->", r[r.length - 1]));
