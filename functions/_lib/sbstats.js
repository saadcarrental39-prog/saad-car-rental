// Website analytics on Supabase: same numbers and same answers as stats.js (Cloudflare D1), only the data now comes from Postgres.
// The SQL lives in supabase-setup.sql. No IP address, name or phone number is stored: only a random visitor id made by the browser.
// All days/hours use Pakistan time (UTC+5, no daylight saving), so "Aaj" means the owner's today.
import { rpc } from "./sb.js";
const PKT = 5 * 3600e3, DAY = 864e5;
const dayOf = (ts) => new Date(ts + PKT).toISOString().slice(0, 10);
const hourOf = (ts) => new Date(ts + PKT).getUTCHours();
const addDays = (d, n) => new Date(Date.parse(`${d}T00:00:00Z`) + n * DAY).toISOString().slice(0, 10);
const monthStart = (d, back) => { const [y, m] = d.split("-").map(Number); return new Date(Date.UTC(y, m - 1 - back, 1)).toISOString().slice(0, 10); };
const num = (x) => Number(x) || 0;
const BOT = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|whatsapp|telegram|curl|wget|python|axios|monitor|uptime|gtmetrix|pingdom/i;
const clip = (x, n) => String(x ?? "").replace(/[\u0000-\u001f<>]/g, " ").trim().slice(0, n);
const TYPES = new Set(["pv", "ping", "phone_click", "whatsapp_click", "email_click", "booking_click", "quote_start", "quote_submit", "form_error", "vehicle_view", "service_view", "route_view", "location_view"]);

/* ---------- collect: one row per page view / event ---------- */
export async function collect(env, request, raw) {   // returns "ok" or the reason why the hit was not stored
  if (BOT.test(request.headers.get("user-agent") || "")) return "bot";
  let b; try { b = JSON.parse(raw ?? (await request.text())); } catch { return "bad_body"; }
  const type = TYPES.has(b.t) ? b.t : "";
  const vid = clip(b.v, 40).replace(/[^A-Za-z0-9-]/g, ""), sid = clip(b.s, 40).replace(/[^A-Za-z0-9-]/g, "");
  if (!type || vid.length < 8 || sid.length < 8) return "bad_fields";
  const path = clip(b.p, 120).split(/[?#]/)[0] || "/", ts = Date.now(), cf = request.cf || {};
  const dev = ["mobile", "tablet", "desktop"].includes(b.d) ? b.d : "desktop";
  await rpc(env, "saad_collect", { p_ts: ts, p_day: dayOf(ts), p_hr: hourOf(ts), p_vid: vid, p_sid: sid, p_type: type, p_path: path, p_item: clip(b.i, 60),
    p_src: clip(b.r, 40).toLowerCase() || "direct", p_dev: dev, p_cty: clip(cf.country, 2), p_city: clip(cf.city, 40) });
  return "ok";
}

/* ---------- stats for the Admin dashboard ---------- */
const RANGES = { today: { n: 1, step: 1 }, "7d": { n: 7, step: 1 }, "30d": { n: 30, step: 1 }, "90d": { n: 90, step: 7 } };
const kpiOf = (r, bounce, nw) => ({ vis: num(r.vis), pv: num(r.pv), ses: num(r.ses), calls: num(r.calls), wa: num(r.wa), em: num(r.em), bc: num(r.bc), qs: num(r.qs), qd: num(r.qd), bounce: num(bounce), nw: num(nw) });

/* Daily (30 days) / weekly (12 weeks) / monthly (12 months) trend. Cached 90 s: it is the heaviest part and changes slowly. */
const memo = new Map();
async function trend(env, today) {
  const hit = memo.get(today); if (hit && Date.now() - hit.t < 90e3) return hit.v;
  const d0 = addDays(today, -29), w0 = addDays(today, -83), m0 = monthStart(today, 11);
  const raw = await rpc(env, "saad_trend_raw", { p_today: today, p_d0: d0, p_w0: w0, p_m0: m0, p_wmin: addDays(today, -89) });
  const wf = raw.wf, out = raw.r || [];
  const map = (i) => new Map((out[i] || []).map((r) => [String(r.k), r]));
  const fill = (keys, hitI, newI) => { const h = map(hitI), n = map(newI); return keys.map((o) => { const r = h.get(String(o.key)) || {}, vis = num(r.vis), nw = Math.min(vis, num(n.get(String(o.key))?.n)); delete o.key; return { ...o, vis, pv: num(r.pv), ses: num(r.ses), inq: num(r.inq), nw, ret: Math.max(0, vis - nw) }; }); };
  const daily = fill(Array.from({ length: 30 }, (_, i) => { const d = addDays(d0, i); return { key: d, k: d }; }), 0, 1);
  const weekly = fill(Array.from({ length: 12 }, (_, i) => ({ key: i, k: addDays(w0, i * 7), to: addDays(w0, i * 7 + 6) })), 2, 3);
  const monthly = fill(Array.from({ length: 12 }, (_, i) => { const k = monthStart(today, 11 - i).slice(0, 7); return { key: k, k }; }), 4, 5);
  const wd = map(6), cnt = Array(7).fill(0); for (let d = wf; d <= today; d = addDays(d, 1)) cnt[new Date(`${d}T00:00:00Z`).getUTCDay()]++;
  const weekdays = Array.from({ length: 7 }, (_, d) => ({ d, avg: cnt[d] ? num(wd.get(String(d))?.pv) / cnt[d] : 0 }));
  const v = { daily, weekly, monthly, weekdays }; memo.set(today, { t: Date.now(), v }); if (memo.size > 3) memo.delete(memo.keys().next().value);
  return v;
}

export async function stats(env, rangeKey) {
  const key = rangeKey in RANGES ? rangeKey : "7d", R = RANGES[key], now = Date.now(), today = dayOf(now);
  const from = addDays(today, -(R.n - 1)), pTo = addDays(from, -1), pFrom = addDays(pTo, -(R.n - 1)), y = addDays(today, -1), w7 = addDays(today, -6), m30 = addDays(today, -29);
  const [R_, tr] = await Promise.all([
    rpc(env, "saad_stats_raw", { p_key: key, p_n: R.n, p_step: R.step, p_today: today, p_from: from, p_pfrom: pFrom, p_pto: pTo, p_y: y, p_w7: w7, p_m30: m30 }),
    trend(env, today),
  ]);
  const one = (k) => (R_[k] || [])[0] || {};

  // chart buckets (filled with zeros so the chart never has holes)
  const buckets = key === "today" ? 24 : Math.ceil(R.n / R.step), s = Array.from({ length: buckets }, (_, i) => ({ i, vis: 0, pv: 0, nw: 0 }));
  for (const r of R_.series || []) if (s[r.b]) { s[r.b].vis = num(r.vis); s[r.b].pv = num(r.pv); }
  for (const r of R_.newSeries || []) if (s[r.b]) s[r.b].nw = num(r.n);
  const labelOf = (i) => (key === "today" ? `${i}:00` : addDays(from, i * R.step));
  const series2 = s.map((x) => ({ ...x, nw: Math.min(x.nw, x.vis), k: labelOf(x.i), ...(key !== "today" && R.step > 1 ? { to: addDays(from, Math.min(R.n - 1, x.i * R.step + R.step - 1)) } : {}) }));
  const hours = Array(24).fill(0); for (const r of R_.hours || []) hours[r.k] = num(r.n);
  const per = (k, n) => kpiOf(one(k), 0, one(n).n);
  return {
    ok: true, range: key, from, to: today, now, since: one("since").f || null, all: { vis: num(one("allVis").n), pv: num(one("allPv").n) }, series: series2,
    cur: kpiOf(one("cur"), one("bCur").n, one("nCur").n), prev: kpiOf(one("prev"), one("bPrev").n, one("nPrev").n),
    periods: { today: per("kToday", "nToday"), yesterday: per("kY", "nY"), week: per("kW", "nW"), month: per("kM", "nM") }, trend: tr,
    pages: R_.pages || [], sources: R_.sources || [], devices: R_.devices || [], places: R_.places || [], cars: R_.cars || [], spots: R_.spots || [], hours,
  };
}

// Full activity history for the dashboard's "Taza activity" sheet: newest first, loaded in pages while the owner scrolls (before = id of the last row already shown).
export async function activityFeed(env, before) {
  const lim = 40, b = Math.max(0, Number(before) || 0);
  const rows = (await rpc(env, "saad_activity_raw", { p_before: b, p_lim: lim + 1 })) || [], more = rows.length > lim, ev = rows.slice(0, lim).map((x) => ({ ...x, nw: !!x.nw }));
  return { ok: true, events: ev, more, next: ev.length ? ev[ev.length - 1].id : 0, dayStart: undefined };
}

/* LIVE: who is on the website right now + newest activity (polled every few seconds by the dashboard).
   "online" = visitors seen in the last 100 s. The website sends a tiny "ping" every 30 s while a page is open and visible. */
export async function liveFeed(env, since) {
  const now = Date.now(), cut = now - 100e3;
  const o = (await rpc(env, "saad_live_raw", { p_since: since > 0 ? since : 0, p_cut: cut })) || {};
  const rows = (k) => o[k] || [], ev = rows("events").map((r) => ({ ...r, nw: !!r.nw }));
  return { ok: true, now, online: num(rows("online")[0]?.n), people: rows("people"), events: ev, cursor: num(rows("maxid")[0]?.m), last: num(rows("last")[0]?.ts) || null };
}
