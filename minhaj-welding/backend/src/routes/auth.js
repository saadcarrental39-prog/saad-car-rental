const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/db');

router.post('/login', (req, res) => {
  try {
    const email = String(req.body?.email || '').trim();
    const password = String(req.body?.password || '');
    const user = db.prepare('SELECT * FROM users WHERE lower(email) = lower(?) AND COALESCE(is_active, 1) = 1').get(email);
    let ok = false;
    try { ok = !!user && !!user.password_hash && bcrypt.compareSync(password, user.password_hash); } catch (e) { ok = false; }
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      process.env.JWT_SECRET || 'minhaj-welding-dev-secret-CHANGE-ME',
      { expiresIn: '7d' }
    );
    res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: 'Login server error: ' + e.message });
  }
});

router.post('/change-password', (req, res) => {
  const { user_id, old_password, new_password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(user_id);
  if (!user || !bcrypt.compareSync(old_password || '', user.password_hash)) {
    return res.status(401).json({ error: 'Old password incorrect' });
  }
  const hash = bcrypt.hashSync(new_password, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, user_id);
  res.json({ success: true });
});

module.exports = router;
