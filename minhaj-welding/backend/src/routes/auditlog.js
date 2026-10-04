const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', requireAuth, requireRole('super_admin', 'admin', 'manager'), (req, res) => {
  const { entity_type, limit } = req.query;
  let sql = `SELECT a.*, u.name as changed_by_name FROM audit_log a
             LEFT JOIN users u ON u.id = a.changed_by WHERE 1=1`;
  const args = [];
  if (entity_type) { sql += ' AND a.entity_type = ?'; args.push(entity_type); }
  sql += ' ORDER BY a.changed_at DESC LIMIT ?';
  args.push(Number(limit) || 100);
  res.json(db.prepare(sql).all(...args));
});

module.exports = router;
