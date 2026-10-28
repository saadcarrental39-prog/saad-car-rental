// Turns text copied from Google Maps / Google Business Profile into review objects. Used by the admin app (Reviews tab).
// Understands the "[Name](profile link)" copy format and plain pasted text (Name, then "Local Guide · 23 reviews", then "2 months ago", then the text).
const LINK = /^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)\s*$/;
const META = /(\d+\s+reviews?|\d+\s+photos?|Local Guide)/i;
const WHEN = /^(?:edited\s+)?(?:a|an|\d+)\s+(?:day|week|month|year)s?\s+ago(?:\s*new)?$/i;
const UNIT = { day: 1, week: 7, month: 30, year: 365 };
export function approxIso(when, now = Date.now()) {
  const m = /(a|an|\d+)\s+(day|week|month|year)s?\s+ago/i.exec(when || ""); if (!m) return new Date(now).toISOString().slice(0, 10);
  return new Date(now - (/^an?$/i.test(m[1]) ? 1 : Number(m[1])) * UNIT[m[2].toLowerCase()] * 864e5).toISOString().slice(0, 10);
}
export function detectLang(t) {
  const s = String(t || "");
  if (/[\u0600-\u06FF]/.test(s)) return /[ٹڈڑںےگچکھ]/.test(s) ? "ur" : "ar";
  if (/[\u4e00-\u9fff]/.test(s)) return "zh"; if (/[\u3040-\u30ff]/.test(s)) return "ja"; if (/[\uac00-\ud7af]/.test(s)) return "ko"; if (/[\u0400-\u04FF]/.test(s)) return "ru";
  return "en";
}
const plain = (l) => l.replace(/^\[([^\]]+)\]\([^)]*\)$/, "$1").trim();
export function parseGoogleReviews(raw) {
  const L = String(raw || "").replace(/\r/g, "").split("\n").map((x) => x.trimEnd());
  const isMetaLine = (l) => { const t = plain(l); return META.test(t) && t.length < 90 && !/[.!?]\s*$/.test(t.replace(/photos?|reviews?/gi, "")) ; };
  const starts = [];
  for (let i = 0; i < L.length; i++) {
    const l = L[i].trim(); if (!l) continue;
    const link = LINK.exec(l);
    if (link && !META.test(link[1])) starts.push(i);
    else if (!link) { let j = i + 1; while (j < L.length && !L[j].trim()) j++; if (l.length < 60 && j < L.length && isMetaLine(L[j].trim()) && !isMetaLine(l) && !WHEN.test(l)) starts.push(i); }
  }
  const out = [];
  starts.forEach((s, k) => {
    const end = k + 1 < starts.length ? starts[k + 1] : L.length, block = L.slice(s, end);
    const head = block[0].trim(), link = LINK.exec(head);
    const name = (link ? link[1] : head).trim(), url = link ? link[2].replace(/\)$/, "") : "";
    let i = 1, meta = "", when = "";
    while (i < block.length && !block[i].trim()) i++;
    if (i < block.length && isMetaLine(block[i].trim())) { meta = plain(block[i].trim()).replace(/\s*·\s*/g, " · ").replace(/\s{2,}/g, " "); i++; }
    while (i < block.length && !block[i].trim()) i++;
    if (i < block.length) { const w = block[i].trim().replace(/new$/i, "").trim(); if (WHEN.test(w) || /^(edited\s+)?\w+\s+ago/i.test(w)) { when = w.replace(/\s*New$/i, ""); i++; } }
    const text = block.slice(i).join("\n").replace(/\n{3,}/g, "\n\n").replace(/\bLike\b\s*\bShare\b/gi, "").trim();
    if (name && text.length > 2) out.push({ name, url, meta, when, iso: approxIso(when), text, lang: detectLang(text) });
  });
  return out;
}
export const slugId = (name, text) => { let h = 0; for (const c of `${name}|${String(text).slice(0, 60)}`) h = (h * 31 + c.charCodeAt(0)) >>> 0; return `g-${String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30)}-${h.toString(36)}`; };
