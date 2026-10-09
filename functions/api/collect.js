// POST /api/visit  (also /api/collect)  called by the website; answers 204 so it can never slow or break the site.
// Needs a D1 database bound to the Pages project with the variable name DB (see README-INSIGHTS.md). Without it, this does nothing.
// Add ?debug=1 to get a JSON answer instead (used by the dashboard's "Tracking test" button).
import { collect } from "../_lib/stats.js";
const empty = () => new Response(null, { status: 204, headers: { "cache-control": "no-store" } });
const json = (o) => new Response(JSON.stringify(o), { headers: { "content-type": "application/json", "cache-control": "no-store" } });

export async function onRequestPost({ request, env, waitUntil }) {
  const debug = new URL(request.url).searchParams.get("debug") === "1";
  if (!env.DB) return debug ? json({ ok: false, reason: "no_db" }) : empty();
  if (Number(request.headers.get("content-length") || 0) > 2048) return debug ? json({ ok: false, reason: "too_big" }) : empty();
  let raw = ""; try { raw = await request.text(); } catch { /* empty body */ }   // read it NOW: a Worker cannot read the body after the response was sent
  const job = collect(env.DB, request, raw);
  if (debug) { try { return json({ ok: true, result: await job }); } catch (e) { return json({ ok: false, reason: String((e && e.message) || e).slice(0, 160) }); } }
  const safe = job.catch(() => {});
  if (waitUntil) waitUntil(safe); else await safe;
  return empty();
}
// Open  https://YOUR-SITE/api/visit  in a browser to check the connection: {"ok":true,"db":true} means the D1 binding works.
export const onRequestGet = ({ env }) => json({ ok: true, db: !!env.DB });
export const onRequest = () => empty();
