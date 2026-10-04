const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { requireAuth } = require('../middleware/auth');

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM settings').all();
  const map = {};
  rows.forEach((r) => { map[r.key] = r.value; });
  res.json(map);
});

router.put('/', requireAuth, (req, res) => {
  const updates = req.body; // { key: value, key2: value2, ... }
  const upsert = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
  const txn = db.transaction(() => {
    Object.entries(updates).forEach(([k, v]) => upsert.run(k, String(v)));
  });
  txn();
  const rows = db.prepare('SELECT * FROM settings').all();
  const map = {};
  rows.forEach((r) => { map[r.key] = r.value; });
  res.json(map);
});

module.exports = router;
