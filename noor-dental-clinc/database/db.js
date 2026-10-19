'use strict';
/* Noor Dental Clinic - SQLite layer (Node's built-in node:sqlite, WAL mode, foreign keys ON)
   NOTE: previously used the native "better-sqlite3" package, which requires a compiled
   binary for every Node/V8 ABI version. On Node 24 no prebuilt binary is published yet,
   so npm fell back to compiling from source with node-gyp - which needs Visual Studio's
   C++ build tools. Those aren't installed, so `npm install` failed.
   Fix: Node 24 ships a built-in SQLite driver (node:sqlite / DatabaseSync). It needs no
   npm package at all and no native compilation, so this removes the problem entirely.
   A small compatibility shim below gives it the same .prepare()/.pragma()/.transaction()/
   .backup() surface that the rest of this app (server.js, lib/*.js) already calls, so no
   other file had to change. */
const path = require('path');
const fs = require('fs');
const { DatabaseSync, backup: sqliteBackup } = require('node:sqlite');
const bcrypt = require('bcryptjs');

/* node:sqlite is stable as of Node 24 but older 22.x/23.x builds still print a one-time
   "ExperimentalWarning: SQLite is an experimental feature" notice. Silence only that
   specific warning so real errors/warnings still show up normally. */
const _origEmit = process.emit;
process.emit = function (event, warning, ...rest) {
  if (event === 'warning' && warning && /SQLite/i.test(warning.message || '')) return false;
  return _origEmit.call(process, event, warning, ...rest);
};

const DB_PATH = path.join(__dirname, 'noor_dental.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
/* Apply a pending restore (staged by /api/backup/restore) BEFORE the DB is opened */
const PENDING = path.join(__dirname, 'restore_pending', 'noor_dental.db');
if (fs.existsSync(PENDING)) {
  for (const ext of ['-wal', '-shm']) { try { fs.unlinkSync(DB_PATH + ext); } catch {} }
  fs.copyFileSync(PENDING, DB_PATH);
  fs.rmSync(path.join(__dirname, 'restore_pending'), { recursive: true, force: true });
}

const _native = new DatabaseSync(DB_PATH);

/* Compatibility facade: mirrors the small slice of the better-sqlite3 API this project
   uses (prepare/exec/pragma/transaction/backup/close), backed by node:sqlite. */
const db = {
  prepare(sql) { return _native.prepare(sql); },
  exec(sql) { return _native.exec(sql); },
  pragma(expr) { return _native.exec(`PRAGMA ${expr}`); },
  transaction(fn) {
    return (...args) => {
      _native.exec('BEGIN');
      try {
        const result = fn(...args);
        _native.exec('COMMIT');
        return result;
      } catch (err) {
        try { _native.exec('ROLLBACK'); } catch {}
        throw err;
      }
    };
  },
  backup(destPath, options) { return sqliteBackup(_native, destPath, options || {}); },
  close() { return _native.close(); },
};

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const D = 'deleted_at TEXT, deleted_reason TEXT';
db.exec(`
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin', full_name TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS patients(id INTEGER PRIMARY KEY, full_name TEXT NOT NULL, urdu_name TEXT, cnic TEXT, phone TEXT,
  whatsapp TEXT, email TEXT, age INTEGER, dob TEXT, gender TEXT, address TEXT, medical_history TEXT, allergies TEXT, photo TEXT,
  notes TEXT, guarantor TEXT, signature TEXT, custom_fields_json TEXT DEFAULT '{}', created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP, ${D});
CREATE TABLE IF NOT EXISTS appointments(id INTEGER PRIMARY KEY, patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
  date TEXT NOT NULL, time TEXT NOT NULL, duration INTEGER DEFAULT 30, treatment TEXT, doctor TEXT DEFAULT 'Dr. M. AlNoor Orakzai',
  status TEXT DEFAULT 'Scheduled', notes TEXT, reminder_flag INTEGER DEFAULT 1, color_tag TEXT DEFAULT '#3B82F6',
  recurrence TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, ${D});
CREATE TABLE IF NOT EXISTS waiting_list(id INTEGER PRIMARY KEY, patient_id INTEGER REFERENCES patients(id) ON DELETE SET NULL,
  name TEXT, phone TEXT, treatment TEXT, notes TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, ${D});
CREATE TABLE IF NOT EXISTS treatments(id INTEGER PRIMARY KEY, patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  name TEXT NOT NULL, tooth_no TEXT, notes TEXT, cost REAL DEFAULT 0, date TEXT, doctor TEXT, ${D});
CREATE TABLE IF NOT EXISTS ortho_records(id INTEGER PRIMARY KEY, patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  visit_no INTEGER, date TEXT, upper_wire TEXT, lower_wire TEXT, ties TEXT, elastics TEXT, tooth_notes_json TEXT DEFAULT '{}',
  photos_json TEXT DEFAULT '[]', next_visit TEXT, notes TEXT, ${D});
CREATE TABLE IF NOT EXISTS expenses(id INTEGER PRIMARY KEY, date TEXT NOT NULL, time TEXT, category TEXT, amount REAL NOT NULL,
  paid_to TEXT, method TEXT DEFAULT 'Cash', notes TEXT, receipt_image TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, ${D});
CREATE TABLE IF NOT EXISTS ledger(id INTEGER PRIMARY KEY, date TEXT NOT NULL, time TEXT, type TEXT NOT NULL,
  patient_id INTEGER REFERENCES patients(id) ON DELETE SET NULL, amount REAL NOT NULL, method TEXT DEFAULT 'Cash', tid TEXT,
  sender TEXT, screenshot TEXT, account TEXT, category TEXT, notes TEXT, ref_id INTEGER, ref_type TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP, ${D});
CREATE TABLE IF NOT EXISTS accounts(id INTEGER PRIMARY KEY, name TEXT NOT NULL, type TEXT DEFAULT 'Bank', opening_balance REAL DEFAULT 0, notes TEXT, ${D});
CREATE TABLE IF NOT EXISTS pos_sales(id INTEGER PRIMARY KEY, patient_id INTEGER REFERENCES patients(id) ON DELETE SET NULL,
  date TEXT, time TEXT, items_json TEXT, subtotal REAL, discount REAL DEFAULT 0, tax REAL DEFAULT 0, total REAL,
  paid REAL DEFAULT 0, payment_json TEXT, doctor TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, ${D});
CREATE TABLE IF NOT EXISTS services(id INTEGER PRIMARY KEY, name TEXT NOT NULL, urdu_name TEXT, price REAL DEFAULT 0, category TEXT,
  active INTEGER DEFAULT 1, ${D});
CREATE TABLE IF NOT EXISTS images(id INTEGER PRIMARY KEY, patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL, type TEXT DEFAULT 'xray', tooth_no TEXT, site TEXT, date TEXT, time TEXT, notes TEXT, ${D});
CREATE TABLE IF NOT EXISTS files(id INTEGER PRIMARY KEY, patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL, original_name TEXT, date TEXT, notes TEXT, ${D});
CREATE TABLE IF NOT EXISTS reminders(id INTEGER PRIMARY KEY, patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
  type TEXT, due_date TEXT, message TEXT, status TEXT DEFAULT 'Pending', channel TEXT, ref_key TEXT UNIQUE,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP, ${D});
CREATE TABLE IF NOT EXISTS whatsapp_log(id INTEGER PRIMARY KEY, patient_id INTEGER, phone TEXT, message TEXT,
  sent_at TEXT DEFAULT CURRENT_TIMESTAMP, status TEXT DEFAULT 'Opened');
CREATE TABLE IF NOT EXISTS queue(id INTEGER PRIMARY KEY, patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  date TEXT NOT NULL, token_no INTEGER NOT NULL, status TEXT DEFAULT 'Waiting', reason TEXT, checkin_at TEXT, called_at TEXT, done_at TEXT,
  notes TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, ${D});
CREATE TABLE IF NOT EXISTS labs(id INTEGER PRIMARY KEY, patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  lab_name TEXT NOT NULL, test_type TEXT, sample_desc TEXT, tooth_no TEXT, sent_date TEXT, expected_date TEXT, received_date TEXT,
  status TEXT DEFAULT 'Pending', sent_by TEXT, cost REAL DEFAULT 0, notes TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, ${D});
CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, value TEXT);
CREATE TABLE IF NOT EXISTS audit_log(id INTEGER PRIMARY KEY, user TEXT, action TEXT, "table" TEXT, record_id INTEGER,
  old_val TEXT, new_val TEXT, timestamp TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS ix_pat_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS ix_treat_patient ON treatments(patient_id, date);
CREATE INDEX IF NOT EXISTS ix_ledger_patient ON ledger(patient_id, date);
CREATE INDEX IF NOT EXISTS ix_sales_patient ON pos_sales(patient_id);
CREATE INDEX IF NOT EXISTS ix_appt_date ON appointments(date);
CREATE INDEX IF NOT EXISTS ix_ledger_date ON ledger(date);
CREATE INDEX IF NOT EXISTS ix_pos_date ON pos_sales(date);
CREATE INDEX IF NOT EXISTS ix_exp_date ON expenses(date);
CREATE INDEX IF NOT EXISTS ix_queue_date ON queue(date, token_no);
CREATE INDEX IF NOT EXISTS ix_labs_status ON labs(status, sent_date);
`);

/* Migration: add register-style columns to an already-existing patients table
   (CREATE TABLE IF NOT EXISTS above only applies to a brand-new database). */
{
  const have = new Set(db.prepare('PRAGMA table_info(patients)').all().map(c => c.name));
  if (!have.has('guarantor')) db.exec('ALTER TABLE patients ADD COLUMN guarantor TEXT');
  if (!have.has('signature')) db.exec('ALTER TABLE patients ADD COLUMN signature TEXT');
}

/* ---- default settings (all editable from the Settings page) ---- */
const DEFAULT_SETTINGS = {
  clinic: { name: 'Noor Dental Clinic', doctor: 'Dr. M. AlNoor Orakzai', address: 'Alshifa Medical & Surgical Center, Thall Road, Hangu',
    whatsapp: '03329610000', phone: '0331-3536136', email: 'dentist.alnoor@gmail.com', developer: 'Muhammad Hasin (Engineer)' },
  theme: { mode: 'light', primary: '#2F9BE0', accent: '#53AFF0', bg: '#FFFFFF', radius: 16, fontSize: 15 },
  hours: { open: '08:00', close: '18:00', slot: 30, days: [1, 2, 3, 4, 5, 6] },
  expense_categories: ['Rent', 'Electricity', 'Dental Supplies', 'Lab', 'Salary', 'Misc'],
  lab_locations: ['Islamabad', 'Peshawar'],
  lab_tests: ['Crown', 'Bridge', 'Denture', 'Impression / Mould', 'Braces Wire', 'Retainer', 'Other'],
  colors: { Scheduled: '#3B82F6', Confirmed: '#10B981', Completed: '#6B7280', Cancelled: '#EF4444', 'No-show': '#F59E0B' },
  doctors: ['Dr. M. AlNoor Orakzai'],
  templates: {
    confirmation: 'Assalam o Alaikum {name}, your appointment at {clinic} is confirmed for {date} at {time}. - {doctor}',
    reminder: 'Assalam o Alaikum {name}, reminder: you have an appointment at {clinic} tomorrow ({date}) at {time}. Please confirm.',
    payment: 'Assalam o Alaikum {name}, a gentle reminder that PKR {amount} is pending at {clinic}. JazakAllah.',
    followup: 'Assalam o Alaikum {name}, how are you feeling after your treatment? Please contact {clinic} if you have any concern.',
    birthday: 'Happy Birthday {name}! 🎂 Wishing you a healthy smile from all of us at {clinic}.',
    custom: 'Assalam o Alaikum {name}, '
  },
  pos: { tax_enabled: false, tax_percent: 0, receipt_size: '80mm', currency: 'PKR' },
  pdf: { header: 'Noor Dental Clinic', footer: 'Alshifa Medical & Surgical Center, Thall Road, Hangu | 0331-3536136', watermark: 'NOOR DENTAL CLINIC', color: '#2F9BE0' },
  system: { session_hours: 8, autobackup_hours: 6, backup_folder: '', whatsapp_automation: false, remember_days: 30 }
};
const getS = db.prepare('SELECT value FROM settings WHERE key=?');
const putS = db.prepare('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value');
for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) if (!getS.get(k)) putS.run(k, JSON.stringify(v));
/* One-time migration: an older install may already have the old dark/blue theme saved in its database,
   which would silently override the new white/light-blue branding. Re-apply the new defaults exactly once;
   after that, any theme changes made from Settings are respected normally and never touched again. */
if (!getS.get('theme_migrated_v2')) {
  putS.run('theme', JSON.stringify(DEFAULT_SETTINGS.theme));
  const cur = getS.get('pdf'); const pdf = cur ? { ...JSON.parse(cur.value), color: DEFAULT_SETTINGS.pdf.color } : DEFAULT_SETTINGS.pdf; putS.run('pdf', JSON.stringify(pdf));
  putS.run('theme_migrated_v2', JSON.stringify(true));
}

if (!db.prepare('SELECT 1 FROM users LIMIT 1').get()) {
  db.prepare('INSERT INTO users(username,password_hash,role,full_name) VALUES(?,?,?,?)')
    .run('admin', bcrypt.hashSync('admin123', 10), 'admin', 'Dr. M. AlNoor Orakzai');
}
if (!db.prepare('SELECT 1 FROM accounts LIMIT 1').get()) {
  const ia = db.prepare('INSERT INTO accounts(name,type,opening_balance) VALUES(?,?,0)');
  ['Cash Drawer', 'EasyPaisa', 'JazzCash', 'Bank Account'].forEach(n => ia.run(n, n === 'Bank Account' ? 'Bank' : n === 'Cash Drawer' ? 'Cash' : 'Wallet'));
}
if (!db.prepare('SELECT 1 FROM services LIMIT 1').get()) {
  const is = db.prepare('INSERT INTO services(name,urdu_name,price,category) VALUES(?,?,?,?)');
  [['Checkup', '', 500, 'General'], ['Scaling & Polishing', '', 3000, 'Hygiene'], ['Filling', '', 2500, 'Restorative'],
   ['Root Canal (RCT)', '', 12000, 'Endo'], ['Extraction', '', 1500, 'Surgery'], ['Crown', '', 10000, 'Prosthetics'],
   ['Braces', '', 60000, 'Ortho'], ['X-ray (IOPA)', '', 500, 'Imaging'], ['Whitening', '', 8000, 'Cosmetic']]
    .forEach(r => is.run(...r));
}

const settings = {
  get(key) { const r = getS.get(key); return r ? JSON.parse(r.value) : DEFAULT_SETTINGS[key]; },
  set(key, val) { putS.run(key, JSON.stringify(val)); },
  all() { const o = {}; for (const r of db.prepare('SELECT key,value FROM settings').all()) { try { o[r.key] = JSON.parse(r.value); } catch { o[r.key] = r.value; } } return o; }
};
module.exports = { db, settings, DB_PATH, DEFAULT_SETTINGS };
