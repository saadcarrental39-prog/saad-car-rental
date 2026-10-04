/**
 * MINHAJ WELDING - Communication Routes (Module 22)
 * Every quotation/invoice gets: Call, WhatsApp, Email, PDF.
 */
const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { generatePdf } = require('../services/pdf');
const { buildWhatsAppLink } = require('../services/whatsapp');
const { sendEmail } = require('../services/email');

function getSettingsMap() {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const map = {};
  rows.forEach((r) => { map[r.key] = r.value; });
  return map;
}

// ---- PDF: Quotation ----
router.post('/quotation/:id/pdf', async (req, res) => {
  const quotation = db.prepare('SELECT * FROM quotations WHERE id = ?').get(req.params.id);
  if (!quotation) return res.status(404).json({ error: 'Quotation not found' });
  const items = db.prepare('SELECT * FROM quotation_items WHERE quotation_id = ? ORDER BY sort_order').all(req.params.id);
  const customer = quotation.customer_id ? db.prepare('SELECT * FROM customers WHERE id = ?').get(quotation.customer_id) : {};
  const settings = getSettingsMap();

  try {
    const filename = `quotation-${quotation.quotation_no}.pdf`;
    const filePath = await generatePdf('quotation', {
      ...settings,
      quotation_no: quotation.quotation_no,
      date: quotation.created_at,
      valid_until: quotation.valid_until || 'N/A',
      customer_name: customer?.name || 'Walk-in Customer',
      customer_phone: customer?.phone || '',
      customer_address: customer?.address || '',
      items,
      subtotal: quotation.subtotal.toFixed(2),
      discount_amount: quotation.discount_amount.toFixed(2),
      total_amount: quotation.total_amount.toFixed(2),
      notes: quotation.notes || '',
    }, filename);

    db.prepare('UPDATE quotations SET pdf_path = ? WHERE id = ?').run(filePath, quotation.id);
    res.json({ pdf_path: filePath, filename });
  } catch (e) {
    res.status(500).json({ error: `PDF generation failed: ${e.message}` });
  }
});

// ---- WhatsApp link builder (quotation/invoice/reminder) ----
router.post('/whatsapp-link', (req, res) => {
  const { phone, template_key, vars } = req.body;
  if (!phone || !template_key) return res.status(400).json({ error: 'phone and template_key are required' });
  const link = buildWhatsAppLink({ phone, templateKey: template_key, vars: vars || {} });
  res.json({ link });
});

// ---- Email send (quotation/invoice with PDF attachment) ----
router.post('/email', async (req, res) => {
  const { to, subject, text, pdf_path } = req.body;
  if (!to || !subject) return res.status(400).json({ error: 'to and subject are required' });
  try {
    const attachments = pdf_path ? [{ filename: pdf_path.split('/').pop(), path: pdf_path }] : [];
    await sendEmail({ to, subject, text, attachments });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
