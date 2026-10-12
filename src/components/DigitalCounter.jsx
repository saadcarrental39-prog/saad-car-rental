import { useEffect, useState } from "react";

// Digital (LED style) counters at the top of the dashboard: Total visitors and Total views, since the first visit was recorded.
function useCount(target) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0, t0 = 0; const dur = 900;
    const step = (t) => { t0 = t0 || t; const p = Math.min(1, (t - t0) / dur); setV(Math.round(target * (1 - (1 - p) ** 3))); if (p < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return v;
}
function Display({ label, value, ready }) {
  const n = useCount(ready ? value : 0), s = String(n).padStart(Math.max(6, String(value || 0).length), "0");
  let seen = false;
  return (
    <div className="dc">
      <span className="dc__l">{label}</span>
      <div className="dc__d" role="img" aria-label={`${label}: ${ready ? value : "loading"}`}>
        {[...s].map((ch, i) => { if (ch !== "0") seen = true; return <i key={i} className={!seen && i < s.length - 1 ? "z" : ""}>{ready ? ch : "-"}</i>; })}
      </div>
    </div>
  );
}
export default function DigitalCounters({ data }) {
  const ready = !!data, vis = data ? (data.all ? data.all.vis : data.cur.vis) : 0, pv = data ? (data.all ? data.all.pv : data.cur.pv) : 0;
  const since = data && data.since ? new Date(data.since + 5 * 3600e3).toISOString().slice(0, 10) : "";
  return (
    <section className="dc-wrap" aria-label="Total visitors and total views">
      <Display label="TOTAL VISITORS" value={vis} ready={ready} />
      <Display label="TOTAL VIEWS" value={pv} ready={ready} />
      <p className="dc-foot">{data && data.all ? "All time" : "Selected period"}{since ? ` · since ${since}` : ""}</p>
    </section>
  );
}
