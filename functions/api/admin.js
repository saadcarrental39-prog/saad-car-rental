// POST /api/admin  { action: "login" | "load" | "save" | "upload", ... }
// The password is checked HERE on the server (never in the browser). Set in Cloudflare Pages > Settings > Variables:
//   ADMIN_USER, ADMIN_PASS (secret)   optional: ADMIN_SECRET (extra signing secret)
// Storage: KV binding SITEDATA (or the existing RECEIPTS binding).
const enc = new TextEncoder();
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const same = (a, b) => { a = String(a); b = String(b); let d = a.length ^ b.length; for (let i = 0; i < Math.max(a.length, b.length); i++) d |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0); return d === 0; };
async function sign(env, msg) {
  const key = await crypto.subtle.importKey("raw", enc.encode(`${env.ADMIN_SECRET || ""}|${env.ADMIN_PASS}|${env.ADMIN_USER}|saad-admin-v1`), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(msg))))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
const mint = async (env) => { const exp = String(Date.now() + 30 * 864e5); return `${exp}.${await sign(env, exp)}`; };   // valid 30 days; changing the password logs everyone out
const valid = async (env, t) => { const [exp, sig] = String(t).split("."); return !!(exp && sig && Number(exp) > Date.now() && same(sig, await sign(env, exp))); };

const s = (x, n) => String(x ?? "").replace(/[\u0000-\u001f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, n);
const slug = (x) => s(x, 40).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const price = (x) => { const n = Math.round(Number(x)); return n > 0 && n < 10000000 ? n : null; };
const img = (x) => (/^\/api\/img\/[a-f0-9]{16}$/.test(String(x)) || /^\/assets\/[A-Za-z0-9._\/-]{1,120}$/.test(String(x)) ? String(x) : "");
const THEMES = ["white", "black", "grey", "red", "plum", "blue"];
function fields(o) {
  const r = {};
  if ("price" in o) r.price = price(o.price);
  if (o.hidden) r.hidden = true;
  for (const [k, n] of [["name", 60], ["trim", 30], ["color", 40], ["subtitle", 40], ["description", 200]]) if (s(o[k], n)) r[k] = s(o[k], n);
  if (img(o.image)) r.image = img(o.image);
  return r;
}
function clean(d) {
  d = d && typeof d === "object" ? d : {};
  const out = { v: 1, vehicles: {}, added: [], cats: [] };
  for (const [id, o] of Object.entries(d.vehicles || {}).slice(0, 200)) if (slug(id) && o && typeof o === "object") out.vehicles[slug(id)] = fields(o);
  const cats = new Set();
  for (const c of (d.cats || []).slice(0, 20)) { const sl = slug(c.slug || c.title), title = s(c.title, 40); if (sl && title && !cats.has(sl)) { cats.add(sl); out.cats.push({ slug: sl, title, description: s(c.description, 200) }); } }
  const ids = new Set();
  for (const a of (d.added || []).slice(0, 100)) {
    const id = slug(a.id), cat = slug(a.cat);
    if (!id || !cat || ids.has(id) || !s(a.name, 60)) continue; ids.add(id);
    out.added.push({ id, cat, theme: THEMES.includes(a.theme) ? a.theme : "white", ...fields(a), name: s(a.name, 60) });
  }
  return out;
}
export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_USER || !env.ADMIN_PASS) return json({ error: "admin_not_configured" }, 503);
  const kv = env.SITEDATA || env.RECEIPTS; if (!kv) return json({ error: "no_storage" }, 503);
  if (Number(request.headers.get("content-length") || 0) > 1.7e6) return json({ error: "too_big" }, 413);
  let b; try { b = await request.json(); } catch { return json({ error: "bad_request" }, 400); }
  if (b.action === "login") {
    const rl = `rl:admin:${request.headers.get("CF-Connecting-IP") || "x"}`, tries = Number(await kv.get(rl)) || 0;
    if (tries >= 8) return json({ error: "too_many" }, 429);
    if (same(s(b.user, 60), env.ADMIN_USER) & same(String(b.pass || "").slice(0, 200), env.ADMIN_PASS)) return json({ token: await mint(env) });
    await kv.put(rl, String(tries + 1), { expirationTtl: 900 });
    return json({ error: "invalid" }, 401);
  }
  if (!(await valid(env, (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "")))) return json({ error: "unauthorized" }, 401);
  if (b.action === "load") { try { return json({ data: JSON.parse((await kv.get("site:fleet")) || "{}") }); } catch { return json({ data: {} }); } }
  if (b.action === "save") {
    const data = clean(b.data), old = await kv.get("site:fleet");
    if (old) await kv.put("site:fleet:prev", old);              // one step of undo-backup
    await kv.put("site:fleet", JSON.stringify(data));
    return json({ ok: true, data });
  }
  if (b.action === "upload") {
    const m = /^data:(image\/(?:webp|png|jpeg));base64,([A-Za-z0-9+\/=]+)$/.exec(String(b.image || ""));
    if (!m) return json({ error: "bad_image" }, 400);
    const bytes = Uint8Array.from(atob(m[2]), (c) => c.charCodeAt(0));
    const ok = (m[1] === "image/png" && bytes[0] === 0x89 && bytes[1] === 0x50) || (m[1] === "image/jpeg" && bytes[0] === 0xff && bytes[1] === 0xd8) || (m[1] === "image/webp" && bytes[0] === 0x52 && bytes[8] === 0x57);
    if (!ok || bytes.length > 900 * 1024) return json({ error: "bad_image" }, 400);
    const id = [...crypto.getRandomValues(new Uint8Array(8))].map((x) => x.toString(16).padStart(2, "0")).join("");
    await kv.put(`img:${id}`, bytes, { metadata: { type: m[1] } });
    return json({ url: `/api/img/${id}` });
  }
  return json({ error: "bad_action" }, 400);
}
