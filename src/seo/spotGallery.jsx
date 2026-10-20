// Photo gallery for a tourist spot. Photos are saved in the admin app (Spots tab) and read from /api/spots in the browser (Googlebot renders this too);
// src/seo/data/spotImages.json is an optional baked-in fallback. Nothing is shown until a photo exists.
import { useEffect, useState } from "react";
import BAKED from "./data/spotImages.json";

const ok = (u) => /^https:\/\//.test(u || "") || /^\/api\/img\/[a-f0-9]{16}$/.test(u || "");
const clean = (list) => (Array.isArray(list) ? list : []).filter((x) => x && ok(x.url));
export function SpotGallery({ slug, name, labels = [] }) {
  const [live, setLive] = useState(null);
  useEffect(() => { let off = false; fetch("/api/spots").then((r) => (r.ok ? r.json() : null)).then((j) => { if (!off && j && j.spots) setLive(j.spots); }).catch(() => {}); return () => { off = true; }; }, []);
  const imgs = clean((live && live[slug]) || BAKED[slug]);
  if (!imgs.length) return null;
  const abs = (u) => (u.startsWith("/") ? `https://www.saadcarremtal.com${u}` : u);
  const ld = { "@context": "https://schema.org", "@graph": imgs.map((im, i) => ({ "@type": "ImageObject", contentUrl: abs(im.url), name: im.alt || `${labels[i] || name} - ${name}`, caption: im.caption || undefined })) };
  return (
    <>
      <div className="spot-gal">
        {imgs.map((im, i) => (
          <figure key={im.url}><img src={im.url} alt={im.alt || `${labels[i] || name} - ${name}`} width="800" height="600" loading={i < 2 ? "eager" : "lazy"} decoding="async" referrerPolicy="no-referrer" />{im.caption && <figcaption>{im.caption}</figcaption>}</figure>
        ))}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
    </>
  );
}
export const hasBakedImages = (slug) => clean(BAKED[slug]).length > 0;
