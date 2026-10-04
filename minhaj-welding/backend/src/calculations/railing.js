/**
 * MINHAJ WELDING - Railing Calculation Engine
 * Unit: Running Foot. Master Pillar priced SEPARATELY (count x pillar_rate)
 * — never folded silently into the running-foot total.
 *
 * inputs = {
 *   length_ft, length_in,       // total railing running length
 *   pillar_count, pillar_rate,  // master pillar - separate line item
 *   design ('round_pipe'|'square_curas'|'golden_ball'|'silver_ball'|'multi_color'|'custom')
 * }
 */
const { toDecimalFeet, sumBreakdown } = require('./helpers');

function railingRunningFt(inputs) {
  const length = toDecimalFeet(inputs.length_ft, inputs.length_in);
  const pillarCount = Number(inputs.pillar_count) || 0;
  const pillarRate = Number(inputs.pillar_rate) || 0;
  const pillarAmount = pillarCount * pillarRate;

  const breakdown = {
    'Railing Length (running ft)': length,
  };
  const result = sumBreakdown(breakdown);

  return {
    ...result,
    // railing total (for main rate x qty) is just the length;
    // pillar amount returned separately so it's added as its own line
    // item in the quotation, at pillar_rate per pillar (not per-ft rate).
    pillar_count: pillarCount,
    pillar_rate: pillarRate,
    pillar_amount: pillarAmount,
  };
}

module.exports = { railingRunningFt };
