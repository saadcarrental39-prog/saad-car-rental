// First-party, privacy-friendly website analytics stored in Cloudflare D1 (binding name: DB).
// No IP address, name or phone number is ever stored: only a random visitor id made by the browser.
// All days/hours use Pakistan time (UTC+5, no daylight saving), so "Aaj" means the owner's today.
const PKT = 5 * 3600e3, DAY = 864e5;
export const dayOf = (ts) => new Date(ts + PKT).toISOString().slice(0, 10);
export const hourOf = (ts) => new Date(ts + PKT).getUTCHours();
export const addDays = (d, n) => new Date(Date.parse(`${d}T00:00:00Z`) + n * DAY).toISOString().slice(0, 10);
const monthStart = (d, back) => { const [y, m] = d.split("-").map(Number); return new Date(Date.UTC(y, m - 1 - back, 1)).toISOString().slice(0, 10); };

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS hits (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER NOT NULL, day TEXT NOT NULL, hr INTEGER NOT NULL, vid TEXT NOT NULL, sid TEXT NOT NULL, type TEXT NOT NULL, path TEXT, item TEXT, src TEXT, dev TEXT, cty TEXT, city TEXT)`,
  `CREATE INDEX IF NOT EXISTS hits_day ON hits (day, type)`,
  `CREATE INDEX IF NOT EXISTS hits_vid ON hits (vid, ts)`,
  `CREATE INDEX IF NOT EXISTS hits_ts ON hits (ts)`,
  // one row per visitor = the moment they were first seen. "New visitors" are simply the rows of a period (fast, no full-table scan).
  `CREATE TABLE IF NOT EXISTS vfirst (vid TEXT PRIMARY KEY, ts INTEGER NOT NULL, day TEXT NOT NULL, hr INTEGER NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS vfirst_day ON vfirst (day)`,
  // customers / leads typed into the website forms (also the ones who never pressed Send). One row per visitor per form.
  `CREATE TABLE IF NOT EXISTS leads (vid TEXT NOT NULL, src TEXT NOT NULL, created INTEGER NOT NULL, updated INTEGER NOT NULL, name TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '', whatsapp TEXT NOT NULL DEFAULT '', car TEXT NOT NULL DEFAULT '', pickup TEXT NOT NULL DEFAULT '', dropoff TEXT NOT NULL DEFAULT '', day TEXT NOT NULL DEFAULT '', tm TEXT NOT NULL DEFAULT '', pax TEXT NOT NULL DEFAULT '', extra TEXT NOT NULL DEFAULT '', city TEXT NOT NULL DEFAULT '', dev TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'partial', seen INTEGER NOT NULL DEFAULT 0, called INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (vid, src))`,
  `CREATE INDEX IF NOT EXISTS leads_updated ON leads (updated)`,
];
let ready = null;
async function init(db) {
  const had = await db.prepare(`SELECT 1 x FROM sqlite_master WHERE type='table' AND name='vfirst'`).first();
  await db.batch(SCHEMA.map((q) => db.prepare(q)));
  // one-time backfill from the visits already stored (SQLite bare columns take the values of the MIN(ts) row)
  if (!had) await db.prepare(`INSERT OR IGNORE INTO vfirst (vid, ts, day, hr) SELECT vid, MIN(ts), day, hr FROM hits WHERE type='pv' GROUP BY vid`).run();
}
export const ensure = (db) => (ready ||= init(db).catch((e) => { ready = null; throw e; }));

/* ---------- collect: one row per page view / event ---------- */
const BOT = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|whatsapp|telegram|curl|wget|python|axios|monitor|uptime|gtmetrix|pingdom/i;
const clip = (x, n) => String(x ?? "").replace(/[\u0000-\u001f<>]/g, " ").trim().slice(0, n);
const TYPES = new Set(["pv", "ping", "phone_click", "whatsapp_click", "email_click", "booking_click", "quote_start", "quote_submit", "form_error", "vehicle_view", "service_view", "route_view", "location_view"]);

export async function collect(db, request, raw) {   // returns "ok" or the reason why the hit was not stored
  if (BOT.test(request.headers.get("user-agent") || "")) return "bot";
  let b; try { b = JSON.parse(raw ?? (await request.text())); } catch { return "bad_body"; }
  const type = TYPES.has(b.t) ? b.t : "";
  const vid = clip(b.v, 40).replace(/[^A-Za-z0-9-]/g, ""), sid = clip(b.s, 40).replace(/[^A-Za-z0-9-]/g, "");
  if (!type || vid.length < 8 || sid.length < 8) return "bad_fields";
  const path = clip(b.p, 120).split(/[?#]/)[0] || "/", ts = Date.now(), cf = request.cf || {}, day = dayOf(ts), hr = hourOf(ts);
  const dev = ["mobile", "tablet", "desktop"].includes(b.d) ? b.d : "desktop";
  await ensure(db);
  const jobs = [db.prepare(`INSERT INTO hits (ts, day, hr, vid, sid, type, path, item, src, dev, cty, city) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
    .bind(ts, day, hr, vid, sid, type, path, clip(b.i, 60), clip(b.r, 40).toLowerCase() || "direct", dev, clip(cf.country, 2), clip(cf.city, 40))];
  if (type === "pv") jobs.push(db.prepare(`INSERT OR IGNORE INTO vfirst (vid, ts, day, hr) VALUES (?,?,?,?)`).bind(vid, ts, day, hr));
  await db.batch(jobs);
  if (Math.random() < 0.01) await db.prepare(`DELETE FROM hits WHERE ts < ?`).bind(ts - 400 * DAY).run();   // keep ~13 months of detail
  return "ok";
}

/* ---------- stats for the Admin dashboard ---------- */
const RANGES = { today: { n: 1, step: 1 }, "7d": { n: 7, step: 1 }, "30d": { n: 30, step: 1 }, "90d": { n: 90, step: 7 } };
export const RANGE_DAYS = { today: 1, "7d": 7, "30d": 30, "90d": 90 };
const KPI = `SELECT COUNT(DISTINCT CASE WHEN type='pv' THEN vid END) vis, SUM(type='pv') pv, COUNT(DISTINCT CASE WHEN type='pv' THEN sid END) ses,
  SUM(type='phone_click') calls, SUM(type='whatsapp_click') wa, SUM(type='email_click') em, SUM(type='booking_click') bc, SUM(type='quote_start') qs, SUM(type='quote_submit') qd
  FROM hits WHERE day BETWEEN ? AND ?`;
const BOUNCE = `SELECT COUNT(*) n FROM (SELECT sid FROM hits WHERE type='pv' AND day BETWEEN ? AND ? GROUP BY sid HAVING COUNT(*)=1)`;
const NEWQ = `SELECT COUNT(*) n FROM vfirst WHERE day BETWEEN ? AND ?`;
const INQ = `SUM(type IN ('phone_click','whatsapp_click','quote_submit'))`;
const num = (x) => Number(x) || 0;
const kpiOf = (r, bounce, nw) => ({ vis: num(r.vis), pv: num(r.pv), ses: num(r.ses), calls: num(r.calls), wa: num(r.wa), em: num(r.em), bc: num(r.bc), qs: num(r.qs), qd: num(r.qd), bounce: num(bounce), nw: num(nw) });

/* Daily (30 days) / weekly (12 weeks) / monthly (12 months) trend. Cached 90 s: it is the heaviest part and changes slowly. */
const memo = new Map();
async function trend(db, today) {
  const hit = memo.get(today); if (hit && Date.now() - hit.t < 90e3) return hit.v;
  const d0 = addDays(today, -29), w0 = addDays(today, -83), m0 = monthStart(today, 11), q = (s, ...a) => db.prepare(s).bind(...a);
  const WB = `CAST((julianday(day)-julianday(?1))/7 AS INTEGER)`, HIT = (k, from) => `SELECT ${k} k, COUNT(DISTINCT CASE WHEN type='pv' THEN vid END) vis, SUM(type='pv') pv, COUNT(DISTINCT CASE WHEN type='pv' THEN sid END) ses, ${INQ} inq FROM hits WHERE day BETWEEN ${from} AND ?2 GROUP BY k`;
  const first = await q(`SELECT MIN(day) d FROM hits`).first(), since = first?.d || today, wf = since > addDays(today, -89) ? since : addDays(today, -89);
  const out = await db.batch([
    q(HIT("day", "?1"), d0, today), q(`SELECT day k, COUNT(*) n FROM vfirst WHERE day BETWEEN ?1 AND ?2 GROUP BY k`, d0, today),
    q(HIT(WB, "?1"), w0, today), q(`SELECT ${WB} k, COUNT(*) n FROM vfirst WHERE day BETWEEN ?1 AND ?2 GROUP BY k`, w0, today),
    q(HIT("substr(day,1,7)", "?1"), m0, today), q(`SELECT substr(day,1,7) k, COUNT(*) n FROM vfirst WHERE day BETWEEN ?1 AND ?2 GROUP BY k`, m0, today),
    q(`SELECT CAST(strftime('%w',day) AS INTEGER) k, COUNT(*) pv FROM hits WHERE type='pv' AND day BETWEEN ? AND ? GROUP BY k`, wf, today),
  ]);
  const map = (i) => new Map((out[i].results || []).map((r) => [String(r.k), r]));
  const fill = (keys, hitI, newI) => { const h = map(hitI), n = map(newI); return keys.map((o) => { const r = h.get(String(o.key)) || {}, vis = num(r.vis), nw = Math.min(vis, num(n.get(String(o.key))?.n)); delete o.key; return { ...o, vis, pv: num(r.pv), ses: num(r.ses), inq: num(r.inq), nw, ret: Math.max(0, vis - nw) }; }); };
  const daily = fill(Array.from({ length: 30 }, (_, i) => { const d = addDays(d0, i); return { key: d, k: d }; }), 0, 1);
  const weekly = fill(Array.from({ length: 12 }, (_, i) => ({ key: i, k: addDays(w0, i * 7), to: addDays(w0, i * 7 + 6) })), 2, 3);
  const monthly = fill(Array.from({ length: 12 }, (_, i) => { const k = monthStart(today, 11 - i).slice(0, 7); return { key: k, k }; }), 4, 5);
  const wd = map(6), cnt = Array(7).fill(0); for (let d = wf; d <= today; d = addDays(d, 1)) cnt[new Date(`${d}T00:00:00Z`).getUTCDay()]++;
  const weekdays = Array.from({ length: 7 }, (_, d) => ({ d, avg: cnt[d] ? num(wd.get(String(d))?.pv) / cnt[d] : 0 }));
  const v = { daily, weekly, monthly, weekdays }; memo.set(today, { t: Date.now(), v }); if (memo.size > 3) memo.delete(memo.keys().next().value);
  return v;
}

export async function stats(db, rangeKey) {
  await ensure(db);
  const key = rangeKey in RANGES ? rangeKey : "7d", R = RANGES[key], now = Date.now(), today = dayOf(now);
  const from = addDays(today, -(R.n - 1)), pTo = addDays(from, -1), pFrom = addDays(pTo, -(R.n - 1)), y = addDays(today, -1), w7 = addDays(today, -6), m30 = addDays(today, -29);
  const q = (sql, ...a) => db.prepare(sql).bind(...a);
  const series = key === "today"
    ? q(`SELECT hr b, COUNT(*) pv, COUNT(DISTINCT vid) vis FROM hits WHERE type='pv' AND day=? GROUP BY hr`, today)
    : q(`SELECT CAST((julianday(day)-julianday(?1))/?2 AS INTEGER) b, COUNT(*) pv, COUNT(DISTINCT vid) vis FROM hits WHERE type='pv' AND day BETWEEN ?1 AND ?3 GROUP BY b`, from, R.step, today);
  const newSeries = key === "today"
    ? q(`SELECT hr b, COUNT(*) n FROM vfirst WHERE day=? GROUP BY hr`, today)
    : q(`SELECT CAST((julianday(day)-julianday(?1))/?2 AS INTEGER) b, COUNT(*) n FROM vfirst WHERE day BETWEEN ?1 AND ?3 GROUP BY b`, from, R.step, today);
  const top = (col, where = `type='pv'`, extra = ``, lim = 8) => q(`SELECT ${col} k, COUNT(*) n, COUNT(DISTINCT vid) u FROM hits WHERE ${where} AND day BETWEEN ? AND ? ${extra} GROUP BY k ORDER BY n DESC LIMIT ${lim}`, from, today);
  const Q = {
    series, newSeries, cur: q(KPI, from, today), prev: q(KPI, pFrom, pTo), bCur: q(BOUNCE, from, today), bPrev: q(BOUNCE, pFrom, pTo),
    nCur: q(NEWQ, from, today), nPrev: q(NEWQ, pFrom, pTo),
    kToday: q(KPI, today, today), kY: q(KPI, y, y), kW: q(KPI, w7, today), kM: q(KPI, m30, today),
    nToday: q(NEWQ, today, today), nY: q(NEWQ, y, y), nW: q(NEWQ, w7, today), nM: q(NEWQ, m30, today),
    pages: top(`path`), sources: top(`src`, `type='pv'`, ``, 7), devices: top(`dev`, `type='pv'`, ``, 4),
    places: top(`city`, `type='pv'`, `AND city<>''`, 6), cars: top(`item`, `type='vehicle_view'`, `AND item<>''`, 6),
    spots: top(`item`, `type IN ('route_view','location_view','service_view')`, `AND item<>''`, 6),
    hours: q(`SELECT hr k, COUNT(*) n FROM hits WHERE type='pv' AND day BETWEEN ? AND ? GROUP BY hr`, from, today),
        since: q(`SELECT MIN(ts) f FROM hits`),
  };
  const names = Object.keys(Q), [res, tr] = await Promise.all([db.batch(names.map((k) => Q[k])), trend(db, today)]);
  const R_ = Object.fromEntries(names.map((k, i) => [k, res[i].results || []])), one = (k) => R_[k][0] || {};

  // chart buckets (filled with zeros so the chart never has holes)
  const buckets = key === "today" ? 24 : Math.ceil(R.n / R.step), s = Array.from({ length: buckets }, (_, i) => ({ i, vis: 0, pv: 0, nw: 0 }));
  for (const r of R_.series) if (s[r.b]) { s[r.b].vis = num(r.vis); s[r.b].pv = num(r.pv); }
  for (const r of R_.newSeries) if (s[r.b]) s[r.b].nw = num(r.n);
  const labelOf = (i) => (key === "today" ? `${i}:00` : addDays(from, i * R.step));
  const series2 = s.map((x) => ({ ...x, nw: Math.min(x.nw, x.vis), k: labelOf(x.i), ...(key !== "today" && R.step > 1 ? { to: addDays(from, Math.min(R.n - 1, x.i * R.step + R.step - 1)) } : {}) }));
  const hours = Array(24).fill(0); for (const r of R_.hours) hours[r.k] = num(r.n);
  const per = (k, n) => kpiOf(one(k), 0, one(n).n);
  return {
    ok: true, range: key, from, to: today, now, since: one("since").f || null, series: series2,
    cur: kpiOf(one("cur"), one("bCur").n, one("nCur").n), prev: kpiOf(one("prev"), one("bPrev").n, one("nPrev").n),
    periods: { today: per("kToday", "nToday"), yesterday: per("kY", "nY"), week: per("kW", "nW"), month: per("kM", "nM") }, trend: tr,
    pages: R_.pages, sources: R_.sources, devices: R_.devices, places: R_.places, cars: R_.cars, spots: R_.spots, hours,
  };
}

/* ---------- LIVE: who is on the website right now + newest activity (polled every few seconds by the dashboard) ----------
   "online" = visitors seen in the last 100 s. The website sends a tiny "ping" every 30 s while a page is open and visible. */
export async function liveFeed(db, since) {
  await ensure(db);
  const now = Date.now(), q = (s, ...a) => db.prepare(s).bind(...a), cut = now - 100e3, after = since > 0;
  const EV = `SELECT h.id, h.ts, h.type, h.path, h.item, h.city, h.dev, h.src, (v.ts = h.ts) nw FROM hits h LEFT JOIN vfirst v ON v.vid = h.vid WHERE h.type NOT IN ('ping','form_error')`;
  const out = await db.batch([
    q(`SELECT COUNT(DISTINCT vid) n FROM hits WHERE ts > ?`, cut),
    q(`SELECT path, src, dev, city, MAX(ts) ts FROM hits WHERE ts > ? AND type<>'form_error' GROUP BY vid ORDER BY ts DESC LIMIT 10`, cut),
    after ? q(`${EV} AND h.id > ? ORDER BY h.id DESC LIMIT 25`, since) : q(`${EV} ORDER BY h.id DESC LIMIT 15`),
    q(`SELECT MAX(id) m FROM hits`),
    q(`SELECT ts FROM hits WHERE type<>'ping' ORDER BY ts DESC LIMIT 1`),
  ]);
  const rows = (i) => out[i].results || [], ev = rows(2).map((r) => ({ ...r, nw: !!r.nw }));
  return { ok: true, now, online: num(rows(0)[0]?.n), people: rows(1), events: ev, cursor: num(rows(3)[0]?.m), last: num(rows(4)[0]?.ts) || null };
}
