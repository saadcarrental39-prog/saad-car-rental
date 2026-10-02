// Cloudflare Pages Function: POST /api/contact
// Receives the website Contact form and delivers it to the owner's WhatsApp via the WhatsApp Business Cloud API.
// Secrets live only here (Cloudflare > Pages > Settings > Environment variables), never in the browser.
//
// Required env:  WA_TOKEN, WA_PHONE_ID, WA_TO (owner number(s), digits with country code, comma separated)
// Optional env:  WA_CONTACT_TEMPLATE (default "new_enquiry"), WA_LANG (default "en"),
//                WA_MODE ("template" default | "text")  -> "text" only works inside WhatsApp's 24h window (testing)
const GRAPH = "https://graph.facebook.com/v21.0";
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const clean = (s, n = 60) => String(s || "-").replace(/[\u0000-\u001f<>*_~`]/g, " ").replace(/\s{2,}/g, " ").trim().slice(0, n) || "-";

export async function onRequestPost({ request, env }) {
  if (!env.WA_TOKEN || !env.WA_PHONE_ID || !env.WA_TO) return json({ ok: false, error: "not_configured" }, 503);
  let b;
  try { b = await request.json(); } catch { return json({ ok: false, error: "bad_request" }, 400); }
  if (b.website) return json({ ok: true }); // honeypot filled: pretend success, send nothing

  const name = clean(b.name, 60), phone = clean(b.phone, 25), topic = clean(b.topic, 40);
  const car = clean(b.car, 60), date = clean(b.date, 20), message = clean(b.message, 400);
  if (name === "-" || message === "-" || !/^[\d+\s()-]{7,25}$/.test(phone)) return json({ ok: false, error: "bad_fields" }, 400);

  const tos = String(env.WA_TO).split(",").map((x) => x.replace(/\D/g, "")).filter(Boolean);
  const auth = { Authorization: `Bearer ${env.WA_TOKEN}`, "content-type": "application/json" };
  try {
    const results = await Promise.all(tos.map(async (to) => {
      const body = env.WA_MODE === "text"
        ? { messaging_product: "whatsapp", to, type: "text", text: { body: `New enquiry\nName: ${name}\nPhone: ${phone}\nTopic: ${topic}\nVehicle: ${car}\nDate: ${date}\nMessage: ${message}` } }
        : { messaging_product: "whatsapp", to, type: "template", template: {
            name: env.WA_CONTACT_TEMPLATE || "new_enquiry", language: { code: env.WA_LANG || "en" },
            components: [{ type: "body", parameters: [name, phone, topic, car, date, message].map((text) => ({ type: "text", text })) }],
          } };
      const r = await fetch(`${GRAPH}/${env.WA_PHONE_ID}/messages`, { method: "POST", headers: auth, body: JSON.stringify(body) });
      return r.ok;
    }));
    return results.some(Boolean) ? json({ ok: true }) : json({ ok: false, error: "send_failed" }, 502);
  } catch {
    return json({ ok: false, error: "network" }, 502);
  }
}

// Open https://YOUR-SITE/api/contact in a browser to check setup (shows only true/false, never secrets).
export const onRequestGet = ({ env }) => json({ configured: !!(env.WA_TOKEN && env.WA_PHONE_ID && env.WA_TO), template: env.WA_CONTACT_TEMPLATE || "new_enquiry", mode: env.WA_MODE || "template" });
export const onRequest = () => json({ ok: false, error: "method_not_allowed" }, 405);
