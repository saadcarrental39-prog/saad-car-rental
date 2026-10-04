const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { requireAuth } = require('../middleware/auth');

function generateInvoiceNo() {
  const year = new Date().getFullYear();
  const count = db.prepare(`SELECT COUNT(*) as c FROM invoices WHERE invoice_no LIKE ?`).get(`MW-INV-${year}-%`).c;
  return `MW-INV-${year}-${String(count + 1).padStart(4, '0')}`;
}

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT i.*, c.name as customer_name FROM invoices i
    LEFT JOIN customers c ON c.id = i.customer_id ORDER BY i.created_at DESC
  `).all();
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(req.params.id);
  if (!invoice) return res.status(404).json({ error: 'Not found' });
  const payments = db.prepare('SELECT * FROM payments WHERE invoice_id = ? ORDER BY paid_at').all(req.params.id);
  res.json({ ...invoice, payments });
});

// Create invoice from an approved quotation (locks the price snapshot)
router.post('/from-quotation/:quotationId', requireAuth, (req, res) => {
  const quotation = db.prepare('SELECT * FROM quotations WHERE id = ?').get(req.params.quotationId);
  if (!quotation) return res.status(404).json({ error: 'Quotation not found' });

  const invoiceNo = generateInvoiceNo();
  const info = db.prepare(`
    INSERT INTO invoices (invoice_no, quotation_id, customer_id, total_amount, paid_amount, balance_amount)
    VALUES (?, ?, ?, ?, 0, ?)
  `).run(invoiceNo, quotation.id, quotation.customer_id, quotation.total_amount, quotation.total_amount);

  res.status(201).json(db.prepare('SELECT * FROM invoices WHERE id = ?').get(info.lastInsertRowid));
});

router.post('/:id/payments', requireAuth, (req, res) => {
  const { amount, mode, note } = req.body;
  const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(req.params.id);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
  const userId = req.user.id;

  const txn = db.transaction(() => {
    db.prepare('INSERT INTO payments (invoice_id, amount, mode, note, created_by) VALUES (?, ?, ?, ?, ?)')
      .run(req.params.id, amount, mode || 'cash', note || null, userId);

    const newPaid = invoice.paid_amount + Number(amount);
    const newBalance = invoice.total_amount - newPaid;
    const status = newBalance <= 0 ? 'paid' : (newPaid > 0 ? 'partial' : 'unpaid');

    db.prepare(`UPDATE invoices SET paid_amount = ?, balance_amount = ?, status = ?, updated_at = datetime('now') WHERE id = ?`)
      .run(newPaid, newBalance, status, req.params.id);
  });
  txn();

  res.json(db.prepare('SELECT * FROM invoices WHERE id = ?').get(req.params.id));
});

module.exports = router;
