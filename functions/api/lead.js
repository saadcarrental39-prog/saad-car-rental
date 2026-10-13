// POST /api/lead : the website sends what a visitor typed into a booking / contact form (also before they press Send).
// Answers 204 and never slows or breaks the form. Uses the same storage as the dashboard: Supabase (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY) or, if those are not set, the old D1 binding DB.
import { saveLead } from "../_lib/leads.js";
import { hasSb } from "../_lib/sb.js";
import { saveLead as sbSaveLead } from "../_lib/sbleads.js";
const empty = () => new Response(null, { status: 204, headers: { "cache-control": "no-store" } });
const json = (o) => new Response(JSON.stringify(o), { headers: { "content-type": "application/json", "cache-control": "no-store" } });

export async function onRequestPost({ request, env, waitUntil }) {
  const sb = hasSb(env);
  if ((!sb && !env.DB) || Number(request.headers.get("content-length") || 0) > 6000) return empty();
  let raw = ""; try { raw = await request.text(); } catch { /* empty */ }          // read the body before answering (Workers cannot read it afterwards)
  const kv = env.SITEDATA || env.RECEIPTS || null;
  const job = (sb ? sbSaveLead({ env, kv, request, raw, waitUntil }) : saveLead({ db: env.DB, kv, request, raw, waitUntil })).catch(() => {});
  if (waitUntil) waitUntil(job); else await job;
  return empty();
}
export const onRequestGet = ({ env }) => json({ ok: true, db: hasSb(env) || !!env.DB, store: hasSb(env) ? "supabase" : env.DB ? "d1" : "none" });   // open /api/lead in a browser: {"ok":true,"db":true} = connected
export const onRequest = () => empty();
