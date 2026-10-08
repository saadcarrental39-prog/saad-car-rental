// First-party, privacy-friendly website analytics stored in Cloudflare D1 (binding name: DB).
// No IP address, name or phone number is ever stored: only a random visitor id made by the browser.
// All days/hours use Pakistan time (UTC+5, no daylight saving), so "Aaj" means the owner's today.
const PKT = 5 * 3600e3, DAY = 864e5;
export const dayOf = (ts) => new Date(ts + PKT).toISOString().slice(0, 10);
export const hourOf = (ts) => new Date(ts + PKT).getUTCHours();
export const addDays = (d, n) => new Date(Date.parse(`${d}T00:00:00Z`) + n * DAY).toISOString().slice(0, 10);
const dayStartMs = (d) => Date.parse(`${d}T00:00:00Z`) - PKT;

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS hits (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER NOT NULL, day TEXT NOT NULL, hr INTEGER NOT NULL, vid TEXT NOT NULL, sid TEXT NOT NULL, type TEXT NOT NULL, path TEXT, item TEXT, src TEXT, dev TEXT, cty TEXT, city TEXT)`,
  `CREATE INDEX IF NOT EXISTS hits_day ON hits (day, type)`,
  `CREATE INDEX IF NOT EXISTS hits_vid ON hits (vid, ts)`,
  `CREATE INDEX IF NOT EXISTS hits_ts ON hits (ts)`,
];
let ready = null;
export const ensure = (db) => (ready ||= db.batch(SCHEMA.map((q) => db.prepare(q))).catch((e) => { ready = null; throw e; }));

/* ---------- collect: one row per page view / event ---------- */
const BOT = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|whatsapp|telegram|curl|wget|python|axios|monitor|uptime|gtmetrix|pingdom/i;
const clip = (x, n) => String(x ?? "").replace(/[\u0000-\u001f<>]/g, " ").trim().slice(0, n);
const TYPES = new Set(["pv", "phone_click", "whatsapp_click", "email_click", "booking_click", "quote_start", "quote_submit", "form_error", "vehicle_view", "service_view", "route_view", "location_view"]);

export async function collect(db, request) {
  if (BOT.test(request.headers.get("user-agent") || "")) return;
  let b; try { b = JSON.parse(await request.text()); } catch { return; }
  const type = TYPES.has(b.t) ? b.t : "";
  const vid = clip(b.v, 40).replace(/[^A-Za-z0-9-]/g, ""), sid = clip(b.s, 40).replace(/[^A-Za-z0-9-]/g, "");
  if (!type || vid.length < 8 || sid.length < 8) return;
  const path = clip(b.p, 120).split(/[?#]/)[0] || "/", ts = Date.now(), cf = request.cf || {};
  const dev = ["mobile", "tablet", "desktop"].includes(b.d) ? b.d : "desktop";
  await ensure(db);
  await db.prepare(`INSERT INTO hits (ts, day, hr, vid, sid, type, path, item, src, dev, cty, city) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
    .bind(ts, dayOf(ts), hourOf(ts), vid, sid, type, path, clip(b.i, 60), clip(b.r, 40).toLowerCase() || "direct", dev, clip(cf.country, 2), clip(cf.city, 40)).run();
  if (Math.random() < 0.01) await db.prepare(`DELETE FROM hits WHERE ts < ?`).bind(ts - 400 * DAY).run();   // keep ~13 months
}

/* ---------- stats for the Admin dashboard ---------- */
const RANGES = { today: { n: 1, step: 1 }, "7d": { n: 7, step: 1 }, "30d": { n: 30, step: 1 }, "90d": { n: 90, step: 7 } };
const KPI = `SELECT COUNT(DISTINCT CASE WHEN type='pv' THEN vid END) vis, SUM(type='pv') pv, COUNT(DISTINCT CASE WHEN type='pv' THEN sid END) ses,
  SUM(type='phone_click') calls, SUM(type='whatsapp_click') wa, SUM(type='email_click') em, SUM(type='booking_click') bc, SUM(type='quote_start') qs, SUM(type='quote_submit') qd
  FROM hits WHERE day BETWEEN ? AND ?`;
const BOUNCE = `SELECT COUNT(*) n FROM (SELECT sid FROM hits WHERE type='pv' AND day BETWEEN ? AND ? GROUP BY sid HAVING COUNT(*)=1)`;
const num = (x) => Number(x) || 0;
const kpiOf = (r, bounce, newV) => ({ vis: num(r.vis), pv: num(r.pv), ses: num(r.ses), calls: num(r.calls), wa: num(r.wa), em: num(r.em), bc: num(r.bc), qs: num(r.qs), qd: num(r.qd), bounce: num(bounce), nw: newV });

export async function stats(db, rangeKey) {
  await ensure(db);
  const R = RANGES[rangeKey] || RANGES["7d"], now = Date.now(), today = dayOf(now);
  const from = addDays(today, -(R.n - 1)), pTo = addDays(from, -1), pFrom = addDays(pTo, -(R.n - 1)), y = addDays(today, -1);
  const w7 = addDays(today, -6), m30 = addDays(today, -29), first = addDays(today, -Math.max(R.n * 2, 31) + 1);
  const q = (sql, ...a) => db.prepare(sql).bind(...a);
  const series = rangeKey === "today"
    ? q(`SELECT hr b, COUNT(*) pv, COUNT(DISTINCT vid) vis FROM hits WHERE type='pv' AND day=? GROUP BY hr`, today)
    : q(`SELECT CAST((julianday(day)-julianday(?1))/?2 AS INTEGER) b, COUNT(*) pv, COUNT(DISTINCT vid) vis FROM hits WHERE type='pv' AND day BETWEEN ?1 AND ?3 GROUP BY b`, from, R.step, today);
  const top = (col, where = `type='pv'`, extra = ``, lim = 8) => q(`SELECT ${col} k, COUNT(*) n, COUNT(DISTINCT vid) u FROM hits WHERE ${where} AND day BETWEEN ? AND ? ${extra} GROUP BY k ORDER BY n DESC LIMIT ${lim}`, from, today);
  const out = await db.batch([
    series,                                                                                        // 0
    q(KPI, from, today), q(KPI, pFrom, pTo), q(BOUNCE, from, today), q(BOUNCE, pFrom, pTo),         // 1-4
    q(`SELECT vid, MIN(ts) f FROM hits WHERE type='pv' GROUP BY vid HAVING f >= ? LIMIT 60000`, dayStartMs(first)), // 5: first visit of every new visitor
    q(KPI, today, today), q(KPI, y, y), q(KPI, w7, today), q(KPI, m30, today),                      // 6-9 daily / weekly / monthly cards
    top(`path`), top(`src`, `type='pv'`, ``, 7), top(`dev`, `type='pv'`, ``, 4),                    // 10-12
    top(`city`, `type='pv'`, `AND city<>''`, 6), top(`item`, `type='vehicle_view'`, `AND item<>''`, 6), // 13-14
    top(`item`, `type IN ('route_view','location_view','service_view')`, `AND item<>''`, 6),        // 15
    q(`SELECT hr k, COUNT(*) n FROM hits WHERE type='pv' AND day BETWEEN ? AND ? GROUP BY hr`, from, today), // 16
    q(`SELECT COUNT(DISTINCT vid) n FROM hits WHERE ts > ?`, now - 5 * 60e3),                       // 17
    q(`SELECT ts, type, path, item, city, dev, src FROM hits WHERE type<>'form_error' ORDER BY ts DESC LIMIT 12`), // 18
    q(`SELECT day k, COUNT(DISTINCT vid) vis, COUNT(*) pv FROM hits WHERE type='pv' AND day BETWEEN ? AND ? GROUP BY day`, m30, today), // 19
    q(`SELECT MIN(ts) f FROM hits`),                                                                // 20
  ]);
  const rows = (i) => out[i].results || [];
  const firsts = rows(5).map((r) => num(r.f));
  const newIn = (d1, d2) => firsts.filter((f) => f >= dayStartMs(d1) && f < dayStartMs(d2) + DAY).length;

  // chart buckets (filled with zeros so the chart never has holes)
  const buckets = rangeKey === "today" ? 24 : Math.ceil(R.n / R.step), s = Array.from({ length: buckets }, (_, i) => ({ i, vis: 0, pv: 0, nw: 0 }));
  for (const r of rows(0)) if (s[r.b]) { s[r.b].vis = num(r.vis); s[r.b].pv = num(r.pv); }
  for (const f of firsts) {
    const d = dayOf(f); if (d < from || d > today) continue;
    const i = rangeKey === "today" ? hourOf(f) : Math.floor((Date.parse(d) - Date.parse(from)) / DAY / R.step); if (s[i]) s[i].nw++;
  }
  const labelOf = (i) => (rangeKey === "today" ? `${i}:00` : addDays(from, i * R.step));
  const series2 = s.map((x) => ({ ...x, k: labelOf(x.i), ...(rangeKey !== "today" && R.step > 1 ? { to: addDays(from, Math.min(R.n - 1, x.i * R.step + R.step - 1)) } : {}) }));

  const hours = Array(24).fill(0); for (const r of rows(16)) hours[r.k] = num(r.n);
  const daily = Object.fromEntries(rows(19).map((r) => [r.k, { vis: num(r.vis), pv: num(r.pv) }]));
  const last14 = Array.from({ length: 14 }, (_, i) => { const d = addDays(today, i - 13); return { d, ...(daily[d] || { vis: 0, pv: 0 }) }; });
  const per = (i, a, b) => ({ ...kpiOf(rows(i)[0] || {}, 0, newIn(a, b)) });
  return {
    ok: true, range: rangeKey in RANGES ? rangeKey : "7d", from, to: today, now, since: rows(20)[0]?.f || null,
    live: num(rows(17)[0]?.n), series: series2,
    cur: kpiOf(rows(1)[0] || {}, rows(3)[0]?.n, newIn(from, today)), prev: kpiOf(rows(2)[0] || {}, rows(4)[0]?.n, newIn(pFrom, pTo)),
    periods: { today: per(6, today, today), yesterday: per(7, y, y), week: per(8, w7, today), month: per(9, m30, today) }, last14,
    pages: rows(10), sources: rows(11), devices: rows(12), places: rows(13), cars: rows(14), spots: rows(15), hours, feed: rows(18),
  };
}
