// GET /api/spot-images.xml : Google image sitemap for the Murree spot photos saved in the admin app (listed in robots.txt).
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export async function onRequestGet({ request, env }) {
  const origin = new URL(request.url).origin, kv = env.SITEDATA || env.RECEIPTS;
  let spots = {};
  try { if (kv) spots = JSON.parse((await kv.get("site:spots")) || "{}").spots || {}; } catch { /* empty */ }
  const abs = (u) => (u.startsWith("/") ? origin + u : u);
  const items = Object.entries(spots).filter(([, l]) => Array.isArray(l) && l.length).map(([slug, l]) =>
    `<url><loc>${esc(`${origin}/murree-tourist-spots/${slug}`)}</loc>${l.map((i) => `<image:image><image:loc>${esc(abs(i.url))}</image:loc>${i.alt ? `<image:title>${esc(i.alt)}</image:title>` : ""}${i.caption ? `<image:caption>${esc(i.caption)}</image:caption>` : ""}</image:image>`).join("")}</url>`);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${items.join("\n")}\n</urlset>\n`;
  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
