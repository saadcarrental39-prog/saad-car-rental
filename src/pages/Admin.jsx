import { useEffect, useMemo, useRef, useState } from "react";
import { baseFleet, applyOverrides } from "../data/fleet";
import { saveLocal } from "../fleetSync";
import { ADMIN_PATH } from "../config";

const TK = "adm-t";
const MSG = { invalid: "Username ya password ghalat hai.", too_many: "Bohat zyada koshish. 15 minute baad dobara try karein.", admin_not_configured: "Admin abhi setup nahi hua. Cloudflare mein ADMIN_USER aur ADMIN_PASS set karein (README-ADMIN.md).", no_storage: "Storage (KV) bind nahi hua. README-ADMIN.md dekhein.", bad_image: "Photo save nahi hui. Chhoti ya doosri photo try karein.", too_big: "Photo bohat bari hai." };
async function api(action, body = {}, token) {
  const r = await fetch("/api/admin", { method: "POST", headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ action, ...body }) });
  let j = {}; try { j = await r.json(); } catch { /* not json */ }
  if (!r.ok) throw Object.assign(new Error(j.error || "error"), { status: r.status });
  return j;
}
async function shrink(file) { // phone photo -> max 1200px webp (keeps transparency)
  const bmp = await createImageBitmap(file); let w = Math.min(1200, bmp.width), out = "";
  for (let i = 0; i < 3; i++) { const c = document.createElement("canvas"); c.width = w; c.height = Math.round((bmp.height * w) / bmp.width); c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height); out = c.toDataURL("image/webp", 0.85); if (out.length < 1.15e6) return out; w = Math.round(w * 0.75); }
  return out;
}
function usePwa() { // makes this page installable as an app, only on the hidden admin page
  const [ev, setEv] = useState(null);
  useEffect(() => {
    const add = (tag, attrs) => { const e = document.createElement(tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); document.head.appendChild(e); return e; };
    const els = [add("link", { rel: "manifest", href: "/admin.webmanifest" }), add("link", { rel: "apple-touch-icon", href: "/admin-icon-180.png" }), add("meta", { name: "theme-color", content: "#16181b" }), add("meta", { name: "robots", content: "noindex,nofollow" }), add("meta", { name: "apple-mobile-web-app-capable", content: "yes" }), add("meta", { name: "apple-mobile-web-app-title", content: "SAAD Admin" })];
    const old = document.title; document.title = "SAAD Admin";
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/admin-sw.js", { scope: `${ADMIN_PATH}/` }).catch(() => {});
    const h = (e) => { e.preventDefault(); setEv(e); }; addEventListener("beforeinstallprompt", h);
    return () => { els.forEach((e) => e.remove()); document.title = old; removeEventListener("beforeinstallprompt", h); };
  }, []);
  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  return { ev, standalone, ios, install: async () => { if (!ev) return; ev.prompt(); await ev.userChoice; setEv(null); } };
}
const Install = ({ pwa }) => pwa.standalone ? null : pwa.ev ? <button type="button" className="adm__b adm__b--ghost" onClick={pwa.install}>Install app</button>
  : pwa.ios ? <p className="adm__hint">iPhone: Safari mein Share dabayein, phir <b>Add to Home Screen</b>.</p> : <p className="adm__hint">App install karne ke liye Chrome menu (⋮) mein <b>Install app</b> / <b>Add to Home screen</b> dabayein.</p>;

function Login({ onOk, pwa }) {
  const [u, setU] = useState(""), [p, setP] = useState(""), [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  const go = async (e) => { e.preventDefault(); setBusy(true); setErr(""); try { onOk((await api("login", { user: u, pass: p })).token); } catch (x) { setErr(MSG[x.message] || "Login nahi hua. Internet check karein."); } finally { setBusy(false); } };
  return (<form className="adm__login" onSubmit={go}><h1>SAAD Admin</h1><p>Sirf owner ke liye</p>
    <label>Username<input value={u} onChange={(e) => setU(e.target.value)} autoCapitalize="none" autoCorrect="off" autoComplete="username" required /></label>
    <label>Password<input type="password" value={p} onChange={(e) => setP(e.target.value)} autoComplete="current-password" required /></label>
    {err && <p role="alert" className="adm__err">{err}</p>}<button className="adm__b" disabled={busy}>{busy ? "Ruko…" : "Login"}</button><Install pwa={pwa} /></form>);
}

function Photo({ tok, onUrl, label = "Photo chunein" }) {
  const [st, setSt] = useState(""), ref = useRef(null);
  const pick = async (e) => { const f = e.target.files?.[0]; if (!f) return; setSt("Upload ho rahi hai…"); try { const url = (await api("upload", { image: await shrink(f) }, tok)).url; setSt("Photo lag gayi"); onUrl(url); } catch (x) { setSt(MSG[x.message] || "Upload nahi hui."); } e.target.value = ""; };
  return (<div className="adm__photo"><input ref={ref} type="file" accept="image/*" onChange={pick} hidden /><button type="button" className="adm__b adm__b--ghost" onClick={() => ref.current.click()}>{label}</button><small>{st || "Behtar: transparent background wali PNG/WebP"}</small></div>);
}

function AddCar({ tok, cats, onAdd, close }) {
  const [f, setF] = useState({ cat: cats[0].slug, newCat: "", name: "", trim: "", color: "", subtitle: "", price: "", theme: "white", image: "" }), [err, setErr] = useState("");
  const u = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = (e) => {
    e.preventDefault(); if (!f.name.trim() || !f.color.trim()) return setErr("Gaari ka naam aur colour likhein.");
    let cat = f.cat, newCat = null;
    if (cat === "__new") { const t = f.newCat.trim(); if (!t) return setErr("Nayi category ka naam likhein."); let sl = t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "category", n = 2, base = sl; while (cats.some((c) => c.slug === sl)) sl = `${base}-${n++}`; cat = sl; newCat = { slug: sl, title: t }; }
    onAdd({ id: `x-${Date.now().toString(36)}`, cat, name: f.name.trim(), trim: f.trim.trim(), color: f.color.trim(), subtitle: f.subtitle.trim() || "With Professional Driver", price: f.price ? Number(f.price) : null, theme: f.theme, image: f.image }, newCat); close();
  };
  return (<form className="adm__card adm__add" onSubmit={submit}><h2>Nayi gaari add karein</h2>
    <label>Category<select value={f.cat} onChange={u("cat")}>{cats.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}<option value="__new">+ Nayi category…</option></select></label>
    {f.cat === "__new" && <label>Nayi category ka naam<input value={f.newCat} onChange={u("newCat")} placeholder="jaise Mercedes S Class" /></label>}
    <label>Gaari ka naam<input value={f.name} onChange={u("name")} placeholder="jaise Toyota Corolla" required /></label>
    <label>Model / trim (optional)<input value={f.trim} onChange={u("trim")} placeholder="jaise Altis" /></label>
    <label>Colour<input value={f.color} onChange={u("color")} placeholder="jaise Pearl White" required /></label>
    <label>Type (optional)<input value={f.subtitle} onChange={u("subtitle")} placeholder="jaise Luxury SUV" /></label>
    <label>Price per day (Rs)<input inputMode="numeric" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value.replace(/\D/g, "") })} placeholder="jaise 25000" /></label>
    <label>Card ka rang<select value={f.theme} onChange={u("theme")}>{[["white", "Safed"], ["black", "Kala"], ["grey", "Grey"], ["red", "Laal"], ["plum", "Plum"], ["blue", "Neela"]].map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select></label>
    <Photo tok={tok} onUrl={(image) => setF((x) => ({ ...x, image }))} />{f.image && <img className="adm__prev" src={f.image} alt="" />}
    {!f.image && <small className="adm__hint">Photo ke baghair gaari carousel mein nahi dikhegi.</small>}
    {err && <p role="alert" className="adm__err">{err}</p>}<div className="adm__acts"><button className="adm__b">Add karein</button><button type="button" className="adm__b adm__b--ghost" onClick={close}>Cancel</button></div></form>);
}

function Row({ v, ov, kind, tok, change, remove }) {
  const val = (k) => ov?.[k] ?? v[k] ?? "", price = ov && "price" in ov ? ov.price : v.price, hidden = !!ov?.hidden, img = ov?.image || v.image;
  return (<div className={`adm__row${hidden ? " is-off" : ""}`}>
    <img src={img} alt="" /><div className="adm__info"><b>{val("name")} {val("trim")}</b><small>{val("color")}</small>
      <label className="adm__price"><span>Rs</span><input inputMode="numeric" value={price ?? ""} placeholder="Price" aria-label={`Price per day for ${val("name")} ${val("color")}`} onChange={(e) => change({ price: e.target.value.replace(/\D/g, "") ? Number(e.target.value.replace(/\D/g, "")) : null })} /><span>/ day</span></label></div>
    <label className="adm__sw"><input type="checkbox" checked={!hidden} onChange={(e) => change({ hidden: !e.target.checked })} /><span>{hidden ? "Hidden" : "Visible"}</span></label>
    <details className="adm__more"><summary>Aur badlein</summary>
      {[["name", "Naam"], ["trim", "Model / trim"], ["color", "Colour"], ["subtitle", "Type"], ["description", "Chhoti description"]].map(([k, t]) => <label key={k}>{t}<input value={val(k)} onChange={(e) => change({ [k]: e.target.value })} /></label>)}
      <Photo tok={tok} label="Photo badlein" onUrl={(image) => change({ image })} />
      {kind === "add" && <button type="button" className="adm__b adm__b--del" onClick={() => confirm("Yeh gaari delete karein?") && remove()}>Gaari delete karein</button>}</details></div>);
}

function Panel({ tok, out, pwa }) {
  const [ov, setOv] = useState(null), [dirty, setDirty] = useState(false), [msg, setMsg] = useState(""), [busy, setBusy] = useState(false), [adding, setAdding] = useState(false);
  const norm = (d) => ({ vehicles: {}, added: [], cats: [], ...(d || {}) });
  useEffect(() => { api("load", {}, tok).then((r) => setOv(norm(r.data))).catch((e) => (e.status === 401 ? out() : setMsg(MSG[e.message] || "Data load nahi hua. Internet check karein."))); }, []);
  const edit = (fn) => { setOv((o) => { const n = structuredClone(o); fn(n); return n; }); setDirty(true); setMsg(""); };
  const cats = useMemo(() => ov ? [...baseFleet.map((c) => ({ slug: c.slug, title: c.title })), ...ov.cats.filter((c) => !baseFleet.some((b) => b.slug === c.slug))] : [], [ov]);
  const save = async () => {
    setBusy(true); setMsg("");
    try { const { data } = await api("save", { data: ov }, tok); setOv(norm(data)); applyOverrides(data); saveLocal(data); setDirty(false); setMsg("Save ho gaya. Website par ~30 second mein nazar aayega."); }
    catch (e) { if (e.status === 401) out(); else setMsg(MSG[e.message] || "Save nahi hua. Dobara try karein."); } finally { setBusy(false); }
  };
  if (!ov) return <p className="adm__load">{msg || "Load ho raha hai…"}</p>;
  return (<>
    <header className="adm__top"><div><b>SAAD Admin</b><small>Prices aur gaariyan</small></div><div className="adm__acts"><Install pwa={pwa} /><button type="button" className="adm__b adm__b--ghost" onClick={out}>Logout</button></div></header>
    <main className="adm__main">
      {cats.map((c) => { const base = baseFleet.find((b) => b.slug === c.slug)?.vehicles || [], added = ov.added.filter((a) => a.cat === c.slug);
        return (<section className="adm__card" key={c.slug}><h2>{c.title}</h2>
          {base.map((v) => <Row key={v.id} v={v} ov={ov.vehicles[v.id]} kind="base" tok={tok} change={(p) => edit((n) => { n.vehicles[v.id] = { ...n.vehicles[v.id], ...p }; })} />)}
          {added.map((a) => <Row key={a.id} v={{ ...a, image: a.image || "/assets/placeholder-vehicle.svg" }} ov={null} kind="add" tok={tok} change={(p) => edit((n) => { Object.assign(n.added.find((x) => x.id === a.id), p); })} remove={() => edit((n) => { n.added = n.added.filter((x) => x.id !== a.id); })} />)}</section>); })}
      {adding ? <AddCar tok={tok} cats={cats} close={() => setAdding(false)} onAdd={(item, nc) => edit((n) => { if (nc) n.cats.push(nc); n.added.push(item); })} />
        : <button type="button" className="adm__b adm__big" onClick={() => setAdding(true)}>+ Nayi gaari add karein</button>}
    </main>
    <div className="adm__bar"><span role="status">{msg || (dirty ? "Badlaav save nahi hue" : "Sab save hai")}</span><button type="button" className="adm__b" disabled={!dirty || busy} onClick={save}>{busy ? "Save ho raha hai…" : "Save karein"}</button></div></>);
}

export default function Admin() {
  const [tok, setTok] = useState(() => { try { return localStorage.getItem(TK) || ""; } catch { return ""; } }), pwa = usePwa();
  const set = (t) => { try { t ? localStorage.setItem(TK, t) : localStorage.removeItem(TK); } catch { /* ignore */ } setTok(t); };
  const ver = new Date(Number(__BUILD_ID__)).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
  return <div className="adm" data-ok="1">{tok ? <Panel tok={tok} out={() => set("")} pwa={pwa} /> : <Login onOk={set} pwa={pwa} />}
    <p className="adm__ver">SAAD CAR RENTAL SERVICES · Owner admin · Sirf authorised owner ke liye · Version: {ver}</p></div>;
}
