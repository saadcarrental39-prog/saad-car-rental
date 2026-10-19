// Admin helper: paste image URLs for each Murree spot, then download spot-images.json.
// Put the downloaded file in /public/spot-images.json (live in the browser at once) and copy the same content into src/seo/data/spotImages.json (baked into the HTML on the next build).
// Open it at  <your admin path>/spot-images
import { useEffect, useState } from "react";
import { TOUR_SPOTS } from "../seo/data/tourSpots";
import BAKED from "../seo/data/spotImages.json";

const SLOTS = 4;
export default function SpotImagesPanel() {
  const [data, setData] = useState(() => JSON.parse(JSON.stringify(BAKED)));
  useEffect(() => { fetch("/spot-images.json", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((j) => j && Object.keys(j).length && setData(j)).catch(() => {}); }, []);
  const get = (slug, i) => (data[slug] || [])[i] || { url: "", alt: "" };
  const set = (slug, i, field, v) => setData((d) => { const list = [...(d[slug] || [])]; while (list.length < SLOTS) list.push({ url: "", alt: "" }); list[i] = { ...list[i], [field]: v }; return { ...d, [slug]: list }; });
  const out = () => { const o = {}; TOUR_SPOTS.forEach((s) => { const l = (data[s.slug] || []).filter((x) => x && /^https?:\/\//.test((x.url || "").trim())).map((x) => ({ url: x.url.trim(), alt: (x.alt || "").trim() })); if (l.length) o[s.slug] = l; }); return JSON.stringify(o, null, 2); };
  const download = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([out()], { type: "application/json" })); a.download = "spot-images.json"; a.click(); };
  const box = { width: "100%", padding: ".45rem", margin: ".15rem 0", border: "1px solid #bbb", borderRadius: 6, font: "inherit" };
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1rem", fontFamily: "system-ui,sans-serif" }}>
      <meta name="robots" content="noindex,nofollow" />
      <h1>Murree spot images</h1>
      <p>Paste a direct image link (https://...) for each photo. Add a short description in the second box (it becomes the alt text for Google). Then press Download.</p>
      {TOUR_SPOTS.map((s) => (
        <fieldset key={s.slug} style={{ margin: "1rem 0", borderRadius: 10, border: "1px solid #ccc" }}>
          <legend><b>{s.name}</b></legend>
          {Array.from({ length: SLOTS }, (_, i) => { const g = get(s.slug, i); return (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 64px", gap: ".4rem", alignItems: "center" }}>
              <input style={box} placeholder={`Image URL ${i + 1}`} value={g.url} onChange={(e) => set(s.slug, i, "url", e.target.value)} />
              <input style={box} placeholder={`Alt text, e.g. ${s.images[i]}`} value={g.alt} onChange={(e) => set(s.slug, i, "alt", e.target.value)} />
              {/^https?:\/\//.test(g.url) ? <img src={g.url} alt="" style={{ width: 64, height: 48, objectFit: "cover", borderRadius: 6 }} referrerPolicy="no-referrer" /> : <span />}
            </div>); })}
        </fieldset>
      ))}
      <button onClick={download} style={{ padding: ".7rem 1.2rem", fontSize: "1rem", borderRadius: 8, border: 0, background: "#111", color: "#fff" }}>Download spot-images.json</button>
    </div>
  );
}
