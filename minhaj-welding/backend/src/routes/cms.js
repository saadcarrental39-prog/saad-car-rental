/**
 * MINHAJ WELDING - Website CMS (Module 16)
 * Every section (hero, services, projects gallery, testimonials, FAQs,
 * design gallery, footer) is stored as free-hand editable blocks so the
 * owner can add/edit/delete/reorder anything from Admin > Website,
 * with no code changes. GET /public is what the actual public website
 * (built in the frontend) fetches — no auth required, read-only.
 */
const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { requireAuth } = require('../middleware/auth');

const SECTIONS = ['hero', 'service', 'project', 'testimonial', 'faq', 'design', 'footer'];

// ---- PUBLIC: everything the live website needs, in one call ----
router.get('/public', (req, res) => {
  const blocks = db.prepare('SELECT * FROM cms_blocks WHERE is_active = 1 ORDER BY section, sort_order').all();
  const bySection = {};
  blocks.forEach((b) => {
    bySection[b.section] = bySection[b.section] || [];
    bySection[b.section].push({ id: b.id, ...JSON.parse(b.content_json) });
  });
  const settingsRows = db.prepare(`SELECT key, value FROM settings WHERE key LIKE 'cms_%' OR key IN ('business_name','owner_1_phone','owner_2_phone','service_areas','whatsapp_number')`).all();
  const settings = {};
  settingsRows.forEach((r) => { settings[r.key] = r.value; });
  res.json({ sections: bySection, settings });
});

// ---- ADMIN: manage blocks ----
router.get('/blocks', requireAuth, (req, res) => {
  const { section } = req.query;
  let sql = 'SELECT * FROM cms_blocks WHERE 1=1';
  const args = [];
  if (section) { sql += ' AND section = ?'; args.push(section); }
  sql += ' ORDER BY section, sort_order';
  res.json(db.prepare(sql).all(...args).map((b) => ({ ...b, content: JSON.parse(b.content_json) })));
});

router.post('/blocks', requireAuth, (req, res) => {
  const { section, content, sort_order } = req.body;
  if (!section || !SECTIONS.includes(section)) return res.status(400).json({ error: `section must be one of: ${SECTIONS.join(', ')}` });
  const info = db.prepare('INSERT INTO cms_blocks (section, content_json, sort_order) VALUES (?, ?, ?)')
    .run(section, JSON.stringify(content || {}), sort_order || 0);
  res.status(201).json(db.prepare('SELECT * FROM cms_blocks WHERE id = ?').get(info.lastInsertRowid));
});

router.put('/blocks/:id', requireAuth, (req, res) => {
  const { content, sort_order, is_active } = req.body;
  const existing = db.prepare('SELECT * FROM cms_blocks WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const merged = content ? JSON.stringify({ ...JSON.parse(existing.content_json), ...content }) : existing.content_json;
  db.prepare(`UPDATE cms_blocks SET content_json = ?, sort_order = COALESCE(?, sort_order),
              is_active = COALESCE(?, is_active), updated_at = datetime('now') WHERE id = ?`)
    .run(merged, sort_order, is_active, req.params.id);
  res.json(db.prepare('SELECT * FROM cms_blocks WHERE id = ?').get(req.params.id));
});

router.delete('/blocks/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM cms_blocks WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
