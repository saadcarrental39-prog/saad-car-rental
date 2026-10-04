const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { requireAuth } = require('../middleware/auth');

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM inventory_items WHERE is_active = 1 ORDER BY name').all();
  res.json(rows.map((r) => ({ ...r, low_stock: r.quantity <= r.min_stock })));
});

router.post('/', requireAuth, (req, res) => {
  const { name, unit, quantity, cost_price, selling_price, supplier, min_stock } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const info = db.prepare(`
    INSERT INTO inventory_items (name, unit, quantity, cost_price, selling_price, supplier, min_stock)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(name, unit || 'pc', quantity || 0, cost_price || 0, selling_price || 0, supplier || null, min_stock || 0);
  res.status(201).json(db.prepare('SELECT * FROM inventory_items WHERE id = ?').get(info.lastInsertRowid));
});

router.put('/:id', requireAuth, (req, res) => {
  const { name, unit, cost_price, selling_price, supplier, min_stock, is_active } = req.body;
  db.prepare(`
    UPDATE inventory_items SET name = COALESCE(?, name), unit = COALESCE(?, unit),
    cost_price = COALESCE(?, cost_price), selling_price = COALESCE(?, selling_price),
    supplier = COALESCE(?, supplier), min_stock = COALESCE(?, min_stock),
    is_active = COALESCE(?, is_active), updated_at = datetime('now') WHERE id = ?
  `).run(name, unit, cost_price, selling_price, supplier, min_stock, is_active, req.params.id);
  res.json(db.prepare('SELECT * FROM inventory_items WHERE id = ?').get(req.params.id));
});

router.delete('/:id', requireAuth, (req, res) => {
  db.prepare('UPDATE inventory_items SET is_active = 0 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

/**
 * Stock movement — positive change_qty = stock in (purchase), negative =
 * stock out (used on a project / sold). Always updates the running
 * quantity on inventory_items in the same transaction (never out of sync).
 */
router.post('/:id/movements', requireAuth, (req, res) => {
  const { change_qty, reason, project_id } = req.body;
  if (change_qty === undefined) return res.status(400).json({ error: 'change_qty is required' });
  const item = db.prepare('SELECT * FROM inventory_items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  const txn = db.transaction(() => {
    db.prepare(`
      INSERT INTO inventory_movements (item_id, change_qty, reason, project_id, created_by)
      VALUES (?, ?, ?, ?, ?)
    `).run(req.params.id, change_qty, reason || null, project_id || null, req.user.id);
    db.prepare(`UPDATE inventory_items SET quantity = quantity + ?, updated_at = datetime('now') WHERE id = ?`)
      .run(change_qty, req.params.id);
  });
  txn();

  res.json(db.prepare('SELECT * FROM inventory_items WHERE id = ?').get(req.params.id));
});

router.get('/:id/movements', (req, res) => {
  res.json(db.prepare('SELECT * FROM inventory_movements WHERE item_id = ? ORDER BY created_at DESC').all(req.params.id));
});

module.exports = router;
