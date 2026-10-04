const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { requireAuth } = require('../middleware/auth');

router.get('/', (req, res) => {
  const { category_id } = req.query;
  let sql = 'SELECT * FROM addon_catalog WHERE is_active = 1';
  const args = [];
  if (category_id) { sql += ' AND (category_id = ? OR category_id IS NULL)'; args.push(category_id); }
  sql += ' ORDER BY name';
  res.json(db.prepare(sql).all(...args));
});

router.post('/', requireAuth, (req, res) => {
  const { name, category_id, unit, default_rate } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const info = db.prepare('INSERT INTO addon_catalog (name, category_id, unit, default_rate) VALUES (?, ?, ?, ?)')
    .run(name, category_id || null, unit || 'pc', default_rate || 0);
  res.status(201).json(db.prepare('SELECT * FROM addon_catalog WHERE id = ?').get(info.lastInsertRowid));
});

router.put('/:id', requireAuth, (req, res) => {
  const { name, unit, default_rate, is_active } = req.body;
  db.prepare(`UPDATE addon_catalog SET name = COALESCE(?, name), unit = COALESCE(?, unit),
              default_rate = COALESCE(?, default_rate), is_active = COALESCE(?, is_active) WHERE id = ?`)
    .run(name, unit, default_rate, is_active, req.params.id);
  res.json(db.prepare('SELECT * FROM addon_catalog WHERE id = ?').get(req.params.id));
});

router.delete('/:id', requireAuth, (req, res) => {
  db.prepare('UPDATE addon_catalog SET is_active = 0 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
