/**
 * MINHAJ WELDING - Custom Field Builder
 * Admin defines extra fields per entity type (customer/project/measurement)
 * without any code change. Values are stored separately per entity record.
 */
const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { requireAuth } = require('../middleware/auth');

const ENTITY_TYPES = ['customer', 'project', 'measurement'];
const FIELD_TYPES = ['text', 'number', 'date', 'dropdown', 'image', 'file'];

router.get('/defs', (req, res) => {
  const { entity_type } = req.query;
  let sql = 'SELECT * FROM custom_field_defs WHERE is_active = 1';
  const args = [];
  if (entity_type) { sql += ' AND entity_type = ?'; args.push(entity_type); }
  sql += ' ORDER BY entity_type, sort_order';
  res.json(db.prepare(sql).all(...args).map((d) => ({ ...d, options: d.options_json ? JSON.parse(d.options_json) : null })));
});

router.post('/defs', requireAuth, (req, res) => {
  const { entity_type, field_name, field_type, options, is_required, default_value, sort_order } = req.body;
  if (!entity_type || !ENTITY_TYPES.includes(entity_type)) return res.status(400).json({ error: `entity_type must be one of: ${ENTITY_TYPES.join(', ')}` });
  if (!field_name) return res.status(400).json({ error: 'field_name is required' });
  if (field_type && !FIELD_TYPES.includes(field_type)) return res.status(400).json({ error: `field_type must be one of: ${FIELD_TYPES.join(', ')}` });
  const info = db.prepare(`
    INSERT INTO custom_field_defs (entity_type, field_name, field_type, options_json, is_required, default_value, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(entity_type, field_name, field_type || 'text', options ? JSON.stringify(options) : null, is_required ? 1 : 0, default_value || null, sort_order || 0);
  res.status(201).json(db.prepare('SELECT * FROM custom_field_defs WHERE id = ?').get(info.lastInsertRowid));
});

router.put('/defs/:id', requireAuth, (req, res) => {
  const { field_name, field_type, options, is_required, default_value, sort_order, is_active } = req.body;
  db.prepare(`
    UPDATE custom_field_defs SET field_name = COALESCE(?, field_name), field_type = COALESCE(?, field_type),
    options_json = COALESCE(?, options_json), is_required = COALESCE(?, is_required),
    default_value = COALESCE(?, default_value), sort_order = COALESCE(?, sort_order),
    is_active = COALESCE(?, is_active) WHERE id = ?
  `).run(field_name, field_type, options ? JSON.stringify(options) : null, is_required, default_value, sort_order, is_active, req.params.id);
  res.json(db.prepare('SELECT * FROM custom_field_defs WHERE id = ?').get(req.params.id));
});

router.delete('/defs/:id', requireAuth, (req, res) => {
  db.prepare('UPDATE custom_field_defs SET is_active = 0 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ---- Values for one specific entity record ----
router.get('/values/:entityType/:entityId', (req, res) => {
  const { entityType, entityId } = req.params;
  const defs = db.prepare('SELECT * FROM custom_field_defs WHERE entity_type = ? AND is_active = 1 ORDER BY sort_order').all(entityType);
  const values = db.prepare('SELECT * FROM custom_field_values WHERE entity_type = ? AND entity_id = ?').all(entityType, entityId);
  const valueMap = {};
  values.forEach((v) => { valueMap[v.field_def_id] = v.value; });
  res.json(defs.map((d) => ({ ...d, options: d.options_json ? JSON.parse(d.options_json) : null, value: valueMap[d.id] ?? d.default_value ?? null })));
});

// body = { values: { [field_def_id]: value, ... } }
router.put('/values/:entityType/:entityId', requireAuth, (req, res) => {
  const { entityType, entityId } = req.params;
  const { values } = req.body;
  const upsert = db.prepare(`
    INSERT INTO custom_field_values (field_def_id, entity_type, entity_id, value) VALUES (?, ?, ?, ?)
    ON CONFLICT(field_def_id, entity_type, entity_id) DO UPDATE SET value = excluded.value
  `);
  const txn = db.transaction(() => {
    Object.entries(values || {}).forEach(([defId, value]) => upsert.run(defId, entityType, entityId, value));
  });
  txn();
  res.json({ success: true });
});

module.exports = router;
