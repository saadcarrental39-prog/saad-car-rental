/**
 * MINHAJ WELDING - Icon Replacement Routes (Section 3)
 * Upload SVG/PNG to replace any icon slot. Files are written to
 * frontend/public/icons/<name>.svg|png — the frontend IconImg component
 * checks that location BEFORE the bundled default, so replacement is
 * instant and works offline. "Reset" simply deletes the override.
 * NOTE: assumes frontend/ sits next to backend/ (local PC setup).
 */
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { requireAuth } = require('../middleware/auth');

const ICON_DIR = path.join(__dirname, '../../../frontend/public/icons');
const DEFAULT_DIR = path.join(ICON_DIR, 'default');
if (!fs.existsSync(ICON_DIR)) fs.mkdirSync(ICON_DIR, { recursive: true });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 }, // 1MB
  fileFilter: (req, file, cb) => {
    const ok = ['image/svg+xml', 'image/png'].includes(file.mimetype);
    cb(ok ? null : new Error('Only SVG or PNG allowed'), ok);
  },
});

const safeName = (n) => /^[a-z0-9_-]+$/i.test(n);

// list icon slots (from default folder) and whether overridden
router.get('/', (req, res) => {
  const defaults = fs.existsSync(DEFAULT_DIR) ? fs.readdirSync(DEFAULT_DIR) : [];
  const slots = [...new Set(defaults.map((f) => path.parse(f).name))].map((name) => ({
    name,
    overridden: fs.existsSync(path.join(ICON_DIR, `${name}.svg`)) || fs.existsSync(path.join(ICON_DIR, `${name}.png`)),
  }));
  res.json(slots);
});

router.post('/:name', requireAuth, upload.single('file'), (req, res) => {
  const { name } = req.params;
  if (!safeName(name)) return res.status(400).json({ error: 'Invalid icon name' });
  if (!req.file) return res.status(400).json({ error: 'file is required' });
  const ext = req.file.mimetype === 'image/svg+xml' ? 'svg' : 'png';
  ['svg', 'png'].forEach((e) => { const p = path.join(ICON_DIR, `${name}.${e}`); if (fs.existsSync(p)) fs.unlinkSync(p); });
  fs.writeFileSync(path.join(ICON_DIR, `${name}.${ext}`), req.file.buffer);
  res.json({ success: true, name, ext });
});

router.delete('/:name', requireAuth, (req, res) => {
  const { name } = req.params;
  if (!safeName(name)) return res.status(400).json({ error: 'Invalid icon name' });
  ['svg', 'png'].forEach((e) => { const p = path.join(ICON_DIR, `${name}.${e}`); if (fs.existsSync(p)) fs.unlinkSync(p); });
  res.json({ success: true, note: 'Reset to default' });
});

module.exports = router;
