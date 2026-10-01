// Gold stars drawn with the supplied star icon. `value` can be fractional (4.8 -> last star mostly filled).
const row = () => [0, 1, 2, 3, 4].map((i) => <img key={i} src="/assets/star.png" alt="" width="96" height="96" loading="lazy" />);
export default function Stars({ value = 5, size = 18 }) {
  const pct = (Math.max(0, Math.min(5, Number(value) || 0)) / 5) * 100;
  return (<span className="stars5" role="img" aria-label={`${value} out of 5 stars`} style={{ "--s": `${size}px` }}>
    <span className="stars5__bg" aria-hidden="true">{row()}</span><span className="stars5__fg" aria-hidden="true" style={{ width: `${pct}%` }}>{row()}</span></span>);
}
