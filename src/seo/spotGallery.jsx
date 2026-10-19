// Photo gallery for a tourist spot. Images are URLs (no files in the repo): they come from src/seo/data/spotImages.json (baked in at build time,
// so crawlers see them) and, in the browser, from /spot-images.json (so a new URL shows without a rebuild). Nothing is shown until a URL exists.
import { useEffect, useState } from "react";
import BAKED from "./data/spotImages.json";

const clean = (list) => (Array.isArray(list) ? list : []).filter((x) => x && /^https?:\/\//.test(x.url));
export function SpotGallery({ slug, name, labels = [] }) {
  const [live, setLive] = useState(null);
  useEffect(() => { let off = false; fetch("/spot-images.json", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((j) => { if (!off && j) setLive(j); }).catch(() => {}); return () => { off = true; }; }, []);
  const imgs = clean((live && live[slug]) || BAKED[slug]);
  if (!imgs.length) return null;
  return (
    <div className="spot-gal">
      {imgs.map((im, i) => (
        <figure key={im.url}><img src={im.url} alt={im.alt || `${labels[i] || name} - ${name}`} loading={i < 2 ? "eager" : "lazy"} decoding="async" referrerPolicy="no-referrer" />{im.caption && <figcaption>{im.caption}</figcaption>}</figure>
      ))}
    </div>
  );
}
export const hasBakedImages = (slug) => clean(BAKED[slug]).length > 0;
