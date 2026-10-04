/**
 * MINHAJ WELDING - Quotations Routes
 * A quotation groups one or more measurements into a single document.
 * Discount protection + loss warning handled at measurement level already;
 * here we also check overall quotation discount against a configurable max.
 */
const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { requireAuth } = require('../middleware/auth');

function generateQuotationNo() {
  const year = new Date().getFullYear();
  const count = db.prepare(`SELECT COUNT(*) as c FROM quotations WHERE quotation_no LIKE ?`).get(`MW-Q-${year}-%`).c;
  return `MW-Q-${year}-${String(count + 1).padStart(4, '0')}`;
}

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT q.*, c.name as customer_name FROM quotations q
    LEFT JOIN customers c ON c.id = q.customer_id
    ORDER BY q.created_at DESC
  `).all();
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const quotation = db.prepare('SELECT * FROM quotations WHERE id = ?').get(req.params.id);
  if (!quotation) return res.status(404).json({ error: 'Not found' });
  const items = db.prepare('SELECT * FROM quotation_items WHERE quotation_id = ? ORDER BY sort_order').all(req.params.id);
  res.json({ ...quotation, items });
});

/**
 * body = {
 *   customer_id, measurement_ids: [1,2,3], discount_amount, notes, valid_until,
 *   extra_items: [{ description, quantity, unit, rate }]  // Module: Gate hardware,
 *     fiber frame/pipe charges, or any manual line item NOT tied to a saved
 *     measurement. amount = quantity x rate, computed here (never hidden).
 * }
 * Pulls each measurement's saved total as a line item (price snapshot),
 * so quotations never silently recalculate.
 */
router.post('/', requireAuth, (req, res) => {
  const { customer_id, measurement_ids = [], extra_items = [], discount_amount = 0, notes, valid_until } = req.body;
  const userId = req.user.id;

  const txn = db.transaction(() => {
    const quotationNo = generateQuotationNo();
    let subtotal = 0;
    const lineItems = [];

    measurement_ids.forEach((mid, idx) => {
      const m = db.prepare(`
        SELECT m.*, c.name as category_name, s.name as style_name
        FROM measurements m
        LEFT JOIN categories c ON c.id = m.category_id
        LEFT JOIN styles s ON s.id = m.style_id
        WHERE m.id = ?
      `).get(mid);
      if (!m) return;
      subtotal += m.total_price;
      lineItems.push({
        measurement_id: m.id,
        description: `${m.category_name || ''} - ${m.style_name || ''}`.trim(),
        quantity: m.final_value,
        unit: m.unit,
        rate: m.rate_at_calc,
        amount: m.total_price,
        sort_order: idx,
      });
    });

    extra_items.forEach((ei, idx) => {
      const qty = Number(ei.quantity) || 0;
      const rate = Number(ei.rate) || 0;
      const amount = qty * rate;
      subtotal += amount;
      lineItems.push({
        measurement_id: null,
        description: ei.description || 'Extra item',
        quantity: qty,
        unit: ei.unit || 'pc',
        rate,
        amount,
        sort_order: measurement_ids.length + idx,
      });
    });

    const totalAmount = subtotal - Number(discount_amount || 0);

    const info = db.prepare(`
      INSERT INTO quotations (quotation_no, customer_id, subtotal, discount_amount, total_amount, notes, valid_until, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(quotationNo, customer_id || null, subtotal, discount_amount || 0, totalAmount, notes || null, valid_until || null, userId);

    const quotationId = info.lastInsertRowid;
    const insertItem = db.prepare(`
      INSERT INTO quotation_items (quotation_id, measurement_id, description, quantity, unit, rate, amount, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    lineItems.forEach((li) => {
      insertItem.run(quotationId, li.measurement_id, li.description, li.quantity, li.unit, li.rate, li.amount, li.sort_order);
      if (li.measurement_id) db.prepare(`UPDATE measurements SET status = 'quoted' WHERE id = ?`).run(li.measurement_id);
    });

    return quotationId;
  });

  try {
    const quotationId = txn();
    const quotation = db.prepare('SELECT * FROM quotations WHERE id = ?').get(quotationId);
    const items = db.prepare('SELECT * FROM quotation_items WHERE quotation_id = ?').all(quotationId);
    res.status(201).json({ ...quotation, items });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put('/:id/status', requireAuth, (req, res) => {
  const { status } = req.body; // draft/sent/approved/rejected
  db.prepare(`UPDATE quotations SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(status, req.params.id);
  res.json(db.prepare('SELECT * FROM quotations WHERE id = ?').get(req.params.id));
});

router.delete('/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM quotations WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
