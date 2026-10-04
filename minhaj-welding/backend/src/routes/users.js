const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../models/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const ROLES = ['super_admin', 'admin', 'manager', 'estimator', 'project_manager', 'site_supervisor', 'accounts', 'inventory', 'viewer'];

router.get('/roles', (req, res) => res.json(ROLES));

router.get('/', requireAuth, requireRole('super_admin', 'admin'), (req, res) => {
  const rows = db.prepare('SELECT id, name, phone, email, role, is_active, created_at FROM users ORDER BY created_at').all();
  res.json(rows);
});

router.post('/', requireAuth, requireRole('super_admin'), (req, res) => {
  const { name, phone, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'name, email, password are required' });
  if (role && !ROLES.includes(role)) return res.status(400).json({ error: `role must be one of: ${ROLES.join(', ')}` });
  const hash = bcrypt.hashSync(password, 10);
  try {
    const info = db.prepare(`INSERT INTO users (name, phone, email, password_hash, role) VALUES (?, ?, ?, ?, ?)`)
      .run(name, phone || null, email, hash, role || 'viewer');
    res.status(201).json(db.prepare('SELECT id, name, phone, email, role FROM users WHERE id = ?').get(info.lastInsertRowid));
  } catch (e) {
    res.status(400).json({ error: 'Email already exists' });
  }
});

router.put('/:id', requireAuth, requireRole('super_admin'), (req, res) => {
  const { name, phone, role, is_active } = req.body;
  if (role && !ROLES.includes(role)) return res.status(400).json({ error: `role must be one of: ${ROLES.join(', ')}` });
  db.prepare(`UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone),
              role = COALESCE(?, role), is_active = COALESCE(?, is_active), updated_at = datetime('now') WHERE id = ?`)
    .run(name, phone, role, is_active, req.params.id);
  res.json(db.prepare('SELECT id, name, phone, email, role, is_active FROM users WHERE id = ?').get(req.params.id));
});

router.delete('/:id', requireAuth, requireRole('super_admin'), (req, res) => {
  db.prepare('UPDATE users SET is_active = 0 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
