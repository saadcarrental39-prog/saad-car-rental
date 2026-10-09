import { useCallback, useEffect, useRef, useState } from "react";
import "../styles/insights.css";

/* Owner dashboard (premium dark): visitors, new vs returning customers, daily / weekly / monthly trends, sources, devices,
   top pages & cars, customer actions, bookings. Data: POST /api/admin { action: "stats", range } (functions/_lib/stats.js).
   All times are Pakistan time. */

const RANGES = [["today", "Aaj"], ["7d", "7 Din"], ["30d", "30 Din"], ["90d", "90 Din"]];
const VS = { today: "kal ke muqable", "7d": "pichle 7 din ke muqable", "30d": "pichle 30 din ke muqable", "90d": "pichle 90 din ke muqable" };
const TRENDS = [["daily", "Daily", "Pichle 30 din"], ["weekly", "Weekly", "Pichle 12 hafte"], ["monthly", "Monthly", "Pichle 12 mahine"]];
const WD = ["Itwar", "Peer", "Mangal", "Budh", "Jumeraat", "Jumma", "Hafta"];
const SRC_COLOR = { google: "#4285f4", direct: "#c9a24a", facebook: "#1877f2", instagram: "#e1306c", whatsapp: "#25d366", youtube: "#ff3b30", bing: "#00a4c4", tiktok: "#69c9d0", x: "#9aa0a6", search: "#9b8afb" };
const DEV = { mobile: ["Mobile", "#e6c36a"], desktop: ["Computer", "#8d93a1"], tablet: ["Tablet", "#4b4f5a"] };
const EV = { pv: ["👁", "Page dekha"], phone_click: ["📞", "Call button dabaya"], whatsapp_click: ["💬", "WhatsApp dabaya"], email_click: ["✉️", "Email dabaya"], booking_click: ["🚘", "Book Now dabaya"], quote_start: ["📝", "Form shuru kiya"], quote_submit: ["✅", "Booking / inquiry bheji"], vehicle_view: ["🚗", "Gaari dekhi"], service_view: ["🛎", "Service dekhi"], route_view: ["🛣", "Route dekha"], location_view: ["📍", "Location dekhi"] };

const fmt = (n) => { n = Math.round(Number(n) || 0); return n >= 100000 ? `${(n / 1000).toFixed(0)}k` : n >= 10000 ? `${(n / 1000).toFixed(1)}k` : n.toLocaleString("en-US"); };
const title = (s) => String(s).replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const pretty = (p) => { const parts = String(p || "/").split("/").filter(Boolean); return parts.length ? parts.map(title).join(" › ") : "Home"; };
const dlabel = (d, o = { day: "numeric", month: "short" }) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", { ...o, timeZone: "UTC" });
const mlabel = (k, long) => new Date(`${k}-01T00:00:00Z`).toLocaleDateString("en-GB", { month: long ? "long" : "short", ...(long ? { year: "numeric" } : {}), timeZone: "UTC" });
const h12 = (h) => `${h % 12 || 12} ${h % 24 < 12 ? "am" : "pm"}`;
const ago = (ts) => { const m = Math.max(0, Math.round((Date.now() - ts) / 60000)); return m < 1 ? "abhi" : m < 60 ? `${m} min pehle` : m < 1440 ? `${Math.round(m / 60)} ghante pehle` : `${Math.round(m / 1440)} din pehle`; };
const share = (a, b) => (b > 0 ? Math.min(100, (a / b) * 100) : 0);
const pct = (cur, prev) => (prev > 0 ? Math.round(((cur - prev) / prev) * 100) : null);

function useCount(v) {   // numbers count up smoothly when data arrives
  const [n, setN] = useState(v), from = useRef(v);
  useEffect(() => {
    const a = from.current, b = v;
    if (a === b || matchMedia("(prefers-reduced-motion: reduce)").matches) { setN(b); from.current = b; return; }
    let raf, t0; const step = (t) => { t0 = t0 ?? t; const p = Math.min(1, (t - t0) / 700); setN(Math.round(a + (b - a) * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(step); else from.current = b; };
    raf = requestAnimationFrame(step); return () => cancelAnimationFrame(raf);
  }, [v]);
  return n;
}
const Num = ({ v, suffix = "" }) => <>{fmt(useCount(Number(v) || 0))}{suffix}</>;

function Delta({ cur, prev, invert }) {
  if (!cur && !prev) return null;
  if (!prev) return <em className="in-delta in-delta--new">New</em>;
  const p = Math.round(((cur - prev) / prev) * 100), good = invert ? p <= 0 : p >= 0;
  return <em className={`in-delta ${p === 0 ? "" : good ? "in-delta--up" : "in-delta--down"}`}>{p > 0 ? "▲" : p < 0 ? "▼" : "•"} {Math.abs(p)}%</em>;
}

/* ---------- charts ---------- */
function Spark({ vals }) {   // tiny trend line inside a KPI card
  const W = 84, H = 30, m = Math.max(1, ...vals), n = vals.length; if (n < 2 || !vals.some(Boolean)) return null;
  const pts = vals.map((v, i) => [(i / (n - 1)) * W, H - 3 - (v / m) * (H - 8)]), d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("");
  return <svg className="in-sparkline" viewBox={`0 0 ${W} ${H}`} aria-hidden="true"><path d={`${d}L${W} ${H}L0 ${H}Z`} className="in-sparkline__fill" /><path d={d} className="in-sparkline__line" /><circle cx={pts[n - 1][0]} cy={pts[n - 1][1]} r="2.6" className="in-sparkline__dot" /></svg>;
}

/* stacked bars: gold = new visitors, white = all visitors (so the white part above the gold = returning) */
function Chart({ s, tick, sel, setSel, uid }) {
  const W = 340, H = 140, n = s.length, gap = n > 40 ? 2 : n > 16 ? 3 : n > 8 ? 5 : 10, bw = (W - gap * (n - 1)) / n, max = Math.max(1, ...s.map((x) => x.vis));
  const rx = Math.min(6, bw / 2), cur = sel ?? n - 1;
  return (<svg className="in-chart" viewBox={`0 0 ${W} ${H + 22}`} role="img" aria-label="Visitors chart">
    <defs><linearGradient id={`g${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f3dc9a" /><stop offset="1" stopColor="#c9a24a" /></linearGradient></defs>
    {[0.25, 0.5, 0.75].map((f) => <line key={f} x1="0" x2={W} y1={H - H * f} y2={H - H * f} className="in-grid" />)}
    {s.map((x, i) => {
      const hAll = x.vis ? Math.max(4, (x.vis / max) * (H - 6)) : 2, hNew = x.vis ? Math.min(hAll, (x.nw / x.vis) * hAll) : 0, X = i * (bw + gap), on = i === cur, t = tick(i, n);
      return (<g key={i} className={on ? "is-on" : ""} onPointerEnter={() => setSel(i)} onClick={() => setSel(i)}>
        <rect x={X - gap / 2} y="0" width={bw + gap} height={H + 20} fill="transparent" />
        <rect x={X} y={H - hAll} width={bw} height={hAll} rx={rx} className="in-bar" />
        {hNew > 0 && <rect x={X} y={H - hNew} width={bw} height={hNew} rx={Math.min(rx, hNew / 2)} fill={`url(#g${uid})`} opacity={on ? 1 : 0.7} />}
        {t && <text x={X + bw / 2} y={H + 16} textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"} className="in-tick">{t}</text>}
      </g>);
    })}
  </svg>);
}
function heroTick(range, s) {
  return (i, n) => range === "today" ? i % 6 === 0 && h12(i) : range === "7d" ? dlabel(s[i].k, { weekday: "short" }) : range === "30d" ? (n - 1 - i) % 5 === 0 && dlabel(s[i].k) : (n - 1 - i) % 3 === 0 && dlabel(s[i].k);
}
const trendTick = (view, rows) => (i, n) => view === "daily" ? (n - 1 - i) % 5 === 0 && dlabel(rows[i].k) : view === "weekly" ? (n - 1 - i) % 2 === 0 && dlabel(rows[i].k) : mlabel(rows[i].k);
const trendName = (view, x) => !x ? "" : view === "monthly" ? mlabel(x.k, true) : view === "weekly" ? `${dlabel(x.k)} – ${dlabel(x.to)}` : dlabel(x.k, { weekday: "short", day: "numeric", month: "short" });
function tip(x, range) {
  if (!x) return "";
  if (range === "today") return `${h12(x.i)} – ${h12(x.i + 1)}`;
  return x.to && x.to !== x.k ? `${dlabel(x.k)} – ${dlabel(x.to)}` : dlabel(x.k, { weekday: "short", day: "numeric", month: "short" });
}

function Donut({ a, b }) {
  const t = a + b, C = 2 * Math.PI * 38, da = t ? (a / t) * C : 0;
  return (<svg className="in-donut" viewBox="0 0 100 100" role="img" aria-label="Naye aur purane visitors">
    <defs><linearGradient id="gDonut" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f3dc9a" /><stop offset="1" stopColor="#c9a24a" /></linearGradient></defs>
    <circle cx="50" cy="50" r="38" className="in-donut__bg" />
    {t > 0 && <circle cx="50" cy="50" r="38" className="in-donut__a" strokeDasharray={`${da} ${C - da}`} transform="rotate(-90 50 50)" />}
    <text x="50" y="49" textAnchor="middle" className="in-donut__n">{fmt(t)}</text><text x="50" y="63" textAnchor="middle" className="in-donut__l">visitors</text>
  </svg>);
}

function Bars({ rows, label, color, empty = "Abhi data nahi aaya" }) {
  const m = Math.max(1, ...rows.map((r) => r.n));
  if (!rows.length) return <p className="in-empty">{empty}</p>;
  return (<ul className="in-bars">{rows.map((r) => (<li key={r.k}><div><b>{color && <i style={{ background: color(r.k) }} />}{label ? label(r.k) : r.k}</b><span>{fmt(r.n)}</span></div><u style={{ "--w": `${Math.max(3, (r.n / m) * 100)}%`, "--c": color ? color(r.k) : undefined }} /></li>))}</ul>);
}
const Card = ({ title: t, sub, children, className = "" }) => (<section className={`ad-card in-card ${className}`}><h2>{t}{sub && <small>{sub}</small>}</h2>{children}</section>);

function Setup() {
  return (<section className="ad-card in-setup"><h2>Dashboard ek baar setup karein</h2>
    <p className="ad-note">Visitors ka data Cloudflare D1 (free) database mein save hota hai. Sirf 3 kaam, ek baar:</p>
    <ol><li>Cloudflare Dashboard &gt; <b>Storage &amp; databases &gt; D1</b> &gt; Create database, naam <b>saad-analytics</b>.</li>
      <li>Workers &amp; Pages &gt; aap ka Pages project &gt; <b>Settings &gt; Bindings &gt; Add &gt; D1 database</b>. Variable name <b>DB</b>, database <b>saad-analytics</b>.</li>
      <li><b>update.bat</b> chalayein (ya Deployments mein Retry). Tables khud ban jati hain.</li></ol></section>);
}

function exportCsv(d) {   // owner can open the numbers in Excel / Google Sheets
  const rows = [["Period", "Date from", "Date to", "Visitors", "New visitors", "Returning visitors", "Page views", "Visits", "Inquiries"]];
  for (const [v] of TRENDS) for (const x of d.trend[v]) rows.push([v, x.k, x.to || x.k, x.vis, x.nw, x.ret, x.pv, x.ses, x.inq]);
  const csv = rows.map((r) => r.join(",")).join("\n"), a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = `saad-traffic-${d.to}.csv`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

function highlights(d, c, p, ret) {
  const out = [], g = pct(c.vis, p.vis), peak = d.hours.reduce((a, v, i) => (v > d.hours[a] ? i : a), 0), wd = d.trend.weekdays, best = wd.reduce((a, w) => (w.avg > wd[a].avg ? w.d : a), 0);
  if (g !== null && g !== 0 && c.vis) out.push(g >= 0 ? `📈 Visitors ${VS[d.range]} ${g}% zyada hain.` : `📉 Visitors ${VS[d.range]} ${Math.abs(g)}% kam hain. Facebook / WhatsApp par post karke dekhein.`);
  if (c.vis >= 5) out.push(`🔁 ${Math.round(share(ret, c.vis))}% visitors wapas aaye hue hain (purane), ${Math.round(share(c.nw, c.vis))}% bilkul naye.`);
  if (d.hours[peak] > 0) out.push(`⏰ Sab se busy waqt ${h12(peak)} – ${h12(peak + 1)} hai.`);
  if (wd[best].avg > 0) out.push(`📅 Sab se zyada traffic ${WD[best]} ko aata hai (roz ke ~${Math.round(wd[best].avg)} page views).`);
  if (d.sources[0]) out.push(`🌐 Sab se bara source: ${title(d.sources[0].k)}.`);
  if (d.cars[0]) out.push(`🚗 Sab se zyada dekhi gayi gaari: ${title(d.cars[0].k)}.`);
  return out.slice(0, 4);
}

export default function Insights({ api, out }) {
  const [range, setRange] = useState(() => { try { return sessionStorage.getItem("in-r") || "7d"; } catch { return "7d"; } });
  const [view, setView] = useState(() => { try { return sessionStorage.getItem("in-v") || "daily"; } catch { return "daily"; } });
  const [data, setData] = useState(null), [err, setErr] = useState(""), [busy, setBusy] = useState(false), [sel, setSel] = useState(null), [tsel, setTsel] = useState(null);
  const [mine, setMine] = useState(() => { try { return localStorage.getItem("saad_owner") === "0"; } catch { return false; } });
  const cache = useRef({}), cur = useRef(range), fns = useRef({ api, out }); cur.current = range; fns.current = { api, out };   // refs keep load() stable, so the refresh timer is never reset

  useEffect(() => {   // this tab is dark: tint the whole admin app (header, tab bar, background) and the phone's status bar
    const root = document.querySelector(".adm"), tint = (c) => { const m = document.querySelector('meta[name="theme-color"]'); m && m.setAttribute("content", c); };
    root && root.classList.add("adm--dark"); tint("#08080a"); const t = setTimeout(() => tint("#08080a"), 400);   // the PWA adds its theme-color tag just after first paint
    return () => { clearTimeout(t); root && root.classList.remove("adm--dark"); tint("#ffffff"); };
  }, []);

  const load = useCallback(async (r, quiet) => {
    if (!quiet) setBusy(true);
    try { const d = await fns.current.api("stats", { range: r }); cache.current[r] = d; if (cur.current === r) { setData(d); setErr(""); } }
    catch (e) { if (e.status === 401) return fns.current.out(); if (cur.current === r) setErr(e.message === "no_db" ? "no_db" : "fail"); }
    finally { setBusy(false); }
  }, []);
  useEffect(() => { setSel(null); if (cache.current[range]) { setData(cache.current[range]); setErr(""); } else setData(null); load(range, !!cache.current[range]); try { sessionStorage.setItem("in-r", range); } catch { /* ignore */ } }, [range]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { try { sessionStorage.setItem("in-v", view); } catch { /* ignore */ } setTsel(null); }, [view]);
  useEffect(() => { const t = setInterval(() => document.visibilityState === "visible" && load(cur.current, true), 45000); return () => clearInterval(t); }, [load]);
  const toggleMine = (on) => { setMine(on); try { localStorage.setItem("saad_owner", on ? "0" : "1"); } catch { /* ignore */ } };

  const head = (<>
    <div className="in-head"><div><span className="in-eyebrow in-eyebrow--gold">SAAD CAR RENTAL</span><h1>Dashboard</h1><p>Website ki performance, ek nazar mein</p></div>
      <div className="in-head__btns">{data && <button type="button" className="in-refresh" onClick={() => exportCsv(data)} aria-label="Excel / CSV download karein" title="CSV download"><svg viewBox="0 0 24 24" className="ad-i" aria-hidden="true"><path d="M12 4v11M7.5 11 12 15.5 16.5 11M5 19.5h14" /></svg></button>}
        <button type="button" className={`in-refresh${busy ? " is-busy" : ""}`} onClick={() => load(range)} aria-label="Refresh"><svg viewBox="0 0 24 24" className="ad-i" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.6-5.9M20 4v5h-5" /></svg></button></div></div>
    <div className="in-seg" role="group" aria-label="Muddat">{RANGES.map(([k, t]) => <button key={k} type="button" aria-pressed={range === k} className={range === k ? "on" : ""} onClick={() => setRange(k)}>{t}</button>)}</div>
  </>);
  if (err === "no_db") return <div className="in-root">{head}<Setup /></div>;
  if (!data) return (<div className="in-root">{head}{err ? <div className="ad-load in-fail"><p>Data load nahi hua. Internet check karein.</p><button type="button" className="ad-btn" onClick={() => load(range)}>Dobara try karein</button></div> : <div className="in-skel" aria-busy="true"><span /><span /><span /></div>}</div>);

  const { cur: c, prev: p, series: s, periods: P, trend: T } = data, sx = s[sel ?? s.length - 1], ret = Math.max(0, c.vis - c.nw), pret = Math.max(0, p.vis - p.nw);
  const inq = c.calls + c.wa + c.qd, pinq = p.calls + p.wa + p.qd, rate = share(inq, c.vis), ppv = c.ses ? c.pv / c.ses : 0, bounce = share(c.bounce, c.ses), vpv = c.vis ? c.ses / c.vis : 0;
  const peak = data.hours.reduce((a, v, i) => (v > data.hours[a] ? i : a), 0), hmax = Math.max(1, ...data.hours), wmax = Math.max(1, ...T.weekdays.map((w) => w.avg));
  const dev = data.devices, devT = dev.reduce((a, d) => a + d.n, 0), empty = !c.pv && !data.since;
  const feed = data.feed.filter((f, i, a) => !(f.type === "pv" && a.some((g) => /_view$/.test(g.type) && g.path === f.path && Math.abs(g.ts - f.ts) < 5000))).slice(0, 8);
  const funnel = [["Visitors", c.vis], ["Book Now dabaya", c.bc], ["Form shuru kiya", c.qs], ["Booking / inquiry bheji", c.qd]], fmax = Math.max(1, ...funnel.map((f) => f[1]));
  const rows = T[view], ti = tsel ?? rows.length - 1, tx = rows[ti], tp = rows[ti - 1], tg = tp ? pct(tx.vis, tp.vis) : null, tsub = (TRENDS.find((t) => t[0] === view) || [])[2];
  const tsum = rows.reduce((a, x) => ({ vis: a.vis + x.vis, nw: a.nw + x.nw, pv: a.pv + x.pv }), { vis: 0, nw: 0, pv: 0 });
  const bk = data.orders, tips = highlights(data, c, p, ret);
  const kpis = [["Page views", c.pv, p.pv, s.map((x) => x.pv)], ["Visits (sessions)", c.ses, p.ses], ["Naye visitors", c.nw, p.nw, s.map((x) => x.nw)], ["Purane visitors", ret, pret, s.map((x) => Math.max(0, x.vis - x.nw))], ["Inquiries", inq, pinq], ["Bookings", bk ? bk.cur : 0, bk ? bk.prev : 0]];

  return (<div className="in-root">{head}
    <div className={`in-live${data.live ? " is-on" : ""}`}><i /><span>{data.live ? <><b>{data.live}</b> {data.live === 1 ? "visitor" : "log"} abhi website par</> : "Abhi website par koi nahi"}</span><small>{dlabel(data.from)}{data.from !== data.to ? ` – ${dlabel(data.to)}` : ""}</small></div>

    {empty && <section className="ad-card in-tip"><b>Tracking on hai ✅</b><p className="ad-note">Abhi tak koi visit record nahi hui. Website kisi aur phone / computer se kholein, ya neeche &ldquo;Apni visits ginein&rdquo; on karke apne phone se kholein. Data kuch second mein yahan aa jata hai.</p></section>}

    <section className="in-hero"><div className="in-hero__top"><div><span className="in-eyebrow">Total visitors</span><div className="in-big"><Num v={c.vis} /></div></div><Delta cur={c.vis} prev={p.vis} /></div>
      <p className="in-hero__vs">{VS[data.range]}</p>
      <div className="in-tip2"><b>{tip(sx, data.range)}</b><span><Num v={sx.vis} /> visitors</span><span><Num v={sx.pv} /> views</span><span className="g"><Num v={sx.nw} /> naye</span></div>
      <Chart s={s} tick={heroTick(data.range, s)} sel={sel} setSel={setSel} uid="h" />
      <div className="in-legend"><span><i className="a" />Naye visitors</span><span><i className="b" />Purane (wapas aaye)</span></div></section>

    {tips.length > 0 && <section className="in-ai"><h2>✨ Aaj ka khulasa</h2><ul>{tips.map((t) => <li key={t}>{t}</li>)}</ul></section>}

    <div className="in-kpis">{kpis.map(([t, v, pv, sp]) => <div key={t} className="in-kpi"><span>{t}</span><b><Num v={v} /></b><div className="in-kpi__foot"><Delta cur={v} prev={pv} />{sp && <Spark vals={sp} />}</div></div>)}</div>

    <Card title="Naye vs Purane customers" sub={data.range === "today" ? "Aaj" : `${data.range.replace("d", "")} din`}><div className="in-split"><Donut a={c.nw} b={ret} />
      <ul className="in-key"><li><i className="a" /><div><b>Naye</b><span>Pehli baar aaye</span></div><strong>{fmt(c.nw)}<small>{Math.round(share(c.nw, c.vis))}%</small></strong></li>
        <li><i className="b" /><div><b>Purane</b><span>Dobara aaye</span></div><strong>{fmt(ret)}<small>{Math.round(share(ret, c.vis))}%</small></strong></li></ul></div>
      <div className="in-two"><div><span>Pages per visit</span><b>{ppv.toFixed(1)}</b></div><div><span>Bounce rate</span><b>{Math.round(bounce)}%</b></div><div><span>Visits / visitor</span><b>{vpv.toFixed(1)}</b></div></div></Card>

    <Card title="Daily · Weekly · Monthly" sub={tsub}>
      <div className="in-tabs" role="group" aria-label="Daily weekly monthly">{TRENDS.map(([k, t]) => <button key={k} type="button" aria-pressed={view === k} className={view === k ? "on" : ""} onClick={() => setView(k)}>{t}</button>)}</div>
      <div className="in-tdetail"><div><b>{trendName(view, tx)}</b>{tg !== null && <em className={`in-delta ${tg >= 0 ? "in-delta--up" : "in-delta--down"}`}>{tg >= 0 ? "▲" : "▼"} {Math.abs(tg)}%</em>}</div>
        <ul><li><span>Visitors</span><b>{fmt(tx.vis)}</b></li><li><span>Naye</span><b className="g">{fmt(tx.nw)}</b></li><li><span>Purane</span><b>{fmt(tx.ret)}</b></li><li><span>Views</span><b>{fmt(tx.pv)}</b></li></ul></div>
      <Chart s={rows} tick={trendTick(view, rows)} sel={tsel} setSel={setTsel} uid={`t${view}`} />
      <div className="in-tsum"><span>Is muddat mein kul: <b>{fmt(tsum.pv)}</b> views</span><span>Naye customers kul: <b>{fmt(tsum.nw)}</b></span></div>
      <div className="in-scroll"><table className="in-table"><thead><tr><th /><th>Visitors</th><th>Naye</th><th>Purane</th><th>Views</th></tr></thead>
        <tbody>{[...rows].reverse().map((x) => <tr key={x.k} className={x === tx ? "is-on" : ""} onClick={() => setTsel(rows.indexOf(x))}><th>{view === "monthly" ? mlabel(x.k) : view === "weekly" ? `${dlabel(x.k)} – ${dlabel(x.to)}` : dlabel(x.k, { weekday: "short", day: "numeric", month: "short" })}</th><td>{fmt(x.vis)}</td><td>{fmt(x.nw)}</td><td>{fmt(x.ret)}</td><td>{fmt(x.pv)}</td></tr>)}</tbody></table></div></Card>

    <Card title="Ek nazar mein" sub="Visitors"><div className="in-glance">{[["Aaj", P.today], ["Kal", P.yesterday], ["7 din", P.week], ["30 din", P.month]].map(([t, x]) => <div key={t}><span>{t}</span><b>{fmt(x.vis)}</b><small>{fmt(x.nw)} naye · {fmt(x.pv)} views</small></div>)}</div>
      {bk && <div className="in-glance in-glance--b">{[["Bookings aaj", bk.today], ["7 din", bk.week], ["30 din", bk.month]].map(([t, v]) => <div key={t}><span>🚘 {t}</span><b>{fmt(v)}</b></div>)}</div>}</Card>

    <Card title="Customer actions" sub={`${rate.toFixed(1)}% inquiry rate`}><ul className="in-funnel">{funnel.map(([t, v], i) => <li key={t}><div><b>{t}</b><span>{fmt(v)}</span></div><u style={{ "--w": `${Math.max(3, (v / fmax) * 100)}%`, "--o": 1 - i * 0.2 }} /></li>)}</ul>
      <div className="in-chips"><div><span>📞 Calls</span><b>{fmt(c.calls)}</b></div><div><span>💬 WhatsApp</span><b>{fmt(c.wa)}</b></div><div><span>✉️ Email</span><b>{fmt(c.em)}</b></div></div></Card>

    <Card title="Traffic kahan se aa raha hai" sub="Sessions"><Bars rows={data.sources} label={title} color={(k) => SRC_COLOR[k] || "#8b94a0"} /></Card>
    <Card title="Sab se zyada dekhe gaye pages"><Bars rows={data.pages} label={pretty} /></Card>
    <Card title="Popular gaariyan"><Bars rows={data.cars} label={title} empty="Gaari ke pages par visits aate hi yahan nazar aayengi" /></Card>
    <Card title="Popular routes, services &amp; jaga"><Bars rows={data.spots} label={title} empty="Abhi data nahi aaya" /></Card>

    <Card title="Devices"><div className="in-stack">{dev.map((d) => <i key={d.k} style={{ flex: d.n, background: (DEV[d.k] || [0, "#999"])[1] }} />)}</div>
      <ul className="in-key in-key--sm">{dev.map((d) => <li key={d.k}><i style={{ background: (DEV[d.k] || [0, "#999"])[1] }} /><div><b>{(DEV[d.k] || [d.k])[0]}</b></div><strong>{Math.round(share(d.n, devT))}%</strong></li>)}</ul>{!dev.length && <p className="in-empty">Abhi data nahi aaya</p>}</Card>
    <Card title="Shehr (cities)"><Bars rows={data.places} empty="Shehr ka data Cloudflare se khud milta hai, visits aate hi nazar aayega" /></Card>

    <Card title="Hafte ke din" sub="Roz ka average views"><div className="in-week">{T.weekdays.map((w) => <div key={w.d} title={`${WD[w.d]}: ${w.avg.toFixed(1)}`}><i style={{ height: `${Math.max(5, (w.avg / wmax) * 100)}%` }} className={w.avg === wmax && w.avg > 0 ? "top" : ""} /><span>{WD[w.d].slice(0, 3)}</span></div>)}</div></Card>

    <Card title="Busy waqt" sub="Pakistan time"><div className="in-hours">{data.hours.map((v, i) => <i key={i} title={`${h12(i)}: ${v}`} style={{ "--a": v ? 0.16 + (v / hmax) * 0.84 : 0.06 }} />)}</div><div className="in-hours__l"><span>12am</span><span>6am</span><span>12pm</span><span>6pm</span></div>
      {data.hours[peak] > 0 && <p className="in-peak">Sab se busy: <b>{h12(peak)} – {h12(peak + 1)}</b></p>}</Card>

    <Card title="Live activity">{feed.length ? <ul className="in-feed">{feed.map((f, i) => { const [e, t] = EV[f.type] || ["•", f.type]; return <li key={`${f.ts}-${i}`}><span>{e}</span><div><b>{t}{f.item ? `: ${title(f.item)}` : f.type === "pv" ? `: ${pretty(f.path)}` : ""}</b><small>{[f.city, (DEV[f.dev] || [f.dev])[0], f.src && f.src !== "direct" ? title(f.src) : ""].filter(Boolean).join(" · ")}</small></div><time>{ago(f.ts)}</time></li>; })}</ul> : <p className="in-empty">Abhi koi activity nahi</p>}</Card>

    <section className="ad-card in-own"><div><b>Apni visits ginein</b><span>Off rakhein to aap ka apna phone / computer count nahi hota.</span></div>
      <label className="ad-switch" aria-label="Apni visits ginein"><input type="checkbox" checked={mine} onChange={(e) => toggleMine(e.target.checked)} /><span /><em>{mine ? "On" : "Off"}</em></label></section>
    <p className="ad-ver">Data anonymous hai: koi naam, phone ya IP save nahi hota.<br />Har 45 second mein khud refresh hota hai.</p>
  </div>);
}
