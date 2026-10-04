/**
 * MINHAJ WELDING - Media Library (Module 17)
 * Real file uploads land on disk under uploads/media/ and are tracked in
 * media_assets so they can be searched, previewed, and assigned to any
 * entity (a service, a project, a gallery, a machine, a design...).
 *
 * 360° SUPPORT: uploading several images with the same `group_key` and an
 * increasing `frame_index` turns them into a real drag-to-rotate sequence
 * (see components/ThreeSixtyViewer on the frontend) — not a single static
 * image pretending to be 360°.
 */
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../models/db');
const { requireAuth } = require('../middleware/auth');

const MEDIA_DIR = path.join(__dirname, '../../uploads/media');
if (!fs.existsSync(MEDIA_DIR)) fs.mkdirSync(MEDIA_DIR, { recursive: true });

const ALLOWED = {
  'image/jpeg': 'image', 'image/png': 'image', 'image/webp': 'image', 'image/gif': 'image',
  'video/mp4': 'video', 'video/webm': 'video',
  'application/pdf': 'document',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, MEDIA_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safe = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safe);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const ok = !!ALLOWED[file.mimetype];
    cb(ok ? null : new Error('Unsupported file type'), ok);
  },
});

router.get('/', (req, res) => {
  const { search, kind, assigned_type, assigned_id, group_key } = req.query;
  let sql = 'SELECT * FROM media_assets WHERE 1=1';
  const args = [];
  if (search) { sql += ' AND (title LIKE ? OR tags LIKE ? OR filename LIKE ?)'; args.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  if (kind) { sql += ' AND kind = ?'; args.push(kind); }
  if (assigned_type) { sql += ' AND assigned_type = ?'; args.push(assigned_type); }
  if (assigned_id) { sql += ' AND assigned_id = ?'; args.push(assigned_id); }
  if (group_key) { sql += ' AND group_key = ?'; args.push(group_key); }
  sql += ' ORDER BY group_key, frame_index, uploaded_at DESC';
  res.json(db.prepare(sql).all(...args));
});

// Distinct 360 groups, with frame count — for a gallery of "360 sets"
router.get('/groups/360', (req, res) => {
  res.json(db.prepare(`
    SELECT group_key, COUNT(*) as frame_count, MIN(id) as cover_id
    FROM media_assets WHERE group_key IS NOT NULL GROUP BY group_key ORDER BY MAX(uploaded_at) DESC
  `).all());
});

/**
 * Upload one or more files in a single call. Pass group_key in the form
 * body to register them as a 360° frame sequence (frame_index = upload
 * order, starting at the current max for that group so you can add more
 * frames later without clashing).
 */
router.post('/upload', requireAuth, upload.array('files', 60), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ error: 'No files uploaded' });
  const { title, tags, group_key, assigned_type, assigned_id } = req.body;

  let nextFrame = 0;
  if (group_key) {
    const row = db.prepare('SELECT MAX(frame_index) as m FROM media_assets WHERE group_key = ?').get(group_key);
    nextFrame = (row?.m ?? -1) + 1;
  }

  const insert = db.prepare(`
    INSERT INTO media_assets (filename, file_path, mime_type, kind, size_bytes, group_key, frame_index, title, tags, assigned_type, assigned_id, uploaded_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const created = req.files.map((f, idx) => {
    const kind = group_key ? '360_frame' : ALLOWED[f.mimetype];
    const info = insert.run(
      f.originalname, f.filename, f.mimetype, kind, f.size,
      group_key || null, group_key ? nextFrame + idx : null,
      title || f.originalname, tags || null,
      assigned_type || null, assigned_id || null, req.user.id
    );
    return db.prepare('SELECT * FROM media_assets WHERE id = ?').get(info.lastInsertRowid);
  });

  res.status(201).json(created);
});

router.put('/:id', requireAuth, (req, res) => {
  const { title, tags, assigned_type, assigned_id } = req.body;
  db.prepare(`
    UPDATE media_assets SET title = COALESCE(?, title), tags = COALESCE(?, tags),
    assigned_type = COALESCE(?, assigned_type), assigned_id = COALESCE(?, assigned_id) WHERE id = ?
  `).run(title, tags, assigned_type, assigned_id, req.params.id);
  res.json(db.prepare('SELECT * FROM media_assets WHERE id = ?').get(req.params.id));
});

router.delete('/:id', requireAuth, (req, res) => {
  const asset = db.prepare('SELECT * FROM media_assets WHERE id = ?').get(req.params.id);
  if (asset) {
    const filePath = path.join(MEDIA_DIR, asset.file_path);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    db.prepare('DELETE FROM media_assets WHERE id = ?').run(req.params.id);
  }
  res.json({ success: true });
});

module.exports = router;
