'use strict';
/* Auto-generated reminders (idempotent via ref_key UNIQUE) */
const { db, settings } = require('../database/db');
const { patientBalance } = require('./pdf');
const ymd = d => d.toISOString().slice(0, 10);
const addDays = (s, n) => { const d = new Date(s + 'T00:00:00'); d.setDate(d.getDate() + n); return ymd(new Date(d.getTime() - d.getTimezoneOffset() * 6e4)); };
const today = () => { const d = new Date(); return ymd(new Date(d.getTime() - d.getTimezoneOffset() * 6e4)); };
const fill = (t, o) => t.replace(/\{(\w+)\}/g, (_, k) => (o[k] ?? ''));

function generate() {
  const T = settings.get('templates'), C = settings.get('clinic'); const now = today(); let n = 0;
  const ins = db.prepare('INSERT OR IGNORE INTO reminders(patient_id,type,due_date,message,channel,ref_key) VALUES(?,?,?,?,?,?)');
  const run = (...a) => { n += ins.run(...a).changes; };
  /* appointments in the next 7 days -> remind 24h before */
  db.prepare("SELECT a.*,p.full_name FROM appointments a JOIN patients p ON p.id=a.patient_id WHERE a.deleted_at IS NULL AND a.reminder_flag=1 AND a.status IN ('Scheduled','Confirmed') AND a.date BETWEEN ? AND ?").all(now, addDays(now, 7))
    .forEach(a => run(a.patient_id, 'Appointment', addDays(a.date, -1) < now ? now : addDays(a.date, -1), fill(T.reminder, { name: a.full_name, date: a.date, time: a.time, clinic: C.name, doctor: C.doctor }), 'whatsapp', `appt:${a.id}:${a.date}:${a.time}`));
  /* ortho next visit */
  db.prepare("SELECT o.*,p.full_name FROM ortho_records o JOIN patients p ON p.id=o.patient_id WHERE o.deleted_at IS NULL AND o.next_visit BETWEEN ? AND ?").all(now, addDays(now, 7))
    .forEach(o => run(o.patient_id, 'Ortho next visit', addDays(o.next_visit, -1) < now ? now : addDays(o.next_visit, -1), fill(T.reminder, { name: o.full_name, date: o.next_visit, time: '', clinic: C.name, doctor: C.doctor }), 'whatsapp', `ortho:${o.id}:${o.next_visit}`));
  /* follow-up: treatment in last 2 days */
  db.prepare("SELECT t.*,p.full_name FROM treatments t JOIN patients p ON p.id=t.patient_id WHERE t.deleted_at IS NULL AND t.date BETWEEN ? AND ?").all(addDays(now, -2), now)
    .forEach(t => run(t.patient_id, 'Follow-up', now, fill(T.followup, { name: t.full_name, clinic: C.name, doctor: C.doctor }), 'whatsapp', `fu:${t.id}`));
  /* payment due (once a month per patient with balance) */
  db.prepare("SELECT id,full_name FROM patients WHERE deleted_at IS NULL AND id IN (SELECT DISTINCT patient_id FROM pos_sales WHERE deleted_at IS NULL AND patient_id IS NOT NULL)").all()
    .forEach(p => { const b = patientBalance(p.id).balance; if (b > 0) run(p.id, 'Payment due', now, fill(T.payment, { name: p.full_name, amount: b.toLocaleString(), clinic: C.name }), 'whatsapp', `pay:${p.id}:${now.slice(0, 7)}`); });
  /* birthdays */
  const md = now.slice(5);
  db.prepare("SELECT id,full_name,dob FROM patients WHERE deleted_at IS NULL AND dob IS NOT NULL AND substr(dob,6)=?").all(md)
    .forEach(p => run(p.id, 'Birthday', now, fill(T.birthday, { name: p.full_name, clinic: C.name }), 'whatsapp', `bd:${p.id}:${now.slice(0, 4)}`));
  return n;
}
module.exports = { generate, today, addDays };
