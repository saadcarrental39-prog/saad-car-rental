/**
 * MINHAJ WELDING - Leads Routes (Module 15)
 * POST / is intentionally PUBLIC (no auth) — this is what a future public
 * website's contact form would call. Everything else needs login.
 */
const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, (req, res) => {
  const { status } = req.query;
  let sql = 'SELECT * FROM leads WHERE 1=1';
  const args = [];
  if (status) { sql += ' AND status = ?'; args.push(status); }
  sql += ' ORDER BY created_at DESC';
  res.json(db.prepare(sql).all(...args));
});

// PUBLIC — website lead capture form submits here
router.post('/', (req, res) => {
  const { name, phone, email, message, source } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const info = db.prepare(`
    INSERT INTO leads (name, phone, email, message, source) VALUES (?, ?, ?, ?, ?)
  `).run(name, phone || null, email || null, message || null, source || 'website');
  res.status(201).json({ success: true, id: info.lastInsertRowid });
});

router.put('/:id/status', requireAuth, (req, res) => {
  const { status } = req.body; // new/contacted/converted/rejected
  db.prepare('UPDATE leads SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json(db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id));
});

// Convert a lead directly into a Customer record
router.post('/:id/convert', requireAuth, (req, res) => {
  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });

  const txn = db.transaction(() => {
    const info = db.prepare(`
      INSERT INTO customers (name, phone, email, source, notes) VALUES (?, ?, ?, 'website_lead', ?)
    `).run(lead.name, lead.phone || null, lead.email || null, lead.message || null);
    db.prepare(`UPDATE leads SET status = 'converted', converted_customer_id = ? WHERE id = ?`)
      .run(info.lastInsertRowid, req.params.id);
    return info.lastInsertRowid;
  });

  const customerId = txn();
  res.json(db.prepare('SELECT * FROM customers WHERE id = ?').get(customerId));
});

module.exports = router;
