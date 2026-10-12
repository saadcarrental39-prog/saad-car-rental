import { useEffect, useRef, useState } from "react";

// Hidden visitors: the owner can swipe a visitor away from the activity lists. This only HIDES them on this phone
// (nothing is deleted from the database), and "Restore" brings them all back.
const KEY = "adm-hidden-vids";
const read = () => { try { const v = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(v) ? v : []; } catch { return []; } };
export const keyOf = (e) => e.vid || `e${e.id}`;
export function useHidden() {
  const [hidden, setHidden] = useState(read);
  useEffect(() => { const on = () => setHidden(read()); addEventListener("adm-hidden", on); return () => removeEventListener("adm-hidden", on); }, []);
  const hide = (k) => { try { localStorage.setItem(KEY, JSON.stringify([...new Set([...read(), k])].slice(-800))); } catch { /* ignore */ } dispatchEvent(new Event("adm-hidden")); };
  const restore = () => { try { localStorage.removeItem(KEY); } catch { /* ignore */ } dispatchEvent(new Event("adm-hidden")); };
  return { hidden, hide, restore };
}

// A list row that can be swiped left or right (or dragged with the mouse) to hide it. Vertical scrolling still works normally.
export function SwipeRow({ onHide, children, label = "Hata dein" }) {
  const [dx, setDx] = useState(0), [gone, setGone] = useState(false), [drag, setDrag] = useState(false), st = useRef(null);
  const down = (e) => { st.current = { x: e.clientX, y: e.clientY, lock: null }; };
  const move = (e) => {
    const s = st.current; if (!s) return;
    const mx = e.clientX - s.x, my = e.clientY - s.y;
    if (!s.lock && (Math.abs(mx) > 8 || Math.abs(my) > 8)) s.lock = Math.abs(mx) > Math.abs(my) ? "x" : "y";
    if (s.lock === "x") { setDrag(true); setDx(mx); }
  };
  const up = () => {
    const s = st.current; st.current = null; setDrag(false);
    if (s && s.lock === "x" && Math.abs(dx) > 90) { setGone(true); setDx(dx > 0 ? 520 : -520); setTimeout(onHide, 200); } else setDx(0);
  };
  const w = Math.min(1, Math.abs(dx) / 90);
  return (
    <li className={`sw${gone ? " is-gone" : ""}`}>
      <span className="sw__bg" style={{ opacity: w }} aria-hidden="true">{label}</span>
      <div className={`sw__fg${drag ? " is-drag" : ""}`} style={{ transform: `translateX(${dx}px)` }} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={() => { if (st.current) up(); }}>{children}</div>
    </li>
  );
}
