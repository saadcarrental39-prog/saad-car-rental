/**
 * MINHAJ WELDING - Gate Calculation Engine (Square Foot)
 * Verified: 12ft x 8ft -> 96 sq ft ✅ (acceptance test)
 *
 * inputs = {
 *   width_ft, width_in, height_ft, height_in,
 *   design ('simple'|'pipe'|'grill'|'cnc'|'decorative'|'custom'),
 * }
 * Hardware (kabza, handle, bolt, lock, latch, wheel) is priced as
 * separate line items in the quotation, NOT folded into this formula —
 * so nothing is hidden inside the area number.
 */
const { toDecimalFeet, sumBreakdown } = require('./helpers');

function gateArea(inputs) {
  const width = toDecimalFeet(inputs.width_ft, inputs.width_in);
  const height = toDecimalFeet(inputs.height_ft, inputs.height_in);

  const breakdown = {
    'Width': width,
    'Height': height,
    'Area (Width x Height) sq ft': width * height,
  };
  // total for pricing purposes = area only (width/height rows are for display)
  return { breakdown, total: width * height };
}

module.exports = { gateArea };
