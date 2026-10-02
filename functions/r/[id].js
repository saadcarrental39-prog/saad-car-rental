// Cloudflare Pages Function: GET /r/<id>  (page with WhatsApp preview) , /r/<id>.png (full receipt) , /r/<id>.jpg (preview thumbnail)
// Links are unguessable (128-bit random id), not indexed, and expire after 30 days.
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const notFound = () => new Response("Receipt not found or expired.", { status: 404, headers: { "content-type": "text/plain; charset=utf-8", "x-robots-tag": "noindex" } });

export async function onRequestGet({ request, env, params }) {
  if (!env.RECEIPTS) return notFound();
  const m = /^([0-9a-f]{32})(\.png|\.jpg)?$/.exec(String(params.id || ""));
  if (!m) return notFound();
  const [, id, ext] = m;
  const h = { "x-robots-tag": "noindex, nofollow", "cache-control": "private, max-age=3600" };
  if (ext) {
    const buf = await env.RECEIPTS.get(`${ext === ".png" ? "p" : "t"}:${id}`, "arrayBuffer");
    return buf ? new Response(buf, { headers: { ...h, "content-type": ext === ".png" ? "image/png" : "image/jpeg" } }) : notFound();
  }
  const { value, metadata } = await env.RECEIPTS.getWithMetadata(`p:${id}`, "arrayBuffer");
  if (!value) return notFound();
  const origin = new URL(request.url).origin, ref = esc(metadata?.ref || "Booking"), title = `Booking Receipt ${ref}`;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title><meta name="robots" content="noindex,nofollow">
<meta property="og:type" content="website"><meta property="og:title" content="${title}"><meta property="og:description" content="SAAD CAR RENTAL SERVICES - new booking receipt">
<meta property="og:image" content="${origin}/r/${id}.jpg"><meta property="og:image:type" content="image/jpeg"><meta name="twitter:card" content="summary_large_image">
<style>body{margin:0;background:#f2f3f4;font-family:system-ui,sans-serif;text-align:center}img{max-width:100%;height:auto;display:block;margin:0 auto}a{display:inline-block;margin:14px;padding:10px 18px;background:#16181b;color:#fff;border-radius:8px;text-decoration:none}</style></head>
<body><img src="/r/${id}.png" alt="${title}"><a href="/r/${id}.png" download="${ref}.png">Download receipt</a></body></html>`;
  return new Response(html, { headers: { ...h, "content-type": "text/html; charset=utf-8" } });
}
