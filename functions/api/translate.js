// POST /api/translate   { text, to, from }  ->  { text }
// Translates a review into the visitor's language with Cloudflare Workers AI (model m2m100). Needs an AI binding named "AI"
// (Cloudflare Pages > Settings > Functions > Bindings > Workers AI). Without it the site simply opens Google Translate instead.
const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const OK = new Set(["urdu", "english", "arabic", "chinese", "french", "german", "spanish", "japanese", "russian", "turkish", "korean"]);
export async function onRequestPost({ request, env }) {
  const origin = request.headers.get("origin"); if (origin && new URL(origin).host !== new URL(request.url).host) return J({ error: "forbidden" }, 403);
  let b; try { b = await request.json(); } catch { return J({ error: "bad_request" }, 400); }
  const text = String(b.text || "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 1500), to = String(b.to || ""), from = String(b.from || "english");
  if (text.length < 2 || !OK.has(to) || !OK.has(from)) return J({ error: "bad_request" }, 400);
  if (!env.AI) return J({ fallback: true }, 503);
  const kv = env.SITEDATA || env.RECEIPTS || env.REVIEWS_KV;
  if (kv) {   // light limit per visitor: 40 translations an hour (keeps the AI bill at zero for bots)
    const k = `tl:${request.headers.get("CF-Connecting-IP") || "x"}:${new Date().toISOString().slice(0, 13)}`; const n = Number((await kv.get(k)) || 0);
    if (n >= 40) return J({ error: "slow_down" }, 429); await kv.put(k, String(n + 1), { expirationTtl: 3700 });
  }
  try {
    const parts = text.split(/\n{2,}/).filter(Boolean), out = [];
    for (const p of parts.slice(0, 6)) { const r = await env.AI.run("@cf/meta/m2m100-1.2b", { text: p, source_lang: from, target_lang: to }); out.push(r.translated_text || ""); }
    const res = out.join("\n\n").trim(); return res ? J({ text: res }) : J({ fallback: true }, 502);
  } catch { return J({ fallback: true }, 502); }
}
