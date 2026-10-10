// Run after the build: `npm run seo:audit`. Verifies the generated site (dist/) and FAILS (exit 1) on critical SEO / security problems.
// Writes dist-reports/seo-audit.json and seo-audit.md (counts, scores, problems, business info still required).
import { readFileSync, existsSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd(), dist = join(root, "dist");
const mod = await import(pathToFileURL(join(root, ".seo-build/entry.mjs")).href);
const { PAGES, BUSINESS, PLACES, PROVINCES, ROUTES, DRAFT_ROUTES, SERVICE_PAGES, baseFleet, MIN_SCORE, FORBIDDEN, score, uniqueText, needsConfirmation, PUNJAB_DISTRICTS, notOffered } = mod;
const problems = [], warnings = [];
const fail = (m) => problems.push(m), warn = (m) => warnings.push(m);
const pathOf = (p) => (p === "/" ? join(dist, "index.html") : join(dist, p, "index.html"));
const text = (h) => h.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const wc = (t) => (t.match(/[\p{L}\p{N}']+/gu) || []).length;
const shingles = (t) => { const w = (t.toLowerCase().match(/[\p{L}\p{N}]+/gu) || []); const s = new Set(); for (let i = 0; i + 6 <= w.length; i++) s.add(w.slice(i, i + 6).join(" ")); return s; };
const jac = (a, b) => { let i = 0; for (const x of a) if (b.has(x)) i++; return i / (a.size + b.size - i || 1); };
const known = new Set(PAGES.map((p) => p.path));
const staticOk = (u) => /^\/(assets|icons|images|bundle|sounds|saad-owner|api|r\/)/.test(u) || /\.(ico|png|jpg|webp|svg|xml|txt|json|webmanifest|js|css)$/.test(u);

// 1) per-page checks
const rows = []; const htmlOf = {}; const titles = {}, descs = {}, h1s = {};
for (const p of PAGES) {
  const f = pathOf(p.path); if (!existsSync(f)) { fail(`${p.path}: HTML file missing`); continue; }
  const h = readFileSync(f, "utf8"); htmlOf[p.path] = h;
  const title = (h.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "", desc = (h.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "";
  const h1s_ = [...h.matchAll(/<h1[ >][\s\S]*?<\/h1>/g)].map((m) => text(m[0]));
  (titles[title] = titles[title] || []).push(p.path); (descs[desc] = descs[desc] || []).push(p.path); (h1s[h1s_[0]] = h1s[h1s_[0]] || []).push(p.path);
  rows.push({ p, h, title, desc, h1s_ });
}
const dupe = (m, label) => Object.entries(m).forEach(([k, v]) => { if (k && v.length > 1) { const idx = v.filter((x) => PAGES.find((p) => p.path === x).indexable); if (idx.length > 1) fail(`duplicate ${label} on ${idx.join(", ")}`); } });
dupe(titles, "title"); dupe(descs, "meta description"); dupe(h1s, "H1");
const sh = {}; for (const r of rows) sh[r.p.path] = shingles(uniqueText(r.p));
const report = [];
for (const { p, h, title, desc, h1s_ } of rows) {
  const metas = (re) => (h.match(re) || []).length;
  if (metas(/rel="canonical"/g) !== 1) fail(`${p.path}: needs exactly one canonical (has ${metas(/rel="canonical"/g)})`);
  if (!h.includes(`href="${p.canonical}"`)) fail(`${p.path}: canonical is not ${p.canonical}`);
  if (!p.canonical.startsWith("https://")) fail(`${p.path}: canonical is not https`);
  const robots = (h.match(/<meta name="robots" content="([^"]*)"/) || [])[1]; if (robots !== p.robots) fail(`${p.path}: robots meta '${robots}' != '${p.robots}'`);
  const og = (h.match(/property="og:image" content="([^"]*)"/) || [])[1]; const ogFile = og && join(dist, og.replace(BUSINESS.website, ""));
  if (!og || !og.startsWith("https://")) fail(`${p.path}: og:image missing or not https`); else if (!existsSync(ogFile)) fail(`${p.path}: og:image file missing (${og.replace(BUSINESS.website, "")})`);
  ["og:title", "og:description", "og:url", "og:type", "og:site_name", "og:image:width", "og:image:height", "og:image:type", "twitter:card", "twitter:image"].forEach((k) => { if (!h.includes(`"${k}"`)) fail(`${p.path}: missing ${k}`); });
  let jsonOk = true; for (const m of h.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) { try { JSON.parse(m[1]); } catch { jsonOk = false; fail(`${p.path}: invalid JSON-LD`); } }
  if (!/application\/ld\+json/.test(h)) { jsonOk = false; fail(`${p.path}: no JSON-LD`); }
  // links: every internal link must point at a real page
  const links = [...h.matchAll(/<a [^>]*href="([^"]+)"/g)].map((m) => m[1]);
  const internal = links.filter((u) => u.startsWith("/") && !u.startsWith("//"));
  internal.forEach((u) => { const q = u.split(/[?#]/)[0].replace(/\/$/, "") || "/"; if (!known.has(q) && !staticOk(q)) fail(`${p.path}: broken internal link ${u}`); });
  const body = text(h.replace(/<head>[\s\S]*?<\/head>/, ""));
  const forbidden = FORBIDDEN.filter((re) => re.test(body)).map(String);
  const maxSim = Math.max(0, ...rows.filter((o) => o.p.kind === p.kind && o.p.path !== p.path).map((o) => jac(sh[p.path], sh[o.p.path])));
  const s = { titleLen: title.length, descLen: desc.length, h1Count: h1s_.length, dupTitle: titles[title].length > 1 && p.indexable, dupDesc: descs[desc].length > 1 && p.indexable, dupH1: h1s[h1s_[0]].length > 1 && p.indexable, words: wc(body), maxSimilarity: ["location", "destination", "route", "service", "vehicle"].includes(p.kind) ? maxSim : 0, forbidden,
    hasTel: /href="tel:/.test(h), hasWa: /href="https:\/\/wa\.me\//.test(h), hasBook: /href="\/book/.test(h), internalLinks: new Set(internal).size, canonicalOk: h.includes(`href="${p.canonical}"`), ogOk: !!og && existsSync(ogFile), jsonOk };
  if (s.h1Count !== 1) fail(`${p.path}: ${s.h1Count} H1 tags`);
  if (!s.hasTel || !s.hasWa) fail(`${p.path}: missing call / WhatsApp button`);
  if (p.kind !== "app" && !/data-seo/.test(h)) fail(`${p.path}: head tags not rendered`);
  const q = score(p, s);
  if (p.indexable && q.total < MIN_SCORE) fail(`${p.path}: quality score ${q.total} < ${MIN_SCORE} (${q.notes.join("; ")})`);
  report.push({ path: p.path, kind: p.kind, indexable: p.indexable, score: q.total, parts: q.parts, words: s.words, uniqueWords: q.uniqueWords, links: s.internalLinks, maxSimilarity: +maxSim.toFixed(2), title, titleLen: title.length, descLen: desc.length, notes: q.notes });
}
// 2) sitemap checks
const sm = (f) => existsSync(join(dist, f)) ? readFileSync(join(dist, f), "utf8") : "";
const idxXml = sm("sitemap.xml"); if (!idxXml) fail("sitemap.xml missing");
const sitemapFiles = [...idxXml.matchAll(/<loc>[^<]*\/(sitemap-[a-z]+\.xml)<\/loc>/g)].map((m) => m[1]);
const inMap = new Set();
sitemapFiles.filter((f) => f !== "sitemap-images.xml").forEach((f) => [...sm(f).matchAll(/<loc>([^<]*)<\/loc>/g)].forEach((m) => inMap.add(m[1].replace(BUSINESS.website, "") || "/")));
for (const u of inMap) { const p = PAGES.find((x) => x.path === u); if (!p) fail(`sitemap URL not a page: ${u}`); else if (!p.indexable) fail(`noindex page in sitemap: ${u}`); }
PAGES.filter((p) => p.indexable).forEach((p) => { if (!inMap.has(p.path)) fail(`indexable page missing from sitemap: ${p.path}`); });
const robots = existsSync(join(dist, "robots.txt")) ? readFileSync(join(dist, "robots.txt"), "utf8") : ""; if (!robots.includes(`Sitemap: ${BUSINESS.website}/sitemap.xml`)) fail("robots.txt has no sitemap line");
if (/Disallow:\s*\/(assets|bundle|icons|images|favicon)/.test(robots)) fail("robots.txt blocks CSS/JS/images/favicon");
if (!existsSync(join(dist, "favicon.ico"))) fail("favicon.ico missing in dist");
// 3) security: nothing private in the deployable folder
const walk = (d) => readdirSync(d).flatMap((n) => { const f = join(d, n); return statSync(f).isDirectory() ? walk(f) : [f]; });
const all = walk(dist);
all.forEach((f) => { if (/(^|\/)\.(env|git)|\.(zip|tar|gz|sql|bak|log|map)$|(^|\/)(backup|dump)/i.test(f.replace(dist, ""))) fail(`private-looking file in dist: ${f.replace(dist, "")}`); });
const SECRET = /(WA_TOKEN\s*[=:]|EAA[A-Za-z0-9]{40,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY|sk_live_|AIza[0-9A-Za-z_-]{35})/;
all.filter((f) => /\.(js|html|json|txt|xml|css)$/.test(f)).forEach((f) => { if (SECRET.test(readFileSync(f, "utf8"))) fail(`possible secret in ${f.replace(dist, "")}`); });
const hdr = readFileSync(join(root, "public/_headers"), "utf8"); ["X-Content-Type-Options", "Strict-Transport-Security", "Referrer-Policy", "Permissions-Policy", "X-Frame-Options"].forEach((k) => { if (!hdr.includes(k)) fail(`_headers missing ${k}`); });

// 3b) AI-agent catalog (PageSpeed "Agentic browsing"): must be real JSON in the ARD shape, not the website's HTML page
{
  const cf = join(dist, ".well-known", "ai-catalog.json");
  if (!existsSync(cf)) fail(".well-known/ai-catalog.json missing in dist");
  else {
    let c; try { c = JSON.parse(readFileSync(cf, "utf8")); } catch (e) { fail(`ai-catalog.json is not valid JSON: ${e.message}`); }
    if (c) {
      if (c.specVersion !== "1.0") fail("ai-catalog.json: specVersion must be \"1.0\"");
      if (!c.host?.displayName) fail("ai-catalog.json: host.displayName missing");
      if (!Array.isArray(c.entries) || !c.entries.length) fail("ai-catalog.json: entries missing");
      const ids = new Set();
      (c.entries || []).forEach((e, i) => {
        if (!/^urn:air:[a-zA-Z0-9.-]+(:[a-zA-Z0-9._-]+)+$/.test(e.identifier || "")) fail(`ai-catalog.json entry ${i}: bad identifier`);
        if (ids.has(e.identifier)) fail(`ai-catalog.json entry ${i}: duplicate identifier`); ids.add(e.identifier);
        if (!e.displayName) fail(`ai-catalog.json entry ${i}: displayName missing`);
        if (!/^[a-z]+\/[a-z0-9.+-]+$/i.test(e.type || "")) fail(`ai-catalog.json entry ${i}: type must be a media type`);
        if (!!e.url === !!e.data) fail(`ai-catalog.json entry ${i}: needs exactly one of url or data`);
        if (e.url && !String(e.url).startsWith(BUSINESS.website)) fail(`ai-catalog.json entry ${i}: url not on ${BUSINESS.website}`);
        if (e.representativeQueries && (e.representativeQueries.length < 2 || e.representativeQueries.length > 5)) fail(`ai-catalog.json entry ${i}: representativeQueries must have 2 to 5 items`);
        if (FORBIDDEN.some((rx) => rx.test(JSON.stringify(e)))) fail(`ai-catalog.json entry ${i}: forbidden wording`);
      });
    }
  }
  if (!/\/\.well-known\/\*/.test(hdr)) fail("_headers: no rule for /.well-known/*");
}
// 3c) speed: long cache for pictures, small picture sizes exist, the hero picture is preloaded
{
  if (/\/assets\/\*\s*\n\s*Cache-Control:\s*no-cache/i.test(hdr)) fail("_headers: /assets/* must be cached long (images), not no-cache");
  const home = readFileSync(join(dist, "index.html"), "utf8");
  if (!/<link rel="preload" as="image"[^>]*fetchpriority="high"/.test(home)) fail("home page: hero image preload missing");
  if (!/<img[^>]*fetchpriority="high"/i.test(home)) fail("home page: hero img has no fetchpriority=high");
  if (!/hero__slide hero__slide--first/.test(home)) fail("home page: first hero slide is not visible at once (needs hero__slide--first)");
  baseFleet.flatMap((c) => c.vehicles).filter((v) => !v.placeholder).forEach((v) => {
    const m = /^\/assets\/vehicles\/([\w-]+)\.webp$/.exec(v.image); if (!m) return;
    if (!existsSync(join(dist, `assets/vehicles/${m[1]}-480.webp`))) warn(`no small (480px) copy for ${v.image}: run python3 scripts/make-image-sizes.py`);
  });
}
// 4) totals (never inflated: counted from the real registry)
const live = PLACES.filter((p) => p.status === "live"), draft = PLACES.filter((p) => p.status === "draft");
const idxPages = PAGES.filter((p) => p.indexable), noidx = PAGES.filter((p) => !p.indexable);
const totals = {
  countries: ["Pakistan"], provincesAdministrativeAreasWithPages: Object.values(PROVINCES).filter((v) => v.own && v.status === "live").map((v) => v.name), provincesPlannedOnly: Object.values(PROVINCES).filter((v) => v.status === "draft").map((v) => v.name),
  majorCitiesLive: live.filter((p) => p.type === "location").map((p) => p.name), citiesPlannedDraft: draft.map((p) => p.name), districtsPlannedNoPages: PUNJAB_DISTRICTS.length,
  destinationsLive: live.filter((p) => p.type === "destination").map((p) => p.name), servicesLive: SERVICE_PAGES.map((s) => s.name) .concat(["Islamabad Airport Transfer"]), servicesNotOffered: notOffered,
  vehicles: baseFleet.map((c) => c.title), routePagesLive: ROUTES.filter((r) => r.status === "live").length, destinationRoutesOnDestinationPages: live.filter((p) => p.type === "destination").length, routesPlannedDraft: DRAFT_ROUTES.length,
  indexablePages: idxPages.length, noindexOrDraftPages: noidx.length + draft.length + DRAFT_ROUTES.length, noindexPagesBuilt: noidx.map((p) => p.path),
};
mkdirSync(join(root, "dist-reports"), { recursive: true });
const avg = Math.round(report.filter((r) => r.indexable).reduce((a, r) => a + r.score, 0) / idxPages.length);
writeFileSync(join(root, "dist-reports/seo-audit.json"), JSON.stringify({ totals, averageScore: avg, problems, warnings, pages: report, needsConfirmation }, null, 1));
const md = [`# SEO audit\n`, `Average quality score: **${avg}/100** (minimum ${MIN_SCORE}) across ${idxPages.length} indexable pages.\n`, `Problems: **${problems.length}**\n`, ...problems.map((x) => `- ${x}`), `\n## Totals\n`, "```json", JSON.stringify(totals, null, 1), "```", `\n## Page scores\n`, `| Path | Kind | Score | Words | Unique words | Links | Max similarity |`, `|---|---|---|---|---|---|---|`, ...report.map((r) => `| ${r.path} | ${r.kind} | ${r.score}${r.indexable ? "" : " (noindex)"} | ${r.words} | ${r.uniqueWords} | ${r.links} | ${r.maxSimilarity} |`), `\n## Business information still required\n`, ...needsConfirmation.map((x) => `- [BUSINESS CONFIRMATION REQUIRED] ${x}`)].join("\n");
writeFileSync(join(root, "dist-reports/seo-audit.md"), md);
console.log(`seo-audit: ${PAGES.length} pages checked, ${idxPages.length} indexable, avg score ${avg}, ${problems.length} problems, ${warnings.length} warnings`);
problems.slice(0, 60).forEach((m) => console.log("  ✗ " + m));
if (problems.length) process.exit(1);
