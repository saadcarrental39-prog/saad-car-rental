// Simple yellow stars. line = outline-only style (design 3).
const P = "M12 2.6l2.9 5.9 6.5.95-4.7 4.6 1.1 6.45L12 17.4l-5.8 3.1 1.1-6.45-4.7-4.6 6.5-.95z";
export default function Stars({ value = 5, size = 18, line = false }) {
  const n = Math.round(Number(value) || 0);
  return (<span className="st" role="img" aria-label={`${n} out of 5 stars`} style={{ "--s": `${size}px` }}>
    {[1, 2, 3, 4, 5].map((i) => (<svg key={i} viewBox="0 0 24 24" aria-hidden="true" className={i <= n ? "on" : "off"}>
      <path d={P} fill={i <= n && !line ? "#FFC107" : "none"} stroke={i <= n ? (line ? "#F5A300" : "#FFC107") : "#cfcfcf"} strokeWidth={line ? 2.2 : 1} strokeLinejoin="round" /></svg>))}</span>);
}
