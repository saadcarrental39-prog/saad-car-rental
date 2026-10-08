// `npm run seo:maps` -> dist-reports/*.csv : URL map, keyword map, metadata map, schema map, Open Graph map, internal-link map.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
const root = process.cwd(); const { PAGES, place } = await import(pathToFileURL(join(root, ".seo-build/entry.mjs")).href);
mkdirSync(join(root, "dist-reports"), { recursive: true });
const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`; const csv = (rows) => rows.map((r) => r.map(q).join(",")).join("\n") + "\n";
const html = (p) => readFileSync(join(root, "dist", p === "/" ? "" : p, "index.html"), "utf8");
const intent = { location: "local / commercial", destination: "tourism + route / transactional", route: "route / transactional", service: "service / commercial", vehicle: "vehicle / commercial", airport: "airport / transactional", hub: "category / navigational", province: "regional / commercial", faq: "informational (AEO)", app: "navigational / commercial", about: "brand", contact: "brand / transactional" };
const kw = (p) => (p.kind === "location" || p.kind === "destination" || p.kind === "route") && place(p.kind === "route" ? p.slug.replace("islamabad-to-", "") : p.slug) ? place(p.kind === "route" ? p.slug.replace("islamabad-to-", "") : p.slug).kw : p.h1.toLowerCase();
const w = (n, rows) => writeFileSync(join(root, "dist-reports", n), csv(rows));
w("url-map.csv", [["URL", "Type", "Indexable", "Priority"], ...PAGES.map((p) => [p.canonical, p.kind, p.indexable, p.priority])]);
w("keyword-map.csv", [["Primary keyword", "Search intent", "Target URL", "Page type", "Title", "H1", "Meta description", "CTA"], ...PAGES.map((p) => [kw(p), intent[p.kind], p.path, p.kind, p.fullTitle, p.h1, p.description, "Call / WhatsApp / Get a quote"])]);
w("metadata-map.csv", [["URL", "Title", "Title length", "Description", "Description length", "Robots", "Canonical"], ...PAGES.map((p) => [p.path, p.fullTitle, p.fullTitle.length, p.description, p.description.length, p.robots, p.canonical])]);
w("open-graph-map.csv", [["URL", "og:image", "og:title"], ...PAGES.map((p) => [p.path, BUSINESS_URL(p), p.fullTitle])]);
function BUSINESS_URL(p) { return p.canonical.replace(p.path === "/" ? /\/$/ : p.path, "") + p.ogImage; }
w("schema-map.csv", [["URL", "Schema types"], ...PAGES.map((p) => { const t = new Set(); (JSON.parse((html(p.path).match(/ld\+json"[^>]*>([\s\S]*?)<\/script>/) || [])[1] || "{}")["@graph"] || []).forEach((n) => t.add(n["@type"])); return [p.path, [...t].join(" + ")]; })]);
w("internal-links-map.csv", [["From", "To (unique internal links)"], ...PAGES.flatMap((p) => [...new Set([...html(p.path).split('<div id="root">')[1].matchAll(/<a [^>]*href="(\/[^"#?]*)/g)].map((m) => m[1]))].map((to) => [p.path, to]))]);
console.log("seo-maps: wrote 6 CSV files to dist-reports/");
