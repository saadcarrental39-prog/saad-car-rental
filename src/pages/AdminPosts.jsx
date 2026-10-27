// Admin app > "Posts" tab (replaces the old Spots tab). The owner types a title, description, tags, picture links (imgbb / postimages) and
// reel / video links. Every post becomes its OWN page at /posts/<slug> (server-rendered, see functions/_lib/posts.js), is added to
// sitemap-posts.xml and is announced to Bing (IndexNow). No rebuild, no deploy. Photos and videos stay on imgbb / YouTube / Facebook /
// Instagram: nothing is stored on our hosting except the text.
import { useEffect, useMemo, useState } from "react";
import { cleanPost, seoChecks, parseVideo, imageLinkProblem, CATEGORIES } from "../../functions/_lib/postcore.js";
import "../styles/admin-spots.css";
import "../styles/admin-posts.css";

export const IPost = () => <svg viewBox="0 0 24 24" aria-hidden="true" className="ad-i"><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5M9 12h7M9 16h7" /></svg>;
const today = () => new Date(Date.now() + 5 * 3600e3).toISOString().slice(0, 10);
const cut = (t) => String(t || "").split("|").map((x) => x.trim());
const lines = (t) => String(t || "").split("\n").map((x) => x.trim()).filter(Boolean);
const EMPTY = () => ({ title: "", slug: "", keyword: "", description: "", category: CATEGORIES[0], location: "", tags: "", summary: "", body: "", images: "", videos: "", spots: "", faqs: "", date: today(), status: "published" });
const toForm = (p) => ({ title: p.title, slug: p.slug, keyword: p.keyword || "", description: p.description || "", category: p.category || CATEGORIES[0], location: p.location || "", tags: (p.tags || []).join(", "), summary: p.summary || "", body: p.body || "",
  images: (p.images || []).map((i) => [i.url, i.alt, i.caption].filter((x, k) => k < 2 || x).join(" | ")).join("\n"), videos: (p.videos || []).map((v) => [v.url, v.title].filter(Boolean).join(" | ")).join("\n"),
  spots: (p.spots || []).map((s) => `${s.name} | ${s.text}`).join("\n"), faqs: (p.faqs || []).map((f) => `${f.q} | ${f.a}`).join("\n"), date: p.date || today(), status: p.status || "published" });
const toRaw = (f) => ({ title: f.title, slug: f.slug, keyword: f.keyword, description: f.description, category: f.category, location: f.location, tags: f.tags.split(/[,\n]/).map((x) => x.trim()).filter(Boolean),
  summary: f.summary, body: f.body, images: lines(f.images).map((l) => { const [url, alt, caption] = cut(l); return { url, alt, caption }; }), videos: lines(f.videos).map((l) => { const [url, title] = cut(l); return { url, title }; }),
  spots: lines(f.spots).map((l) => { const [name, ...r] = cut(l); return { name, text: r.join(" | ") }; }), faqs: lines(f.faqs).map((l) => { const [q, ...r] = cut(l); return { q, a: r.join(" | ") }; }), date: f.date, status: f.status });
const state = (p) => (p.status !== "published" ? "Draft" : p.date > today() ? "Scheduled" : "Live");

export default function AdminPosts({ tok, api, out }) {
  const [guides, setGuides] = useState([]);
  useEffect(() => { fetch("/guide-posts.json").then((r) => r.json()).then((j) => setGuides(Array.isArray(j) ? j : [])).catch(() => {}); }, []);
  const [list, setList] = useState(null), [err, setErr] = useState(""), [edit, setEdit] = useState(null), [msg, setMsg] = useState(""), [busy, setBusy] = useState(false), [res, setRes] = useState(null);
  const load = () => api("posts_list", {}, tok).then((r) => setList(r.posts || [])).catch((e) => (e.status === 401 ? out() : setErr("Load nahi hua. Internet check karein.")));
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const open = async (slug) => { setMsg(""); setRes(null); if (!slug) return setEdit({ old: "", f: EMPTY() }); try { const r = await api("posts_get", { slug }, tok); setEdit({ old: slug, f: toForm(r.post) }); } catch (e) { if (e.status === 401) return out(); setMsg("Post khul nahi saki."); } };
  const del = async (slug) => { if (!window.confirm("Ye post hamesha ke liye hata dein?")) return; try { await api("posts_delete", { slug }, tok); setMsg("Post hat gayi."); setEdit(null); load(); } catch (e) { if (e.status === 401) return out(); setMsg("Delete nahi hui."); } };
  const save = async (status) => {
    const f = { ...edit.f, status }; setBusy(true); setMsg(""); setRes(null);
    try { const r = await api("posts_save", { post: toRaw(f), old: edit.old }, tok); setEdit({ old: r.post.slug, f: toForm(r.post) }); setRes({ url: r.url, live: r.live, dropped: r.dropped, status: r.post.status, title: r.post.title }); load(); }
    catch (e) { if (e.status === 401) return out(); setMsg(e.message === "title_short" ? "Title kam az kam 5 akshar ka likhein." : "Save nahi hua. Dobara try karein."); }
    setBusy(false);
  };
  if (!list) return <div className="ad-load">{err ? <p>{err}</p> : <><span className="ad-spin" /><p>Load ho raha hai…</p></>}</div>;
  if (edit) return <Editor {...{ edit, setEdit, save, del, busy, msg, res, back: () => { setEdit(null); setRes(null); setMsg(""); } }} />;
  return (<>
    <section className="ad-card"><h2>Posts: Trips, Spots &amp; Videos<small>{list.length}</small></h2>
      <p className="ad-note">Har post ka apna SEO page banta hai (<b>/posts/…</b>). Roz 1 post daalein: title, description, tags, images ke links aur reel / video links. Post save hote hi website par live ho jati hai.</p>
      <button type="button" className="ad-btn ad-btn--lg" onClick={() => open("")}>+ Nayi post</button>
      <a className="ad-note" href="/posts" target="_blank" rel="noopener noreferrer">Website par Trips page dekhein →</a>{msg && <p className="ad-note" role="status">{msg}</p>}</section>
    {list.map((p) => (<section className="ad-card ad-post" key={p.slug}>
      {p.image ? <img src={p.image} alt="" loading="lazy" referrerPolicy="no-referrer" /> : <div className="ad-post__ph" />}
      <div><h3>{p.title}</h3><p className="ad-note"><b className={`ad-pill ad-pill--${state(p).toLowerCase()}`}>{state(p)}</b> {p.date}{p.location ? ` · ${p.location}` : ""}</p>
        <div className="ad-spot__btns"><button type="button" className="ad-btn ad-btn--ghost" onClick={() => open(p.slug)}>Edit</button><a className="ad-btn ad-btn--ghost" href={`/posts/${p.slug}`} target="_blank" rel="noopener noreferrer">Dekhein</a></div></div>
    </section>))}
    {!list.length && <section className="ad-card"><p className="ad-note">Abhi koi post nahi. Pehli post banayein: “+ Nayi post”.</p></section>}
    {guides.length > 0 && <section className="ad-card"><h2>Website ki ready Trip Guides<small>{guides.length}</small></h2>
      <p className="ad-note">Ye {guides.length} guides website ke saath bani hain aur LIVE hain. Ye “Trips” page par bhi nazar aati hain. Inhein badalna ho to developer se kehein; nayi posts aap upar “+ Nayi post” se bana sakte hain.</p></section>}
    {guides.map((p) => (<section className="ad-card ad-post" key={p.slug}>
      {p.image ? <img src={p.image} alt="" loading="lazy" /> : <div className="ad-post__ph" />}
      <div><h3>{p.title}</h3><p className="ad-note"><b className="ad-pill ad-pill--live">Live</b> {p.date}{p.location ? ` · ${p.location}` : ""}</p>
        <div className="ad-spot__btns"><a className="ad-btn ad-btn--ghost" href={p.href} target="_blank" rel="noopener noreferrer">Dekhein</a></div></div>
    </section>))}
  </>);
}

function Editor({ edit, setEdit, save, del, busy, msg, res, back }) {
  const { f } = edit, set = (k) => (e) => setEdit({ ...edit, f: { ...f, [k]: e.target.value } }), setv = (k, v) => setEdit({ ...edit, f: { ...f, [k]: v } });
  const raw = useMemo(() => toRaw(f), [f]);
  const { post, dropped } = useMemo(() => cleanPost(raw, today()), [raw]);
  const chk = useMemo(() => seoChecks(post), [post]);
  const imgs = lines(f.images).map((l) => { const [url, alt] = cut(l); return { url, alt, problem: imageLinkProblem(url) }; });
  const vids = lines(f.videos).map((l) => { const [url] = cut(l); const pv = parseVideo(url); return { url, ok: !!pv, label: pv ? pv.label : "" }; });
  const autoFill = () => {
    const loc = f.location.trim(), kw = f.keyword.trim() || `${loc || f.title} car rental with driver from islamabad`.toLowerCase();
    const tags = f.tags.trim() || [...new Set([kw, loc.toLowerCase(), "car rental with driver", "islamabad", "pakistan tour", f.category.toLowerCase()].filter(Boolean))].join(", ");
    const summary = f.summary.trim() || (loc ? `Book a car with a professional driver from Islamabad to ${loc}. ${f.title}. Share your pickup, date and passengers on WhatsApp and we confirm the vehicle and send the quote before you travel.` : "");
    setEdit({ ...edit, f: { ...f, keyword: kw, tags, summary } });
  };
  const copy = (t) => { try { navigator.clipboard.writeText(t); } catch { /* ignore */ } };
  const lock = edit.old && edit.f.status === "published";
  return (<>
    <section className="ad-card"><h2>{edit.old ? "Post edit" : "Nayi post"}<small className={chk.score >= 85 ? "ad-good" : ""}>SEO {chk.score}%</small></h2>
      <button type="button" className="ad-btn ad-btn--ghost" onClick={back}>← Wapas</button>
      <label className="ad-field"><span>Title (30-65 akshar)</span><input value={f.title} maxLength={110} onChange={set("title")} placeholder="Islamabad to Murree: Patriata, Mall Road and Ayubia Chairlift by Car" /></label>
      <label className="ad-field"><span>Focus keyword (jo Google par rank karwana hai)</span><input value={f.keyword} maxLength={80} onChange={set("keyword")} placeholder="islamabad to murree car with driver" /></label>
      <label className="ad-field"><span>Location</span><input value={f.location} maxLength={80} onChange={set("location")} placeholder="Murree" /></label>
      <label className="ad-field"><span>Category</span><select value={f.category} onChange={set("category")}>{[...new Set([f.category, ...CATEGORIES])].map((c) => <option key={c}>{c}</option>)}</select></label>
      <label className="ad-field"><span>Meta description (120-160 akshar)</span><textarea rows={3} value={f.description} maxLength={170} onChange={set("description")} placeholder="Khali chhor dein to short answer se khud ban jayegi" /></label>
      <label className="ad-field"><span>Tags / keywords (comma se alag)</span><textarea rows={2} value={f.tags} onChange={set("tags")} placeholder="murree, patriata chairlift, ayubia, car with driver, islamabad to murree" /></label>
      <button type="button" className="ad-btn ad-btn--ghost ad-mt" onClick={autoFill}>✨ Khali SEO fields khud bharo</button>
    </section>
    <section className="ad-card"><h2>Short answer (AEO / AI)</h2><p className="ad-note">2-3 saaf jumle (25-70 alfaz) jo seedha sawal ka jawab dein. Google AI, ChatGPT aur voice search yehi uthate hain.</p>
      <textarea rows={4} value={f.summary} maxLength={420} onChange={set("summary")} placeholder="Islamabad se Murree ki car with driver trip ... " />
      <label className="ad-field"><span>Poori details</span></label><p className="ad-note">Naya paragraph = khali line. <b>## Heading</b>, <b>- bullet</b>, <b>**bold**</b>, <b>[text](/cars)</b> chalte hain.</p>
      <textarea rows={12} value={f.body} maxLength={12000} onChange={set("body")} placeholder={"## Kya dekhein\n- Patriata chairlift\n- Mall Road\n\n## Best time\nGarmiyon mein ..."} />
    </section>
    <section className="ad-card"><h2>Images <small>{imgs.length}</small></h2>
      <p className="ad-note">Har line: <b>direct image link | alt text | caption (optional)</b>. Pehli image main photo banti hai. imgbb mein “Direct link” (<b>i.ibb.co/…</b>) aur postimages mein “Direct link” (<b>i.postimg.cc/…</b>) lagayein.</p>
      <textarea rows={6} value={f.images} onChange={set("images")} placeholder={"https://i.ibb.co/abc/patriata.jpg | Patriata chairlift Murree | Chairlift ride"} />
      <div className="ad-thumbs">{imgs.map((i, k) => <figure key={k}>{i.problem ? <span className="ad-bad">⚠ {i.problem}</span> : <img src={i.url} alt="" loading="lazy" referrerPolicy="no-referrer" />}<figcaption>{k + 1}</figcaption></figure>)}</div>
      {dropped.images > 0 && <p className="ad-warn">{dropped.images} image link save nahi hoga (direct link nahi hai).</p>}
    </section>
    <section className="ad-card"><h2>Videos / Reels <small>{vids.length}</small></h2>
      <p className="ad-note">Har line: <b>link | title (optional)</b>. YouTube, YouTube Shorts, Facebook reel / video, Instagram reel, TikTok ya seedha .mp4 link. Page par scroll karke video aate hi khud chalti hai (awaaz band, tap par on). Instagram apni taraf se autoplay allow nahi karta, wahan play button dabana parta hai.</p>
      <textarea rows={4} value={f.videos} onChange={set("videos")} placeholder={"https://www.youtube.com/shorts/xxxxxxxxxxx | Patriata chairlift ride\nhttps://www.instagram.com/reel/xxxx/"} />
      {vids.map((v, k) => <p key={k} className={v.ok ? "ad-ok" : "ad-warn"}>{v.ok ? `✓ ${v.label}` : "⚠ Ye link samajh nahi aaya"}: {v.url.slice(0, 48)}</p>)}
    </section>
    <section className="ad-card"><h2>Spots aur FAQ</h2>
      <label className="ad-field"><span>Spots (har line: naam | tafseel)</span></label>
      <textarea rows={5} value={f.spots} onChange={set("spots")} placeholder={"Patriata | Chairlift aur cable car, jungle trail\nMall Road | Shopping aur cafes"} />
      <label className="ad-field"><span>FAQ (har line: sawal | jawab) - kam az kam 2</span></label>
      <textarea rows={5} value={f.faqs} onChange={set("faqs")} placeholder={"Murree trip ke liye kaun si car behtar hai? | Barf ya fog mein Prado ya Land Cruiser behtar hai."} />
    </section>
    <section className="ad-card"><h2>Schedule</h2>
      <label className="ad-field"><span>Date (aane wali date = us din live hogi)</span><input type="date" value={f.date} onChange={set("date")} /></label>
      <label className="ad-field"><span>Address (slug){lock ? " - live post ka address nahi badalta" : ""}</span><input value={f.slug} disabled={lock} maxLength={80} onChange={(e) => setv("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} placeholder="khali = title se khud" /></label>
      <p className="ad-note">Page: <b>/posts/{post.slug || "…"}</b></p>
    </section>
    <section className="ad-card"><h2>SEO checklist</h2>{chk.items.map((c, k) => <p key={k} className={c.ok ? "ad-ok" : "ad-warn"}>{c.ok ? "✓" : "○"} {c.msg}</p>)}</section>
    {res && <section className="ad-card ad-done" role="status"><h2>{res.status === "published" ? (res.live ? "Post live ho gayi ✓" : "Schedule ho gayi ✓") : "Draft save ho gaya ✓"}</h2>
      {res.status === "published" && <><p className="ad-note">{res.url}</p><div className="ad-spot__btns"><a className="ad-btn ad-btn--ghost" href={res.url} target="_blank" rel="noopener noreferrer">Page dekhein</a><button type="button" className="ad-btn ad-btn--ghost" onClick={() => copy(res.url)}>Link copy</button>
        <a className="ad-btn ad-btn--ghost" href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${res.title} ${res.url}`)}`} target="_blank" rel="noopener noreferrer">WhatsApp</a></div>
        <p className="ad-note">Facebook / Instagram post mein ye link daalein: wahan se bhi traffic aur backlink milta hai. Bing ko khud bata diya gaya; Google 1-2 din mein sitemap se utha leta hai (Search Console mein URL Inspection &gt; Request indexing se jaldi).</p></>}
      {res.dropped && (res.dropped.images > 0 || res.dropped.videos > 0) && <p className="ad-warn">{res.dropped.images} image aur {res.dropped.videos} video link save nahi hue (link theek nahi).</p>}</section>}
    {msg && <p className="ad-warn" role="alert">{msg}</p>}
    <div className="ad-save ad-save--posts" role="status"><button type="button" className="ad-btn ad-btn--ghost" disabled={busy} onClick={() => save("draft")}>Draft</button><button type="button" className="ad-btn ad-btn--light" disabled={busy} onClick={() => save("published")}>{busy ? "Save ho raha hai…" : "Publish karein"}</button></div>
    {edit.old && <button type="button" className="ad-btn ad-btn--del" onClick={() => del(edit.old)}>Ye post delete karein</button>}
  </>);
}
