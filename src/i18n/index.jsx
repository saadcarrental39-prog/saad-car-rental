// ============================================================================
//  i18n: the website speaks the visitor's language.
//
//  HOW THE LANGUAGE IS CHOSEN (first match wins)
//    1. The language the visitor picked in the selector (saved on their device as "saad_lang").
//    2. The language of their browser / phone (navigator.languages), e.g. Arabic phone -> Arabic.
//    3. Their country (Cloudflare tells us the country at /api/geo), e.g. visitor in Germany with an unsupported browser language -> German.
//    4. English: American English (en-US) or British English (en-GB, used in the UK, Pakistan, India, Ireland, Australia ...).
//  Google and other crawlers have no browser language preference, so they always see the normal English pages (no cloaking, no redirects).
//
//  TO ADD / CHANGE A TRANSLATION: open src/i18n/dict/<code>.js. Every line is   "English text": "translation".
//  Anything missing in a language falls back to English, so the site never breaks. `node scripts/i18n-check.mjs` lists missing lines.
//  There is NO Hebrew and no Israel region on purpose.
// ============================================================================
import KEYS from "./keys";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export const LANGS = [
  { code: "en-US", native: "English (US)", html: "en-US", dir: "ltr" },
  { code: "en-GB", native: "English (UK)", html: "en-GB", dir: "ltr" },
  { code: "ur", native: "اردو", html: "ur", dir: "rtl" },
  { code: "ar", native: "العربية", html: "ar", dir: "rtl" },
  { code: "fa", native: "فارسی", html: "fa", dir: "rtl" },
  { code: "zh", native: "简体中文", html: "zh-CN", dir: "ltr" },
  { code: "ja", native: "日本語", html: "ja", dir: "ltr" },
  { code: "ko", native: "한국어", html: "ko", dir: "ltr" },
  { code: "nl", native: "Nederlands", html: "nl", dir: "ltr" },
  { code: "de", native: "Deutsch", html: "de", dir: "ltr" },
  { code: "fr", native: "Français", html: "fr", dir: "ltr" },
  { code: "es", native: "Español", html: "es", dir: "ltr" },
  { code: "it", native: "Italiano", html: "it", dir: "ltr" },
  { code: "tr", native: "Türkçe", html: "tr", dir: "ltr" },
  { code: "ru", native: "Русский", html: "ru", dir: "ltr" },
  { code: "ms", native: "Bahasa Melayu", html: "ms", dir: "ltr" },
];
const IDX = Object.fromEntries(KEYS.map((k, i) => [k, i]));
const BY = Object.fromEntries(LANGS.map((l) => [l.code, l]));
const LOADERS = {
  "en-GB": () => import("./dict/en-GB.js"), ur: () => import("./dict/ur.js"), ar: () => import("./dict/ar.js"), fa: () => import("./dict/fa.js"), zh: () => import("./dict/zh.js"),
  ja: () => import("./dict/ja.js"), ko: () => import("./dict/ko.js"), nl: () => import("./dict/nl.js"), de: () => import("./dict/de.js"), fr: () => import("./dict/fr.js"),
  es: () => import("./dict/es.js"), it: () => import("./dict/it.js"), tr: () => import("./dict/tr.js"), ru: () => import("./dict/ru.js"), ms: () => import("./dict/ms.js"),
};

// country (ISO code) -> language. Countries not listed use English. Israel (IL) is intentionally not mapped: English is shown there.
const C = (lang, list) => list.split(" ").forEach((c) => { COUNTRY[c] = lang; });
const COUNTRY = {};
C("en-GB", "GB IE PK IN BD LK NP AU NZ ZA SG MT CY KE NG GH UG TZ ZW ZM BW NA MU JM TT BB FJ");
C("en-US", "US CA PH LR");
C("ar", "SA AE QA KW BH OM JO LB EG IQ SY YE LY DZ MA TN SD PS MR DJ KM");
C("zh", "CN HK MO TW");
C("ja", "JP"); C("ko", "KR KP"); C("ms", "MY BN"); C("tr", "TR"); C("fa", "IR AF"); C("it", "IT SM VA");
C("nl", "NL BE SR AW CW"); C("de", "DE AT CH LI"); C("ru", "RU BY KZ KG TJ UZ TM");
C("fr", "FR LU MC SN CI CM CD ML BF NE TG BJ GA MG GN HT RW BI");
C("es", "ES MX AR CO CL PE VE EC UY PY BO CR PA DO GT HN SV NI CU PR GQ");
// browsers: "pt-BR", "zh-Hant", "nb" ... -> one of our codes (primary language subtag)
const PRIMARY = { ur: "ur", ar: "ar", fa: "fa", zh: "zh", ja: "ja", ko: "ko", nl: "nl", de: "de", fr: "fr", es: "es", it: "it", tr: "tr", ru: "ru", ms: "ms", id: "ms", ps: "fa", prs: "fa" };
const GB_REGIONS = /^en-(GB|IE|AU|NZ|IN|PK|ZA|SG|HK|MT|KE|NG)$/i;

const KEY = "saad_lang";
const read = (k, s = localStorage) => { try { return s.getItem(k) || ""; } catch { return ""; } };
const write = (k, v, s = localStorage) => { try { s.setItem(k, v); } catch { /* private mode: fine */ } };
const valid = (c) => (BY[c] ? c : "");

// what the browser itself asks for. returns { code, generic } where generic = plain English without a region (country decides US/UK)
function fromBrowser() {
  const list = (typeof navigator !== "undefined" && (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language])) || [];
  for (const raw of list) {
    if (!raw) continue; const l = raw.toLowerCase(), p = l.split("-")[0];
    if (p === "he" || p === "iw") continue;                        // not offered
    if (p === "en") return { code: GB_REGIONS.test(raw) ? "en-GB" : l === "en" ? "" : "en-US", generic: l === "en" };
    if (PRIMARY[p]) return { code: PRIMARY[p] };
  }
  return { code: "" };
}
export function initialLang() {
  if (typeof window === "undefined") return "en-US";
  const saved = valid(read(KEY)); if (saved) return saved;
  const b = fromBrowser(); if (b.code) return b.code;
  const geo = valid(COUNTRY[read("saad_cc", sessionStorage)]); return geo || "en-US";
}

const Ctx = createContext({ lang: "en-US", dir: "ltr", t: (s) => s, setLang: () => {}, langs: LANGS, ready: true });
export const useI18n = () => useContext(Ctx);
export const useT = () => useContext(Ctx).t;

export function I18nProvider({ children, initial }) {
  const [lang, setLangState] = useState(() => initial || initialLang());
  const [dict, setDict] = useState({});
  const [loaded, setLoaded] = useState("en-US");
  // load the dictionary of the chosen language (a small separate file, only for visitors who need it)
  useEffect(() => {
    let dead = false;
    if (lang === "en-US") { setDict({}); setLoaded("en-US"); return undefined; }
    LOADERS[lang]().then((m) => { if (!dead) { setDict(m.default || {}); setLoaded(lang); } }).catch(() => { if (!dead) { setDict({}); setLoaded("en-US"); } });
    return () => { dead = true; };
  }, [lang]);
  // country detection: only when the browser gave no clear language (plain "en" or an unsupported language) and the visitor never chose
  useEffect(() => {
    if (valid(read(KEY))) return;
    const b = fromBrowser(); if (b.code) return;
    let dead = false;
    const apply = (cc) => { if (dead) return; const l = valid(COUNTRY[cc]); if (l) setLangState(l); else if (b.generic) setLangState("en-US"); };
    const cached = read("saad_cc", sessionStorage);
    if (cached) return apply(cached);
    fetch("/api/geo", { cache: "no-store" }).then((r) => r.json()).then((j) => { const cc = String(j.country || "").toUpperCase(); if (cc) write("saad_cc", cc, sessionStorage); apply(cc); }).catch(() => {});
    return () => { dead = true; };
  }, []);
  // <html lang dir>: right-to-left languages flip the layout
  const meta = BY[lang] || BY["en-US"];
  useEffect(() => { const h = document.documentElement; h.lang = meta.html; h.dir = meta.dir; h.dataset.lang = lang; }, [lang, meta]);
  const setLang = useCallback((c) => { if (!valid(c)) return; write(KEY, c); setLangState(c); }, []);
  const t = useCallback((s, vars) => {
    let out = (loaded === lang && (dict[IDX[s]] || dict[s])) || s;   // dictionary lines are numbered (see keys.js); a few use the English text itself as the key
    if (vars) out = out.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
    return out;
  }, [dict, lang, loaded]);
  const value = useMemo(() => ({ lang, dir: meta.dir, t, setLang, langs: LANGS }), [lang, meta, t, setLang]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// compact language selector (header, menu and footer)
export function LangSelect({ className = "" }) {
  const { lang, setLang, langs, t } = useI18n();
  return (
    <label className={`lang ${className}`}>
      <span className="lang__ico" aria-hidden="true">🌐</span>
      <span className="sr">{t("Language")}</span>
      <select value={lang} onChange={(e) => setLang(e.target.value)} aria-label={t("Language")} translate="no">
        {langs.map((l) => <option key={l.code} value={l.code} lang={l.html}>{l.native}</option>)}
      </select>
    </label>
  );
}
