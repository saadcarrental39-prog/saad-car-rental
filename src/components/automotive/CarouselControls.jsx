const Arrow = ({ flip }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={flip ? { transform: "scaleX(-1)" } : null}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

export default function CarouselControls({ index, total, onPrev, onNext }) {
  if (total < 2) return null;
  const pad = (n) => String(n).padStart(2, "0");
  return (
    <nav className="lc__controls" aria-label="Vehicle carousel">
      <button type="button" className="lc__nav lc__nav--prev" onClick={onPrev} aria-label="Previous vehicle"><Arrow flip /></button>
      <div className="lc__count" aria-hidden="true">
        <span>{pad(index + 1)} / {pad(total)}</span>
        <span className="lc__dots">{Array.from({ length: total }, (_, i) => <i key={i} className={i === index ? "on" : ""} />)}</span>
      </div>
      <button type="button" className="lc__nav lc__nav--next" onClick={onNext} aria-label="Next vehicle"><Arrow /></button>
    </nav>
  );
}
