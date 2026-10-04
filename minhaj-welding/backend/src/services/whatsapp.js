/**
 * MINHAJ WELDING - WhatsApp Service
 *
 * Phase 1 approach: wa.me deep links (Module 22). This needs ZERO setup,
 * works instantly on click (desktop opens WhatsApp Web, mobile opens the
 * app), and never breaks due to WhatsApp API changes.
 *
 * A future phase CAN add whatsapp-web.js / Baileys for fully-automated
 * sending (no click needed) — that requires a persistent QR-scanned
 * session on the owner's PC. Left as an upgrade path; see docs/API_DOCS.md.
 */
const db = require('../models/db');

function getSetting(key, fallback = '') {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? row.value : fallback;
}

/**
 * Fill a template string with {variable} placeholders.
 * template: "Hi {customer_name}, your quotation total is Rs. {amount}"
 */
function fillTemplate(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, key) => (vars[key] !== undefined ? vars[key] : `{${key}}`));
}

const DEFAULT_TEMPLATES = {
  quotation: 'Assalam-o-Alaikum {customer_name}, aap ki quotation #{quotation_no} taiyar hai. Total: Rs. {amount}. PDF: {pdf_link}\n\n- MINHAJ WELDING',
  invoice: 'Assalam-o-Alaikum {customer_name}, invoice #{invoice_no}. Total: Rs. {amount}, Balance: Rs. {balance}. PDF: {pdf_link}\n\n- MINHAJ WELDING',
  reminder: 'Assalam-o-Alaikum {customer_name}, reminder: aap ka balance Rs. {balance} outstanding hai. Shukriya.\n\n- MINHAJ WELDING',
};

/**
 * Build a wa.me link. phone must be in international format without '+'
 * (e.g. "923001234567"). templateKey looks up settings first (so admin
 * can edit message text without touching code), falling back to defaults.
 */
function buildWhatsAppLink({ phone, templateKey, vars = {} }) {
  const customTemplate = getSetting(`whatsapp_template_${templateKey}`);
  const template = customTemplate || DEFAULT_TEMPLATES[templateKey] || '';
  const message = fillTemplate(template, vars);
  const cleanPhone = String(phone || '').replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

module.exports = { buildWhatsAppLink, fillTemplate, DEFAULT_TEMPLATES };
