// Runs in front of EVERY request on Cloudflare Pages. It gives Google exactly ONE address for every page, so Search Console
// stops reporting "Page with redirect" / "Alternative page with proper canonical tag" / soft 404:
//   1. http://  -> https://            (301)
//   2. saadcarremtal.com -> www.       (301, path and ?query kept)   <- the bare domain used to answer 200 itself = duplicate site
//   3. /page/   -> /page               (301)  (canonical, sitemap and internal links never use a trailing slash)
//   4. /PAGE    -> /page               (301, only when the lower-case page exists)
//   5. a URL that does not exist       -> real 404 page (never a 200 "soft 404")
//   6. any other host (xxxx.pages.dev)  -> X-Robots-Tag: noindex, so a preview copy can never compete with the real site
// The list of real pages is written at build time to /known-paths.json by scripts/prerender.mjs.
const ADMIN = "/saad-owner-7k3x9";
const PASS = [/^\/api\//, /^\/r\//, /^\/receipt$/, /^\/\.well-known\//, new RegExp(`^${ADMIN}(/|$)`)];   // handled by their own functions / the admin app
// old addresses (same list as public/_redirects, repeated here so the order of the two features never matters)
const LEGACY = { "/terms-and-conditions": "/terms-of-service", "/cancellation-policy": "/refund-policy", "/cars/mercedes-luxury": "/cars", "/cars/g-vegan": "/cars/mercedes-g-wagon", "/cars/g-wagon": "/cars/mercedes-g-wagon", "/cars/g-wagen": "/cars/mercedes-g-wagon", "/cars/mercedes-g-class": "/cars/mercedes-g-wagon", "/cars/lexus": "/cars/lexus-lx-570", "/cars/lexus-lx570": "/cars/lexus-lx-570", "/cars/lx-570": "/cars/lexus-lx-570", "/cars/lx570": "/cars/lexus-lx-570", "/cars/fortuner": "/cars/toyota-fortuner", "/cars/audi-a6": "/cars/audi", "/cars/audi-car": "/cars/audi", "/cars/land-cruiser-tz": "/cars/premium-luxury-land-cruiser", "/cars/premium-land-cruiser": "/cars/premium-luxury-land-cruiser", "/cars/land-cruiser-2025": "/cars/premium-luxury-land-cruiser", "/cars/land-cruiser-v8-2018": "/cars/land-cruiser-v8", "/cars/land-cruiser-2018": "/cars/land-cruiser-v8" };
const FALLBACK_HOST = "www.saadcarremtal.com";

let known = null, knownAt = 0;
async function knownPaths(env, url) {
  if (known && Date.now() - knownAt < 300000) return known;
  try {
    const r = await env.ASSETS.fetch(new URL("/known-paths.json", url));
    if (!r.ok || !/json/.test(r.headers.get("content-type") || "")) return known;   // keep the old list (or none) if it cannot be read
    known = new Set(await r.json()); knownAt = Date.now();
  } catch { /* ignore: never block the site because of this list */ }
  return known;
}
const go = (to, status = 301) => new Response(null, { status, headers: { Location: to, "Cache-Control": "public, max-age=3600" } });

export async function onRequest({ request, env, next }) {
  const url = new URL(request.url);
  const canonicalHost = (env.CANONICAL_HOST || FALLBACK_HOST).toLowerCase();
  const bare = canonicalHost.replace(/^www\./, "");
  const host = url.hostname.toLowerCase();
  const isSite = host === canonicalHost || host === bare;

  if (isSite && (url.protocol === "http:" || host === bare)) {
    url.protocol = "https:"; url.hostname = canonicalHost; url.port = "";
    return go(url.toString());
  }
  if (!isSite && /(^|\.)pages\.dev$/.test(host) === false && host !== "localhost" && !/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    // some other domain pointing at this site: send visitors to the real one
    url.protocol = "https:"; url.hostname = canonicalHost; url.port = "";
    return go(url.toString());
  }

  let path = url.pathname;
  const isPage = (request.method === "GET" || request.method === "HEAD") && !/\.[a-z0-9]{2,5}$/i.test(path) && !PASS.some((re) => re.test(path));
  if (isPage) {
    if (path.length > 1 && path.endsWith("/")) { url.pathname = path.replace(/\/+$/, "") || "/"; return go(url.toString()); }
    if (LEGACY[path]) { url.pathname = LEGACY[path]; return go(url.toString()); }
    const list = await knownPaths(env, url);
    if (list && !list.has(path)) {
      const lower = path.toLowerCase();
      if (lower !== path && list.has(lower)) { url.pathname = lower; return go(url.toString()); }
      let body = "<!doctype html><title>Page not found</title><h1>Page not found</h1><p><a href=\"/\">Home</a></p>";
      try { const nf = await env.ASSETS.fetch(new URL("/not-found", url)); if (nf.ok) body = await nf.text(); } catch { /* use the tiny page */ }
      return new Response(request.method === "HEAD" ? null : body, { status: 404, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" } });
    }
  }

  const res = await next();
  if (!isSite) { const r = new Response(res.body, res); r.headers.set("X-Robots-Tag", "noindex, nofollow"); return r; }
  return res;
}
