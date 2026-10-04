const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { requireAuth } = require('../middleware/auth');

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM machinery WHERE is_active = 1 ORDER BY name').all());
});

router.post('/', requireAuth, (req, res) => {
  const { name, hourly_rate, daily_rate, weekly_rate, monthly_rate, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const info = db.prepare(`
    INSERT INTO machinery (name, hourly_rate, daily_rate, weekly_rate, monthly_rate, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(name, hourly_rate || null, daily_rate || null, weekly_rate || null, monthly_rate || null, notes || null);
  res.status(201).json(db.prepare('SELECT * FROM machinery WHERE id = ?').get(info.lastInsertRowid));
});

router.put('/:id', requireAuth, (req, res) => {
  const { name, status, hourly_rate, daily_rate, weekly_rate, monthly_rate, notes } = req.body;
  db.prepare(`
    UPDATE machinery SET name = COALESCE(?, name), status = COALESCE(?, status),
    hourly_rate = COALESCE(?, hourly_rate), daily_rate = COALESCE(?, daily_rate),
    weekly_rate = COALESCE(?, weekly_rate), monthly_rate = COALESCE(?, monthly_rate),
    notes = COALESCE(?, notes) WHERE id = ?
  `).run(name, status, hourly_rate, daily_rate, weekly_rate, monthly_rate, notes, req.params.id);
  res.json(db.prepare('SELECT * FROM machinery WHERE id = ?').get(req.params.id));
});

router.delete('/:id', requireAuth, (req, res) => {
  db.prepare('UPDATE machinery SET is_active = 0 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ---- Bookings ----
router.get('/:id/bookings', (req, res) => {
  res.json(db.prepare(`
    SELECT b.*, c.name as customer_name FROM machinery_bookings b
    LEFT JOIN customers c ON c.id = b.customer_id
    WHERE b.machinery_id = ? ORDER BY b.start_at DESC
  `).all(req.params.id));
});

router.get('/bookings/all', (req, res) => {
  res.json(db.prepare(`
    SELECT b.*, m.name as machinery_name, c.name as customer_name FROM machinery_bookings b
    LEFT JOIN machinery m ON m.id = b.machinery_id
    LEFT JOIN customers c ON c.id = b.customer_id
    ORDER BY b.start_at DESC
  `).all());
});

/**
 * Create booking with DOUBLE-BOOKING PREVENTION: rejects if the machine
 * already has an overlapping reserved/active booking in that time range.
 */
router.post('/:id/bookings', requireAuth, (req, res) => {
  const { customer_id, start_at, end_at, rate_type, rate_amount, notes } = req.body;
  if (!start_at || !end_at || !rate_amount) {
    return res.status(400).json({ error: 'start_at, end_at, rate_amount are required' });
  }

  const overlap = db.prepare(`
    SELECT id FROM machinery_bookings
    WHERE machinery_id = ? AND status IN ('reserved', 'active')
      AND NOT (end_at <= ? OR start_at >= ?)
  `).get(req.params.id, start_at, end_at);
  if (overlap) {
    return res.status(409).json({ error: `This machine is already booked (booking #${overlap.id}) during part of that time range.` });
  }

  // simple total = rate_amount as given (owner enters correct duration*rate); kept transparent, no hidden math
  const totalAmount = Number(rate_amount);

  const info = db.prepare(`
    INSERT INTO machinery_bookings (machinery_id, customer_id, start_at, end_at, rate_type, rate_amount, total_amount, notes, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(req.params.id, customer_id || null, start_at, end_at, rate_type || 'daily', rate_amount, totalAmount, notes || null, req.user.id);

  db.prepare(`UPDATE machinery SET status = 'reserved' WHERE id = ?`).run(req.params.id);

  res.status(201).json(db.prepare('SELECT * FROM machinery_bookings WHERE id = ?').get(info.lastInsertRowid));
});

router.put('/bookings/:bookingId/status', requireAuth, (req, res) => {
  const { status } = req.body; // reserved/active/completed/cancelled
  db.prepare('UPDATE machinery_bookings SET status = ? WHERE id = ?').run(status, req.params.bookingId);
  const booking = db.prepare('SELECT * FROM machinery_bookings WHERE id = ?').get(req.params.bookingId);
  if (booking && (status === 'completed' || status === 'cancelled')) {
    db.prepare(`UPDATE machinery SET status = 'available' WHERE id = ?`).run(booking.machinery_id);
  } else if (booking && status === 'active') {
    db.prepare(`UPDATE machinery SET status = 'rented' WHERE id = ?`).run(booking.machinery_id);
  }
  res.json(booking);
});

module.exports = router;
