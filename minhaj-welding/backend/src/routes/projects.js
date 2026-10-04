/**
 * MINHAJ WELDING - Projects Routes (Module 11)
 * Government + Private contracts. BOQ builder, milestone payments,
 * progress tracking, document uploads (path only — file save handled
 * by a generic upload route in a later phase; for now the frontend can
 * store any accessible file path/URL here).
 */
const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { requireAuth } = require('../middleware/auth');

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT p.*, c.name as customer_name FROM projects p
    LEFT JOIN customers c ON c.id = p.customer_id
    ORDER BY p.created_at DESC
  `).all();
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });
  const boq = db.prepare('SELECT * FROM project_boq_items WHERE project_id = ? ORDER BY sort_order').all(req.params.id);
  const milestones = db.prepare('SELECT * FROM project_milestones WHERE project_id = ? ORDER BY sort_order').all(req.params.id);
  const progress = db.prepare('SELECT * FROM project_progress WHERE project_id = ? ORDER BY logged_at DESC').all(req.params.id);
  const documents = db.prepare('SELECT * FROM project_documents WHERE project_id = ? ORDER BY uploaded_at DESC').all(req.params.id);
  const expenses = db.prepare('SELECT * FROM expenses WHERE project_id = ? ORDER BY spent_at DESC').all(req.params.id);

  const estimatedCost = boq.reduce((s, b) => s + b.estimated_cost, 0);
  const actualCost = boq.reduce((s, b) => s + (b.actual_cost || 0), 0) + expenses.reduce((s, e) => s + e.amount, 0);
  const profit = (project.contract_value || 0) - actualCost;
  const margin = project.contract_value ? (profit / project.contract_value) * 100 : null;

  res.json({ ...project, boq, milestones, progress, documents, expenses, summary: { estimatedCost, actualCost, profit, margin } });
});

router.post('/', requireAuth, (req, res) => {
  const { name, customer_id, project_type, contract_value, start_date, end_date, location, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const info = db.prepare(`
    INSERT INTO projects (name, customer_id, project_type, contract_value, start_date, end_date, location, notes, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, customer_id || null, project_type || 'private', contract_value || null, start_date || null, end_date || null, location || null, notes || null, req.user.id);
  res.status(201).json(db.prepare('SELECT * FROM projects WHERE id = ?').get(info.lastInsertRowid));
});

router.put('/:id', requireAuth, (req, res) => {
  const { name, status, contract_value, start_date, end_date, location, notes } = req.body;
  db.prepare(`
    UPDATE projects SET name = COALESCE(?, name), status = COALESCE(?, status),
    contract_value = COALESCE(?, contract_value), start_date = COALESCE(?, start_date),
    end_date = COALESCE(?, end_date), location = COALESCE(?, location), notes = COALESCE(?, notes),
    updated_at = datetime('now') WHERE id = ?
  `).run(name, status, contract_value, start_date, end_date, location, notes, req.params.id);
  res.json(db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id));
});

router.delete('/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ---- BOQ items ----
router.post('/:id/boq', requireAuth, (req, res) => {
  const { item_type, description, quantity, unit, estimated_rate } = req.body;
  if (!description) return res.status(400).json({ error: 'description is required' });
  const qty = Number(quantity) || 1;
  const rate = Number(estimated_rate) || 0;
  const info = db.prepare(`
    INSERT INTO project_boq_items (project_id, item_type, description, quantity, unit, estimated_rate, estimated_cost)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(req.params.id, item_type || 'material', description, qty, unit || null, rate, qty * rate);
  res.status(201).json(db.prepare('SELECT * FROM project_boq_items WHERE id = ?').get(info.lastInsertRowid));
});

router.put('/boq/:boqId', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM project_boq_items WHERE id = ?').get(req.params.boqId);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const quantity = req.body.quantity ?? existing.quantity;
  const estimated_rate = req.body.estimated_rate ?? existing.estimated_rate;
  db.prepare(`
    UPDATE project_boq_items SET item_type = COALESCE(?, item_type), description = COALESCE(?, description),
    quantity = ?, unit = COALESCE(?, unit), estimated_rate = ?, estimated_cost = ?,
    actual_cost = COALESCE(?, actual_cost) WHERE id = ?
  `).run(req.body.item_type, req.body.description, quantity, req.body.unit, estimated_rate, quantity * estimated_rate, req.body.actual_cost, req.params.boqId);
  res.json(db.prepare('SELECT * FROM project_boq_items WHERE id = ?').get(req.params.boqId));
});

router.delete('/boq/:boqId', requireAuth, (req, res) => {
  db.prepare('DELETE FROM project_boq_items WHERE id = ?').run(req.params.boqId);
  res.json({ success: true });
});

// ---- Milestones ----
router.post('/:id/milestones', requireAuth, (req, res) => {
  const { title, amount, due_date } = req.body;
  if (!title || amount === undefined) return res.status(400).json({ error: 'title and amount are required' });
  const info = db.prepare(`
    INSERT INTO project_milestones (project_id, title, amount, due_date) VALUES (?, ?, ?, ?)
  `).run(req.params.id, title, amount, due_date || null);
  res.status(201).json(db.prepare('SELECT * FROM project_milestones WHERE id = ?').get(info.lastInsertRowid));
});

router.put('/milestones/:milestoneId', requireAuth, (req, res) => {
  const { status } = req.body; // pending/invoiced/paid
  db.prepare(`UPDATE project_milestones SET status = ?, paid_at = CASE WHEN ? = 'paid' THEN datetime('now') ELSE paid_at END WHERE id = ?`)
    .run(status, status, req.params.milestoneId);
  res.json(db.prepare('SELECT * FROM project_milestones WHERE id = ?').get(req.params.milestoneId));
});

// ---- Progress log ----
router.post('/:id/progress', requireAuth, (req, res) => {
  const { percent_complete, note, photo_path } = req.body;
  const info = db.prepare(`
    INSERT INTO project_progress (project_id, percent_complete, note, photo_path, logged_by)
    VALUES (?, ?, ?, ?, ?)
  `).run(req.params.id, percent_complete || 0, note || null, photo_path || null, req.user.id);
  res.status(201).json(db.prepare('SELECT * FROM project_progress WHERE id = ?').get(info.lastInsertRowid));
});

// ---- Documents ----
router.post('/:id/documents', requireAuth, (req, res) => {
  const { title, file_path } = req.body;
  if (!title || !file_path) return res.status(400).json({ error: 'title and file_path are required' });
  const info = db.prepare(`
    INSERT INTO project_documents (project_id, title, file_path, uploaded_by) VALUES (?, ?, ?, ?)
  `).run(req.params.id, title, file_path, req.user.id);
  res.status(201).json(db.prepare('SELECT * FROM project_documents WHERE id = ?').get(info.lastInsertRowid));
});

module.exports = router;
