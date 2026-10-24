// A small finger animation that shows customers they can swipe (phone) or drag (computer) to see the next car / photo.
// Shows when the area first scrolls into view, only a few times per visitor, and disappears on the first touch, drag or key press.
import { useEffect, useRef, useState } from "react";
import { useT } from "../i18n";

const KEY = "swipe-hint-n", MAX = 3;
const seen = () => { try { return Number(localStorage.getItem(KEY) || 0); } catch { return 0; } };
const remember = () => { try { localStorage.setItem(KEY, String(seen() + 1)); sessionStorage.setItem(KEY, "1"); } catch { /* ignore */ } };
const doneThisVisit = () => { try { return sessionStorage.getItem(KEY) === "1"; } catch { return false; } };

export default function SwipeHint({ label = "Swipe to see more cars", force = false }) {
  const t = useT(); const me = useRef(null); const [on, setOn] = useState(false);
  useEffect(() => {
    const host = me.current && me.current.parentElement; if (!host) return;
    if (!force && (seen() >= MAX || doneThisVisit())) return;
    let timer, io, shown = false;
    const hide = () => { setOn(false); clearTimeout(timer); ["pointerdown", "touchstart", "keydown", "wheel"].forEach((e) => host.removeEventListener(e, hide)); removeEventListener("keydown", hide); };
    const show = () => {
      if (shown) return; shown = true; if (!force) remember(); setOn(true);
      ["pointerdown", "touchstart", "wheel"].forEach((e) => host.addEventListener(e, hide, { passive: true })); addEventListener("keydown", hide);
      timer = setTimeout(hide, 7500);
    };
    if (!("IntersectionObserver" in window)) { show(); return hide; }
    io = new IntersectionObserver(([e]) => { if (e.isIntersecting && e.intersectionRatio > 0.45) { io.disconnect(); setTimeout(show, 600); } }, { threshold: [0.45] });
    io.observe(host);
    return () => { io && io.disconnect(); hide(); };
  }, [force]);
  return (
    <span className={`swh${on ? " swh--on" : ""}`} ref={me} aria-hidden="true">
      <span className="swh__track">
        <svg className="swh__chev swh__chev--l" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
        <span className="swh__hand">
          <i className="swh__ring" />
          <svg width="54" height="54" viewBox="0 0 64 64"><path d="M27 7c-3 0-5 2-5 5v23l-5-5c-2-2-5-2-7 0s-2 5 0 7l14 17c3 4 7 6 12 6h6c8 0 14-6 14-14V31c0-3-2-5-5-5-1 0-2 0-3 1-1-2-3-3-5-3-1 0-3 1-4 2-1-1-2-2-4-2-1 0-2 0-3 1V12c0-3-2-5-5-5z" fill="#fff" stroke="#16181b" strokeWidth="2.6" strokeLinejoin="round" /></svg>
        </span>
        <svg className="swh__chev swh__chev--r" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
      </span>
      <span className="swh__label">{t(label)}</span>
    </span>
  );
}
