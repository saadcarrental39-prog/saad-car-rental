/**
 * MINHAJ WELDING - Pricing Service
 * Rule (Module 8 - Historical Price Protection):
 *   Once a measurement is saved, its rate is SNAPSHOTTED. Changing the
 *   live market rate later NEVER changes already-saved measurements,
 *   quotations, or invoices. Only NEW calculations use the new rate.
 */
const db = require('../models/db');
const { runFormula } = require('../calculations');

/**
 * Get the currently active rate row for a given style (or category if no
 * style-specific rate exists). Returns null if nothing configured yet —
 * caller must then require rate_source = 'custom' with a manual rate.
 */
function getActiveRate({ categoryId, styleId }) {
  let row = null;
  if (styleId) {
    row = db.prepare(
      `SELECT * FROM rates WHERE style_id = ? AND status = 'active' ORDER BY effective_from DESC LIMIT 1`
    ).get(styleId);
  }
  if (!row) {
    row = db.prepare(
      `SELECT * FROM rates WHERE category_id = ? AND style_id IS NULL AND status = 'active' ORDER BY effective_from DESC LIMIT 1`
    ).get(categoryId);
  }
  return row || null;
}

/**
 * Full calculation + pricing pipeline. Does NOT save to DB — that's the
 * controller's job (so the frontend can preview before saving).
 *
 * params = {
 *   category_id, style_id, formula_key,
 *   inputs: {...},                 // raw dimensions/counts
 *   manual_value, manual_reason,   // optional override of auto total
 *   rate_source: 'current'|'custom'|'historical',
 *   custom_rate,                   // required if rate_source = custom
 *   historical_rate_id,            // required if rate_source = historical
 *   discount_amount, discount_percent,
 *   labour_amount, transport_amount,
 * }
 */
function calculatePrice(params) {
  const calc = runFormula(params.formula_key, params.inputs || {});
  const autoValue = calc.total;
  const finalValue = (params.manual_value !== undefined && params.manual_value !== null && params.manual_value !== '')
    ? Number(params.manual_value)
    : autoValue;

  // ---- Rate resolution (with historical protection) ----
  let rateRow = null;
  let rateAtCalc = null;
  let rateSource = params.rate_source || 'current';

  if (rateSource === 'custom') {
    rateAtCalc = Number(params.custom_rate);
  } else if (rateSource === 'historical') {
    rateRow = db.prepare('SELECT * FROM rates WHERE id = ?').get(params.historical_rate_id);
    if (!rateRow) throw new Error('Historical rate not found');
    rateAtCalc = rateRow.current_rate;
  } else {
    rateRow = getActiveRate({ categoryId: params.category_id, styleId: params.style_id });
    if (!rateRow) throw new Error('No active rate configured for this category/style. Set one in Admin > Pricing, or use a custom rate.');
    rateAtCalc = rateRow.current_rate;
  }

  const priceAtCalc = finalValue * rateAtCalc;

  const discountAmount = Number(params.discount_amount) || 0;
  const discountPercent = Number(params.discount_percent) || 0;
  const discountFromPercent = priceAtCalc * (discountPercent / 100);
  const totalDiscount = discountAmount + discountFromPercent;

  const labourAmount = Number(params.labour_amount) || 0;
  const transportAmount = Number(params.transport_amount) || 0;
  const extraAmount = Number(params.extra_amount) || 0; // e.g. pillar_amount for railing

  const totalPrice = priceAtCalc - totalDiscount + labourAmount + transportAmount + extraAmount;

  // ---- Loss warning (Module 9) ----
  // If a "cost basis" is supplied by the caller, warn when selling below it.
  let lossWarning = null;
  if (params.cost_basis !== undefined && params.cost_basis !== null) {
    const cost = Number(params.cost_basis);
    if (totalPrice < cost) {
      lossWarning = `Warning: Total price (Rs. ${totalPrice.toFixed(2)}) is BELOW cost basis (Rs. ${cost.toFixed(2)}).`;
    }
  }

  return {
    calc_breakdown: calc.breakdown,
    extra_calc: { ...calc, breakdown: undefined, total: undefined }, // e.g. pillar_amount, frame_perimeter_ft
    auto_value: autoValue,
    manual_value: params.manual_value ?? null,
    manual_reason: params.manual_reason || null,
    final_value: finalValue,
    unit: rateRow?.unit || params.unit || 'running_ft',
    rate_id: rateRow?.id || null,
    rate_at_calc: rateAtCalc,
    rate_source: rateSource,
    price_at_calc: priceAtCalc,
    discount_amount: discountAmount,
    discount_percent: discountPercent,
    total_discount: totalDiscount,
    labour_amount: labourAmount,
    transport_amount: transportAmount,
    extra_amount: extraAmount,
    total_price: totalPrice,
    loss_warning: lossWarning,
  };
}

module.exports = { calculatePrice, getActiveRate };
