// Cloudflare Pages Function: POST /api/receipt-link
// Stores the receipt PNG (+ small JPEG thumbnail for the WhatsApp link preview) in Workers KV and returns a private link.
// The website then opens the owner's WhatsApp chat with that link already typed in -> customer only taps Send.
// Works with normal WhatsApp AND WhatsApp Business (it is just a wa.me chat link). No Meta API needed.
//
// Setup: Cloudflare > Pages > your project > Settings > Functions > KV namespace bindings:
//        Variable name = RECEIPTS   (create a KV namespace, e.g. "receipts")
const MAX_PNG = 1.5 * 1024 * 1024, MAX_THUMB = 300 * 1024;
const TTL = 60 * 60 * 24 * 30; // links stay valid for 30 days
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const isPng = (b) => b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
const isJpg = (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
const cleanRef = (s) => String(s || "").replace(/[^A-Za-z0-9-]/g, "").slice(0, 30);

export async function onRequestPost({ request, env }) {
  if (!env.RECEIPTS) return json({ ok: false, error: "not_configured" }, 503);
  let form;
  try { form = await request.formData(); } catch { return json({ ok: false, error: "bad_request" }, 400); }
  const file = form.get("file"), thumb = form.get("thumb");
  if (!file || typeof file === "string" || file.size < 1000 || file.size > MAX_PNG) return json({ ok: false, error: "bad_file" }, 400);
  if (!thumb || typeof thumb === "string" || thumb.size < 200 || thumb.size > MAX_THUMB) return json({ ok: false, error: "bad_thumb" }, 400);
  const png = new Uint8Array(await file.arrayBuffer()), jpg = new Uint8Array(await thumb.arrayBuffer());
  if (!isPng(png) || !isJpg(jpg)) return json({ ok: false, error: "bad_file" }, 400);

  const id = [...crypto.getRandomValues(new Uint8Array(16))].map((x) => x.toString(16).padStart(2, "0")).join("");
  const ref = cleanRef(form.get("ref"));
  try {
    await Promise.all([
      env.RECEIPTS.put(`p:${id}`, png, { expirationTtl: TTL, metadata: { ref } }),
      env.RECEIPTS.put(`t:${id}`, jpg, { expirationTtl: TTL }),
    ]);
  } catch { return json({ ok: false, error: "storage" }, 502); }
  return json({ ok: true, url: `${new URL(request.url).origin}/r/${id}` });
}

// Open https://YOUR-SITE/api/receipt-link to check the KV binding (true/false only).
export const onRequestGet = ({ env }) => json({ configured: !!env.RECEIPTS });
export const onRequest = () => json({ ok: false, error: "method_not_allowed" }, 405);
