'use strict';
/* Sample data seeder:  npm run seed   (adds demo data; safe to run once) */
const { db } = require('./db'); const { today, addDays } = require('../lib/reminders');
if (db.prepare('SELECT COUNT(*) c FROM patients').get().c > 0) { console.log('Patients already exist - seeding skipped.'); process.exit(0); }
const d0 = today();
const P = [
  ['Ahmad Khan', '', '14101-1234567-1', '03001234567', 25, 'Male', 'Hangu City'], ['Sana Bibi', '', '14101-2345678-2', '03111234567', 31, 'Female', 'Thall Road, Hangu'],
  ['Imran Ali', '', '14101-3456789-3', '03211234567', 19, 'Male', 'Doaba, Hangu'], ['Fatima Noor', '', '14101-4567890-4', '03331234567', 14, 'Female', 'Hangu'],
  ['Zubair Shah', '', '14101-5678901-5', '03451234567', 42, 'Male', 'Kohat Road'], ['Ayesha Gul', '', '14101-6789012-6', '03021234567', 28, 'Female', 'Orakzai'],
  ['Bilal Hussain', '', '14101-7890123-7', '03151234567', 36, 'Male', 'Hangu'], ['Mariam Khan', '', '14101-8901234-8', '03231234567', 22, 'Female', 'Thall']];
const ip = db.prepare('INSERT INTO patients(full_name,urdu_name,cnic,phone,whatsapp,age,gender,address,medical_history,allergies) VALUES(?,?,?,?,?,?,?,?,?,?)');
P.forEach(p => ip.run(p[0], p[1], p[2], p[3], p[3], p[4], p[5], p[6], 'None significant', 'None'));
const ia = db.prepare('INSERT INTO appointments(patient_id,date,time,duration,treatment,status,color_tag) VALUES(?,?,?,?,?,?,?)');
[[1, d0, '09:00', 30, 'Checkup', 'Confirmed', '#10B981'], [2, d0, '10:00', 45, 'Scaling & Polishing', 'Scheduled', '#3B82F6'], [3, d0, '11:30', 60, 'Root Canal (RCT)', 'Scheduled', '#3B82F6'],
 [4, addDays(d0, 1), '09:30', 30, 'Braces', 'Scheduled', '#3B82F6'], [5, addDays(d0, 1), '12:00', 30, 'Filling', 'Confirmed', '#10B981'], [6, addDays(d0, -2), '10:00', 30, 'Extraction', 'Completed', '#6B7280'],
 [7, addDays(d0, -5), '15:00', 30, 'Checkup', 'No-show', '#F59E0B'], [8, addDays(d0, 3), '16:00', 30, 'Crown', 'Scheduled', '#3B82F6']].forEach(a => ia.run(...a));
const sale = (pid, day, items, paid, method) => {
  const sub = items.reduce((s, i) => s + i.price * i.qty, 0);
  const r = db.prepare('INSERT INTO pos_sales(patient_id,date,time,items_json,subtotal,discount,tax,total,paid,payment_json,doctor) VALUES(?,?,?,?,?,0,0,?,?,?,?)').run(pid, day, '10:30', JSON.stringify(items), sub, sub, paid, JSON.stringify([{ method, amount: paid }]), 'Dr. M. AlNoor Orakzai');
  if (paid) db.prepare("INSERT INTO ledger(date,time,type,patient_id,amount,method,account,category,notes,ref_id,ref_type) VALUES(?,?,'in',?,?,?,?,'Treatment',?,?,'pos')").run(day, '10:30', pid, paid, method, method === 'Cash' ? 'Cash Drawer' : method, 'POS #' + r.lastInsertRowid, r.lastInsertRowid);
  items.forEach(i => db.prepare('INSERT INTO treatments(patient_id,name,cost,date,doctor) VALUES(?,?,?,?,?)').run(pid, i.name, i.price * i.qty, day, 'Dr. M. AlNoor Orakzai'));
};
for (let i = 0; i < 12; i++) sale(1 + (i % 8), addDays(d0, -i * 2), [{ name: i % 2 ? 'Filling' : 'Scaling & Polishing', price: i % 2 ? 2500 : 3000, qty: 1 }], i % 3 === 0 ? 1500 : (i % 2 ? 2500 : 3000), ['Cash', 'EasyPaisa', 'JazzCash', 'Bank Transfer'][i % 4]);
[['Rent', 25000, 'Cash'], ['Electricity', 6800, 'Cash'], ['Dental Supplies', 9200, 'Bank Transfer'], ['Lab', 4500, 'Cash'], ['Salary', 30000, 'Cash']].forEach(([c, a, m], i) => {
  const r = db.prepare('INSERT INTO expenses(date,time,category,amount,paid_to,method) VALUES(?,?,?,?,?,?)').run(addDays(d0, -i), '13:00', c, a, c + ' vendor', m);
  db.prepare("INSERT INTO ledger(date,time,type,amount,method,account,category,notes,ref_id,ref_type) VALUES(?,?,'out',?,?,?,?,?,?,'expense')").run(addDays(d0, -i), '13:00', a, m, m === 'Cash' ? 'Cash Drawer' : 'Bank Account', c, 'Expense: ' + c, r.lastInsertRowid);
});
const io = db.prepare('INSERT INTO ortho_records(patient_id,visit_no,date,upper_wire,lower_wire,ties,elastics,tooth_notes_json,next_visit) VALUES(?,?,?,?,?,?,?,?,?)');
io.run(4, 1, addDays(d0, -60), '0.014 NiTi', '0.014 NiTi', 'Blue O-tie', '', '{"11":"Bracket bonded","21":"Bracket bonded"}', addDays(d0, -30));
io.run(4, 2, addDays(d0, -30), '0.016 NiTi', '0.016 NiTi', 'Silver chain', '3/16 Class II', '{"13":"Rotation correcting"}', addDays(d0, 2));
console.log('Sample data added: 8 patients, appointments, sales, expenses, ortho records.');
