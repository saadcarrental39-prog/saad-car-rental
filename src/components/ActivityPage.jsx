import { useCallback, useEffect, useRef, useState } from "react";
import { evText, where, dedupe, dlabel } from "./Insights";
import { SwipeRow, keyOf, useHidden } from "./swipe";

// "Taza activity" as its own complete page (the Activity tab): newest first, then everything back to the very first visit,
// grouped by date (Pakistan time). Loads older pages while you scroll. Swipe a visitor left or right to hide them (only on this phone).
const PKT = 5 * 3600e3, dayKey = (ts) => new Date(ts + PKT).toISOString().slice(0, 10);
const clock = (ts) => { const d = new Date(ts + PKT), h = d.getUTCHours(); return `${h % 12 || 12}:${String(d.getUTCMinutes()).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`; };
const dayName = (k) => { if (k === dayKey(Date.now())) return "Aaj"; if (k === dayKey(Date.now() - 864e5)) return "Kal"; return dlabel(k, { weekday: "short", day: "numeric", month: "short", year: "numeric" }); };

export default function ActivityPage({ api }) {
  const { hidden, hide, restore } = useHidden();
  const [rows, setRows] = useState([]), [more, setMore] = useState(true), [busy, setBusy] = useState(false), [bad, setBad] = useState(false), [undo, setUndo] = useState(null);
  const next = useRef(0), seen = useRef(new Set()), loading = useRef(false), done = useRef(false), cursor = useRef(0), end = useRef(null);
  const take = useCallback((evs) => { const add = evs.filter((e) => !seen.current.has(e.id)); if (!add.length) return; add.forEach((e) => seen.current.add(e.id)); setRows((r) => [...r, ...add].sort((a, b) => b.id - a.id)); }, []);
  const older = useCallback(async () => {
    if (loading.current || done.current) return; loading.current = true; setBusy(true);
    try { const d = await api("activity", { before: next.current }); take(d.events || []); next.current = d.next || next.current; done.current = !d.more; setMore(!!d.more); setBad(false); }
    catch { setBad(true); } finally { loading.current = false; setBusy(false); }
  }, [api, take]);
  useEffect(() => { older(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // new visits appear at the top by themselves
  useEffect(() => {
    let off = false;
    const tick = async () => { if (document.hidden || off) return; try { const d = await api("live", { since: cursor.current }); if (off) return; take(d.events || []); if (d.cursor) cursor.current = d.cursor; } catch { /* next tick */ } };
    tick(); const t = setInterval(tick, 6000);
    return () => { off = true; clearInterval(t); };
  }, [api, take]);
  // load the next page when the end of the list comes into view
  useEffect(() => {
    const el = end.current; if (!el || !("IntersectionObserver" in window)) return undefined;
    const io = new IntersectionObserver((en) => { if (en[0].isIntersecting) older(); }, { rootMargin: "400px" });
    io.observe(el); return () => io.disconnect();
  }, [older, rows.length]);

  const shown = dedupe(rows.filter((e) => !hidden.includes(keyOf(e)))), groups = [];
  shown.forEach((f) => { const k = dayKey(f.ts), g = groups[groups.length - 1]; if (g && g.k === k) g.items.push(f); else groups.push({ k, items: [f] }); });
  const hideIt = (f) => { hide(keyOf(f)); setUndo(f); clearTimeout(hideIt.t); hideIt.t = setTimeout(() => setUndo(null), 5000); };
  const undoIt = () => { if (!undo) return; const k = keyOf(undo); try { const cur = JSON.parse(localStorage.getItem("adm-hidden-vids") || "[]").filter((x) => x !== k); localStorage.setItem("adm-hidden-vids", JSON.stringify(cur)); } catch { /* ignore */ } dispatchEvent(new Event("adm-hidden")); setUndo(null); };

  return (
    <div className="ac">
      <header className="ac-head">
        <div><h1>Taza activity</h1><p>{shown.length}{more ? "+" : ""} activities · visitor ko left ya right swipe karke hata dein</p></div>
        {hidden.length > 0 && <button type="button" className="ad-btn ad-btn--ghost" onClick={restore}>Restore ({hidden.length})</button>}
      </header>
      {groups.map((g) => (
        <section key={g.k} className="ac-day">
          <h2>{dayName(g.k)}<small>{g.items.length}</small></h2>
          <ul className="ac-list">
            {g.items.map((f) => { const [h, d] = evText(f); return (
              <SwipeRow key={f.id} onHide={() => hideIt(f)}>
                <div className="ac-row"><div><b>{h}</b><small>{[where(f), d].filter(Boolean).join(" · ")}</small></div><time>{clock(f.ts)}</time></div>
              </SwipeRow>); })}
          </ul>
        </section>
      ))}
      {!shown.length && !busy && !bad && <p className="ac-st">{hidden.length ? "Sab visitors hidden hain. Restore dabayein." : "Abhi koi activity nahi."}</p>}
      <div ref={end} className="ac-end" />
      {busy && <p className="ac-st">Load ho raha hai…</p>}
      {bad && <p className="ac-st"><button type="button" onClick={older}>Dobara try karein</button></p>}
      {!more && shown.length > 0 && <p className="ac-st">Yahan se pehli activity shuru hui</p>}
      {undo && <div className="ac-undo" role="status">Visitor hata diya <button type="button" onClick={undoIt}>Undo</button></div>}
    </div>
  );
}
