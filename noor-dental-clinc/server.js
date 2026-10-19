'use strict';
/* Noor Dental Clinic - local server (127.0.0.1:3000). Express + SQLite. 100% offline. */
const express = require('express'); const path = require('path'); const fs = require('fs');
const crypto = require('crypto'); const bcrypt = require('bcryptjs'); const multer = require('multer');
const cron = require('node-cron'); const chokidar = require('chokidar'); const { exec } = require('child_process');
const { db, settings } = require('./database/db');
const pdf = require('./lib/pdf'); const backup = require('./lib/backup'); const reminders = require('./lib/reminders');
const { today } = reminders;

const HOST = process.env.HOST || '127.0.0.1'; const PORT = Number(process.env.PORT) || 3000;
const app = express(); const PUB = path.join(__dirname, 'public'); const UP = path.join(__dirname, 'uploads');
app.disable('x-powered-by'); app.use(express.json({ limit: '40mb' }));

/* ---------- PWA + static (spec item 10) ---------- */
app.get('/manifest.json', (req, res) => { res.type('application/manifest+json').set('Cache-Control', 'no-cache').sendFile(path.join(PUB, 'manifest.json')); });
app.get('/service-worker.js', (req, res) => {
  res.set({ 'Service-Worker-Allowed': '/', 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Content-Type': 'application/javascript' }).sendFile(path.join(PUB, 'service-worker.js'));
});
app.use('/uploads', express.static(UP, { maxAge: 0 }));
app.use('/assets', express.static(path.join(__dirname, 'assets'), { maxAge: 0 }));
app.use(express.static(PUB, { maxAge: 0, etag: true, extensions: ['html'] }));

/* ---------- helpers ---------- */
const now = () => new Date(); const pad = n => String(n).padStart(2, '0');
const nowTime = () => { const d = now(); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
const ok = (res, data) => res.json(data === undefined ? { ok: true } : data);
const wrap = fn => (req, res) => { try { const r = fn(req, res); if (r && r.catch) r.catch(e => fail(res, e)); } catch (e) { fail(res, e); } };
const fail = (res, e, code = 400) => { console.error('[api]', e.message); if (!res.headersSent) res.status(code).json({ error: e.message }); };
const audit = (user, action, table, id, o, n) => db.prepare('INSERT INTO audit_log(user,action,"table",record_id,old_val,new_val) VALUES(?,?,?,?,?,?)')
  .run(user || 'system', action, table, id || null, o ? JSON.stringify(o) : null, n ? JSON.stringify(n) : null);

/* ---------- sessions & auth ---------- */
db.exec('CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, username TEXT, role TEXT, full_name TEXT, expires INTEGER)');
db.prepare('DELETE FROM sessions WHERE expires < ?').run(Date.now());
app.post('/api/auth/login', wrap((req, res) => {
  const { username, password, remember } = req.body || {};
  const u = db.prepare('SELECT * FROM users WHERE username=?').get(String(username || ''));
  if (!u || !bcrypt.compareSync(String(password || ''), u.password_hash)) { audit(username || '?', 'FAILED_LOGIN', 'users', u && u.id); return res.status(401).json({ error: 'Invalid username or password' }); }
  const sys = settings.get('system'); const hours = remember ? (sys.remember_days || 30) * 24 : (sys.session_hours || 8);
  const token = crypto.randomBytes(24).toString('hex');
  db.prepare('INSERT INTO sessions VALUES(?,?,?,?,?)').run(token, u.username, u.role, u.full_name, Date.now() + hours * 36e5);
  audit(u.username, 'LOGIN', 'users', u.id);
  ok(res, { token, user: { username: u.username, role: u.role, full_name: u.full_name }, default_password: bcrypt.compareSync('admin123', u.password_hash) });
}));
app.get('/api/ping', (req, res) => res.json({ ok: true, time: Date.now() }));

const ACCESS = {
  receptionist: ['patients', 'appointments', 'waiting_list', 'treatments', 'ortho_records', 'images', 'files', 'services', 'pos', 'pos_sales', 'reminders', 'whatsapp_log', 'upload', 'pdf', 'dashboard', 'settings-public', 'auth'],
  accountant: ['ledger', 'ledger-summary', 'expenses', 'accounts', 'reports', 'pdf', 'dashboard', 'patients', 'upload', 'settings-public', 'auth']
};
app.use('/api', (req, res, next) => {
  if (req.path === '/auth/login' || req.path === '/ping') return next();
  const token = req.get('x-token') || req.query.token;
  const s = token && db.prepare('SELECT * FROM sessions WHERE token=?').get(token);
  if (!s || s.expires < Date.now()) return res.status(401).json({ error: 'Session expired - please log in' });
  req.user = s;
  if (s.role !== 'admin') { const seg = req.path.split('/')[1]; if (seg === 'settings' && req.method === 'GET') return next(); if (!(ACCESS[s.role] || []).includes(seg)) return res.status(403).json({ error: 'Not allowed for your role' }); }
  next();
});
app.get('/api/auth/me', (req, res) => ok(res, { user: req.user }));
app.post('/api/auth/logout', wrap((req, res) => { db.prepare('DELETE FROM sessions WHERE token=?').run(req.user.token); ok(res); }));
app.post('/api/auth/change-password', wrap((req, res) => {
  const { old_password, new_password, username, new_username } = req.body;
  const u = db.prepare('SELECT * FROM users WHERE username=?').get(req.user.username);
  if (!bcrypt.compareSync(String(old_password || ''), u.password_hash)) throw new Error('Current password is wrong');
  if (!new_password || String(new_password).length < 4) throw new Error('New password must be at least 4 characters');
  db.prepare('UPDATE users SET password_hash=?, username=COALESCE(?,username) WHERE id=?').run(bcrypt.hashSync(String(new_password), 10), new_username || null, u.id);
  audit(u.username, 'PASSWORD_CHANGE', 'users', u.id); ok(res);
}));
const adminOnly = (req, res, next) => (req.user.role === 'admin' ? next() : res.status(403).json({ error: 'Admin only' }));
app.get('/api/users', adminOnly, wrap((req, res) => ok(res, db.prepare('SELECT id,username,role,full_name,created_at FROM users').all())));
app.post('/api/users', adminOnly, wrap((req, res) => {
  const { username, password, role, full_name } = req.body; if (!username || !password) throw new Error('Username and password required');
  const r = db.prepare('INSERT INTO users(username,password_hash,role,full_name) VALUES(?,?,?,?)').run(username, bcrypt.hashSync(String(password), 10), role || 'receptionist', full_name || username);
  audit(req.user.username, 'CREATE', 'users', r.lastInsertRowid); ok(res, { id: r.lastInsertRowid });
}));
app.delete('/api/users/:id', adminOnly, wrap((req, res) => {
  const u = db.prepare('SELECT * FROM users WHERE id=?').get(req.params.id);
  if (u && u.username === req.user.username) throw new Error('You cannot delete your own account');
  db.prepare('DELETE FROM users WHERE id=?').run(req.params.id); ok(res);
}));

/* ---------- generic CRUD with soft delete + audit ---------- */
const TABLES = {
  patients: { search: ['full_name', 'urdu_name', 'phone', 'cnic', 'whatsapp'], order: 'id DESC' },
  appointments: { date: 'date', order: 'date, time', join: true, search: ['treatment', 'notes'] },
  waiting_list: { order: 'id DESC', join: true },
  treatments: { date: 'date', order: 'date DESC, id DESC', join: true },
  ortho_records: { order: 'visit_no, date', join: true },
  expenses: { date: 'date', order: 'date DESC, id DESC', search: ['category', 'paid_to', 'notes'] },
  ledger: { date: 'date', order: 'date DESC, time DESC, id DESC', join: true, search: ['notes', 'tid', 'category'] },
  accounts: { order: 'id' },
  pos_sales: { date: 'date', order: 'id DESC', join: true },
  services: { order: 'category, name', search: ['name', 'urdu_name', 'category'] },
  images: { date: 'date', order: 'date DESC, id DESC', join: true },
  files: { order: 'id DESC', join: true },
  reminders: { date: 'due_date', order: 'due_date, id', join: true, search: ['message', 'type'] },
  whatsapp_log: { hard: true, order: 'id DESC', date: 'sent_at' },
  queue: { date: 'date', order: 'date DESC, token_no', join: true, search: ['reason', 'notes'] },
  labs: { date: 'sent_date', order: 'sent_date DESC, id DESC', join: true, search: ['lab_name', 'test_type', 'sample_desc', 'status'] }
};
const cols = {}; for (const t of Object.keys(TABLES)) cols[t] = db.prepare(`PRAGMA table_info(${t})`).all().map(c => c.name);
const JSONCOLS = new Set(['custom_fields_json', 'items_json', 'payment_json', 'tooth_notes_json', 'photos_json']);
const clean = (t, body) => { const o = {}; for (const [k, v] of Object.entries(body || {})) { if (!cols[t].includes(k) || ['id', 'deleted_at', 'deleted_reason'].includes(k)) continue; o[k] = (v !== null && typeof v === 'object') ? JSON.stringify(v) : (v === '' ? null : v); } return o; };
const defaultAccount = m => ({ Cash: 'Cash Drawer', EasyPaisa: 'EasyPaisa', JazzCash: 'JazzCash', 'Bank Transfer': 'Bank Account', Card: 'Bank Account' }[m] || 'Cash Drawer');

const hooks = {
  ledger: { before(o) { if (!o.time) o.time = nowTime(); if (!o.account) o.account = defaultAccount(o.method); } },
  expenses: {
    before(o) { if (!o.time) o.time = nowTime(); },
    after(op, row) {
      if (op === 'create') db.prepare("INSERT INTO ledger(date,time,type,amount,method,account,category,notes,ref_id,ref_type) VALUES(?,?,?,?,?,?,?,?,?,?)").run(row.date, row.time, 'out', row.amount, row.method, defaultAccount(row.method), row.category, 'Expense: ' + (row.paid_to || '') + ' ' + (row.notes || ''), row.id, 'expense');
      if (op === 'update') db.prepare("UPDATE ledger SET date=?,time=?,amount=?,method=?,account=?,category=? WHERE ref_type='expense' AND ref_id=?").run(row.date, row.time, row.amount, row.method, defaultAccount(row.method), row.category, row.id);
      if (op === 'delete') db.prepare("UPDATE ledger SET deleted_at=CURRENT_TIMESTAMP WHERE ref_type='expense' AND ref_id=?").run(row.id);
      if (op === 'restore') db.prepare("UPDATE ledger SET deleted_at=NULL WHERE ref_type='expense' AND ref_id=?").run(row.id);
    }
  },
  patients: { before(o, op) { o.updated_at = new Date().toISOString(); if (op === 'create' && !o.full_name) throw new Error('Name is required'); } },
  appointments: { before(o) { if (!o.color_tag) { const c = settings.get('colors'); if (o.status && c[o.status]) o.color_tag = c[o.status]; } } },
  ortho_records: { before(o, op, req) { if (op === 'create' && !o.visit_no) o.visit_no = db.prepare('SELECT COALESCE(MAX(visit_no),0)+1 n FROM ortho_records WHERE patient_id=?').get(o.patient_id).n; } },
  queue: { before(o, op) { if (op === 'create') { if (!o.date) o.date = today(); if (!o.token_no) o.token_no = db.prepare('SELECT COALESCE(MAX(token_no),0)+1 n FROM queue WHERE date=? AND deleted_at IS NULL').get(o.date).n; if (!o.checkin_at) o.checkin_at = nowTime(); if (!o.status) o.status = 'Waiting'; } } },
  labs: { before(o, op) { if (op === 'create' && !o.sent_date) o.sent_date = today(); if (!o.status) o.status = 'Pending'; } }
};
const selectSql = t => (TABLES[t].join ? `SELECT t.*, p.full_name AS patient_name, p.phone AS patient_phone, p.whatsapp AS patient_whatsapp FROM ${t} t LEFT JOIN patients p ON p.id=t.patient_id` : `SELECT t.* FROM ${t} t`);
const one = (t, id) => db.prepare(`${selectSql(t)} WHERE t.id=?`).get(id);

app.get('/api/dashboard', wrap((req, res) => {
  const d = today(), month = d.slice(0, 7);
  const q = (sql, ...a) => db.prepare(sql).get(...a);
  const patients = q('SELECT COUNT(*) c FROM patients WHERE deleted_at IS NULL').c;
  const pending = db.prepare('SELECT DISTINCT patient_id id FROM pos_sales WHERE deleted_at IS NULL AND patient_id IS NOT NULL').all().reduce((s, r) => s + Math.max(0, pdf.patientBalance(r.id).balance), 0);
  const days = []; for (let i = 29; i >= 0; i--) days.push(reminders.addDays(d, -i));
  const rev = Object.fromEntries(db.prepare("SELECT date, SUM(amount) s FROM ledger WHERE type='in' AND deleted_at IS NULL AND date>=? GROUP BY date").all(days[0]).map(r => [r.date, r.s]));
  const weeks = db.prepare("SELECT strftime('%Y-W%W', date) w, COUNT(*) c FROM appointments WHERE deleted_at IS NULL AND date>=? GROUP BY w ORDER BY w").all(reminders.addDays(d, -56));
  ok(res, {
    kpi: {
      patients, appointments_today: q('SELECT COUNT(*) c FROM appointments WHERE date=? AND deleted_at IS NULL', d).c,
      revenue_today: q("SELECT COALESCE(SUM(amount),0) s FROM ledger WHERE type='in' AND date=? AND deleted_at IS NULL", d).s, pending,
      income_month: q("SELECT COALESCE(SUM(amount),0) s FROM ledger WHERE type='in' AND substr(date,1,7)=? AND deleted_at IS NULL", month).s,
      expenses_today: q('SELECT COALESCE(SUM(amount),0) s FROM expenses WHERE date=? AND deleted_at IS NULL', d).s
    },
    revenue30: { labels: days, values: days.map(x => rev[x] || 0) },
    weekly: { labels: weeks.map(w => w.w), values: weeks.map(w => w.c) },
    treatments: db.prepare("SELECT COALESCE(treatment,'Other') name, COUNT(*) c FROM appointments WHERE deleted_at IS NULL AND status!='Cancelled' GROUP BY name ORDER BY c DESC LIMIT 8").all(),
    methods: db.prepare("SELECT method, SUM(amount) s FROM ledger WHERE type='in' AND deleted_at IS NULL AND date>=? GROUP BY method").all(days[0]),
    today_appts: db.prepare('SELECT a.*, p.full_name patient_name, p.phone patient_phone, p.whatsapp patient_whatsapp FROM appointments a LEFT JOIN patients p ON p.id=a.patient_id WHERE a.date=? AND a.deleted_at IS NULL ORDER BY a.time').all(d),
    recent_patients: db.prepare('SELECT id,full_name,phone,photo,gender,created_at FROM patients WHERE deleted_at IS NULL ORDER BY id DESC LIMIT 6').all(),
    reminders_due: db.prepare("SELECT r.*, p.full_name patient_name, p.phone patient_phone, p.whatsapp patient_whatsapp FROM reminders r LEFT JOIN patients p ON p.id=r.patient_id WHERE r.deleted_at IS NULL AND r.status='Pending' AND r.due_date<=? ORDER BY r.due_date LIMIT 8").all(d),
    queue_today: queueView(d),
    labs_available: db.prepare("SELECT l.*, p.full_name patient_name FROM labs l JOIN patients p ON p.id=l.patient_id WHERE l.deleted_at IS NULL AND l.status='Available' ORDER BY l.sent_date DESC LIMIT 6").all(),
    backup_age_hours: backup.backupAgeHours()
  });
}));

/* Today's queue, shaped for the "now serving / next / after next" display: the one row
   with status='Serving' (if any) plus the next rows still Waiting, in token order. Also
   used standalone by the Waiting Room page's live widget. */
function queueView(date) {
  const rows = db.prepare("SELECT q.*, p.full_name patient_name, p.phone patient_phone, p.whatsapp patient_whatsapp, p.gender patient_gender, p.photo patient_photo FROM queue q JOIN patients p ON p.id=q.patient_id WHERE q.date=? AND q.deleted_at IS NULL ORDER BY q.token_no").all(date)
    .map(r => ({ ...r, balance: pdf.patientBalance(r.patient_id).balance }));
  const serving = rows.find(r => r.status === 'Serving') || null;
  const waiting = rows.filter(r => r.status === 'Waiting');
  const done = rows.filter(r => r.status === 'Done');
  return { serving, next: waiting.slice(0, 2), waiting_count: waiting.length, done_count: done.length, all: rows };
}
app.get('/api/queue-today', wrap((req, res) => ok(res, queueView(req.query.date || today()))));

/* Ortho register: one row per patient who has at least one ortho visit, with their
   latest wire/ties/next-visit info - so Ortho Tie Sheet can open as a list (like the
   Patients register) instead of forcing a search first. */
app.get('/api/ortho-register', wrap((req, res) => {
  const q = req.query.q;
  let rows = db.prepare(`
    SELECT p.id patient_id, p.full_name patient_name, p.phone patient_phone, p.whatsapp patient_whatsapp, p.gender patient_gender, p.photo patient_photo,
      COUNT(o.id) visit_count, MAX(o.date) last_date, MAX(o.next_visit) next_visit
    FROM ortho_records o JOIN patients p ON p.id = o.patient_id
    WHERE o.deleted_at IS NULL AND p.deleted_at IS NULL
    GROUP BY p.id ORDER BY last_date DESC`).all();
  if (q) { const ql = q.toLowerCase(); rows = rows.filter(r => r.patient_name.toLowerCase().includes(ql) || (r.patient_phone || '').includes(q)); }
  const last = db.prepare('SELECT * FROM ortho_records WHERE patient_id=? AND deleted_at IS NULL ORDER BY date DESC, id DESC LIMIT 1');
  ok(res, rows.map(r => { const l = last.get(r.patient_id) || {}; return { ...r, upper_wire: l.upper_wire, lower_wire: l.lower_wire, ties: l.ties, elastics: l.elastics }; }));
}));

/* patient full profile */
app.get('/api/patients/:id/full', wrap((req, res) => {
  const id = Number(req.params.id); const P = db.prepare('SELECT * FROM patients WHERE id=?').get(id); if (!P) return fail(res, new Error('Patient not found'), 404);
  const a = sql => db.prepare(sql).all(id);
  ok(res, {
    patient: P, balance: pdf.patientBalance(id),
    appointments: a('SELECT * FROM appointments WHERE patient_id=? AND deleted_at IS NULL ORDER BY date DESC, time DESC'),
    treatments: a('SELECT * FROM treatments WHERE patient_id=? AND deleted_at IS NULL ORDER BY date DESC, id DESC'),
    images: a('SELECT * FROM images WHERE patient_id=? AND deleted_at IS NULL ORDER BY date DESC, id DESC'),
    files: a('SELECT * FROM files WHERE patient_id=? AND deleted_at IS NULL ORDER BY id DESC'),
    ledger: a('SELECT * FROM ledger WHERE patient_id=? AND deleted_at IS NULL ORDER BY date, time, id'),
    sales: a('SELECT * FROM pos_sales WHERE patient_id=? AND deleted_at IS NULL ORDER BY id DESC'),
    ortho: a('SELECT * FROM ortho_records WHERE patient_id=? AND deleted_at IS NULL ORDER BY visit_no, date')
  });
}));
app.get('/api/patients/:id/balance', wrap((req, res) => ok(res, pdf.patientBalance(Number(req.params.id)))));

/* Register-style patient list (matches the clinic's paper register: S.No, Name, Time,
   Procedure, Paid, Balance, Total, Guaranteed Patient, Address, Cell #, Signature).
   One extra query per row (procedure/total/paid) - fine at clinic scale; keeps the
   numbers always correct with zero duplicated bookkeeping logic. */
app.get('/api/patients-register', wrap((req, res) => {
  const { q, sort, dir, limit, offset } = req.query;
  const where = ['deleted_at IS NULL']; const args = [];
  if (q) { where.push('(full_name LIKE ? OR phone LIKE ? OR cnic LIKE ? OR whatsapp LIKE ?)'); args.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`); }
  if (req.query.gender) { where.push('gender = ?'); args.push(req.query.gender); }
  const w = ' WHERE ' + where.join(' AND ');
  const total = db.prepare(`SELECT COUNT(*) c FROM patients${w}`).get(...args).c;
  const sortable = { full_name: 'full_name', created_at: 'created_at', age: 'age', id: 'id' };
  let order = 'id DESC'; if (sort && sortable[sort]) order = `${sortable[sort]} ${dir === 'asc' ? 'ASC' : 'DESC'}`;
  let sql = `SELECT * FROM patients${w} ORDER BY ${order}`; const la = [...args];
  if (limit) { sql += ' LIMIT ? OFFSET ?'; la.push(Number(limit), Number(offset) || 0); }
  const rows = db.prepare(sql).all(...la);
  const lastProcedure = db.prepare('SELECT name FROM treatments WHERE patient_id=? AND deleted_at IS NULL ORDER BY date DESC, id DESC LIMIT 1');
  const out = rows.map(p => {
    const bal = pdf.patientBalance(p.id);
    return { ...p, time: (p.created_at || '').slice(11, 16), procedure: (lastProcedure.get(p.id) || {}).name || '', total: bal.charged, paid: bal.paid, balance: bal.balance };
  });
  res.set('X-Total-Count', total).set('Access-Control-Expose-Headers', 'X-Total-Count'); ok(res, out);
}));

for (const t of Object.keys(TABLES)) {
  const cfg = TABLES[t];
  app.get(`/api/${t}`, wrap((req, res) => {
    const where = cfg.hard ? [] : ['t.deleted_at IS NULL']; const args = [];
    const { q, from, to, sort, dir, limit, offset } = req.query;
    if (q && cfg.search) { where.push('(' + cfg.search.map(c => `t.${c} LIKE ?`).join(' OR ') + (cfg.join ? ' OR p.full_name LIKE ?' : '') + ')'); cfg.search.forEach(() => args.push(`%${q}%`)); if (cfg.join) args.push(`%${q}%`); }
    else if (q && cfg.join) { where.push('p.full_name LIKE ?'); args.push(`%${q}%`); }
    if (cfg.date && from) { where.push(`t.${cfg.date} >= ?`); args.push(from); } if (cfg.date && to) { where.push(`t.${cfg.date} <= ?`); args.push(to + (cfg.hard ? ' 23:59:59' : '')); }
    for (const [k, v] of Object.entries(req.query)) if (cols[t].includes(k) && v !== '') { where.push(`t.${k} = ?`); args.push(v); }
    if (req.query.unassigned) where.push('t.patient_id IS NULL');
    const w = where.length ? ' WHERE ' + where.join(' AND ') : '';
    const total = db.prepare(`SELECT COUNT(*) c FROM ${t} t ${cfg.join ? 'LEFT JOIN patients p ON p.id=t.patient_id' : ''}${w}`).get(...args).c;
    let order = cfg.order.replace(/(^|, )(?=\w)/g, '$1t.'); if (sort && cols[t].includes(sort)) order = `t.${sort} ${dir === 'desc' ? 'DESC' : 'ASC'}`;
    let sql = `${selectSql(t)}${w} ORDER BY ${order}`; const la = [...args];
    if (limit) { sql += ' LIMIT ? OFFSET ?'; la.push(Number(limit), Number(offset) || 0); }
    res.set('X-Total-Count', total).set('Access-Control-Expose-Headers', 'X-Total-Count'); ok(res, db.prepare(sql).all(...la));
  }));
  app.get(`/api/${t}/:id`, wrap((req, res) => { const r = one(t, req.params.id); r ? ok(res, r) : fail(res, new Error('Not found'), 404); }));
  app.post(`/api/${t}`, wrap((req, res) => {
    const o = clean(t, req.body); const h = hooks[t] || {}; if (h.before) h.before(o, 'create', req);
    const keys = Object.keys(o); if (!keys.length) throw new Error('Nothing to save');
    const r = db.prepare(`INSERT INTO ${t}(${keys.join(',')}) VALUES(${keys.map(() => '?').join(',')})`).run(...keys.map(k => o[k]));
    const row = one(t, r.lastInsertRowid); if (h.after) h.after('create', row); audit(req.user.username, 'CREATE', t, row.id, null, o); ok(res, row);
  }));
  app.put(`/api/${t}/:id`, wrap((req, res) => {
    const old = one(t, req.params.id); if (!old) throw new Error('Not found');
    const o = clean(t, req.body); const h = hooks[t] || {}; if (h.before) h.before(o, 'update', req);
    const keys = Object.keys(o); if (keys.length) db.prepare(`UPDATE ${t} SET ${keys.map(k => k + '=?').join(',')} WHERE id=?`).run(...keys.map(k => o[k]), req.params.id);
    const row = one(t, req.params.id); if (h.after) h.after('update', row); audit(req.user.username, 'UPDATE', t, row.id, old, o); ok(res, row);
  }));
  app.post(`/api/${t}/:id/duplicate`, wrap((req, res) => {
    const old = db.prepare(`SELECT * FROM ${t} WHERE id=?`).get(req.params.id); if (!old) throw new Error('Not found');
    const o = clean(t, old); if (o.full_name) o.full_name += ' (copy)'; else if (o.name) o.name += ' (copy)';
    const keys = Object.keys(o); const r = db.prepare(`INSERT INTO ${t}(${keys.join(',')}) VALUES(${keys.map(() => '?').join(',')})`).run(...keys.map(k => o[k]));
    audit(req.user.username, 'DUPLICATE', t, r.lastInsertRowid); ok(res, one(t, r.lastInsertRowid));
  }));
  app.delete(`/api/${t}/:id`, wrap((req, res) => {
    const old = one(t, req.params.id); if (!old) throw new Error('Not found');
    if (cfg.hard) db.prepare(`DELETE FROM ${t} WHERE id=?`).run(req.params.id);
    else db.prepare(`UPDATE ${t} SET deleted_at=CURRENT_TIMESTAMP, deleted_reason=? WHERE id=?`).run(req.query.reason || null, req.params.id);
    const h = hooks[t] || {}; if (h.after) h.after('delete', old); audit(req.user.username, 'DELETE', t, old.id, old); ok(res, { ok: true, undo: { table: t, id: old.id } });
  }));
}

/* ---------- trash (30 days) ---------- */
const SOFT = Object.keys(TABLES).filter(t => !TABLES[t].hard);
const labelOf = r => r.full_name || r.name || (r.treatment ? r.treatment + ' ' + (r.date || '') : null) || (r.amount != null ? 'PKR ' + r.amount + ' ' + (r.date || r.category || '') : null) || r.message || r.file_path || ('#' + r.id);
app.get('/api/trash', wrap((req, res) => ok(res, SOFT.flatMap(t => db.prepare(`SELECT * FROM ${t} WHERE deleted_at IS NOT NULL`).all().map(r => ({ table: t, id: r.id, label: labelOf(r), deleted_at: r.deleted_at, reason: r.deleted_reason }))).sort((a, b) => b.deleted_at.localeCompare(a.deleted_at)))));
app.post('/api/trash/restore', wrap((req, res) => {
  const { table, id } = req.body; if (!SOFT.includes(table)) throw new Error('Bad table');
  db.prepare(`UPDATE ${table} SET deleted_at=NULL, deleted_reason=NULL WHERE id=?`).run(id);
  const h = hooks[table]; if (h && h.after) h.after('restore', db.prepare(`SELECT * FROM ${table} WHERE id=?`).get(id)); audit(req.user.username, 'RESTORE', table, id); ok(res);
}));
app.post('/api/trash/purge', adminOnly, wrap((req, res) => { let n = 0; SOFT.forEach(t => { n += db.prepare(`DELETE FROM ${t} WHERE deleted_at IS NOT NULL AND (?=1 OR deleted_at < datetime('now','-30 days'))`).run(req.body.all ? 1 : 0).changes; }); ok(res, { removed: n }); }));

/* ---------- uploads ---------- */
const KINDS = ['patients', 'xrays', 'payments', 'receipts', 'misc', 'ortho', 'intake'];
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const kind = KINDS.includes(req.params.kind) ? req.params.kind : 'misc'; const pid = /^\d+$/.test(req.query.pid || '') ? req.query.pid : '';
    const dir = path.join(UP, kind, pid); fs.mkdirSync(dir, { recursive: true }); cb(null, dir);
  },
  filename(req, file, cb) { const safe = path.basename(file.originalname).replace(/[^\w.\-]+/g, '_'); cb(null, Date.now() + '_' + safe); }
});
const upload = multer({ storage, limits: { fileSize: 80 * 1024 * 1024 } });
app.post('/api/upload/:kind', upload.array('files', 40), wrap((req, res) => {
  ok(res, req.files.map(f => ({ path: '/' + path.relative(__dirname, f.path).split(path.sep).join('/'), name: f.originalname, size: f.size })));
}));
app.post('/api/images/annotated', wrap((req, res) => {
  const { image_id, dataUrl } = req.body; const src = db.prepare('SELECT * FROM images WHERE id=?').get(image_id); if (!src) throw new Error('Image not found');
  const m = /^data:image\/png;base64,(.+)$/.exec(dataUrl || ''); if (!m) throw new Error('Bad image data');
  const dir = path.join(UP, 'xrays', String(src.patient_id || 'unassigned')); fs.mkdirSync(dir, { recursive: true });
  const fn = `${Date.now()}_annotated.png`; fs.writeFileSync(path.join(dir, fn), Buffer.from(m[1], 'base64'));
  const r = db.prepare("INSERT INTO images(patient_id,file_path,type,tooth_no,site,date,time,notes) VALUES(?,?,?,?,?,?,?,?)").run(src.patient_id, `/uploads/xrays/${src.patient_id || 'unassigned'}/${fn}`, src.type, src.tooth_no, src.site, today(), nowTime(), 'Annotated copy of #' + src.id);
  ok(res, one('images', r.lastInsertRowid));
}));
app.post('/api/images/:id/assign', wrap((req, res) => {
  const img = db.prepare('SELECT * FROM images WHERE id=?').get(req.params.id); const pid = Number(req.body.patient_id); if (!img || !pid) throw new Error('Bad request');
  let fp = img.file_path; const abs = path.join(__dirname, fp);
  if (fp.startsWith('/uploads/intake/') && fs.existsSync(abs)) { const dir = path.join(UP, 'xrays', String(pid)); fs.mkdirSync(dir, { recursive: true }); const dest = path.join(dir, path.basename(abs)); fs.renameSync(abs, dest); fp = `/uploads/xrays/${pid}/${path.basename(abs)}`; }
  db.prepare('UPDATE images SET patient_id=?, file_path=?, tooth_no=COALESCE(?,tooth_no), site=COALESCE(?,site), type=COALESCE(?,type) WHERE id=?').run(pid, fp, req.body.tooth_no || null, req.body.site || null, req.body.type || null, img.id); ok(res, one('images', img.id));
}));

/* ---------- POS ---------- */
app.post('/api/pos/checkout', wrap((req, res) => {
  const b = req.body; const items = (b.items || []).filter(i => i.name && Number(i.qty) > 0); if (!items.length) throw new Error('Add at least one item');
  const subtotal = items.reduce((s, i) => s + Number(i.price) * Number(i.qty) - Number(i.discount || 0), 0);
  const dv = Number(b.discount_value || 0); const discount = b.discount_type === 'percent' ? subtotal * dv / 100 : dv;
  const tax = (settings.get('pos').tax_enabled ? (subtotal - discount) * Number(b.tax_percent ?? settings.get('pos').tax_percent) / 100 : 0);
  const total = Math.max(0, subtotal - discount + tax); const pays = (b.payments || []).filter(p => Number(p.amount) > 0); const paid = pays.reduce((s, p) => s + Number(p.amount), 0);
  if (paid > total + 0.01) throw new Error('Payments exceed the total');
  const d = today(), tm = nowTime();
  const tx = db.transaction(() => {
    const r = db.prepare('INSERT INTO pos_sales(patient_id,date,time,items_json,subtotal,discount,tax,total,paid,payment_json,doctor) VALUES(?,?,?,?,?,?,?,?,?,?,?)')
      .run(b.patient_id || null, d, tm, JSON.stringify(items), subtotal, discount, tax, total, paid, JSON.stringify(pays), b.doctor || settings.get('clinic').doctor);
    const li = db.prepare("INSERT INTO ledger(date,time,type,patient_id,amount,method,tid,sender,screenshot,account,category,notes,ref_id,ref_type) VALUES(?,?,'in',?,?,?,?,?,?,?,'Treatment',?,?,'pos')");
    pays.forEach(p => li.run(d, tm, b.patient_id || null, p.amount, p.method, p.tid || null, p.sender || null, p.screenshot || null, defaultAccount(p.method), 'POS #' + r.lastInsertRowid, r.lastInsertRowid));
    if (b.patient_id) { const it = db.prepare('INSERT INTO treatments(patient_id,name,tooth_no,notes,cost,date,doctor) VALUES(?,?,?,?,?,?,?)'); items.forEach(i => it.run(b.patient_id, i.name, i.tooth_no || null, 'POS #' + r.lastInsertRowid, Number(i.price) * Number(i.qty) - Number(i.discount || 0), d, b.doctor || settings.get('clinic').doctor)); }
    return r.lastInsertRowid;
  });
  const id = tx(); audit(req.user.username, 'POS_SALE', 'pos_sales', id, null, { total, paid }); ok(res, one('pos_sales', id));
}));
app.post('/api/pos/:id/refund', wrap((req, res) => {
  const s = db.prepare('SELECT * FROM pos_sales WHERE id=?').get(req.params.id); if (!s) throw new Error('Sale not found'); const amt = Number(req.body.amount); if (!(amt > 0)) throw new Error('Enter refund amount');
  db.prepare("INSERT INTO ledger(date,time,type,patient_id,amount,method,account,category,notes,ref_id,ref_type) VALUES(?,?,'out',?,?,?,?,'Refund',?,?,'refund')").run(today(), nowTime(), s.patient_id, amt, req.body.method || 'Cash', defaultAccount(req.body.method || 'Cash'), 'Refund for POS #' + s.id + ' ' + (req.body.notes || ''), s.id);
  audit(req.user.username, 'REFUND', 'pos_sales', s.id, null, { amt }); ok(res);
}));

/* ---------- ledger summary ---------- */
app.get('/api/ledger-summary', wrap((req, res) => {
  const date = req.query.date || today(); const acc = db.prepare('SELECT * FROM accounts WHERE deleted_at IS NULL').all();
  const sumTo = (cond, ...a) => db.prepare(`SELECT COALESCE(SUM(CASE WHEN type='in' THEN amount ELSE -amount END),0) s FROM ledger WHERE deleted_at IS NULL AND ${cond}`).get(...a).s;
  const openBase = acc.reduce((s, a) => s + a.opening_balance, 0); const opening = openBase + sumTo('date < ?', date);
  const dayIn = db.prepare("SELECT COALESCE(SUM(amount),0) s FROM ledger WHERE type='in' AND date=? AND deleted_at IS NULL").get(date).s;
  const dayOut = db.prepare("SELECT COALESCE(SUM(amount),0) s FROM ledger WHERE type='out' AND date=? AND deleted_at IS NULL").get(date).s;
  const range = (from) => db.prepare("SELECT COALESCE(SUM(CASE WHEN type='in' THEN amount END),0) i, COALESCE(SUM(CASE WHEN type='out' THEN amount END),0) o FROM ledger WHERE deleted_at IS NULL AND date>=? AND date<=?").get(from, date);
  const d0 = new Date(date + 'T00:00:00'); const dow = (d0.getDay() + 6) % 7;
  ok(res, {
    date, opening, in: dayIn, out: dayOut, closing: opening + dayIn - dayOut,
    week: range(reminders.addDays(date, -dow)), month: range(date.slice(0, 7) + '-01'), year: range(date.slice(0, 4) + '-01-01'),
    accounts: acc.map(a => ({ ...a, balance: a.opening_balance + db.prepare("SELECT COALESCE(SUM(CASE WHEN type='in' THEN amount ELSE -amount END),0) s FROM ledger WHERE deleted_at IS NULL AND account=?").get(a.name).s }))
  });
}));

/* ---------- reports ---------- */
const money = n => Number(n || 0);
function report(type, from, to) {
  from = from || today(); to = to || from; const P = (sql, ...a) => db.prepare(sql).all(...a);
  const range = 'date>=? AND date<=? AND deleted_at IS NULL';
  switch (type) {
    case 'daily': {
      const L = P(`SELECT l.*,p.full_name pn FROM ledger l LEFT JOIN patients p ON p.id=l.patient_id WHERE l.date>=? AND l.date<=? AND l.deleted_at IS NULL ORDER BY l.date,l.time`, from, to);
      const inc = L.filter(l => l.type === 'in').reduce((s, l) => s + l.amount, 0), out = L.filter(l => l.type === 'out').reduce((s, l) => s + l.amount, 0);
      const pts = db.prepare(`SELECT COUNT(DISTINCT patient_id) c FROM (SELECT patient_id FROM appointments WHERE ${range} AND status!='Cancelled' UNION ALL SELECT patient_id FROM pos_sales WHERE ${range})`).get(from, to, from, to).c;
      return { title: 'Daily Report', subtitle: `${from}${to !== from ? ' to ' + to : ''}`, columns: ['Date', 'Time', 'Type', 'Patient', 'Method', 'Amount', 'Notes'], rows: L.map(l => [l.date, l.time, l.type === 'in' ? 'IN' : 'OUT', l.pn || '', l.method, money(l.amount), l.notes || l.category || '']), summary: [['Patients seen', pts], ['Income', 'PKR ' + inc.toLocaleString()], ['Expenses', 'PKR ' + out.toLocaleString()], ['Net', 'PKR ' + (inc - out).toLocaleString()]], chart: { type: 'bar', labels: ['Income', 'Expenses', 'Net'], values: [inc, out, inc - out] } };
    }
    case 'period': {
      const R = P(`SELECT date, SUM(CASE WHEN type='in' THEN amount ELSE 0 END) i, SUM(CASE WHEN type='out' THEN amount ELSE 0 END) o FROM ledger WHERE ${range} GROUP BY date ORDER BY date`, from, to);
      const tI = R.reduce((s, r) => s + r.i, 0), tO = R.reduce((s, r) => s + r.o, 0);
      return { title: 'Income / Expense Report', subtitle: `${from} to ${to}`, columns: ['Date', 'Income', 'Expenses', 'Net'], rows: R.map(r => [r.date, money(r.i), money(r.o), money(r.i - r.o)]), summary: [['Total income', 'PKR ' + tI.toLocaleString()], ['Total expenses', 'PKR ' + tO.toLocaleString()], ['Net', 'PKR ' + (tI - tO).toLocaleString()]], chart: { type: 'line', labels: R.map(r => r.date), values: R.map(r => r.i) } };
    }
    case 'patient_revenue': {
      const R = P(`SELECT p.full_name n, p.phone ph, COUNT(l.id) c, SUM(l.amount) s FROM ledger l JOIN patients p ON p.id=l.patient_id WHERE l.type='in' AND l.date>=? AND l.date<=? AND l.deleted_at IS NULL GROUP BY p.id ORDER BY s DESC`, from, to);
      return { title: 'Patient-wise Revenue', subtitle: `${from} to ${to}`, columns: ['Patient', 'Phone', 'Payments', 'Total paid'], rows: R.map(r => [r.n, r.ph || '', r.c, money(r.s)]), summary: [['Total', 'PKR ' + R.reduce((s, r) => s + r.s, 0).toLocaleString()]], chart: { type: 'bar', labels: R.slice(0, 10).map(r => r.n), values: R.slice(0, 10).map(r => r.s) } };
    }
    case 'treatment_revenue': case 'doctor_revenue': {
      const S = P(`SELECT * FROM pos_sales WHERE ${range}`, from, to); const m = {};
      if (type === 'treatment_revenue') S.forEach(s => JSON.parse(s.items_json || '[]').forEach(i => { const k = i.name; m[k] = m[k] || { c: 0, s: 0 }; m[k].c += Number(i.qty); m[k].s += Number(i.price) * Number(i.qty) - Number(i.discount || 0); }));
      else S.forEach(s => { const k = s.doctor || 'Unassigned'; m[k] = m[k] || { c: 0, s: 0 }; m[k].c += 1; m[k].s += s.total; });
      const R = Object.entries(m).sort((a, b) => b[1].s - a[1].s);
      return { title: type === 'treatment_revenue' ? 'Treatment-wise Revenue' : 'Doctor-wise Revenue', subtitle: `${from} to ${to}`, columns: [type === 'treatment_revenue' ? 'Treatment' : 'Doctor', type === 'treatment_revenue' ? 'Qty' : 'Sales', 'Revenue'], rows: R.map(([k, v]) => [k, v.c, money(v.s)]), summary: [['Total', 'PKR ' + R.reduce((s, r) => s + r[1].s, 0).toLocaleString()]], chart: { type: 'pie', labels: R.map(r => r[0]), values: R.map(r => r[1].s) } };
    }
    case 'expense_breakdown': {
      const R = P(`SELECT COALESCE(category,'Uncategorised') c, COUNT(*) n, SUM(amount) s FROM expenses WHERE ${range} GROUP BY c ORDER BY s DESC`, from, to);
      return { title: 'Expense Breakdown', subtitle: `${from} to ${to}`, columns: ['Category', 'Entries', 'Total'], rows: R.map(r => [r.c, r.n, money(r.s)]), summary: [['Total', 'PKR ' + R.reduce((s, r) => s + r.s, 0).toLocaleString()]], chart: { type: 'doughnut', labels: R.map(r => r.c), values: R.map(r => r.s) } };
    }
    case 'outstanding': {
      const R = P('SELECT id,full_name,phone,whatsapp FROM patients WHERE deleted_at IS NULL AND id IN (SELECT patient_id FROM pos_sales WHERE deleted_at IS NULL AND patient_id IS NOT NULL)').map(p => ({ ...p, ...pdf.patientBalance(p.id) })).filter(p => p.balance > 0.5).sort((a, b) => b.balance - a.balance);
      return { title: 'Outstanding Payments', subtitle: 'As of ' + today(), columns: ['Patient', 'Phone', 'Billed', 'Paid', 'Balance'], rows: R.map(r => [r.full_name, r.phone || '', money(r.charged), money(r.paid), money(r.balance)]), summary: [['Total outstanding', 'PKR ' + R.reduce((s, r) => s + r.balance, 0).toLocaleString()]], chart: { type: 'bar', labels: R.slice(0, 10).map(r => r.full_name), values: R.slice(0, 10).map(r => r.balance) } };
    }
    case 'noshow': {
      const R = P(`SELECT status, COUNT(*) c FROM appointments WHERE ${range} GROUP BY status`, from, to); const tot = R.reduce((s, r) => s + r.c, 0); const ns = (R.find(r => r.status === 'No-show') || { c: 0 }).c;
      return { title: 'Appointments & No-show Rate', subtitle: `${from} to ${to}`, columns: ['Status', 'Count', 'Share %'], rows: R.map(r => [r.status, r.c, tot ? +(r.c * 100 / tot).toFixed(1) : 0]), summary: [['Total appointments', tot], ['No-show rate', (tot ? (ns * 100 / tot).toFixed(1) : 0) + '%']], chart: { type: 'doughnut', labels: R.map(r => r.status), values: R.map(r => r.c) } };
    }
    case 'ortho': {
      const R = P('SELECT p.full_name n, COUNT(o.id) v, MIN(o.date) f, MAX(o.date) l, MAX(o.next_visit) nx FROM ortho_records o JOIN patients p ON p.id=o.patient_id WHERE o.deleted_at IS NULL GROUP BY p.id ORDER BY v DESC');
      return { title: 'Ortho Patient Progress', subtitle: 'All active ortho patients', columns: ['Patient', 'Visits', 'First visit', 'Last visit', 'Next visit'], rows: R.map(r => [r.n, r.v, r.f || '', r.l || '', r.nx || '']), summary: [['Ortho patients', R.length]], chart: { type: 'bar', labels: R.map(r => r.n), values: R.map(r => r.v) } };
    }
    case 'heatmap': {
      const R = P(`SELECT CAST(strftime('%w',date) AS INT) d, CAST(substr(time,1,2) AS INT) h, COUNT(*) c FROM appointments WHERE ${range} AND status!='Cancelled' GROUP BY d,h`, from, to); const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return { title: 'Busy Hours Heatmap', subtitle: `${from} to ${to}`, columns: ['Day', 'Hour', 'Appointments'], rows: R.sort((a, b) => b.c - a.c).map(r => [days[r.d], r.h + ':00', r.c]), summary: [['Busiest slot', R[0] ? days[R[0].d] + ' ' + R[0].h + ':00' : '-']], heat: R };
    }
  }
  throw new Error('Unknown report');
}
app.get('/api/reports/:type', wrap((req, res) => ok(res, report(req.params.type, req.query.from, req.query.to))));

/* ---------- reminders ---------- */
app.post('/api/reminders/generate', wrap((req, res) => ok(res, { created: reminders.generate() })));

/* ---------- PDFs ---------- */
const pdfOut = (res, name) => { res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="${name}"` }); return res; };
app.get('/api/pdf/patient/:id', wrap((req, res) => {
  const id = Number(req.params.id); fs.mkdirSync(path.join(__dirname, 'pdfs'), { recursive: true });
  const file = path.join(__dirname, 'pdfs', `${id}_dossier_${today()}.pdf`); const out = fs.createWriteStream(file);
  const pass = require('stream').PassThrough && new (require('stream').PassThrough)(); pass.pipe(out); pass.pipe(pdfOut(res, `dossier_${id}.pdf`)); pdf.dossier(id, pass);
}));
app.get('/api/pdf/ortho/:id', wrap((req, res) => pdf.orthoReport(Number(req.params.id), pdfOut(res, 'ortho_report.pdf'))));
app.get('/api/pdf/receipt/:id', wrap((req, res) => pdf.receipt(Number(req.params.id), req.query.size || settings.get('pos').receipt_size, pdfOut(res, `receipt_${req.params.id}.pdf`))));
app.post('/api/pdf/table', wrap((req, res) => pdf.tableReport(req.body, pdfOut(res, 'report.pdf'))));

/* ---------- settings ---------- */
app.get('/api/settings', wrap((req, res) => ok(res, settings.all())));
app.put('/api/settings/:key', adminOnly, wrap((req, res) => { settings.set(req.params.key, req.body.value); audit(req.user.username, 'SETTINGS', 'settings', null, null, { key: req.params.key }); ok(res); }));
app.get('/api/audit', adminOnly, wrap((req, res) => ok(res, db.prepare('SELECT * FROM audit_log ORDER BY id DESC LIMIT 300').all())));

/* ---------- backup ---------- */
app.post('/api/backup/create', wrap(async (req, res) => ok(res, await backup.createBackup(req.body && req.body.folder))));
app.get('/api/backup/list', wrap((req, res) => ok(res, { backups: backup.listBackups(req.query.folder), last: settings.get('last_backup'), age_hours: backup.backupAgeHours() })));
app.get('/api/backup/usb', wrap(async (req, res) => ok(res, await backup.usbDrives())));
app.get('/api/backup/download', wrap((req, res) => { const f = path.basename(String(req.query.name || '')); const full = path.join(settings.get('system').backup_folder || path.join(UP, 'backups'), f); if (!/^backup_.*\.zip$/.test(f) || !fs.existsSync(full)) throw new Error('Not found'); res.download(full); }));
app.post('/api/backup/restore', adminOnly, upload.single('file'), wrap((req, res) => {
  /* accepts either an uploaded ZIP (multipart) or a server-side path from the list */
  const zipPath = req.file ? req.file.path : req.body && req.body.path; if (!zipPath) throw new Error('Choose a backup file');
  if (String(req.query.confirm) !== 'RESTORE') throw new Error('Type RESTORE to confirm');
  backup.stageRestore(zipPath); audit(req.user.username, 'RESTORE_BACKUP', 'system', null); ok(res, { restarting: true });
  setTimeout(() => process.exit(75), 700); /* start.bat restarts the server on exit code 75 */
}));

/* ---------- intake folder watcher (imaging machine) ---------- */
fs.mkdirSync(path.join(UP, 'intake'), { recursive: true });
chokidar.watch(path.join(UP, 'intake'), { ignoreInitial: false, depth: 0, awaitWriteFinish: { stabilityThreshold: 1500, pollInterval: 300 } }).on('add', f => {
  try {
    if (!/\.(jpe?g|png|bmp|tiff?|gif|webp|dcm)$/i.test(f)) return; const rel = '/uploads/intake/' + path.basename(f);
    if (db.prepare('SELECT 1 FROM images WHERE file_path=?').get(rel)) return;
    const m = /^(?:PID[_-]?)?(\d+)[_-]/i.exec(path.basename(f)); let pid = null, fp = rel;
    if (m && db.prepare('SELECT 1 FROM patients WHERE id=? AND deleted_at IS NULL').get(m[1])) { pid = Number(m[1]); const dir = path.join(UP, 'xrays', String(pid)); fs.mkdirSync(dir, { recursive: true }); fs.renameSync(f, path.join(dir, path.basename(f))); fp = `/uploads/xrays/${pid}/${path.basename(f)}`; }
    db.prepare('INSERT INTO images(patient_id,file_path,type,date,time,notes) VALUES(?,?,?,?,?,?)').run(pid, fp, 'xray', today(), nowTime(), 'Auto-imported from intake folder');
    console.log('[intake]', path.basename(f), pid ? '-> patient ' + pid : '(unassigned)');
  } catch (e) { console.error('[intake]', e.message); }
});

/* ---------- schedulers ---------- */
cron.schedule('0 * * * *', () => { try { reminders.generate(); } catch (e) { console.error(e.message); } });
cron.schedule('30 3 * * *', () => { try { db.prepare("DELETE FROM sessions WHERE expires<?").run(Date.now()); SOFT.forEach(t => db.prepare(`DELETE FROM ${t} WHERE deleted_at IS NOT NULL AND deleted_at < datetime('now','-30 days')`).run()); } catch (e) { console.error(e.message); } });
const abH = () => settings.get('system').autobackup_hours || 6;
setInterval(() => { const a = backup.backupAgeHours(); if (a === null || a >= abH()) backup.createBackup().then(r => console.log('[backup] auto ->', r.file)).catch(e => console.error('[backup]', e.message)); }, 10 * 60 * 1000);
setTimeout(() => { const a = backup.backupAgeHours(); if (a === null || a >= abH()) backup.createBackup().catch(e => console.error('[backup]', e.message)); }, 20 * 1000);
try { reminders.generate(); } catch (e) { console.error(e.message); }

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));
app.listen(PORT, HOST, () => {
  const url = `http://${HOST}:${PORT}`; console.log(`\n  Noor Dental Clinic running at ${url}\n  (Ctrl+C to stop)\n`);
  if (!process.env.NO_OPEN && process.platform === 'win32') exec(`start "" "${url}"`); else if (!process.env.NO_OPEN && process.platform === 'darwin') exec(`open ${url}`);
});
