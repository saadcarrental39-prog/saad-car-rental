// POST /api/collect  (called by the website through navigator.sendBeacon; always answers 204 so it can never slow or break the site)
// Needs a D1 database bound to the Pages project with the variable name DB (see README-INSIGHTS.md). Without it, this does nothing.
import { collect } from "../_lib/stats.js";
const empty = () => new Response(null, { status: 204, headers: { "cache-control": "no-store" } });

export async function onRequestPost({ request, env, waitUntil }) {
  if (!env.DB || Number(request.headers.get("content-length") || 0) > 2048) return empty();
  const job = collect(env.DB, request).catch(() => {});
  if (waitUntil) waitUntil(job); else await job;
  return empty();
}
// Open  https://YOUR-SITE/api/collect  in a browser to check the connection: {"ok":true,"db":true} means the D1 binding works.
export const onRequestGet = ({ env }) => new Response(JSON.stringify({ ok: true, db: !!env.DB }), { headers: { "content-type": "application/json", "cache-control": "no-store" } });
export const onRequest = () => empty();
