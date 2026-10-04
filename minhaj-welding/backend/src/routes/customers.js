const express = require('express');
const router = express.Router();
const db = require('../models/db');

router.get('/', (req, res) => {
  const { search } = req.query;
  let sql = 'SELECT * FROM customers WHERE 1=1';
  const args = [];
  if (search) {
    sql += ' AND (name LIKE ? OR phone LIKE ? OR area LIKE ?)';
    args.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  sql += ' ORDER BY created_at DESC';
  res.json(db.prepare(sql).all(...args));
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

router.post('/', (req, res) => {
  const { name, phone, whatsapp, email, address, area, source, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const info = db.prepare(`
    INSERT INTO customers (name, phone, whatsapp, email, address, area, source, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, phone || null, whatsapp || null, email || null, address || null, area || null, source || 'manual', notes || null);
  res.status(201).json(db.prepare('SELECT * FROM customers WHERE id = ?').get(info.lastInsertRowid));
});

router.put('/:id', (req, res) => {
  const { name, phone, whatsapp, email, address, area, notes } = req.body;
  db.prepare(`
    UPDATE customers SET name = COALESCE(?, name), phone = COALESCE(?, phone),
    whatsapp = COALESCE(?, whatsapp), email = COALESCE(?, email), address = COALESCE(?, address),
    area = COALESCE(?, area), notes = COALESCE(?, notes) WHERE id = ?
  `).run(name, phone, whatsapp, email, address, area, notes, req.params.id);
  res.json(db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM customers WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
