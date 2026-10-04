/**
 * MINHAJ WELDING - Formula Registry
 * Central place that maps a style's `formula_key` (stored in DB) to the
 * actual calculation function. To add a NEW formula in a later phase:
 *   1. Write the function in calculations/<file>.js
 *   2. Register it here with a unique key
 *   3. Create a style row in the DB with that formula_key
 * No other code changes needed — the API and frontend are formula-agnostic.
 */
const { chokatDoor, chokatWindow, chokatBathroom, chokatRoshandan } = require('./chokat');
const { gateArea } = require('./gate');
const { railingRunningFt } = require('./railing');
const { fiberSheet } = require('./fiber');

const REGISTRY = {
  chokat_door: chokatDoor,
  chokat_window: chokatWindow,
  chokat_bathroom: chokatBathroom,
  chokat_roshandan: chokatRoshandan,
  gate_area: gateArea,
  railing_running_ft: railingRunningFt,
  fiber_sheet: fiberSheet,
};

function runFormula(formulaKey, inputs) {
  const fn = REGISTRY[formulaKey];
  if (!fn) {
    throw new Error(`Unknown formula_key: "${formulaKey}". Register it in calculations/index.js`);
  }
  return fn(inputs);
}

function listFormulaKeys() {
  return Object.keys(REGISTRY);
}

module.exports = { runFormula, listFormulaKeys, REGISTRY };
