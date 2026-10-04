/**
 * MINHAJ WELDING - Rates Service
 * Module 7 (Central Pricing) + Module 8 (Historical Price Protection).
 *
 * RULE: We never UPDATE current_rate in place without first writing the
 * old value into rate_history. Past measurements reference rates by
 * rate_id + a frozen rate_at_calc snapshot, so they are never affected.
 */
const db = require('../models/db');
const brain = require('./brain');

function listRates({ category_id, style_id, status } = {}) {
  let sql = `SELECT r.*, c.name as category_name, s.name as style_name
             FROM rates r
             LEFT JOIN categories c ON c.id = r.category_id
             LEFT JOIN styles s ON s.id = r.style_id
             WHERE 1=1`;
  const args = [];
  if (category_id) { sql += ' AND r.category_id = ?'; args.push(category_id); }
  if (style_id) { sql += ' AND r.style_id = ?'; args.push(style_id); }
  if (status) { sql += ' AND r.status = ?'; args.push(status); }
  sql += ' ORDER BY r.category_id, r.style_id';
  return db.prepare(sql).all(...args);
}

function createRate(data, userId) {
  const stmt = db.prepare(`
    INSERT INTO rates (category_id, style_id, material_id, unit, min_rate, max_rate, current_rate, notes, created_by, updated_by)
    VALUES (@category_id, @style_id, @material_id, @unit, @min_rate, @max_rate, @current_rate, @notes, @userId, @userId)
  `);
  const info = stmt.run({ ...data, userId });
  return db.prepare('SELECT * FROM rates WHERE id = ?').get(info.lastInsertRowid);
}

/**
 * Update a rate's current_rate. Writes the OLD value to rate_history
 * before overwriting, and logs to audit_log. This is the ONLY function
 * that should ever change rates.current_rate.
 */
function updateRateValue(rateId, newRate, reason, userId) {
  const existing = db.prepare('SELECT * FROM rates WHERE id = ?').get(rateId);
  if (!existing) throw new Error('Rate not found');

  const txn = db.transaction(() => {
    db.prepare(`
      INSERT INTO rate_history (rate_id, old_rate, new_rate, changed_by, reason)
      VALUES (?, ?, ?, ?, ?)
    `).run(rateId, existing.current_rate, newRate, userId, reason || null);

    db.prepare(`
      UPDATE rates SET current_rate = ?, updated_by = ?, updated_at = datetime('now') WHERE id = ?
    `).run(newRate, userId, rateId);

    db.prepare(`
      INSERT INTO audit_log (entity_type, entity_id, action, old_value, new_value, changed_by)
      VALUES ('rate', ?, 'update', ?, ?, ?)
    `).run(rateId, String(existing.current_rate), String(newRate), userId);
  });
  txn();

  const meta = db.prepare(`SELECT c.name as category, s.name as style FROM rates r
    LEFT JOIN categories c ON c.id = r.category_id LEFT JOIN styles s ON s.id = r.style_id WHERE r.id = ?`).get(rateId);
  brain.logRateChange({ id: rateId, category: meta?.category, style: meta?.style, oldRate: existing.current_rate, newRate, by: userId });

  return db.prepare('SELECT * FROM rates WHERE id = ?').get(rateId);
}

function getRateHistory(rateId) {
  return db.prepare(`
    SELECT rh.*, u.name as changed_by_name
    FROM rate_history rh
    LEFT JOIN users u ON u.id = rh.changed_by
    WHERE rh.rate_id = ?
    ORDER BY rh.changed_at DESC
  `).all(rateId);
}

function deleteRate(rateId) {
  // Soft-delete pattern: mark inactive rather than hard delete, so any
  // measurement still referencing rate_id keeps working.
  db.prepare(`UPDATE rates SET status = 'inactive' WHERE id = ?`).run(rateId);
}

module.exports = { listRates, createRate, updateRateValue, getRateHistory, deleteRate };
