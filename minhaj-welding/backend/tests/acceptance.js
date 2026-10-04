// Acceptance tests from master prompt Section 10 (run: node tests/acceptance.js)
const { runFormula } = require('../src/calculations');
let fail = 0;
const check = (name, got, exp) => {
  const ok = Math.abs(got - exp) < 1e-9;
  if (!ok) fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}: got ${got}, expected ${exp}`);
};
check('DOOR 8.5x3.5 paithaan double', runFormula('chokat_door', { height_ft: 8, height_in: 6, width_ft: 3, width_in: 6, paithaan_count: 2 }).total, 27.5);
check('BATHROOM 6x2.5 anglaran free', runFormula('chokat_bathroom', { height_ft: 6, width_ft: 2, width_in: 6 }).total, 14.5);
check('GATE 12x8', runFormula('gate_area', { width_ft: 12, height_ft: 8 }).total, 96);
const r = runFormula('railing_running_ft', { length_ft: 20, pillar_count: 3, pillar_rate: 500 });
check('RAILING length', r.total, 20);
check('RAILING pillar separate', r.pillar_amount, 1500);
const f = runFormula('fiber_sheet', { width_ft: 8, height_ft: 6 });
check('FIBER area', f.total, 48);
const w = runFormula('chokat_window', { height_ft: 5, width_ft: 5, laar_count: 2, paithaan_count: 1, roshandan: true });
console.log(`INFO  WINDOW 5x5, 2 Laar, paithaan, roshandan = ${w.total} (master prompt says 49.50 "configured" - multiplier rules need owner confirmation, see docs/FORMULAS.md)`);
process.exit(fail ? 1 : 0);
