/**
 * MINHAJ WELDING - Email Service
 * Uses Nodemailer with Gmail SMTP (free — needs a Gmail "App Password",
 * not the normal Gmail password; see docs/SETUP.md for how to generate one).
 * SMTP credentials are read from settings (Admin > Communication) so they
 * are editable without touching code or .env in production use.
 */
const nodemailer = require('nodemailer');
const db = require('../models/db');

function getSettingsMap() {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const map = {};
  rows.forEach((r) => { map[r.key] = r.value; });
  return map;
}

function getTransporter() {
  const s = getSettingsMap();
  return nodemailer.createTransport({
    host: s.email_smtp_host || 'smtp.gmail.com',
    port: Number(s.email_smtp_port) || 587,
    secure: false,
    auth: {
      user: s.email_smtp_user,
      pass: s.email_smtp_pass,
    },
  });
}

/**
 * send({ to, subject, text, html, attachments })
 * attachments: [{ filename, path }]
 */
async function sendEmail({ to, subject, text, html, attachments }) {
  const s = getSettingsMap();
  if (!s.email_smtp_user || !s.email_smtp_pass) {
    throw new Error('Email SMTP not configured yet. Go to Admin > Settings > Communication and add Gmail address + App Password.');
  }
  const transporter = getTransporter();
  return transporter.sendMail({
    from: `"${s.business_name || 'MINHAJ WELDING'}" <${s.email_smtp_user}>`,
    to,
    subject,
    text,
    html,
    attachments,
  });
}

module.exports = { sendEmail };
