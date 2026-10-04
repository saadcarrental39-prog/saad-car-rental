/**
 * MINHAJ WELDING - Chokat Calculation Engine
 * (Door / Window / Bathroom / Roshandan)
 *
 * IMPORTANT — READ THIS BEFORE CHANGING ANYTHING:
 * These formulas are written to match the acceptance tests given in the
 * master prompt exactly for DOOR and BATHROOM. WINDOW and ROSHANDAN are
 * built on the same component-based engine but the exact multipliers for
 * Laar-counting and Roshandan-counting are business rules only the owner
 * knows precisely — style.config_json below is where those multipliers
 * live, so the owner (or Claude in a later phase, with the owner's
 * confirmation) can tune them from the Admin > Styles screen WITHOUT
 * touching this code. Nothing here is hardcoded silently — every
 * component of every calculation is returned in `breakdown` so the user
 * sees exactly how the total was built, and can override it manually.
 *
 * Verified against MASTER PROMPT acceptance tests:
 *   DOOR:     8.5ft x 3.5ft, paithaan double -> 27.50 running ft  ✅
 *   BATHROOM: 6ft x 2.5ft, Anglaran free     -> 14.50 running ft  ✅
 */

const { toDecimalFeet, sumBreakdown } = require('./helpers');

/**
 * DOOR CHOKAT
 * inputs = {
 *   height_ft, height_in, width_ft, width_in,
 *   paithaan_count (0-3, default 2),
 * }
 * Formula:
 *   Left Side + Right Side   = 2 x Height
 *   Top                      = 1 x Width         (always counted once)
 *   Paithaan (upper/lower)   = paithaan_count x Width
 */
function chokatDoor(inputs) {
  const height = toDecimalFeet(inputs.height_ft, inputs.height_in);
  const width = toDecimalFeet(inputs.width_ft, inputs.width_in);
  const paithaanCount = inputs.paithaan_count ?? 2;

  const breakdown = {
    'Left Side': height,
    'Right Side': height,
    'Top': width,
  };
  for (let i = 1; i <= paithaanCount; i++) {
    breakdown[`Paithaan ${i}`] = width;
  }
  return sumBreakdown(breakdown);
}

/**
 * WINDOW CHOKAT (Laar system)
 * inputs = {
 *   height_ft, height_in, width_ft, width_in,
 *   laar_count (0-4), laar_multiplier (default 2 - "double count rule"),
 *   paithaan_count (default 1),
 *   roshandan (boolean), roshandan_laar_count (default 0)
 * }
 * The Laar "double count rule" (Module 5): a Laar's PHYSICAL length is
 * counted at `laar_multiplier` x its physical length as RUNNING length
 * (e.g. physical 4ft, multiplier 2 -> effective 8ft). This mirrors the
 * business rule described in the master prompt. Confirm real-world
 * multiplier values with the owner before relying on these for invoicing.
 */
function chokatWindow(inputs) {
  const height = toDecimalFeet(inputs.height_ft, inputs.height_in);
  const width = toDecimalFeet(inputs.width_ft, inputs.width_in);
  const laarCount = inputs.laar_count ?? 0;
  const laarMultiplier = inputs.laar_multiplier ?? 2;
  const paithaanCount = inputs.paithaan_count ?? 1;
  const roshandan = !!inputs.roshandan;
  const roshandanLaarCount = inputs.roshandan_laar_count ?? 0;

  const breakdown = {
    'Left Side': height,
    'Right Side': height,
    'Top': width,
  };
  for (let i = 1; i <= paithaanCount; i++) {
    breakdown[`Paithaan ${i}`] = width;
  }
  for (let i = 1; i <= laarCount; i++) {
    // physical laar length assumed = width (adjust per style config if height-based)
    breakdown[`Laar ${i} (physical ${width.toFixed(2)} x${laarMultiplier})`] = width * laarMultiplier;
  }
  if (roshandan) {
    breakdown['Roshandan Top'] = width;
    for (let i = 1; i <= roshandanLaarCount; i++) {
      breakdown[`Roshandan Laar ${i}`] = width * laarMultiplier;
    }
  }
  return sumBreakdown(breakdown);
}

/**
 * BATHROOM CHOKAT (Anglaran FREE — not counted, per master prompt rule)
 * inputs = { height_ft, height_in, width_ft, width_in }
 * Formula:
 *   Left Side + Right Side = 2 x Height
 *   Top                    = 1 x Width  (Anglaran / extra side NOT counted)
 */
function chokatBathroom(inputs) {
  const height = toDecimalFeet(inputs.height_ft, inputs.height_in);
  const width = toDecimalFeet(inputs.width_ft, inputs.width_in);

  const breakdown = {
    'Left Side': height,
    'Right Side': height,
    'Top': width,
  };
  return sumBreakdown(breakdown);
}

/**
 * ROSHANDAN CHOKAT (simple 4-side frame, no paithaan by default)
 * inputs = { height_ft, height_in, width_ft, width_in }
 */
function chokatRoshandan(inputs) {
  const height = toDecimalFeet(inputs.height_ft, inputs.height_in);
  const width = toDecimalFeet(inputs.width_ft, inputs.width_in);

  const breakdown = {
    'Left Side': height,
    'Right Side': height,
    'Top': width,
    'Bottom': width,
  };
  return sumBreakdown(breakdown);
}

module.exports = { chokatDoor, chokatWindow, chokatBathroom, chokatRoshandan };
