// Runs after `vite build` (see package.json "build"). Turns the single-page app into real HTML for every public URL and writes
// sitemap.xml (segmented), robots.txt. Output goes into dist/. Needs only packages that Vite already installs (esbuild).
import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd(), dist = join(root, "dist"), work = join(root, ".seo-build");
if (!existsSync(join(dist, "index.html"))) { console.error("dist/index.html not found: run `vite build` first."); process.exit(1); }

// ---- env (same VITE_* values the browser build used)
let env = {};
try { const { loadEnv } = await import("vite"); env = loadEnv("production", root, "VITE_"); } catch { env = Object.fromEntries(Object.entries(process.env).filter(([k]) => k.startsWith("VITE_"))); }
let buildId = "ssr"; try { buildId = JSON.parse(readFileSync(join(dist, "version.json"), "utf8")).id; } catch { /* ignore */ }

// ---- bundle the server entry. import.meta.glob (poster images) has no meaning here, so it becomes {}
await build({
  entryPoints: [join(root, "src/ssr/entry-server.jsx")], outfile: join(work, "entry.mjs"), bundle: true, platform: "node", format: "esm",
  // react / react-dom stay external (one React copy); router + gsap are bundled so Node never has to guess their module format
  external: ["react", "react-dom", "react-dom/server", "react/jsx-runtime"], mainFields: ["module", "main"], jsx: "automatic", logLevel: "error", sourcemap: false,
  banner: { js: 'import { createRequire as __cr } from "node:module"; const require = __cr(import.meta.url);' },
  define: { "process.env.NODE_ENV": '"production"', "import.meta.env": JSON.stringify({ ...env, PROD: true }), __BUILD_ID__: JSON.stringify(buildId) },
  loader: { ".webp": "empty", ".png": "empty", ".jpg": "empty", ".svg": "empty", ".css": "empty", ".mp3": "empty", ".mp4": "empty" },
  plugins: [{ name: "no-glob", setup(b) { b.onLoad({ filter: /src[\\/]data[\\/]services\.js$/ }, (a) => ({ contents: readFileSync(a.path, "utf8").replace(/import\.meta\.glob\([^)]*\)/g, "{}"), loader: "js" })); } }],
});
const mod = await import(pathToFileURL(join(work, "entry.mjs")).href);
const { PAGES, render, BUSINESS, ADMIN_PATH, baseFleet, imgSet, HERO_SIZES, notFoundHead, headHtml } = mod;

// ---- quiet the harmless React "useLayoutEffect does nothing on the server" warning
const err = console.error; console.error = (...a) => { if (!/useLayoutEffect|fetchpriority/.test(String(a[0]))) err(...a); };

// ---- write every page
// The main stylesheet is small, so it is put INSIDE every page (a <style> block) instead of a separate render-blocking file:
// one request less before the first paint. Admin / lazy files keep their own files. Skipped automatically if the CSS is large.
let template = readFileSync(join(dist, "index.html"), "utf8");
template = template.replace(/<link\b[^>]*>/g, (tag) => {
  const href = /rel="stylesheet"/.test(tag) && (/href="(\/bundle\/[^"]+\.css)"/.exec(tag) || [])[1];
  if (!href) return tag;
  const css = readFileSync(join(dist, href), "utf8");
  if (css.length > 120000) return tag;
  console.log(`prerender: main stylesheet inlined (${Math.round(css.length / 1024)} KB, ${href})`);
  return `<style>${css}</style>`;
});
const strip = (h) => h.replace(/<title>[\s\S]*?<\/title>\s*/i, "").replace(/<meta\s+name="description"[^>]*>\s*/i, "");
let written = 0;
for (const page of PAGES) {
  const { html, head } = render(page.path);
  if (!html || html.length < 500) throw new Error(`Empty render for ${page.path}`);
  // Home page: tell the browser to start downloading the big hero picture straight away (it is the "Largest Contentful Paint" element).
  let preload = "";
  if (page.path === "/") {
    const hero = baseFleet.flatMap((c) => c.vehicles).find((v) => !v.placeholder), s = hero && imgSet(hero.image, HERO_SIZES);
    if (hero) preload = `\n<link rel="preload" as="image" href="${hero.image}"${s.srcSet ? ` imagesrcset="${s.srcSet}" imagesizes="${s.sizes}"` : ""} fetchpriority="high">`;
  }
  let out = strip(template).replace("</head>", `${head}${preload}\n</head>`);
  if (!out.includes('<div id="root"></div>')) throw new Error('index.html is missing <div id="root"></div>');
  out = out.replace('<div id="root"></div>', `<div id="root">${html}</div>`);
  // flat file (routes/x.html, not routes/x/index.html): Cloudflare Pages serves it at /routes/x with NO redirect to /routes/x/, which matches our canonical and sitemap
  const file = page.path === "/" ? join(dist, "index.html") : join(dist, `${page.path}.html`);
  mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, out); written++;
}
console.log(`prerender: wrote ${written} HTML pages`);

// ---- sitemaps (only canonical, indexable, public pages; indexable=false pages are excluded automatically)
const site = BUSINESS.website, today = new Date().toISOString().slice(0, 10);
const x = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const urlset = (items, ns = "") => `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${ns}>\n${items.join("\n")}\n</urlset>\n`;
// ---- real "not found" page (served with status 404 by functions/_middleware.js for URLs that do not exist; otherwise the single-page
// fallback would answer 200 for every wrong URL = "soft 404" in Google Search Console)
{
  const { html } = render("/page-not-found-xyz");
  const nf = strip(template).replace("</head>", `${headHtml(notFoundHead())}\n</head>`).replace('<div id="root"></div>', `<div id="root">${html}</div>`);
  writeFileSync(join(dist, "not-found.html"), nf);
  // every URL that really exists (the middleware uses this list; anything else gets the 404 page)
  writeFileSync(join(dist, "known-paths.json"), JSON.stringify(PAGES.map((p) => p.path)));
}

const urlTag = (p, extra = "") => `<url><loc>${x(site + (p.path === "/" ? "/" : p.path))}</loc><lastmod>${(p.updated || BUSINESS.contentUpdated)}</lastmod>${extra}</url>`;   // lastmod = the content review date in business.config.js (stable between deploys)
const idx = PAGES.filter((p) => p.indexable);
const groups = {
  "sitemap-pages.xml": idx.filter((p) => ["app", "about", "contact", "hub", "faq", "airport", "guide", "legal", "audience", "pillar", "info", "article"].includes(p.kind)),
  "sitemap-islamabad.xml": idx.filter((p) => p.kind === "spot"),
  "sitemap-vehicles.xml": idx.filter((p) => p.kind === "vehicle"),
  "sitemap-services.xml": idx.filter((p) => p.kind === "service"),
  "sitemap-locations.xml": idx.filter((p) => p.kind === "location" || p.kind === "province"),
  "sitemap-destinations.xml": idx.filter((p) => p.kind === "destination"),
  "sitemap-routes.xml": idx.filter((p) => p.kind === "route"),
};
const IMG = ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"';
const imgTag = (u, t) => `<image:image><image:loc>${x(u)}</image:loc><image:title>${x(t)}</image:title></image:image>`;
const files = [];
for (const [name, list] of Object.entries(groups)) { if (!list.length) continue; writeFileSync(join(dist, name), urlset(list.map((p) => urlTag(p)))); files.push(name); }
// image sitemap: real vehicle photos (linked from their vehicle page) + each page's share image
const imgItems = idx.map((p) => {
  const imgs = [];
  if (p.kind === "vehicle") { const c = baseFleet.find((c) => c.slug === p.slug); (c ? c.vehicles : []).filter((v) => !v.placeholder).forEach((v) => imgs.push(imgTag(site + v.image, `${v.color} ${v.name} ${v.trim} with professional driver`.replace(/\s+/g, " ")))); }
  imgs.push(imgTag(site + p.ogImage, p.h1));
  return urlTag(p, imgs.join(""));
});
writeFileSync(join(dist, "sitemap-images.xml"), urlset(imgItems, IMG)); files.push("sitemap-images.xml");
writeFileSync(join(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${files.map((f) => `<sitemap><loc>${site}/${f}</loc></sitemap>`).join("\n")}\n</sitemapindex>\n`);

// ---- /.well-known/ai-catalog.json : the list of public resources that AI agents may discover (Agentic Resource Discovery, ARD).
// Only real, public things that exist on this website are listed. No invented tools, APIs or agents.
const host = new URL(site).hostname, urn = (n) => `urn:air:${host}:${n}`;
const catalog = {
  specVersion: "1.0",
  host: { displayName: BUSINESS.businessName, documentationUrl: site + "/", logoUrl: site + "/icons/saad-512.png" },
  entries: [
    { identifier: urn("site:website"), displayName: `${BUSINESS.businessName} website`, type: "text/html", url: site + "/",
      description: "Car rental with a professional driver in Islamabad: vehicles, services, airport transfers and routes across Pakistan.",
      tags: ["car-rental", "chauffeur", "islamabad", "pakistan"],
      representativeQueries: ["car rental with driver in Islamabad", "Land Cruiser rental with driver for airport transfer in Islamabad", "Islamabad to Hunza car rental with driver"] },
    { identifier: urn("site:booking"), displayName: "Booking and quote request page", type: "text/html", url: site + "/book",
      description: "Page to send a booking or quote request for a car with a professional driver. The business replies to confirm details.",
      tags: ["booking", "quote"] },
    { identifier: urn("site:out-of-station"), displayName: "Out of station car with driver from Islamabad", type: "text/html", url: site + "/out-of-station-car-rental",
      description: "Trips that leave Islamabad with a professional driver: Lahore, Peshawar, Murree, Swat, Kumrat, Naran, Hunza, Skardu and more. Priced separately from local travel.",
      tags: ["out-of-station", "intercity", "northern-pakistan", "tours"],
      representativeQueries: ["out of station car rental Islamabad", "Islamabad to Skardu car with driver", "Islamabad to Kumrat car rental"] },
    { identifier: urn("site:local-service"), displayName: "Local car with driver in Islamabad", type: "text/html", url: site + "/local-car-rental-islamabad",
      description: "Daily local car with a professional driver inside Islamabad: shopping, markets, premium hotels, meetings and picnic spots. Priced separately from out of station trips.",
      tags: ["local", "islamabad", "shopping", "hotels", "picnic"],
      representativeQueries: ["local car with driver in Islamabad", "car with driver for shopping in Islamabad", "Daman-e-Koh car with driver"] },
    { identifier: urn("site:islamabad-places"), displayName: "Islamabad places we cover with a driver", type: "text/html", url: site + "/islamabad-places",
      description: "Markets, premium hotels, picnic spots and landmarks in Islamabad with a local car and professional driver.",
      tags: ["islamabad", "markets", "hotels", "landmarks"],
      representativeQueries: ["Centaurus Mall car with driver", "Faisal Mosque tour with driver"] },
    { identifier: urn("site:guide"), displayName: "Car rental with driver in Pakistan: search guide", type: "text/html", url: site + "/car-rental-guide",
      description: "Guide that matches common searches (Islamabad, other cities, northern areas, airport pickup, weddings, booking from abroad) to the right page, with answers to common questions.",
      tags: ["guide", "faq", "car-rental", "pakistan"],
      representativeQueries: ["rent a car with driver in Islamabad", "which car is best for Hunza and Skardu", "car rental in Pakistan for tourists"] },
    { identifier: urn("site:visit-pakistan"), displayName: "Tourist car with driver in Pakistan", type: "text/html", url: site + "/visit-pakistan",
      description: "Airport pickup and a professional driver for visitors from abroad, to the northern areas and other cities. Book in advance.",
      tags: ["tourists", "airport-pickup", "northern-pakistan"],
      representativeQueries: ["tourist car with driver in Pakistan", "Islamabad airport pickup for tourists"] },
    { identifier: urn("site:overseas-pakistanis"), displayName: "Car with driver for overseas Pakistanis", type: "text/html", url: site + "/overseas-pakistanis",
      description: "Overseas Pakistanis can book a car with a professional driver in advance, for airport pickup, family trips and weddings.",
      tags: ["overseas-pakistanis", "airport-pickup", "family-travel"],
      representativeQueries: ["car with driver for overseas Pakistanis", "book a car in Islamabad from abroad"] },
    { identifier: urn("site:guides"), displayName: "Car rental guides for Pakistan", type: "text/html", url: site + "/guides",
      description: "Guides on rates and what is included, northern Pakistan itineraries, choosing a vehicle, winter roads to Murree, wedding cars, airport pickup and booking terms.",
      tags: ["guides", "rates", "itineraries", "booking-terms"],
      representativeQueries: ["car with driver rates in Islamabad", "northern Pakistan road trip itinerary by car", "which car for Hunza and Skardu"] },
    { identifier: urn("site:sitemap"), displayName: "Sitemap index", type: "application/xml", url: site + "/sitemap.xml",
      description: "Index of every public page on the website (vehicles, services, locations, destinations, routes).", tags: ["sitemap"] },
  ],
};
mkdirSync(join(dist, ".well-known"), { recursive: true });
writeFileSync(join(dist, ".well-known", "ai-catalog.json"), JSON.stringify(catalog, null, 2) + "\n");
{ const exp = new Date(Date.now() + 365 * 864e5).toISOString(); writeFileSync(join(dist, ".well-known", "security.txt"), `Contact: ${site}/contact\nExpires: ${exp}\nPreferred-Languages: en, ur\nCanonical: ${site}/.well-known/security.txt\n`); }
writeFileSync(join(dist, "ai-catalog.json"), JSON.stringify(catalog, null, 2) + "\n");   // same file at the root too: /ai-catalog.json
console.log("prerender: .well-known/ai-catalog.json written");

// ---- robots.txt: crawlers may read everything public (CSS, JS, images, favicon). Private areas are ALSO protected by auth / noindex headers.
// AI search / assistant crawlers are named on purpose so that nobody has to guess: they may read the public site, never the private areas.
const AI_BOTS = ["GPTBot", "ChatGPT-User", "OAI-SearchBot", "Claude-Web", "ClaudeBot", "anthropic-ai", "PerplexityBot", "Perplexity-User", "Google-Extended", "Bingbot", "Applebot", "Applebot-Extended", "cohere-ai", "Meta-ExternalAgent", "Meta-ExternalFetcher", "FacebookBot", "Bytespider"];
const PRIVATE = `Disallow: /api/\nDisallow: /r/\nDisallow: ${ADMIN_PATH}\n`;
writeFileSync(join(dist, "robots.txt"), `User-agent: *\nAllow: /\n${PRIVATE}\n# AI search and assistant crawlers (public pages only)\n` + AI_BOTS.map((b) => `User-agent: ${b}\nAllow: /\n${PRIVATE}`).join("\n") + `\nSitemap: ${site}/sitemap.xml\n`);

// ---- /llms-full.txt : the complete plain-text business description for AI assistants. Built from the page registry on every build, so it is never stale.
{
  const by = (...k) => idx.filter((p) => k.includes(p.kind));
  const line = (p) => `- [${p.h1}](${site}${p.path}): ${p.description}`;
  const sec = (t, list) => (list.length ? `\n## ${t}\n${list.map(line).join("\n")}\n` : "");
  const faq = (PAGES.find((p) => p.path === "/faq") || { faqs: [] }).faqs;
  writeFileSync(join(dist, "llms-full.txt"), `# SAAD CAR RENTAL SERVICES (full description)

> Car rental with professional driver (chauffeur service) based in Islamabad, Pakistan. Every vehicle is provided with an experienced driver; self-drive hire is not offered. Two services, quoted separately: Local (inside Islamabad, daily use) and Out of Station (any trip that leaves Islamabad).

## Business
- Name: SAAD CAR RENTAL SERVICES (Saad Car Rental)
- Website: ${site}/
- Phone / WhatsApp: ${BUSINESS.phoneDisplay} (+92 333 9850599)
- Office: Office No 12, 3rd Floor, Shah Nawaz Plaza, G-11 Markaz, Islamabad 44000, Pakistan (the only office; no branches elsewhere)
- Pricing: quoted per trip by vehicle, route, days and requirements. No fixed public prices.
- Payment: cash or bank transfer. No online payment on the website.
- How to book: call, WhatsApp, or the Book Now form at ${site}/book . A booking is confirmed when the team confirms it in writing.
- Machine-readable: ${site}/llms.txt , ${site}/ai-catalog.json , ${site}/sitemap.xml , ${site}/ai-info
${sec("Vehicles (each with a professional driver)", by("vehicle"))}${sec("Services", by("service"))}${sec("Local service: places in Islamabad", by("pillar").filter((p) => p.path.includes("local") || p.path.includes("places")).concat(by("spot")))}${sec("Out of Station and tour pages", by("pillar").filter((p) => p.path.includes("out-of-station")))}${sec("Cities, regions and provinces served from Islamabad", by("location", "province"))}${sec("Destinations (Islamabad to ...)", by("destination"))}${sec("Airport, hubs and guides", by("airport", "hub", "guide", "audience", "info", "about", "contact"))}${sec("Policies", by("legal"))}
## Frequently asked questions
${faq.map((x) => `### ${x.q}\n${x.a}`).join("\n\n")}
`);
  console.log("prerender: llms-full.txt written");
}
console.log(`prerender: sitemap index + ${files.length} sitemaps (${idx.length} indexable URLs), robots.txt`);
