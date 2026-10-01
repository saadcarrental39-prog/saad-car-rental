// Finds WHEN (in ms) a CSS cubic-bezier easing reaches each equal step of progress.
// Used so the "tik" sounds land exactly as the car passes each notch of the circle.
export function bezierTimes([x1, y1, x2, y2], durMs, steps) {
  const B = (a, b, s) => 3 * a * s * (1 - s) ** 2 + 3 * b * s * s * (1 - s) + s ** 3;
  const out = [];
  for (let k = 1; k <= steps; k++) {
    const target = k / steps;
    let lo = 0, hi = 1;
    for (let i = 0; i < 28; i++) { const m = (lo + hi) / 2; (B(y1, y2, m) < target ? (lo = m) : (hi = m)); }
    out.push(B(x1, x2, (lo + hi) / 2) * durMs);
  }
  return out;
}
