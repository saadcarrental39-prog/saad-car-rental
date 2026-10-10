// Gives the browser a choice of picture sizes (phones take the small one, big screens the big one).
// Only car photos that have small copies (see scripts/make-image-sizes.py) get a choice; any other picture is left exactly as it is.
import { SETS } from "./data/imageSets";
const RX = /^\/assets\/vehicles\/([\w-]+)\.webp$/;
const variant = (name, w, full) => (w === full ? `/assets/vehicles/${name}.webp` : `/assets/vehicles/${name}-${w}.webp`);
export function imgSet(src, sizes) {
  const m = RX.exec(src || ""), ws = m && SETS[m[1]];
  if (!ws || ws.length < 2) return {};
  const full = ws[ws.length - 1];
  return { srcSet: ws.map((w) => `${variant(m[1], w, full)} ${w}w`).join(", "), sizes };
}
// smallest copy: used where a picture is only a shape (the shine effect) and never seen sharp
export function tinySrc(src) {
  const m = RX.exec(src || ""), ws = m && SETS[m[1]];
  return ws && ws.length > 1 ? variant(m[1], ws[0], ws[ws.length - 1]) : src;
}
export const HERO_SIZES = "(max-width: 900px) 92vw, 52vw";
export const CAROUSEL_SIZES = "(max-width: 900px) 92vw, 48vw";
export const CARD_SIZES = "(max-width: 700px) 90vw, 360px";
