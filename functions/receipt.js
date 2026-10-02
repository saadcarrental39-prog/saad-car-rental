// /receipt?d=...  Same React page for people, but adds a rich preview (title + picture) for WhatsApp's link preview.
// No storage and no setup needed: the booking lives inside the link itself.
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const res = await env.ASSETS.fetch(new URL("/", url));
  let title = "Booking Receipt | SAAD CAR RENTAL SERVICES", desc = "Booking request receipt";
  try {
    const b = (url.searchParams.get("d") || "").replace(/-/g, "+").replace(/_/g, "/");
    const j = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(b), (c) => c.charCodeAt(0))));
    title = `Booking Receipt ${String(j.r || "").slice(0, 16)}`;
    desc = [j.n, [j.d, j.t].filter(Boolean).join(" "), [j.u, j.o].filter(Boolean).join(" to ")].filter(Boolean).join(" · ").slice(0, 150) || desc;   // no phone number in the preview
  } catch { /* keep defaults */ }
  const tags = `<meta name="robots" content="noindex,nofollow"><meta property="og:type" content="website"><meta property="og:site_name" content="SAAD CAR RENTAL SERVICES">` +
    `<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:image" content="${url.origin}/assets/receipt-og.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">`;
  const out = new HTMLRewriter().on("head", { element(e) { e.append(tags, { html: true }); } }).transform(new Response(res.body, res));
  out.headers.set("cache-control", "no-store"); out.headers.set("referrer-policy", "no-referrer"); out.headers.set("x-robots-tag", "noindex");
  return out;
}
