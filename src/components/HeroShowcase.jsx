import { useEffect, useRef, useState } from "react";
import { imgSet, HERO_SIZES } from "../imgset";

// Fleet pictures only (videos removed: they were full dark scenes and cannot be made transparent).
// The FIRST picture is on screen immediately (no fade-in: that delayed the "main image loaded" time on PageSpeed).
// Every later picture: fades in, holds, fades out through the page background (never through black), then the next one.
export const IMAGE_MS = 5000; // total time per picture
export const FADE_MS = 1500;  // fade-in and fade-out length (edit here)

export default function HeroShowcase({ images }) {
  const [idx, setIdx] = useState(0);
  const first = useRef(true); // true only for the very first picture after the page opens
  useEffect(() => {
    const t = setTimeout(() => { first.current = false; setIdx((i) => (i + 1) % images.length); }, IMAGE_MS);
    return () => clearTimeout(t);
  }, [idx, images.length]);
  useEffect(() => { // preload the next picture (the same small/big file the screen will really use)
    const n = new Image(), nx = images[(idx + 1) % images.length], s = imgSet(nx.src, HERO_SIZES);
    if (s.srcSet) { n.sizes = s.sizes; n.srcset = s.srcSet; } n.src = nx.src;
  }, [idx, images]);
  const box = useRef(null);
  const isFirst = idx === 0 && first.current;
  useEffect(() => { // fade in -> hold -> fade out, all inside one picture's time slot (first picture: no fade-in)
    const k = FADE_MS / IMAGE_MS;
    const frames = isFirst ? [{ opacity: 1, offset: 0 }, { opacity: 1, offset: 1 - k }, { opacity: 0, offset: 1 }]
      : [{ opacity: 0, offset: 0 }, { opacity: 1, offset: k }, { opacity: 1, offset: 1 - k }, { opacity: 0, offset: 1 }];
    const a = box.current?.animate(frames, { duration: IMAGE_MS, easing: "ease-in-out", fill: "both" });
    return () => a?.cancel();
  }, [idx]);
  const cur = images[idx], s = imgSet(cur.src, HERO_SIZES);
  return (
    <div className="hero__show" role="img" aria-label={cur.alt}>
      <div key={idx} ref={box} className={`hero__slide${isFirst ? " hero__slide--first" : ""}`}>
        <img src={cur.src} {...s} alt="" width="805" height="510" decoding="async" {...(idx === 0 ? { fetchpriority: "high" } : {})} />
      </div>
    </div>
  );
}
