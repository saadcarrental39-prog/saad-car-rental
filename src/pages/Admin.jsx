import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { baseFleet, applyOverrides } from "../data/fleet";
import { saveLocal } from "../fleetSync";
import { ADMIN_PATH } from "../config";
import "../styles/admin.css";
import Insights from "../components/Insights";

const TK = "adm-t";
const LOGO = "/icons/saad-logo.png";
const MSG = { invalid: "Username ya password ghalat hai.", too_many: "Bohat zyada koshish. 15 minute baad dobara try karein.", admin_not_configured: "Admin abhi setup nahi hua. Cloudflare mein ADMIN_USER aur ADMIN_PASS set karein (README-ADMIN.md).", no_storage: "Storage (KV) bind nahi hua. README-ADMIN.md dekhein.", bad_image: "Photo save nahi hui. Chhoti ya doosri photo try karein.", too_big: "Photo bohat bari hai." };
const SW = [["white", "#f2f2f0"], ["black", "#17171a"], ["grey", "#8b94a0"], ["gray", "#8b94a0"], ["silver", "#c3c7cd"], ["red", "#b3262b"], ["blue", "#1f56b8"], ["plum", "#6b2d5c"]];
const swatch = (n = "") => (SW.find(([k]) => String(n).toLowerCase().includes(k)) || [0, "#b4b8be"])[1];

async function api(action, body = {}, token) {
  const r = await fetch("/api/admin", { method: "POST", headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ action, ...body }) });
  let j = {}; try { j = await r.json(); } catch { /* not json */ }
  if (!r.ok) throw Object.assign(new Error(j.error || "error"), { status: r.status });
  return j;
}
async function shrink(file) { // phone photo -> max 1000px webp (keeps transparency), kept small (about 150 KB) so the website stays fast
  const bmp = await createImageBitmap(file); let w = Math.min(1000, bmp.width), out = "";
  for (let i = 0; i < 5; i++) { const c = document.createElement("canvas"); c.width = w; c.height = Math.round((bmp.height * w) / bmp.width); c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height); out = c.toDataURL("image/webp", 0.8); if (out.length < 2.2e5) return out; w = Math.round(w * 0.85); }
  return out;
}

/* ---------- icons ---------- */
const I = (d) => function Icon() { return <svg viewBox="0 0 24 24" aria-hidden="true" className="ad-i" dangerouslySetInnerHTML={{ __html: d }} />; };
const ICar = I('<path d="M5 16h14M6.5 16l1.4-5.2A2 2 0 0 1 9.8 9.3h4.4a2 2 0 0 1 1.9 1.5L17.5 16"/><rect x="3.5" y="16" width="17" height="3.5" rx="1.4"/><circle cx="7.5" cy="17.8" r=".6"/><circle cx="16.5" cy="17.8" r=".6"/>');
const IChart = I('<path d="M4.5 19.5h15M7 16v-4.5M12 16V7M17 16v-7"/><path d="m6 8.5 4-3 3.5 2.2L18 4.5"/>');
const IPlus = I('<path d="M12 5v14M5 12h14"/>');
const IUser = I('<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c.8-3.6 3.8-5.5 7.5-5.5s6.7 1.9 7.5 5.5"/>');
const ISearch = I('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>');
const IEye = I('<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>');
const IEyeOff = I('<path d="M3 3l18 18M10.6 5.7A9.7 9.7 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-3 3.7M6.6 7.1A15.6 15.6 0 0 0 2.5 12S6 18.5 12 18.5a9.6 9.6 0 0 0 4-.9"/>');
const IOut = I('<path d="M10 4.5H6.5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2H10M15 8l4 4-4 4M19 12H9.5"/>');
const IDown = I('<path d="M12 4v11M7.5 11 12 15.5 16.5 11M5 19.5h14"/>');
const IGlobe = I('<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.6 2.4 3.8 5.2 3.8 8.5s-1.2 6.1-3.8 8.5c-2.6-2.4-3.8-5.2-3.8-8.5S9.4 5.9 12 3.5z"/>');
const IPeople = I('<circle cx="9" cy="8.5" r="3.2"/><path d="M3 19.5c.6-3.3 3.1-5 6-5s5.4 1.7 6 5"/><path d="M16 5.6a3.2 3.2 0 0 1 0 5.8M18 14.7c1.8.6 3 2.3 3.4 4.8"/>');
const IMail = I('<rect x="3.5" y="5.5" width="17" height="13" rx="2.2"/><path d="m4.5 7.5 7.5 6 7.5-6"/>');
const IBell = I('<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/>');
const IPhone = I('<path d="M6.5 4h3l1.6 4-2 1.3a10 10 0 0 0 4.6 4.6l1.3-2 4 1.6v3a2 2 0 0 1-2.2 2A14.5 14.5 0 0 1 4.5 6.2 2 2 0 0 1 6.5 4z"/>');
const ITrash = I('<path d="M4.5 7h15M9.5 7V4.8h5V7M6.5 7l.8 12.2h9.4L17.5 7M10 11v5M14 11v5"/>');
const IChat = I('<path d="M4.5 18.5 5.6 15A7.5 7.5 0 1 1 9 18z"/>');
const IImg = I('<rect x="3.5" y="5" width="17" height="14" rx="2.4"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17.5 4.8-4.4 3.4 3 2.4-2.2 4.4 3.6"/>');

/* ---------- opening animation (plays when the app is opened), then the login / dashboard appears ---------- */
function Splash({ done }) {
  const [out, setOut] = useState(false), fin = useRef(false), v = useRef(null);
  const end = () => { if (fin.current) return; fin.current = true; setOut(true); setTimeout(done, 480); };
  useEffect(() => {
    const el = v.current; if (el) { el.muted = true; const p = el.play(); if (p && p.catch) p.catch(end); }
    const t = setTimeout(end, 5500); return () => clearTimeout(t);
  }, []);
  return <div className={`ad-splash${out ? " is-out" : ""}`} onClick={end} role="presentation"><video ref={v} src="/icons/saad-splash.mp4" autoPlay muted playsInline preload="auto" onEnded={end} onError={end} /></div>;
}

/* ---------- install + automatic update ---------- */
function usePwa() {
  const [ev, setEv] = useState(null);
  useEffect(() => {
    const add = (tag, attrs) => { const e = document.createElement(tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); document.head.appendChild(e); return e; };
    const els = [add("link", { rel: "manifest", href: "/admin.webmanifest" }), add("link", { rel: "apple-touch-icon", href: "/icons/saad-apple-180.png" }), add("meta", { name: "theme-color", content: "#ffffff" }), add("meta", { name: "robots", content: "noindex,nofollow" }), add("meta", { name: "apple-mobile-web-app-capable", content: "yes" }), add("meta", { name: "mobile-web-app-capable", content: "yes" }), add("meta", { name: "apple-mobile-web-app-status-bar-style", content: "default" }), add("meta", { name: "apple-mobile-web-app-title", content: "SAAD Admin" })];
    const old = document.title; document.title = "SAAD Admin";
    let reg = null; const onVis = () => { if (document.visibilityState === "visible" && reg) reg.update().catch(() => {}); };
    const had = !!(navigator.serviceWorker && navigator.serviceWorker.controller);
    const onCtl = () => { if (had && !sessionStorage.getItem("adm-sw")) { sessionStorage.setItem("adm-sw", "1"); location.reload(); } }; // new version took over -> reload once
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/admin-sw.js", { scope: `${ADMIN_PATH}/`, updateViaCache: "none" }).then((r) => { reg = r; r.update().catch(() => {}); }).catch(() => {});
      navigator.serviceWorker.addEventListener("controllerchange", onCtl);
    }
    document.addEventListener("visibilitychange", onVis);
    const h = (e) => { e.preventDefault(); setEv(e); }; addEventListener("beforeinstallprompt", h);
    return () => { els.forEach((e) => e.remove()); document.title = old; removeEventListener("beforeinstallprompt", h); document.removeEventListener("visibilitychange", onVis); if ("serviceWorker" in navigator) navigator.serviceWorker.removeEventListener("controllerchange", onCtl); };
  }, []);
  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  return { ev, standalone, ios, install: async () => { if (!ev) return; ev.prompt(); await ev.userChoice; setEv(null); } };
}
function InstallCard({ pwa }) {
  if (pwa.standalone) return <p className="ad-note">App phone par install hai. Naya version khud update ho jata hai.</p>;
  return (<div className="ad-card ad-install"><b>App install karein</b>
    {pwa.ev ? <button type="button" className="ad-btn" onClick={pwa.install}><IDown />Install app</button>
      : pwa.ios ? <p className="ad-note">iPhone: Safari mein Share dabayein, phir <b>Add to Home Screen</b>.</p>
      : <p className="ad-note">Chrome menu (⋮) mein <b>Install app</b> / <b>Add to Home screen</b> dabayein.</p>}</div>);
}

/* ---------- login ---------- */
function Login({ onOk }) {
  const [u, setU] = useState(""), [p, setP] = useState(""), [show, setShow] = useState(false), [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  const go = async (e) => { e.preventDefault(); setBusy(true); setErr(""); try { onOk((await api("login", { user: u, pass: p })).token); } catch (x) { setErr(MSG[x.message] || "Login nahi hua. Internet check karein."); } finally { setBusy(false); } };
  return (<div className="ad-login">
    <div className="ad-login__top"><img src={LOGO} alt="SAAD CAR" width="900" height="284" /><span>RENTAL SERVICES</span></div>
    <form className="ad-login__form" onSubmit={go}>
      <h1>Owner login</h1><p className="ad-sub">Apni gaariyon aur prices ko manage karein.</p>
      <label className="ad-field"><span>Username</span><input value={u} onChange={(e) => setU(e.target.value)} autoCapitalize="none" autoCorrect="off" autoComplete="username" placeholder="Username" required /></label>
      <label className="ad-field"><span>Password</span><div className="ad-pw"><input type={show ? "text" : "password"} value={p} onChange={(e) => setP(e.target.value)} autoComplete="current-password" placeholder="Password" required />
        <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Password chhupayein" : "Password dikhayein"}>{show ? <IEyeOff /> : <IEye />}</button></div></label>
      {err && <p role="alert" className="ad-err">{err}</p>}
      <button className="ad-btn ad-btn--lg" disabled={busy}>{busy ? "Ruko…" : "Login"}</button>
    </form>
    <p className="ad-login__foot">Sirf authorised owner ke liye</p>
  </div>);
}

/* ---------- pieces ---------- */
function Photo({ tok, onUrl, label = "Photo chunein" }) {
  const [st, setSt] = useState(""), ref = useRef(null);
  const pick = async (e) => { const f = e.target.files?.[0]; if (!f) return; setSt("Upload ho rahi hai…"); try { const url = (await api("upload", { image: await shrink(f) }, tok)).url; setSt("Photo lag gayi"); onUrl(url); } catch (x) { setSt(MSG[x.message] || "Upload nahi hui."); } e.target.value = ""; };
  return (<div className="ad-photo"><input ref={ref} type="file" accept="image/*" onChange={pick} hidden /><button type="button" className="ad-btn ad-btn--ghost" onClick={() => ref.current.click()}><IImg />{label}</button><small>{st || "Behtar: transparent background wali PNG/WebP"}</small></div>);
}

function AddCar({ tok, cats, onAdd }) {
  const [f, setF] = useState({ cat: cats[0].slug, newCat: "", name: "", trim: "", color: "", subtitle: "", price: "", theme: "white", image: "" }), [err, setErr] = useState("");
  const u = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = (e) => {
    e.preventDefault(); if (!f.name.trim() || !f.color.trim()) return setErr("Gaari ka naam aur colour likhein.");
    let cat = f.cat, newCat = null;
    if (cat === "__new") { const t = f.newCat.trim(); if (!t) return setErr("Nayi category ka naam likhein."); let sl = t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "category", n = 2, base = sl; while (cats.some((c) => c.slug === sl)) sl = `${base}-${n++}`; cat = sl; newCat = { slug: sl, title: t }; }
    onAdd({ id: `x-${Date.now().toString(36)}`, cat, name: f.name.trim(), trim: f.trim.trim(), color: f.color.trim(), subtitle: f.subtitle.trim() || "With Professional Driver", price: f.price ? Number(f.price) : null, theme: f.theme, image: f.image }, newCat);
  };
  return (<form className="ad-card ad-add" onSubmit={submit}><h2>Nayi gaari add karein</h2>
    <label className="ad-field"><span>Category</span><select value={f.cat} onChange={u("cat")}>{cats.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}<option value="__new">+ Nayi category…</option></select></label>
    {f.cat === "__new" && <label className="ad-field"><span>Nayi category ka naam</span><input value={f.newCat} onChange={u("newCat")} placeholder="jaise Mercedes S Class" /></label>}
    <label className="ad-field"><span>Gaari ka naam</span><input value={f.name} onChange={u("name")} placeholder="jaise Toyota Corolla" required /></label>
    <div className="ad-two"><label className="ad-field"><span>Model / trim</span><input value={f.trim} onChange={u("trim")} placeholder="jaise Altis" /></label>
      <label className="ad-field"><span>Colour</span><input value={f.color} onChange={u("color")} placeholder="jaise Pearl White" required /></label></div>
    <label className="ad-field"><span>Type</span><input value={f.subtitle} onChange={u("subtitle")} placeholder="jaise Luxury SUV" /></label>
    <label className="ad-field"><span>Price per day (Rs)</span><input inputMode="numeric" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value.replace(/\D/g, "") })} placeholder="jaise 25000" /></label>
    <label className="ad-field"><span>Card ka rang</span><select value={f.theme} onChange={u("theme")}>{[["white", "Safed"], ["black", "Kala"], ["grey", "Grey"], ["red", "Laal"], ["plum", "Plum"], ["blue", "Neela"]].map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select></label>
    <Photo tok={tok} onUrl={(image) => setF((x) => ({ ...x, image }))} />{f.image && <img className="ad-prev" src={f.image} alt="" />}
    {!f.image && <small className="ad-note">Photo ke baghair gaari carousel mein nahi dikhegi.</small>}
    {err && <p role="alert" className="ad-err">{err}</p>}<button className="ad-btn ad-btn--lg">Add karein</button></form>);
}

function Row({ v, ov, kind, tok, change, remove }) {
  const val = (k) => ov?.[k] ?? v[k] ?? "", price = ov && "price" in ov ? ov.price : v.price, hidden = ov ? !!ov.hidden : !!v.hidden, img = ov?.image || v.image;
  return (<div className={`ad-row${hidden ? " is-off" : ""}`}>
    <div className="ad-thumb"><img src={img} alt="" loading="lazy" /></div>
    <div className="ad-info"><b>{val("name")} {val("trim")}</b><span><i style={{ background: swatch(val("color")) }} />{val("color")}</span></div>
    <label className="ad-switch" aria-label={`${val("name")} ${val("color")} website par dikhana`}><input type="checkbox" checked={!hidden} onChange={(e) => change({ hidden: !e.target.checked })} /><span /><em>{hidden ? "Hidden" : "Live"}</em></label>
    <label className="ad-price"><small>Price / day</small><div><span>Rs</span><input inputMode="numeric" value={price ?? ""} placeholder="—" aria-label={`Price per day for ${val("name")} ${val("color")}`} onChange={(e) => { const d = e.target.value.replace(/\D/g, ""); change({ price: d ? Number(d) : null }); }} /></div></label>
    <details className="ad-more"><summary>Aur badlein</summary>
      <div className="ad-more__in">
        {[["name", "Naam"], ["trim", "Model / trim"], ["color", "Colour"], ["subtitle", "Type"], ["description", "Chhoti description"]].map(([k, t]) => <label className="ad-field" key={k}><span>{t}</span><input value={val(k)} onChange={(e) => change({ [k]: e.target.value })} /></label>)}
        <Photo tok={tok} label="Photo badlein" onUrl={(image) => change({ image })} />
        {kind === "add" && <button type="button" className="ad-btn ad-btn--del" onClick={() => confirm("Yeh gaari delete karein?") && remove()}>Gaari delete karein</button>}
      </div></details></div>);
}


/* ---------- booking orders: list, tone, app-icon count, phone notifications ---------- */
const TONE = "/sounds/order-tone.mp3";
const b64ToU8 = (b) => { const p = (b + "=".repeat((4 - (b.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/"), r = atob(p); return Uint8Array.from(r, (c) => c.charCodeAt(0)); };
const fmtDate = (s) => { const d = new Date(`${s}T00:00:00`); return isNaN(d) ? s : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); };
const fmtTime = (s) => { const m = /^(\d{1,2}):(\d{2})/.exec(s || ""); if (!m) return s || ""; const h = +m[1]; return `${h % 12 || 12}:${m[2]} ${h >= 12 ? "PM" : "AM"}`; };
const waNum = (p) => { let d = String(p || "").replace(/\D/g, ""); if (d.startsWith("00")) d = d.slice(2); else if (d.startsWith("0")) d = `92${d.slice(1)}`; return d; };
const ago = (ts) => { const m = Math.max(0, Math.round((Date.now() - ts) / 60000)); return m < 1 ? "abhi" : m < 60 ? `${m} min pehle` : m < 1440 ? `${Math.round(m / 60)} ghante pehle` : new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short" }); };

function useOrders(tok, out, tab) {
  const [orders, setOrders] = useState(null), [fresh, setFresh] = useState(() => new Set()), [blocked, setBlocked] = useState(false), [banner, setBanner] = useState("");
  const known = useRef(null), el = useRef(null), ringState = useRef({ stop: false }), pending = useRef(false), tabRef = useRef(tab);
  tabRef.current = tab;
  const audio = () => { if (!el.current) { el.current = new Audio(TONE); el.current.preload = "auto"; el.current.volume = 1; } return el.current; };
  const stopRing = () => { ringState.current.stop = true; pending.current = false; const a = el.current; if (a) { a.onended = null; a.pause(); } };
  const ring = (times = 3) => {
    stopRing(); const a = audio(), st = { stop: false }; ringState.current = st; let n = 0;
    const next = () => { if (st.stop || n >= times) return; n++; a.currentTime = 0; a.play().then(() => { setBlocked(false); pending.current = false; }).catch(() => { pending.current = true; setBlocked(true); }); };
    a.onended = () => setTimeout(next, 450); next();
  };
  // the first tap anywhere unlocks sound on phones (browser rule); a tone that was blocked plays right then
  useEffect(() => {
    const h = () => { const a = audio(); if (pending.current) { ring(3); return; } if (!a.dataset.primed) { a.dataset.primed = "1"; a.muted = true; a.play().then(() => { a.pause(); a.currentTime = 0; a.muted = false; }).catch(() => { a.muted = false; }); } };
    addEventListener("pointerdown", h, { passive: true }); return () => removeEventListener("pointerdown", h);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const refresh = async () => {
    try {
      const list = (await api("orders", {}, tok)).orders || [], unseen = list.filter((o) => !o.seen);
      if (known.current === null) { known.current = new Set(list.map((o) => o.id)); setFresh(new Set(unseen.map((o) => o.id))); if (unseen.length && tabRef.current !== "orders") { setBanner(`🔔 ${unseen.length} naya booking order`); ring(2); } }
      else { const add = list.filter((o) => !known.current.has(o.id)); add.forEach((o) => known.current.add(o.id)); if (add.length) { setFresh((f) => new Set([...f, ...add.map((o) => o.id)])); setBanner(`🔔 ${add.length} naya booking order`); ring(3); } }
      setOrders(list);
    } catch (e) { if (e.status === 401) out(); }
  };
  useEffect(() => {
    refresh(); const t = setInterval(() => document.visibilityState === "visible" && refresh(), 12000);
    const vis = () => document.visibilityState === "visible" && refresh();
    const msg = (e) => { if (e.data?.type === "new-order") refresh(); };
    document.addEventListener("visibilitychange", vis); navigator.serviceWorker?.addEventListener("message", msg);
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", vis); navigator.serviceWorker?.removeEventListener("message", msg); stopRing(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (tab === "orders") { stopRing(); setBanner(""); } }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { // viewing the Orders tab marks them as seen (count goes down)
    if (tab !== "orders" || !orders) return; const ids = orders.filter((o) => !o.seen).map((o) => o.id); if (!ids.length) return;
    const t = setTimeout(async () => { try { await api("order_seen", { ids }, tok); setOrders((os) => os && os.map((o) => (ids.includes(o.id) ? { ...o, seen: 1 } : o))); } catch { /* retry on next refresh */ } }, 1500);
    return () => clearTimeout(t);
  }, [tab, orders]); // eslint-disable-line react-hooks/exhaustive-deps
  const unread = orders ? orders.filter((o) => !o.seen).length : 0;
  useEffect(() => { // red count on the phone's app icon + in the tab title
    try { unread ? navigator.setAppBadge?.(unread) : navigator.clearAppBadge?.(); } catch { /* not supported */ }
    document.title = unread ? `(${unread}) SAAD Admin` : "SAAD Admin";
  }, [unread]);
  const del = async (id) => { await api("order_del", { id }, tok); setOrders((os) => os.filter((o) => o.id !== id)); };
  return { orders, unread, fresh, blocked, banner, setBanner, ring, del, refresh };
}

function PushCard({ tok, ring, pwa }) {
  const ok = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  const [perm, setPerm] = useState(ok ? Notification.permission : "unsupported"), [on, setOn] = useState(false), [msg, setMsg] = useState("");
  useEffect(() => {
    if (!ok || perm !== "granted") return;
    navigator.serviceWorker.ready.then(async (reg) => { const sub = await reg.pushManager.getSubscription(); if (sub) { setOn(true); api("push_sub", { sub: sub.toJSON() }, tok).catch(() => {}); } }).catch(() => {});
  }, [perm]); // eslint-disable-line react-hooks/exhaustive-deps
  const enable = async () => {
    ring(1);
    try {
      const p = await Notification.requestPermission(); setPerm(p);
      if (p !== "granted") return setMsg("Notification allow nahi hui. Phone Settings > Apps > SAAD Admin > Notifications mein allow karein.");
      const reg = await navigator.serviceWorker.ready, { key } = await api("push_key", {}, tok);
      const sub = (await reg.pushManager.getSubscription()) || (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToU8(key) }));
      await api("push_sub", { sub: sub.toJSON() }, tok); setOn(true); setMsg("Notifications on ho gayin. App band hone par bhi order ka alert aayega.");
    } catch { setMsg("Notification on nahi hui. Internet check karke dobara try karein."); }
  };
  if (!ok) return <p className="ad-note">Is browser mein phone notifications support nahi. Chrome (Android) ya installed app (iPhone) istemal karein.</p>;
  if (pwa.ios && !pwa.standalone) return <p className="ad-note">iPhone par notification ke liye pehle Account tab se app ko Home Screen par install karein, phir wahan se kholein.</p>;
  if (on && perm === "granted") return <p className="ad-note ad-ok">✅ Phone notification on hai. <button type="button" className="ad-link" onClick={() => ring(1)}>🔊 Tone test</button></p>;
  return (<div className="ad-card ad-install"><b>🔔 Order notification on karein</b><p className="ad-note">Naya booking order aate hi phone par alert aur tone aayegi, chahe app band ho.</p>
    <button type="button" className="ad-btn" onClick={enable}><IBell />Notifications on karein</button>{msg && <p className="ad-note">{msg}</p>}</div>);
}

function Orders({ tok, st, pwa }) {
  const { orders, fresh, blocked, ring, del } = st, [view, setView] = useState(""), [busy, setBusy] = useState("");
  const src = (id) => `/api/admin?img=${id}&t=${encodeURIComponent(tok)}`;
  if (!orders) return <div className="ad-load" style={{ minHeight: "40svh" }}><span className="ad-spin" /><p>Orders load ho rahe hain…</p></div>;
  return (<>
    <PushCard tok={tok} ring={ring} pwa={pwa} />
    {blocked && <button type="button" className="ad-btn ad-btn--ghost ad-btn--lg" onClick={() => ring(2)}>🔊 Tone ke liye yahan tap karein</button>}
    {!orders.length && <section className="ad-card ad-empty"><IBell /><b>Abhi koi order nahi</b><span>Website se booking aate hi yahan receipt ke saath nazar aayegi.</span></section>}
    {orders.map((o) => (<article className={`ad-card ad-ord${fresh.has(o.id) ? " is-new" : ""}`} key={o.id}>
      <header><div><b>{o.car || "Booking"}</b><small>#{o.ref} · {ago(o.ts)}</small></div>{fresh.has(o.id) && <em>NEW</em>}</header>
      <button type="button" className="ad-rcpt" onClick={() => setView(o.id)} aria-label="Receipt bari karein"><img src={src(o.id)} alt={`Receipt ${o.ref}`} loading="lazy" /></button>
      <dl>{[["👤 Naam", o.name], ["📞 Phone", o.phone], ["📍 Pickup", o.pickup], ["🏁 Drop-off", o.drop], ["📅 Date", fmtDate(o.date)], ["⏰ Time", fmtTime(o.time)], ["👥 Passengers", o.pax], ["📝 Notes", o.extra]].filter(([, v]) => v).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
      <div className="ad-acts">
        <a className="ad-btn ad-btn--ghost" href={`tel:${String(o.phone).replace(/[^\d+]/g, "")}`}><IPhone />Call</a>
        <a className="ad-btn ad-btn--ghost" href={`https://wa.me/${waNum(o.phone)}`} target="_blank" rel="noopener noreferrer"><IChat />WhatsApp</a>
        <a className="ad-btn ad-btn--ghost" href={src(o.id)} download={`${o.ref}.png`}><IDown />Receipt</a>
        <button type="button" className="ad-btn ad-btn--del" disabled={busy === o.id} onClick={async () => { if (!confirm("Yeh order delete karein? Receipt bhi hat jayegi.")) return; setBusy(o.id); try { await del(o.id); } catch { alert("Delete nahi hua. Internet check karein."); } setBusy(""); }}><ITrash />Delete</button>
      </div></article>))}
    {view && <div className="ad-lb" onClick={() => setView("")} role="dialog" aria-label="Receipt"><button type="button" aria-label="Band karein">×</button><img src={src(view)} alt="Receipt" /></div>}
  </>);
}

/* ---------- Clients: everything visitors typed into the website forms, also when they never pressed Send ---------- */
const LSRC = { book: "Book page", modal: "Booking popup", home: "Home page booking", contact: "Contact form" };
const lkey = (l) => `${l.vid}|${l.src}`;
function leadsCsv(rows) {
  const H = ["Date", "Status", "Form", "Name", "Phone", "Email", "WhatsApp", "Car", "Pickup", "Drop-off", "Travel date", "Time", "Passengers", "Notes", "City", "Device", "Contacted"];
  const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`, body = rows.map((l) => [new Date(l.updated).toISOString().slice(0, 16).replace("T", " "), l.status === "sent" ? "Send kiya" : "Adhoora", LSRC[l.src] || l.src, l.name, l.phone, l.email, l.whatsapp, l.car, l.pickup, l.dropoff, l.day, l.tm, l.pax, l.extra, l.city, l.dev, l.called ? "Yes" : "No"].map(q).join(","));
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["\ufeff" + [H.map(q).join(","), ...body].join("\n")], { type: "text/csv" }));
  a.download = `saad-clients-${new Date().toISOString().slice(0, 10)}.csv`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
function Leads({ tok, out, onSeen }) {
  const outRef = useRef(out); outRef.current = out;   // keeps load() stable so the refresh timer is never reset
  const [rows, setRows] = useState(null), [err, setErr] = useState(""), [f, setF] = useState("all"), [q, setQ] = useState(""), [fresh, setFresh] = useState(() => new Set()), [busy, setBusy] = useState("");
  const load = useCallback(async () => {
    try {
      const r = await api("leads", {}, tok); setErr(""); setRows(r.rows);
      const nu = r.rows.filter((x) => !x.seen);
      if (nu.length) { setFresh((s) => new Set([...s, ...nu.map(lkey)])); api("lead_seen", {}, tok).catch(() => {}); }   // opening the tab = seen
      onSeen && onSeen();
    } catch (e) { if (e.status === 401) return outRef.current(); setErr(e.message === "no_db" ? "no_db" : "fail"); }
  }, [tok, onSeen]);
  useEffect(() => { load(); const t = setInterval(() => document.visibilityState === "visible" && load(), 20000); return () => clearInterval(t); }, [load]);
  if (err === "no_db") return <section className="ad-card"><h2>Clients ke liye database chahiye</h2><p className="ad-note">Dashboard wala D1 database (variable name <b>DB</b>) abhi Cloudflare mein bind nahi hai. Dashboard tab par jo 3 steps likhe hain wo kar lein, phir yahan sab clients nazar aayenge.</p></section>;
  if (!rows) return <div className="ad-load" style={{ minHeight: "40svh" }}>{err ? <><p>Load nahi hua. Internet check karein.</p><button type="button" className="ad-btn" onClick={load}>Dobara try karein</button></> : <><span className="ad-spin" /><p>Clients load ho rahe hain…</p></>}</div>;
  const n = { all: rows.length, partial: rows.filter((l) => l.status !== "sent").length, sent: rows.filter((l) => l.status === "sent").length, todo: rows.filter((l) => !l.called).length };
  const s = q.trim().toLowerCase(), list = rows.filter((l) => (f === "all" || (f === "partial" && l.status !== "sent") || (f === "sent" && l.status === "sent") || (f === "todo" && !l.called)) && (!s || [l.name, l.phone, l.email, l.car, l.pickup, l.dropoff].some((v) => String(v || "").toLowerCase().includes(s))));
  const call = async (l) => { setBusy(lkey(l)); try { await api("lead_update", { vid: l.vid, src: l.src, called: !l.called }, tok); setRows((r) => r.map((x) => (lkey(x) === lkey(l) ? { ...x, called: x.called ? 0 : 1 } : x))); } catch { alert("Save nahi hua. Internet check karein."); } setBusy(""); };
  const del = async (l) => { if (!confirm(`${l.name || l.phone || l.email} ka record delete karein?`)) return; setBusy(lkey(l)); try { await api("lead_delete", { vid: l.vid, src: l.src }, tok); setRows((r) => r.filter((x) => lkey(x) !== lkey(l))); } catch { alert("Delete nahi hua. Internet check karein."); } setBusy(""); };
  return (<>
    <section className="ad-card ad-leadhd"><div><h2>Clients ka data</h2><p className="ad-note">Jo bhi website ke form mein naam, phone ya email likhta hai, wo yahan save ho jata hai, chahe usne Send na dabaya ho.</p></div>
      <button type="button" className="ad-btn ad-btn--ghost" onClick={() => leadsCsv(rows)} disabled={!rows.length}><IDown />Excel (CSV) download</button></section>
    <div className="ad-fl" role="group" aria-label="Filter">{[["all", "Sab"], ["partial", "Adhoore"], ["sent", "Send kiye"], ["todo", "Rabta baqi"]].map(([k, t]) => <button key={k} type="button" aria-pressed={f === k} className={f === k ? "on" : ""} onClick={() => setF(k)}>{t} <b>{n[k]}</b></button>)}</div>
    <label className="ad-field"><span>Dhoondein</span><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Naam, phone, email ya gaari" /></label>
    {!rows.length && <section className="ad-card ad-empty"><IPeople /><b>Abhi koi client nahi</b><span>Website ke form mein koi phone ya email likhte hi yahan aa jayega, aur phone par notification bhi aayega.</span></section>}
    {rows.length > 0 && !list.length && <p className="ad-note" style={{ textAlign: "center", padding: "18px 0" }}>Is filter mein koi record nahi.</p>}
    {list.map((l) => (<article className={`ad-card ad-ord ad-lead${fresh.has(lkey(l)) ? " is-new" : ""}`} key={lkey(l)}>
      <header><div><b>{l.name || "Naam nahi likha"}</b><small>{LSRC[l.src] || l.src} · {ago(l.updated)}</small></div><span className={`ad-st ad-st--${l.status}`}>{l.status === "sent" ? "SEND KIYA" : "ADHOORA"}</span></header>
      <dl>{[["📞 Phone", l.phone], ["💬 WhatsApp", l.whatsapp && l.whatsapp !== l.phone ? l.whatsapp : ""], ["✉️ Email", l.email], ["🚗 Gaari", l.car], ["📍 Pickup", l.pickup], ["🏁 Drop-off", l.dropoff], ["📅 Date", l.day && fmtDate(l.day)], ["⏰ Time", l.tm && fmtTime(l.tm)], ["👥 Passengers", l.pax], ["📝 Notes", l.extra], ["🌍 Shehr", [l.city, l.dev].filter(Boolean).join(" · ")]].filter(([, v]) => v).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
      <div className="ad-acts">
        {l.phone && <a className="ad-btn ad-btn--ghost" href={`tel:${String(l.phone).replace(/[^\d+]/g, "")}`}><IPhone />Call</a>}
        {l.phone && <a className="ad-btn ad-btn--ghost" href={`https://wa.me/${waNum(l.whatsapp || l.phone)}`} target="_blank" rel="noopener noreferrer"><IChat />WhatsApp</a>}
        {l.email && <a className="ad-btn ad-btn--ghost" href={`mailto:${l.email}`}><IMail />Email</a>}
        <button type="button" className={`ad-btn ${l.called ? "ad-btn--ok" : "ad-btn--ghost"}`} disabled={busy === lkey(l)} onClick={() => call(l)}>{l.called ? "✅ Rabta ho gaya" : "Rabta ho gaya?"}</button>
        <button type="button" className="ad-btn ad-btn--del" disabled={busy === lkey(l)} onClick={() => del(l)}><ITrash />Delete</button>
      </div></article>))}
  </>);
}

/* Google review numbers shown on the website. Live from Google when the API key is set; otherwise (or as backup) typed here. */
function ReviewsCard({ tok }) {
  const [info, setInfo] = useState(null), [rating, setRating] = useState(""), [count, setCount] = useState(""), [msg, setMsg] = useState(""), [busy, setBusy] = useState(false);
  const refresh = useCallback(async () => { try { const j = await (await fetch(`/api/reviews?summary=1&t=${Date.now()}`)).json(); setInfo(j); return j; } catch { return null; } }, []);
  useEffect(() => { refresh().then((j) => { if (j && j.count != null) { setCount(String(j.count)); setRating(j.rating != null ? Number(j.rating).toFixed(1) : ""); } }); }, [refresh]);
  const save = async () => {
    setBusy(true); setMsg("");
    try { await api("reviews_set", { rating, count }, tok); await refresh(); setMsg("✅ Save ho gaya. Website par ab ye number dikhega."); }
    catch (e) { setMsg(e.message === "bad_count" ? "Reviews ka number sahi likhein, jaise 218." : e.message === "bad_rating" ? "Rating 1 se 5 ke beech likhein, jaise 5.0." : "Save nahi hua. Dobara try karein."); }
    setBusy(false);
  };
  const sync = async () => {
    setBusy(true); setMsg("");
    try { await api("reviews_refresh", {}, tok); const j = await refresh(); setMsg(j && j.source === "google" ? `✅ Google se update hua: ${j.count} reviews.` : j && j.error ? `❌ Google ne jawab nahi diya (${j.error}). API key / billing check karein.` : "Google API abhi set nahi hai. Neeche wala number haath se likh sakte hain."); }
    catch { setMsg("Update nahi hua. Dobara try karein."); }
    setBusy(false);
  };
  const src = !info ? "…" : info.source === "google" ? "✅ Live Google se jura hai (har ghante khud update)" : info.source === "manual" ? "✍️ Haath se likha number chal raha hai" : "Website abhi purana fixed number dikha rahi hai";
  return (<section className="ad-card"><h2>Google reviews (website par)</h2>
    <p className="ad-note">{src}{info && info.configured && info.source !== "google" && info.error ? ` · Google error: ${info.error}` : ""}</p>
    <div className="ad-two"><label className="ad-field"><span>Rating</span><input inputMode="decimal" value={rating} onChange={(e) => setRating(e.target.value)} placeholder="5.0" /></label>
      <label className="ad-field"><span>Total reviews</span><input inputMode="numeric" value={count} onChange={(e) => setCount(e.target.value.replace(/\D/g, ""))} placeholder="218" /></label></div>
    <button type="button" className="ad-btn ad-btn--lg" style={{ marginTop: 14 }} disabled={busy || !count || !rating} onClick={save}>{busy ? "Ek second…" : "Number save karein"}</button>
    {info && info.configured && <button type="button" className="ad-btn ad-btn--ghost ad-btn--lg" style={{ marginTop: 10 }} disabled={busy} onClick={sync}>Abhi Google se update karein</button>}
    {msg && <p className="ad-note" style={{ marginTop: 12 }}>{msg}</p>}
    <p className="ad-note" style={{ marginTop: 12 }}>Google API key lagi ho to ye number khud Google se aata hai aur haath ka number sirf backup hai.</p></section>);
}

function Panel({ tok, out, pwa }) {
  const [ov, setOv] = useState(null), [dirty, setDirty] = useState(false), [msg, setMsg] = useState(""), [loadErr, setLoadErr] = useState(""), [busy, setBusy] = useState(false), [tab, setTab] = useState(() => { const t = new URLSearchParams(location.search).get("tab"); return t === "fleet" || t === "orders" || t === "leads" ? t : "home"; }), [q, setQ] = useState(""), [formKey, setFormKey] = useState(0); const [leadN, setLeadN] = useState(0);
  const norm = (d) => ({ vehicles: {}, added: [], cats: [], ...(d || {}) });
  const load = () => { setLoadErr(""); api("load", {}, tok).then((r) => setOv(norm(r.data))).catch((e) => (e.status === 401 ? out() : setLoadErr(MSG[e.message] || "Data load nahi hua. Internet check karein."))); };
  const st = useOrders(tok, out, tab);
  const insApi = useCallback((a, b) => api(a, b, tok), [tok]);
  const tabRef = useRef(tab); tabRef.current = tab;
  const refreshLeadN = useCallback(() => { if (tabRef.current === "leads") return; api("lead_count", {}, tok).then((r) => setLeadN(r.unseen || 0)).catch(() => {}); }, [tok]);   // red badge on the Clients tab
  useEffect(() => { refreshLeadN(); const t = setInterval(() => document.visibilityState === "visible" && refreshLeadN(), 30000); return () => clearInterval(t); }, [refreshLeadN]);
  useEffect(() => {
    const m = (e) => { const t = e.data?.type; if (t === "open-orders") setTab("orders"); else if (t === "open-tab" && ["orders", "leads", "fleet", "home"].includes(e.data.tab)) setTab(e.data.tab); else if (t === "new-lead") refreshLeadN(); };
    navigator.serviceWorker?.addEventListener("message", m); return () => navigator.serviceWorker?.removeEventListener("message", m);
  }, [refreshLeadN]);
  const onLeadsSeen = useCallback(() => setLeadN(0), []);
  useEffect(load, []);
  useEffect(() => { if (!msg) return; const t = setTimeout(() => setMsg(""), 4500); return () => clearTimeout(t); }, [msg]);
  const edit = (fn) => { setOv((o) => { const n = structuredClone(o); fn(n); return n; }); setDirty(true); setMsg(""); };
  const cats = useMemo(() => ov ? [...baseFleet.map((c) => ({ slug: c.slug, title: c.title })), ...ov.cats.filter((c) => !baseFleet.some((b) => b.slug === c.slug))] : [], [ov]);
  const stats = useMemo(() => {
    if (!ov) return { total: 0, live: 0, hidden: 0, priced: 0 };
    const all = [...baseFleet.flatMap((c) => c.vehicles.map((v) => { const o = ov.vehicles[v.id]; return { hidden: !!o?.hidden, price: o && "price" in o ? o.price : v.price }; })), ...ov.added.map((a) => ({ hidden: !!a.hidden, price: a.price }))];
    return { total: all.length, live: all.filter((x) => !x.hidden).length, hidden: all.filter((x) => x.hidden).length, priced: all.filter((x) => x.price).length };
  }, [ov]);
  const save = async () => {
    setBusy(true); setMsg("");
    try { const { data } = await api("save", { data: ov }, tok); setOv(norm(data)); applyOverrides(data); saveLocal(data); setDirty(false); setMsg("Save ho gaya. Website par ~30 second mein nazar aayega."); }
    catch (e) { if (e.status === 401) out(); else setMsg(MSG[e.message] || "Save nahi hua. Dobara try karein."); } finally { setBusy(false); }
  };
  if (!ov) return (<div className="ad-load">{loadErr ? <><p>{loadErr}</p><button type="button" className="ad-btn" onClick={load}>Dobara try karein</button></> : <><span className="ad-spin" /><p>Load ho raha hai…</p></>}</div>);
  const match = (c, v) => !q.trim() || `${v.name} ${v.trim || ""} ${v.color || ""} ${c.title}`.toLowerCase().includes(q.trim().toLowerCase());
  const tabs = [["home", "Dashboard", IChart], ["orders", "Orders", IBell], ["leads", "Clients", IPeople], ["fleet", "Gaariyan", ICar], ["add", "Add", IPlus], ["me", "Account", IUser]];
  return (<>
    <header className="ad-top"><img src={LOGO} alt="SAAD CAR" width="900" height="284" /><span className="ad-pill">Admin</span></header>
    <main className="ad-main">
      {st.banner && tab !== "orders" && <button type="button" className="ad-alert" onClick={() => { st.setBanner(""); setTab("orders"); }}>{st.banner} <b>Dekhein</b></button>}
      {tab === "home" && <Insights api={insApi} out={out} />}
      {tab === "orders" && <Orders tok={tok} st={st} pwa={pwa} />}
      {tab === "leads" && <Leads tok={tok} out={out} onSeen={onLeadsSeen} />}
      {tab === "fleet" && <>
        <div className="ad-stats">{[["Total", stats.total], ["Live", stats.live], ["Hidden", stats.hidden], ["Price set", stats.priced]].map(([t, n]) => <div key={t}><b>{n}</b><span>{t}</span></div>)}</div>
        <label className="ad-search"><ISearch /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Gaari ya colour dhoondhein" aria-label="Search" /></label>
        {cats.map((c) => { const base = (baseFleet.find((b) => b.slug === c.slug)?.vehicles || []).filter((v) => match(c, v)), added = ov.added.filter((a) => a.cat === c.slug && match(c, a)); if (!base.length && !added.length) return null;
          return (<section className="ad-card" key={c.slug}><h2>{c.title}<small>{base.length + added.length}</small></h2>
            {base.map((v) => <Row key={v.id} v={v} ov={ov.vehicles[v.id]} kind="base" tok={tok} change={(p) => edit((n) => { n.vehicles[v.id] = { ...n.vehicles[v.id], ...p }; })} />)}
            {added.map((a) => <Row key={a.id} v={{ ...a, image: a.image || "/assets/placeholder-vehicle.svg" }} ov={null} kind="add" tok={tok} change={(p) => edit((n) => { Object.assign(n.added.find((x) => x.id === a.id), p); })} remove={() => edit((n) => { n.added = n.added.filter((x) => x.id !== a.id); })} />)}</section>); })}
      </>}
      {tab === "add" && <AddCar key={formKey} tok={tok} cats={cats} onAdd={(item, nc) => { edit((n) => { if (nc) n.cats.push(nc); n.added.push(item); }); setFormKey((k) => k + 1); setTab("fleet"); setMsg("Gaari add ho gayi. Neeche Save dabana na bhoolein."); }} />}
      {tab === "me" && <>
        <section className="ad-card ad-me"><img src={LOGO} alt="SAAD CAR" width="900" height="284" /><b>SAAD CAR RENTAL SERVICES</b><span>Owner admin</span></section>
        <InstallCard pwa={pwa} />
        <ReviewsCard tok={tok} />
        <a className="ad-btn ad-btn--ghost ad-btn--lg" href="/" target="_blank" rel="noopener noreferrer"><IGlobe />Website kholein</a>
        <button type="button" className="ad-btn ad-btn--ghost ad-btn--lg" onClick={out}><IOut />Logout</button>
        <p className="ad-ver">Version: {new Date(Number(__BUILD_ID__)).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}<br />Naya update aane par app khud update ho jati hai.</p>
      </>}
    </main>
    {(dirty || busy) && tab !== "orders" && tab !== "home" && tab !== "leads" && <div className="ad-save" role="status"><span>Badlaav save nahi hue</span><button type="button" className="ad-btn ad-btn--light" disabled={busy} onClick={save}>{busy ? "Save ho raha hai…" : "Save karein"}</button></div>}
    {msg && <div className="ad-toast" role="status">{msg}</div>}
    <nav className="ad-tabs" aria-label="Admin">{tabs.map(([k, t, Ic]) => <button key={k} type="button" className={tab === k ? "on" : ""} aria-current={tab === k ? "page" : undefined} onClick={() => setTab(k)}><span className="ad-ic"><Ic />{k === "orders" && st.unread > 0 && <i className="ad-count">{st.unread > 99 ? "99+" : st.unread}</i>}{k === "leads" && leadN > 0 && tab !== "leads" && <i className="ad-count">{leadN > 99 ? "99+" : leadN}</i>}</span>{t}</button>)}</nav>
  </>);
}

export default function Admin() {
  const [tok, setTok] = useState(() => { try { return localStorage.getItem(TK) || ""; } catch { return ""; } }), pwa = usePwa();
  const [splash, setSplash] = useState(() => { try { return !sessionStorage.getItem("adm-sp") && !matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; } });
  const set = (t) => { try { t ? localStorage.setItem(TK, t) : localStorage.removeItem(TK); } catch { /* ignore */ } setTok(t); };
  const endSplash = () => { try { sessionStorage.setItem("adm-sp", "1"); } catch { /* ignore */ } setSplash(false); };
  return <div className="adm" data-ok="1">{tok ? <Panel tok={tok} out={() => set("")} pwa={pwa} /> : <Login onOk={set} />}{splash && <Splash done={endSplash} />}</div>;
}
