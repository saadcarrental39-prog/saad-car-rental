const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { requireAuth } = require('../middleware/auth');

// ---- Categories ----
router.get('/categories', (req, res) => {
  res.json(db.prepare('SELECT * FROM expense_categories ORDER BY name').all());
});
router.post('/categories', requireAuth, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const info = db.prepare('INSERT OR IGNORE INTO expense_categories (name) VALUES (?)').run(name);
  res.status(201).json(db.prepare('SELECT * FROM expense_categories WHERE id = ?').get(info.lastInsertRowid || info.changes));
});
router.delete('/categories/:id', requireAuth, (req, res) => {
  db.prepare('UPDATE expense_categories SET is_active = 0 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ---- Expenses ----
router.get('/', (req, res) => {
  const { from, to, category_id } = req.query;
  let sql = `SELECT e.*, ec.name as category_name FROM expenses e
             LEFT JOIN expense_categories ec ON ec.id = e.expense_category_id WHERE 1=1`;
  const args = [];
  if (from) { sql += ' AND date(e.spent_at) >= date(?)'; args.push(from); }
  if (to) { sql += ' AND date(e.spent_at) <= date(?)'; args.push(to); }
  if (category_id) { sql += ' AND e.expense_category_id = ?'; args.push(category_id); }
  sql += ' ORDER BY e.spent_at DESC';
  res.json(db.prepare(sql).all(...args));
});

router.post('/', requireAuth, (req, res) => {
  const { expense_category_id, description, amount, spent_at, receipt_path } = req.body;
  if (!amount) return res.status(400).json({ error: 'amount is required' });
  const info = db.prepare(`
    INSERT INTO expenses (expense_category_id, description, amount, spent_at, receipt_path, created_by)
    VALUES (?, ?, ?, COALESCE(?, datetime('now')), ?, ?)
  `).run(expense_category_id || null, description || null, amount, spent_at || null, receipt_path || null, req.user.id);
  res.status(201).json(db.prepare('SELECT * FROM expenses WHERE id = ?').get(info.lastInsertRowid));
});

router.delete('/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
