// POST /api/lead : the website sends what a visitor typed into a booking / contact form (also before they press Send).
// Answers 204 and never slows or breaks the form. Needs the same D1 binding as the dashboard (variable name DB).
import { saveLead } from "../_lib/leads.js";
const empty = () => new Response(null, { status: 204, headers: { "cache-control": "no-store" } });
const json = (o) => new Response(JSON.stringify(o), { headers: { "content-type": "application/json", "cache-control": "no-store" } });

export async function onRequestPost({ request, env, waitUntil }) {
  if (!env.DB || Number(request.headers.get("content-length") || 0) > 6000) return empty();
  let raw = ""; try { raw = await request.text(); } catch { /* empty */ }          // read the body before answering (Workers cannot read it afterwards)
  const job = saveLead({ db: env.DB, kv: env.SITEDATA || env.RECEIPTS || null, request, raw, waitUntil }).catch(() => {});
  if (waitUntil) waitUntil(job); else await job;
  return empty();
}
export const onRequestGet = ({ env }) => json({ ok: true, db: !!env.DB });   // open /api/lead in a browser: {"ok":true,"db":true} = connected
export const onRequest = () => empty();
