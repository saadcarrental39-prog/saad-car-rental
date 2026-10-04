/**
 * MINHAJ WELDING - Measurements Routes
 * POST /calculate  -> preview only, does NOT touch the database
 * POST /            -> saves the measurement (with rate + formula snapshot)
 */
const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { calculatePrice } = require('../services/pricing');
const { requireAuth } = require('../middleware/auth');

// ---- PREVIEW (no save) ----
router.post('/calculate', (req, res) => {
  try {
    const result = calculatePrice(req.body);
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ---- SAVE ----
router.post('/', requireAuth, (req, res) => {
  const body = req.body;
  try {
    const result = calculatePrice(body);
    const userId = req.user.id;

    const info = db.prepare(`
      INSERT INTO measurements (
        customer_id, category_id, style_id, material_id, formula_key, formula_version,
        input_json, calc_json, auto_value, manual_value, manual_reason, final_value,
        unit, rate_id, rate_at_calc, rate_source, price_at_calc,
        discount_amount, discount_percent, labour_amount, transport_amount, total_price,
        status, created_by
      ) VALUES (
        @customer_id, @category_id, @style_id, @material_id, @formula_key, @formula_version,
        @input_json, @calc_json, @auto_value, @manual_value, @manual_reason, @final_value,
        @unit, @rate_id, @rate_at_calc, @rate_source, @price_at_calc,
        @discount_amount, @discount_percent, @labour_amount, @transport_amount, @total_price,
        @status, @created_by
      )
    `).run({
      customer_id: body.customer_id || null,
      category_id: body.category_id,
      style_id: body.style_id || null,
      material_id: body.material_id || null,
      formula_key: body.formula_key,
      formula_version: body.formula_version || 1,
      input_json: JSON.stringify(body.inputs || {}),
      calc_json: JSON.stringify(result.calc_breakdown),
      auto_value: result.auto_value,
      manual_value: result.manual_value,
      manual_reason: result.manual_reason,
      final_value: result.final_value,
      unit: result.unit,
      rate_id: result.rate_id,
      rate_at_calc: result.rate_at_calc,
      rate_source: result.rate_source,
      price_at_calc: result.price_at_calc,
      discount_amount: result.discount_amount,
      discount_percent: result.discount_percent,
      labour_amount: result.labour_amount,
      transport_amount: result.transport_amount,
      total_price: result.total_price,
      status: body.status || 'saved',
      created_by: userId,
    });

    const saved = db.prepare('SELECT * FROM measurements WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({ ...saved, loss_warning: result.loss_warning });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get('/', (req, res) => {
  const { customer_id, category_id, status } = req.query;
  let sql = `SELECT m.*, c.name as category_name, s.name as style_name, cu.name as customer_name
             FROM measurements m
             LEFT JOIN categories c ON c.id = m.category_id
             LEFT JOIN styles s ON s.id = m.style_id
             LEFT JOIN customers cu ON cu.id = m.customer_id
             WHERE 1=1`;
  const args = [];
  if (customer_id) { sql += ' AND m.customer_id = ?'; args.push(customer_id); }
  if (category_id) { sql += ' AND m.category_id = ?'; args.push(category_id); }
  if (status) { sql += ' AND m.status = ?'; args.push(status); }
  sql += ' ORDER BY m.created_at DESC';
  res.json(db.prepare(sql).all(...args));
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM measurements WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

router.delete('/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM measurements WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

router.post('/:id/duplicate', (req, res) => {
  const existing = db.prepare('SELECT * FROM measurements WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const info = db.prepare(`
    INSERT INTO measurements (customer_id, category_id, style_id, material_id, formula_key, formula_version,
      input_json, calc_json, auto_value, manual_value, manual_reason, final_value, unit, rate_id,
      rate_at_calc, rate_source, price_at_calc, discount_amount, discount_percent, labour_amount,
      transport_amount, total_price, status, created_by)
    SELECT customer_id, category_id, style_id, material_id, formula_key, formula_version,
      input_json, calc_json, auto_value, manual_value, manual_reason, final_value, unit, rate_id,
      rate_at_calc, rate_source, price_at_calc, discount_amount, discount_percent, labour_amount,
      transport_amount, total_price, 'draft', created_by
    FROM measurements WHERE id = ?
  `).run(req.params.id);
  res.status(201).json(db.prepare('SELECT * FROM measurements WHERE id = ?').get(info.lastInsertRowid));
});

module.exports = router;
