// Supabase (Postgres) connection for Cloudflare Pages Functions.
// It talks to the Supabase REST API with plain fetch(): no extra npm package is needed, so the build cannot break because of it.
// Cloudflare Pages > Settings > Variables and Secrets:   SUPABASE_URL  (https://xxxx.supabase.co)   and   SUPABASE_SERVICE_ROLE_KEY  (the SECRET key, never the public one).
// While both variables are set, the Insights dashboard and the Clients list use Supabase. Delete them and the old Cloudflare D1 code runs again (rollback).
export const hasSb = (env) => !!(env && env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);

/** Calls one database function (see supabase-setup.sql). Returns the JSON it answers, or null when it answers nothing. Throws on any error. */
export async function rpc(env, fn, args = {}) {
  // Pasted values often carry hidden characters (new line, space, zero-width mark): keep only visible ASCII, otherwise fetch() throws "invalid header value".
  const base = String(env.SUPABASE_URL).replace(/[^\x21-\x7E]/g, "").replace(/\/+$/, ""), key = String(env.SUPABASE_SERVICE_ROLE_KEY).replace(/[^\x21-\x7E]/g, "");
  const headers = { apikey: key, "content-type": "application/json", accept: "application/json" };
  if (key.startsWith("eyJ")) headers.authorization = `Bearer ${key}`;   // old-style (legacy JWT) keys also go in Authorization; the new sb_secret_ keys must NOT
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 8000);
  try {
    const r = await fetch(`${base}/rest/v1/rpc/${fn}`, { method: "POST", headers, body: JSON.stringify(args), signal: ctl.signal });
    const text = await r.text();
    if (!r.ok) { let m = text; try { const j = JSON.parse(text); m = j.message || j.hint || text; } catch { /* keep raw text */ } throw new Error(`supabase_${r.status}: ${String(m).slice(0, 140)}`); }
    if (!text) return null;
    try { return JSON.parse(text); } catch { return null; }
  } catch (e) {
    if (e && e.name === "AbortError") throw new Error("supabase_timeout");
    throw e;
  } finally { clearTimeout(timer); }
}
