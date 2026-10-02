// Cloudflare Pages Function: POST /api/booking
// Receives the receipt PNG from the website and delivers it to the owner's WhatsApp via the WhatsApp Business Cloud API.
// Secrets live only here (Cloudflare > Pages > Settings > Environment variables), never in the browser.
//
// Required env:  WA_TOKEN, WA_PHONE_ID, WA_TO (owner number(s), digits with country code, comma separated e.g. 923339850599)
// Optional env:  WA_TEMPLATE (default "new_booking"), WA_LANG (default "en"), WA_MODE ("template" default | "image")
const GRAPH = "https://graph.facebook.com/v21.0";
const MAX_BYTES = 1.5 * 1024 * 1024;
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const clean = (s, n = 60) => String(s || "-").replace(/[\u0000-\u001f<>*_~`]/g, " ").replace(/\s{2,}/g, " ").trim().slice(0, n) || "-";

export async function onRequestPost({ request, env }) {
  if (!env.WA_TOKEN || !env.WA_PHONE_ID || !env.WA_TO) return json({ ok: false, error: "not_configured" }, 503);
  let form;
  try { form = await request.formData(); } catch { return json({ ok: false, error: "bad_request" }, 400); }

  const file = form.get("file");
  if (!file || typeof file === "string" || file.type !== "image/png" || file.size < 1000 || file.size > MAX_BYTES) return json({ ok: false, error: "bad_file" }, 400);
  const name = clean(form.get("name")), phone = clean(form.get("phone"), 25);
  if (name === "-" || !/^[\d+\s()-]{7,25}$/.test(phone)) return json({ ok: false, error: "bad_fields" }, 400);
  const ref = clean(form.get("ref"), 30);
  const trip = `${clean(form.get("pickup"))} to ${clean(form.get("drop"))}`;
  const when = `${clean(form.get("date"), 20)} ${clean(form.get("time"), 10)}`;
  const car = clean(form.get("car"));

  const auth = { Authorization: `Bearer ${env.WA_TOKEN}` };
  try {
    // 1) upload the PNG to WhatsApp
    const up = new FormData();
    up.append("messaging_product", "whatsapp");
    up.append("type", "image/png");
    up.append("file", file, `${ref}.png`);
    const mr = await fetch(`${GRAPH}/${env.WA_PHONE_ID}/media`, { method: "POST", headers: auth, body: up });
    const media = await mr.json();
    if (!mr.ok || !media.id) return json({ ok: false, error: "upload_failed", detail: media?.error?.message }, 502);

    // 2) send it to each owner number
    const tos = String(env.WA_TO).split(",").map((x) => x.replace(/\D/g, "")).filter(Boolean);
    const results = await Promise.all(tos.map(async (to) => {
      const body = env.WA_MODE === "image"
        ? { messaging_product: "whatsapp", to, type: "image", image: { id: media.id, caption: `New booking ${ref}\n${name} (${phone})\n${car}\n${trip}\n${when}` } }
        : { messaging_product: "whatsapp", to, type: "template", template: {
            name: env.WA_TEMPLATE || "new_booking", language: { code: env.WA_LANG || "en" },
            components: [
              { type: "header", parameters: [{ type: "image", image: { id: media.id } }] },
              { type: "body", parameters: [ref, name, phone, car, trip, when].map((text) => ({ type: "text", text })) },
            ] } };
      const r = await fetch(`${GRAPH}/${env.WA_PHONE_ID}/messages`, { method: "POST", headers: { ...auth, "content-type": "application/json" }, body: JSON.stringify(body) });
      return r.ok;
    }));
    return results.some(Boolean) ? json({ ok: true, ref }) : json({ ok: false, error: "send_failed" }, 502);
  } catch {
    return json({ ok: false, error: "network" }, 502);
  }
}

// Open https://YOUR-SITE/api/booking in a browser to check setup (shows only true/false, never secrets).
export const onRequestGet = ({ env }) => json({ configured: !!(env.WA_TOKEN && env.WA_PHONE_ID && env.WA_TO), token: !!env.WA_TOKEN, phoneId: !!env.WA_PHONE_ID, to: !!env.WA_TO, mode: env.WA_MODE || "template", template: env.WA_TEMPLATE || "new_booking" });
export const onRequest = () => json({ ok: false, error: "method_not_allowed" }, 405);
