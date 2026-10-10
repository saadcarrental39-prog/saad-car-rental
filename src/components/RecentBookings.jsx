import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { SITE } from "../config";
import { allVehicles } from "../data/fleet";
import { CUSTOMERS } from "../data/customers";
// Small bottom-right popup: "<Name> booked a car with a professional driver" + our Google rating.
// Timing (milliseconds): popup stays SHOW_MS, then waits GAP_MS, then the next name appears.
const SHOW_MS = 3500, GAP_MS = 2000, FIRST_MS = 3000;
const PHOTOS = allVehicles.filter((v) => v.image && !v.image.includes("placeholder"));
const stored = () => { try { return sessionStorage.getItem("rb-off") === "1"; } catch { return false; } };
export default function RecentBookings() {
  const { pathname } = useLocation(), blocked = pathname.startsWith("/book");
  const [cur, setCur] = useState(null), [off, setOff] = useState(stored);
  const paused = useRef(false), at = useRef(Math.floor(Math.random() * CUSTOMERS.length)), ph = useRef(Math.floor(Math.random() * Math.max(PHOTOS.length, 1)));
  useEffect(() => {
    if (off || blocked || !CUSTOMERS.length || !PHOTOS.length) { setCur(null); return; }
    let alive = true; const T = [], later = (fn, ms) => T.push(setTimeout(() => alive && fn(), ms));
    const busy = () => !!document.querySelector(".mdl,.menu");
    const show = () => {
      if (paused.current || busy()) return later(show, 700);
      const v = PHOTOS[ph.current++ % PHOTOS.length], name = CUSTOMERS[at.current++ % CUSTOMERS.length];
      setCur({ name, img: v.image, key: at.current });
      later(() => setCur((c) => c && { ...c, out: true }), SHOW_MS - 350); later(hide, SHOW_MS);
    };
    const hide = () => { if (paused.current) { setCur((c) => c && { ...c, out: false }); return later(hide, 800); } setCur(null); later(show, GAP_MS); };
    later(show, FIRST_MS);
    return () => { alive = false; T.forEach(clearTimeout); };
  }, [off, blocked]);
  if (!cur) return null;
  const hold = (v) => () => { paused.current = v; };
  return (<aside className={`rb${cur.out ? " rb--out" : ""}`} key={cur.key} aria-label="Recent customer" onMouseEnter={hold(true)} onMouseLeave={hold(false)} onFocus={hold(true)} onBlur={hold(false)}>
    <img src={cur.img} alt="" width="56" height="56" decoding="async" />
    <div className="rb__t"><b>{cur.name}</b><span>booked a car with a professional driver</span>
      <span className="rb__r"><i aria-hidden="true">★★★★★</i> {SITE.rating} · {SITE.reviewCount} Google reviews</span></div>
    <button type="button" className="rb__x" aria-label="Close these notifications" onClick={() => { try { sessionStorage.setItem("rb-off", "1"); } catch { /* ignore */ } setOff(true); }}>×</button>
  </aside>);
}
