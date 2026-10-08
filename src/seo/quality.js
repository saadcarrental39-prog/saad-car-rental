// PAGE QUALITY GATE. Score out of 100 (minimum to publish: 80). Used by scripts/seo-audit.mjs at build time: the build FAILS if a
// page that is meant to be indexed scores below 80, so thin or duplicate pages cannot reach the live site by accident.
import { place } from "./data/places";
import { route } from "./data/routes";
import { SERVICE_PAGES } from "./data/services";
import { category } from "./links";

export const MIN_SCORE = 80;
export const FORBIDDEN = [/\bRs\.?\s?\d/i, /\bPKR\s?\d/i, /\$\s?\d/, /guarantee/i, /\bbest price\b/i, /\b#\s?1\b/, /\bcheapest\b/i, /\bto be confirmed\b/i, /\[BUSINESS CONFIRMATION/i];

// The text that is specific to ONE page (not shared template text). Used to measure real uniqueness between pages.
export function uniqueText(page) {
  const faq = (page.faqs || []).map((f) => `${f.q} ${f.a}`).join(" ");
  if (page.kind === "location") { const p = place(page.slug); return [p.intro, p.highlights.join(" "), p.audience.join(" "), faq].join(" "); }
  if (page.kind === "destination") { const p = place(page.slug); return [p.intro, p.highlights.join(" "), p.road, p.season, p.plan, faq].join(" "); }
  if (page.kind === "route") { const r = route(page.slug); const p = place(r.to); return [r.note, p.plan, p.road, p.season].join(" "); }
  if (page.kind === "service") { const s = SERVICE_PAGES.find((x) => x.slug === page.slug); return [s.intro, s.points.join(" "), faq].join(" "); }
  if (page.kind === "vehicle") { const c = category(page.slug); return [c.description, c.vehicles.map((v) => v.description).join(" "), faq].join(" "); }
  return faq;
}
const words = (t) => (t.match(/[\p{L}\p{N}']+/gu) || []).length;

export function score(page, s) {
  const out = {}; const notes = [];
  // Search intent (20): unique, well-formed title / description / H1
  let a = 20;
  if (s.titleLen > 65) { a -= 5; notes.push(`title ${s.titleLen} chars (>65)`); }
  if (s.descLen < 70 || s.descLen > 160) { a -= 5; notes.push(`description ${s.descLen} chars (70-160)`); }
  if (s.h1Count !== 1) { a -= 10; notes.push(`H1 count ${s.h1Count}`); }
  if (s.dupTitle || s.dupDesc || s.dupH1) { a -= 10; notes.push("duplicate title/description/H1"); }
  out.searchIntent = Math.max(a, 0);
  // Unique value (20)
  const uw = words(uniqueText(page)); const entity = ["location", "destination", "route", "service", "vehicle"].includes(page.kind);
  const limits = entity ? [150, 100, 60] : [300, 200, 100];
  const base = entity ? uw : s.words;
  out.uniqueValue = base >= limits[0] ? 20 : base >= limits[1] ? 15 : base >= limits[2] ? 10 : 0;
  if (s.maxSimilarity > 0.5) { out.uniqueValue = Math.min(out.uniqueValue, 5); notes.push(`similarity ${s.maxSimilarity.toFixed(2)}`); }
  // Business relevance (20): live service only; penalise unconfirmed wording
  out.businessRelevance = s.forbidden.length ? 10 : 20; if (s.forbidden.length) notes.push(`forbidden wording: ${s.forbidden.join(", ")}`);
  // Content quality (15): visible words
  out.contentQuality = s.words >= 500 ? 15 : s.words >= 350 ? 12 : s.words >= 250 ? 8 : 3;
  // Conversion (10)
  out.conversion = (s.hasTel ? 4 : 0) + (s.hasWa ? 3 : 0) + (s.hasBook ? 3 : 0);
  // Internal linking (5)
  out.internalLinking = s.internalLinks >= 8 ? 5 : s.internalLinks >= 4 ? 3 : 0;
  // Technical SEO (5)
  out.technical = (s.canonicalOk ? 2 : 0) + (s.ogOk ? 2 : 0) + (s.jsonOk ? 1 : 0);
  // Trust (5): no invented claims
  out.trust = s.forbidden.length ? 0 : 5;
  const total = Object.values(out).reduce((x, y) => x + y, 0);
  return { total, parts: out, notes, uniqueWords: uw };
}
