/**
 * MINHAJ WELDING - Catalog Routes
 * Categories / Styles / Materials — all free-hand editable (add/edit/delete).
 */
const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { listFormulaKeys } = require('../calculations');
const { requireAuth } = require('../middleware/auth');

// ---------------------------------------------------------------------
// CATEGORIES
// ---------------------------------------------------------------------
router.get('/categories', (req, res) => {
  const rows = db.prepare('SELECT * FROM categories ORDER BY sort_order, name').all();
  res.json(rows);
});

router.post('/categories', requireAuth, (req, res) => {
  const { name, unit_type, sort_order } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const info = db.prepare('INSERT INTO categories (name, unit_type, sort_order) VALUES (?, ?, ?)')
    .run(name, unit_type || 'running_ft', sort_order || 0);
  res.status(201).json(db.prepare('SELECT * FROM categories WHERE id = ?').get(info.lastInsertRowid));
});

router.put('/categories/:id', requireAuth, (req, res) => {
  const { name, unit_type, is_active, sort_order } = req.body;
  db.prepare(`UPDATE categories SET name = COALESCE(?, name), unit_type = COALESCE(?, unit_type),
              is_active = COALESCE(?, is_active), sort_order = COALESCE(?, sort_order) WHERE id = ?`)
    .run(name, unit_type, is_active, sort_order, req.params.id);
  res.json(db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id));
});

router.delete('/categories/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ---------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------
router.get('/styles', (req, res) => {
  const { category_id } = req.query;
  let sql = 'SELECT * FROM styles WHERE 1=1';
  const args = [];
  if (category_id) { sql += ' AND category_id = ?'; args.push(category_id); }
  sql += ' ORDER BY name';
  res.json(db.prepare(sql).all(...args));
});

router.get('/styles/formula-keys', (req, res) => {
  // lists available calculation formulas that can be attached to a style
  res.json(listFormulaKeys());
});

router.post('/styles', requireAuth, (req, res) => {
  const { category_id, name, code, formula_key, config_json } = req.body;
  if (!category_id || !name || !formula_key) {
    return res.status(400).json({ error: 'category_id, name, formula_key are required' });
  }
  const info = db.prepare(`
    INSERT INTO styles (category_id, name, code, formula_key, config_json)
    VALUES (?, ?, ?, ?, ?)
  `).run(category_id, name, code || null, formula_key, JSON.stringify(config_json || {}));
  res.status(201).json(db.prepare('SELECT * FROM styles WHERE id = ?').get(info.lastInsertRowid));
});

router.put('/styles/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM styles WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Style not found' });
  const { name, code, formula_key, config_json, is_active, bump_version } = req.body;

  // Bumping formula_version is how the system tracks a meaningful formula
  // change (Module: Formula Versions) without breaking old measurements
  // that already stored the previous formula_version.
  const newVersion = bump_version ? existing.formula_version + 1 : existing.formula_version;

  db.prepare(`
    UPDATE styles SET name = COALESCE(?, name), code = COALESCE(?, code),
    formula_key = COALESCE(?, formula_key),
    config_json = COALESCE(?, config_json),
    is_active = COALESCE(?, is_active),
    formula_version = ?,
    updated_at = datetime('now')
    WHERE id = ?
  `).run(name, code, formula_key, config_json ? JSON.stringify(config_json) : null, is_active, newVersion, req.params.id);

  res.json(db.prepare('SELECT * FROM styles WHERE id = ?').get(req.params.id));
});

router.delete('/styles/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM styles WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

router.post('/styles/:id/duplicate', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM styles WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Style not found' });
  const info = db.prepare(`
    INSERT INTO styles (category_id, name, code, formula_key, formula_version, config_json)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(existing.category_id, existing.name + ' (Copy)', null, existing.formula_key, existing.formula_version, existing.config_json);
  res.status(201).json(db.prepare('SELECT * FROM styles WHERE id = ?').get(info.lastInsertRowid));
});

// ---------------------------------------------------------------------
// MATERIALS
// ---------------------------------------------------------------------
router.get('/materials', (req, res) => {
  const { category_id } = req.query;
  let sql = 'SELECT * FROM materials WHERE 1=1';
  const args = [];
  if (category_id) { sql += ' AND category_id = ?'; args.push(category_id); }
  res.json(db.prepare(sql).all(...args));
});

router.post('/materials', requireAuth, (req, res) => {
  const { category_id, name, unit } = req.body;
  const info = db.prepare('INSERT INTO materials (category_id, name, unit) VALUES (?, ?, ?)')
    .run(category_id || null, name, unit || null);
  res.status(201).json(db.prepare('SELECT * FROM materials WHERE id = ?').get(info.lastInsertRowid));
});

router.put('/materials/:id', requireAuth, (req, res) => {
  const { name, unit, is_active } = req.body;
  db.prepare('UPDATE materials SET name = COALESCE(?, name), unit = COALESCE(?, unit), is_active = COALESCE(?, is_active) WHERE id = ?')
    .run(name, unit, is_active, req.params.id);
  res.json(db.prepare('SELECT * FROM materials WHERE id = ?').get(req.params.id));
});

router.delete('/materials/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM materials WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
