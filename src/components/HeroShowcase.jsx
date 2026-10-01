import { useEffect, useRef, useState } from "react";

// Fleet pictures only (videos removed: they were full dark scenes and cannot be made transparent).
// Each picture: fades in, holds, fades out through the page background (never through black), then the next one.
export const IMAGE_MS = 5000; // total time per picture
export const FADE_MS = 1500;  // fade-in and fade-out length (edit here)

export default function HeroShowcase({ images }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setIdx((i) => (i + 1) % images.length), IMAGE_MS);
    return () => clearTimeout(t);
  }, [idx, images.length]);
  useEffect(() => { const n = new Image(); n.src = images[(idx + 1) % images.length].src; }, [idx, images]); // preload next
  const box = useRef(null);
  useEffect(() => { // fade in -> hold -> fade out, all inside one picture's time slot
    const a = box.current?.animate([{ opacity: 0, offset: 0 }, { opacity: 1, offset: FADE_MS / IMAGE_MS }, { opacity: 1, offset: 1 - FADE_MS / IMAGE_MS }, { opacity: 0, offset: 1 }], { duration: IMAGE_MS, easing: "ease-in-out", fill: "both" });
    return () => a?.cancel();
  }, [idx]);
  const cur = images[idx];
  return (
    <div className="hero__show" role="img" aria-label={cur.alt}>
      <div key={idx} ref={box} className="hero__slide">
        <img src={cur.src} alt="" width="805" height="510" decoding="async" />
      </div>
    </div>
  );
}
