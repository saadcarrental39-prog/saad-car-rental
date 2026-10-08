import { useCallback, useEffect, useRef, useState } from "react";
import "../styles/insights.css";

/* Owner dashboard: website visitors, new vs returning, daily / weekly / monthly, sources, devices, top pages & cars, customer actions.
   Data comes from POST /api/admin { action: "stats", range } (see functions/_lib/stats.js). All times are Pakistan time. */

const RANGES = [["today", "Aaj"], ["7d", "7 Din"], ["30d", "30 Din"], ["90d", "90 Din"]];
const VS = { today: "kal ke muqable", "7d": "pichle 7 din ke muqable", "30d": "pichle 30 din ke muqable", "90d": "pichle 90 din ke muqable" };
const SRC_COLOR = { google: "#4285f4", direct: "#0d0d0f", facebook: "#1877f2", instagram: "#e1306c", whatsapp: "#25d366", youtube: "#ff0033", bing: "#00809d", tiktok: "#111", x: "#111", search: "#7a5af8" };
const DEV = { mobile: ["Mobile", "#0d0d0f"], desktop: ["Computer", "#7b8190"], tablet: ["Tablet", "#c4c8d0"] };
const EV = { pv: ["👁", "Page dekha"], phone_click: ["📞", "Call button dabaya"], whatsapp_click: ["💬", "WhatsApp dabaya"], email_click: ["✉️", "Email dabaya"], booking_click: ["🚘", "Book Now dabaya"], quote_start: ["📝", "Form shuru kiya"], quote_submit: ["✅", "Booking / inquiry bheji"], vehicle_view: ["🚗", "Gaari dekhi"], service_view: ["🛎", "Service dekhi"], route_view: ["🛣", "Route dekha"], location_view: ["📍", "Location dekhi"] };

const fmt = (n) => { n = Math.round(Number(n) || 0); return n >= 100000 ? `${(n / 1000).toFixed(0)}k` : n >= 10000 ? `${(n / 1000).toFixed(1)}k` : n.toLocaleString("en-US"); };
const title = (s) => String(s).replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const pretty = (p) => { const parts = String(p || "/").split("/").filter(Boolean); return parts.length ? parts.map(title).join(" › ") : "Home"; };
const dlabel = (d, o = { day: "numeric", month: "short" }) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", { ...o, timeZone: "UTC" });
const h12 = (h) => `${h % 12 || 12} ${h % 24 < 12 ? "am" : "pm"}`;
const ago = (ts) => { const m = Math.max(0, Math.round((Date.now() - ts) / 60000)); return m < 1 ? "abhi" : m < 60 ? `${m} min pehle` : m < 1440 ? `${Math.round(m / 60)} ghante pehle` : `${Math.round(m / 1440)} din pehle`; };
const share = (a, b) => (b > 0 ? Math.min(100, (a / b) * 100) : 0);

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

function Delta({ cur, prev, dark, invert }) {
  if (!cur && !prev) return null;
  if (!prev) return <em className={`in-delta in-delta--new${dark ? " is-dark" : ""}`}>New</em>;
  const p = Math.round(((cur - prev) / prev) * 100), good = invert ? p <= 0 : p >= 0;
  return <em className={`in-delta ${p === 0 ? "" : good ? "in-delta--up" : "in-delta--down"}${dark ? " is-dark" : ""}`}>{p > 0 ? "▲" : p < 0 ? "▼" : "•"} {Math.abs(p)}%</em>;
}

/* ---------- chart: stacked bars (new visitors on top of returning) ---------- */
function Chart({ s, range, sel, setSel }) {
  const W = 340, H = 140, n = s.length, gap = n > 40 ? 2 : n > 16 ? 3 : n > 8 ? 5 : 10, bw = (W - gap * (n - 1)) / n, max = Math.max(1, ...s.map((x) => x.vis));
  const rx = Math.min(6, bw / 2), cur = sel ?? n - 1;
  const tick = (i) => range === "today" ? i % 6 === 0 && h12(i) : range === "7d" ? dlabel(s[i].k, { weekday: "short" }) : range === "30d" ? (n - 1 - i) % 5 === 0 && dlabel(s[i].k) : (n - 1 - i) % 3 === 0 && dlabel(s[i].k);
  return (<svg className="in-chart" viewBox={`0 0 ${W} ${H + 22}`} role="img" aria-label="Visitors chart">
    <defs><linearGradient id="inNew" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8df0c4" /><stop offset="1" stopColor="#34d399" /></linearGradient></defs>
    {[0.25, 0.5, 0.75].map((f) => <line key={f} x1="0" x2={W} y1={H - H * f} y2={H - H * f} className="in-grid" />)}
    {s.map((x, i) => {
      const hAll = x.vis ? Math.max(4, (x.vis / max) * (H - 6)) : 2, hNew = x.vis ? Math.min(hAll, (x.nw / x.vis) * hAll) : 0, X = i * (bw + gap), on = i === cur, t = tick(i);
      return (<g key={i} className={on ? "is-on" : ""} onPointerEnter={() => setSel(i)} onClick={() => setSel(i)}>
        <rect x={X - gap / 2} y="0" width={bw + gap} height={H + 20} fill="transparent" />
        <rect x={X} y={H - hAll} width={bw} height={hAll} rx={rx} className="in-bar" />
        {hNew > 0 && <rect x={X} y={H - hNew} width={bw} height={hNew} rx={Math.min(rx, hNew / 2)} fill="url(#inNew)" opacity={on ? 1 : 0.55} />}
        {t && <text x={X + bw / 2} y={H + 16} textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"} className="in-tick">{t}</text>}
      </g>);
    })}
  </svg>);
}
function tip(x, range) {
  if (!x) return "";
  if (range === "today") return `${h12(x.i)} – ${h12(x.i + 1)}`;
  return x.to && x.to !== x.k ? `${dlabel(x.k)} – ${dlabel(x.to)}` : dlabel(x.k, { weekday: "short", day: "numeric", month: "short" });
}

function Donut({ a, b }) {
  const t = a + b, C = 2 * Math.PI * 38, da = t ? (a / t) * C : 0;
  return (<svg className="in-donut" viewBox="0 0 100 100" role="img" aria-label="Naye aur purane visitors">
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

export default function Insights({ api, out }) {
  const [range, setRange] = useState(() => { try { return sessionStorage.getItem("in-r") || "7d"; } catch { return "7d"; } });
  const [data, setData] = useState(null), [err, setErr] = useState(""), [busy, setBusy] = useState(false), [sel, setSel] = useState(null);
  const [mine, setMine] = useState(() => { try { return localStorage.getItem("saad_owner") === "0"; } catch { return false; } });
  const cache = useRef({}), cur = useRef(range), fns = useRef({ api, out }); cur.current = range; fns.current = { api, out };   // refs keep load() stable, so the 30 s refresh timer is never reset
  const load = useCallback(async (r, quiet) => {
    if (!quiet) setBusy(true);
    try { const d = await fns.current.api("stats", { range: r }); cache.current[r] = d; if (cur.current === r) { setData(d); setErr(""); } }
    catch (e) { if (e.status === 401) return fns.current.out(); if (cur.current === r) setErr(e.message === "no_db" ? "no_db" : "fail"); }
    finally { setBusy(false); }
  }, []);
  useEffect(() => { setSel(null); if (cache.current[range]) { setData(cache.current[range]); setErr(""); } else setData(null); load(range, !!cache.current[range]); try { sessionStorage.setItem("in-r", range); } catch { /* ignore */ } }, [range]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const t = setInterval(() => document.visibilityState === "visible" && load(cur.current, true), 30000); return () => clearInterval(t); }, [load]);
  const toggleMine = (on) => { setMine(on); try { localStorage.setItem("saad_owner", on ? "0" : "1"); } catch { /* ignore */ } };

  const head = (<>
    <div className="in-head"><div><h1>Dashboard</h1><p>Website ki performance</p></div>
      <button type="button" className={`in-refresh${busy ? " is-busy" : ""}`} onClick={() => load(range)} aria-label="Refresh"><svg viewBox="0 0 24 24" className="ad-i" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.6-5.9M20 4v5h-5" /></svg></button></div>
    <div className="in-seg" role="group" aria-label="Muddat">{RANGES.map(([k, t]) => <button key={k} type="button" aria-pressed={range === k} className={range === k ? "on" : ""} onClick={() => setRange(k)}>{t}</button>)}</div>
  </>);
  if (err === "no_db") return <>{head}<Setup /></>;
  if (!data) return (<>{head}{err ? <div className="ad-load"><p>Data load nahi hua. Internet check karein.</p><button type="button" className="ad-btn" onClick={() => load(range)}>Dobara try karein</button></div> : <div className="in-skel" aria-busy="true"><span /><span /><span /></div>}</>);

  const { cur: c, prev: p, series: s, periods: P } = data, sx = s[sel ?? s.length - 1], ret = Math.max(0, c.vis - c.nw), pret = Math.max(0, p.vis - p.nw);
  const inq = c.calls + c.wa + c.qd, pinq = p.calls + p.wa + p.qd, rate = share(inq, c.vis), ppv = c.ses ? c.pv / c.ses : 0, bounce = share(c.bounce, c.ses);
  const peak = data.hours.reduce((a, v, i) => (v > data.hours[a] ? i : a), 0), hmax = Math.max(1, ...data.hours), l14 = Math.max(1, ...data.last14.map((x) => x.vis));
  const dev = data.devices, devT = dev.reduce((a, d) => a + d.n, 0), empty = !c.pv && !data.since;
  const feed = data.feed.filter((f, i, a) => !(f.type === "pv" && a.some((g) => /_view$/.test(g.type) && g.path === f.path && Math.abs(g.ts - f.ts) < 5000))).slice(0, 8);
  const funnel = [["Visitors", c.vis], ["Book Now dabaya", c.bc], ["Form shuru kiya", c.qs], ["Booking / inquiry bheji", c.qd]], fmax = Math.max(1, ...funnel.map((f) => f[1]));

  return (<>{head}
    <div className={`in-live${data.live ? " is-on" : ""}`}><i /><span>{data.live ? <><b>{data.live}</b> {data.live === 1 ? "visitor" : "log"} abhi website par</> : "Abhi website par koi nahi"}</span><small>{dlabel(data.from)}{data.from !== data.to ? ` – ${dlabel(data.to)}` : ""}</small></div>

    {empty && <section className="ad-card in-tip"><b>Tracking on hai ✅</b><p className="ad-note">Abhi tak koi visit record nahi hui. Website kisi aur phone / computer se kholein, ya neeche &ldquo;Apni visits ginein&rdquo; on karke apne phone se kholein. Data kuch second mein yahan aa jata hai.</p></section>}

    <section className="in-hero"><div className="in-hero__top"><div><span className="in-eyebrow">Total visitors</span><div className="in-big"><Num v={c.vis} /></div></div><Delta cur={c.vis} prev={p.vis} dark /></div>
      <p className="in-hero__vs">{VS[data.range]}</p>
      <div className="in-tip2"><b>{tip(sx, data.range)}</b><span><Num v={sx.vis} /> visitors</span><span><Num v={sx.pv} /> views</span><span className="g"><Num v={sx.nw} /> naye</span></div>
      <Chart s={s} range={data.range} sel={sel} setSel={setSel} />
      <div className="in-legend"><span><i className="a" />Naye visitors</span><span><i className="b" />Purane (wapas aaye)</span></div></section>

    <div className="in-kpis">{[["Page views", c.pv, p.pv], ["Naye visitors", c.nw, p.nw], ["Purane visitors", ret, pret], ["Inquiries", inq, pinq]].map(([t, v, pv]) => <div key={t} className="in-kpi"><span>{t}</span><b><Num v={v} /></b><Delta cur={v} prev={pv} /></div>)}</div>

    <Card title="Naye vs Purane customers" sub={data.range === "today" ? "Aaj" : `${data.range.replace("d", "")} din`}><div className="in-split"><Donut a={c.nw} b={ret} />
      <ul className="in-key"><li><i className="a" /><div><b>Naye</b><span>Pehli baar aaye</span></div><strong>{fmt(c.nw)}<small>{Math.round(share(c.nw, c.vis))}%</small></strong></li>
        <li><i className="b" /><div><b>Purane</b><span>Dobara aaye</span></div><strong>{fmt(ret)}<small>{Math.round(share(ret, c.vis))}%</small></strong></li></ul></div>
      <div className="in-two"><div><span>Pages per visit</span><b>{ppv.toFixed(1)}</b></div><div><span>Bounce rate</span><b>{Math.round(bounce)}%</b></div><div><span>Visits (sessions)</span><b>{fmt(c.ses)}</b></div></div></Card>

    <Card title="Daily · Weekly · Monthly" sub="Pichle 14 din"><div className="in-spark" aria-hidden="true">{data.last14.map((x) => <span key={x.d} title={`${dlabel(x.d)}: ${x.vis}`}><i style={{ height: `${Math.max(4, (x.vis / l14) * 100)}%` }} /></span>)}</div>
      <table className="in-table"><thead><tr><th /><th>Visitors</th><th>Views</th><th>Naye</th></tr></thead><tbody>{[["Aaj", P.today], ["Kal", P.yesterday], ["Pichle 7 din", P.week], ["Pichle 30 din", P.month]].map(([t, x]) => <tr key={t}><th>{t}</th><td>{fmt(x.vis)}</td><td>{fmt(x.pv)}</td><td>{fmt(x.nw)}</td></tr>)}</tbody></table></Card>

    <Card title="Customer actions" sub={`${rate.toFixed(1)}% inquiry rate`}><ul className="in-funnel">{funnel.map(([t, v], i) => <li key={t}><div><b>{t}</b><span>{fmt(v)}</span></div><u style={{ "--w": `${Math.max(3, (v / fmax) * 100)}%`, "--o": 1 - i * 0.2 }} /></li>)}</ul>
      <div className="in-chips"><div><span>📞 Calls</span><b>{fmt(c.calls)}</b></div><div><span>💬 WhatsApp</span><b>{fmt(c.wa)}</b></div><div><span>✉️ Email</span><b>{fmt(c.em)}</b></div></div></Card>

    <Card title="Traffic kahan se aa raha hai" sub="Sessions"><Bars rows={data.sources} label={title} color={(k) => SRC_COLOR[k] || "#8b94a0"} /></Card>
    <Card title="Sab se zyada dekhe gaye pages"><Bars rows={data.pages} label={pretty} /></Card>
    <Card title="Popular gaariyan"><Bars rows={data.cars} label={title} empty="Gaari ke pages par visits aate hi yahan nazar aayengi" /></Card>
    <Card title="Popular routes, services &amp; jaga"><Bars rows={data.spots} label={title} empty="Abhi data nahi aaya" /></Card>

    <Card title="Devices"><div className="in-stack">{dev.map((d) => <i key={d.k} style={{ flex: d.n, background: (DEV[d.k] || [0, "#999"])[1] }} />)}</div>
      <ul className="in-key in-key--sm">{dev.map((d) => <li key={d.k}><i style={{ background: (DEV[d.k] || [0, "#999"])[1] }} /><div><b>{(DEV[d.k] || [d.k])[0]}</b></div><strong>{Math.round(share(d.n, devT))}%</strong></li>)}</ul>{!dev.length && <p className="in-empty">Abhi data nahi aaya</p>}</Card>
    <Card title="Shehr (cities)"><Bars rows={data.places} empty="Shehr ka data Cloudflare se khud milta hai, visits aate hi nazar aayega" /></Card>

    <Card title="Busy waqt" sub="Pakistan time"><div className="in-hours">{data.hours.map((v, i) => <i key={i} title={`${h12(i)}: ${v}`} style={{ "--a": v ? 0.14 + (v / hmax) * 0.86 : 0.05 }} />)}</div><div className="in-hours__l"><span>12am</span><span>6am</span><span>12pm</span><span>6pm</span></div>
      {data.hours[peak] > 0 && <p className="in-peak">Sab se busy: <b>{h12(peak)} – {h12(peak + 1)}</b></p>}</Card>

    <Card title="Live activity">{feed.length ? <ul className="in-feed">{feed.map((f, i) => { const [e, t] = EV[f.type] || ["•", f.type]; return <li key={`${f.ts}-${i}`}><span>{e}</span><div><b>{t}{f.item ? `: ${title(f.item)}` : f.type === "pv" ? `: ${pretty(f.path)}` : ""}</b><small>{[f.city, (DEV[f.dev] || [f.dev])[0], f.src && f.src !== "direct" ? title(f.src) : ""].filter(Boolean).join(" · ")}</small></div><time>{ago(f.ts)}</time></li>; })}</ul> : <p className="in-empty">Abhi koi activity nahi</p>}</Card>

    <section className="ad-card in-own"><div><b>Apni visits ginein</b><span>Off rakhein to aap ka apna phone / computer count nahi hota.</span></div>
      <label className="ad-switch" aria-label="Apni visits ginein"><input type="checkbox" checked={mine} onChange={(e) => toggleMine(e.target.checked)} /><span /><em>{mine ? "On" : "Off"}</em></label></section>
    <p className="ad-ver">Data anonymous hai: koi naam, phone ya IP save nahi hota.<br />Har 30 second mein khud refresh hota hai.</p>
  </>);
}
