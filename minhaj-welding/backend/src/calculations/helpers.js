/**
 * MINHAJ WELDING - Calculation Helpers
 * Rule: NO SILENT ROUNDING. Every value kept as full decimal.
 * Frontend may display rounded (e.g. 2 decimals) but stored values are exact.
 */

/**
 * Convert dual feet+inch input into decimal feet.
 * e.g. toDecimalFeet(8, 6) -> 8.5
 */
function toDecimalFeet(feet = 0, inch = 0) {
  const f = Number(feet) || 0;
  const i = Number(inch) || 0;
  return f + i / 12;
}

/**
 * Round to 2 decimals for DISPLAY ONLY. Never use this on stored values.
 */
function displayRound(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

/**
 * Standard breakdown -> total summer used by every chokat-style formula.
 * Returns { breakdown: {label: value, ...}, total: number }
 */
function sumBreakdown(breakdown) {
  const total = Object.values(breakdown).reduce((acc, v) => acc + (Number(v) || 0), 0);
  return { breakdown, total };
}

module.exports = { toDecimalFeet, displayRound, sumBreakdown };
