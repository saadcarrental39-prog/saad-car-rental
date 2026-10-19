'use strict';
/* PDF generation (pdfkit) - dossier, ortho report, receipt, generic table report */
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { db, settings } = require('../database/db');
const ROOT = path.join(__dirname, '..');
const LOGO = path.join(ROOT, 'assets', 'logo.png');
const fmt = n => 'PKR ' + Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });
const fileOf = p => (p ? path.join(ROOT, p.replace(/^\/+/, '')) : null);
const okImg = p => { const f = fileOf(p); return f && fs.existsSync(f) && /\.(jpe?g|png)$/i.test(f) ? f : null; };

function newDoc(opts = {}) {
  const cfg = settings.get('pdf');
  const doc = new PDFDocument({ size: opts.size || 'A4', margin: 40, bufferPages: true, ...(opts.extra || {}) });
  doc._cfg = cfg;
  return doc;
}
/* watermark + header + footer on every page, applied at the end (bufferPages) */
function decorate(doc, title) {
  const cfg = doc._cfg; const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    const { width: w, height: h } = doc.page;
    doc.save();
    doc.fillColor('#999').fillOpacity(0.07).fontSize(58).rotate(-35, { origin: [w / 2, h / 2] })
      .text(cfg.watermark || '', 0, h / 2 - 30, { width: w, align: 'center', lineBreak: false });
    doc.restore(); doc.fillOpacity(1);
    if (i > range.start || !doc._cover) {
      doc.save(); doc.rect(0, 0, w, 26).fill(cfg.color || '#2F9BE0');
      doc.fillColor('#fff').fontSize(9).font('Helvetica-Bold').text(cfg.header || '', 40, 9, { lineBreak: false });
      doc.font('Helvetica').text(title || '', 0, 9, { width: w - 40, align: 'right', lineBreak: false }); doc.restore();
    }
    doc.save(); doc.fillColor('#666').fontSize(8).font('Helvetica')
      .text((cfg.footer || '') + '   |   Page ' + (i - range.start + 1) + ' of ' + range.count, 40, h - 30, { width: w - 80, align: 'center', lineBreak: false });
    doc.restore();
  }
}
function h1(doc, text) {
  if (doc.y > 720) doc.addPage();
  doc.moveDown(0.6).fontSize(13).font('Helvetica-Bold').fillColor(doc._cfg.color || '#2F9BE0').text(text);
  const y = doc.y + 1; doc.moveTo(40, y).lineTo(doc.page.width - 40, y).strokeColor(doc._cfg.color || '#2F9BE0').lineWidth(1).stroke();
  doc.moveDown(0.4).fillColor('#111').font('Helvetica').fontSize(10);
}
function kv(doc, k, v) { if (doc.y > 760) doc.addPage(); doc.font('Helvetica-Bold').text(k + ': ', { continued: true }).font('Helvetica').text(v == null || v === '' ? '-' : String(v)); }
function table(doc, cols, rows, widths) {
  const total = doc.page.width - 80; const sum = widths.reduce((a, b) => a + b, 0);
  const w = widths.map(x => (x / sum) * total);
  const head = () => {
    let x = 40; const y = doc.y; doc.rect(40, y - 2, total, 16).fill(doc._cfg.color || '#2F9BE0'); doc.fillColor('#fff').font('Helvetica-Bold').fontSize(8.5);
    cols.forEach((c, i) => { doc.text(c, x + 3, y + 1, { width: w[i] - 6, lineBreak: false }); x += w[i]; });
    doc.y = y + 18; doc.fillColor('#111').font('Helvetica').fontSize(8.5);
  };
  head();
  rows.forEach((r, ri) => {
    if (doc.y > 770) { doc.addPage(); doc.y = 40; head(); }
    const y = doc.y; let x = 40; let hMax = 12;
    r.forEach((c, i) => { hMax = Math.max(hMax, doc.heightOfString(String(c ?? ''), { width: w[i] - 6 })); });
    if (y + hMax > 780) { doc.addPage(); doc.y = 40; head(); }
    const yy = doc.y; if (ri % 2) doc.rect(40, yy - 1, total, hMax + 3).fill('#F1F5F9'); doc.fillColor('#111');
    r.forEach((c, i) => { doc.text(String(c ?? ''), x + 3, yy, { width: w[i] - 6 }); x += w[i]; });
    doc.y = yy + hMax + 3;
  });
  doc.moveDown(0.3).fontSize(10);
}
function imageGrid(doc, items) {
  let x = 40, col = 0; const cw = 165, ch = 125;
  items.forEach(it => {
    const f = okImg(it.file_path); if (!f) return;
    if (col === 0 && doc.y + ch + 30 > 780) doc.addPage();
    if (col === 0) x = 40;
    const y = doc.y;
    try { doc.image(f, x, y, { fit: [cw, ch] }); } catch { return; }
    doc.fontSize(7.5).fillColor('#444').text(`${it.date || ''} ${it.tooth_no ? '| Tooth ' + it.tooth_no : ''} ${it.site ? '| ' + it.site : ''}`, x, y + ch + 2, { width: cw, lineBreak: false });
    col++; x += cw + 10;
    if (col === 3) { col = 0; doc.y = y + ch + 18; } else doc.y = y;
  });
  if (col) doc.y += ch + 18; doc.fillColor('#111').fontSize(10);
}
function patientBalance(pid) {
  const s = db.prepare('SELECT COALESCE(SUM(total),0) t FROM pos_sales WHERE patient_id=? AND deleted_at IS NULL').get(pid).t;
  const p = db.prepare("SELECT COALESCE(SUM(amount),0) t FROM ledger WHERE patient_id=? AND type='in' AND deleted_at IS NULL").get(pid).t;
  const r = db.prepare("SELECT COALESCE(SUM(amount),0) t FROM ledger WHERE patient_id=? AND type='out' AND category='Refund' AND deleted_at IS NULL").get(pid).t;
  return { charged: s, paid: p, refunded: r, balance: s - p + r };
}

function dossier(pid, stream) {
  const P = db.prepare('SELECT * FROM patients WHERE id=?').get(pid); if (!P) throw new Error('Patient not found');
  const clinic = settings.get('clinic'); const doc = newDoc(); doc._cover = true; doc.pipe(stream);
  const col = doc._cfg.color || '#2F9BE0';
  /* cover */
  doc.rect(0, 0, doc.page.width, 250).fill(col);
  if (fs.existsSync(LOGO)) doc.image(LOGO, doc.page.width / 2 - 55, 40, { width: 110 });
  doc.fillColor('#fff').font('Helvetica-Bold').fontSize(26).text(clinic.name, 0, 165, { align: 'center' });
  doc.fontSize(11).font('Helvetica').text(clinic.doctor + '  |  ' + clinic.address, { align: 'center' });
  doc.fillColor('#111').fontSize(22).font('Helvetica-Bold').text('PATIENT DOSSIER', 0, 290, { align: 'center' });
  const ph = okImg(P.photo);
  if (ph) { try { doc.image(ph, doc.page.width / 2 - 60, 330, { fit: [120, 140], align: 'center' }); } catch {} }
  doc.fontSize(18).text(P.full_name, 0, 490, { align: 'center' });
  doc.font('Helvetica').fontSize(11).fillColor('#444').text('Patient ID: NDC-' + String(P.id).padStart(5, '0'), { align: 'center' })
    .text('Generated: ' + new Date().toLocaleString(), { align: 'center' });
  doc.addPage(); doc.y = 45; doc.fillColor('#111').font('Helvetica').fontSize(10);
  h1(doc, 'Personal Information');
  [['Name', P.full_name], ['Urdu name', P.urdu_name], ['CNIC', P.cnic], ['Phone', P.phone], ['WhatsApp', P.whatsapp], ['Email', P.email],
   ['Age', P.age], ['Date of birth', P.dob], ['Gender', P.gender], ['Address', P.address]].forEach(([k, v]) => kv(doc, k, v));
  let cf = {}; try { cf = JSON.parse(P.custom_fields_json || '{}'); } catch {}
  Object.entries(cf).forEach(([k, v]) => kv(doc, k, v));
  h1(doc, 'Medical History'); kv(doc, 'History', P.medical_history); kv(doc, 'Allergies', P.allergies); kv(doc, 'Notes', P.notes);
  const T = db.prepare('SELECT * FROM treatments WHERE patient_id=? AND deleted_at IS NULL ORDER BY date').all(pid);
  h1(doc, 'Visits & Treatments');
  const A = db.prepare('SELECT * FROM appointments WHERE patient_id=? AND deleted_at IS NULL ORDER BY date,time').all(pid);
  if (A.length) table(doc, ['Date', 'Time', 'Treatment', 'Doctor', 'Status'], A.map(a => [a.date, a.time, a.treatment, a.doctor, a.status]), [2, 1.2, 3, 3, 2]);
  if (T.length) table(doc, ['Date', 'Treatment', 'Tooth', 'Cost', 'Notes'], T.map(t => [t.date, t.name, t.tooth_no, fmt(t.cost), t.notes]), [2, 3, 1.2, 2, 4]);
  else doc.text('No treatments recorded.');
  const IM = db.prepare('SELECT * FROM images WHERE patient_id=? AND deleted_at IS NULL ORDER BY date').all(pid);
  h1(doc, 'X-rays & Photos'); if (IM.length) imageGrid(doc, IM); else doc.text('No images.');
  const O = db.prepare('SELECT * FROM ortho_records WHERE patient_id=? AND deleted_at IS NULL ORDER BY visit_no').all(pid);
  h1(doc, 'Orthodontic Tie Sheet History');
  if (O.length) table(doc, ['#', 'Date', 'Upper wire', 'Lower wire', 'Ties', 'Elastics', 'Next visit'], O.map(o => [o.visit_no, o.date, o.upper_wire, o.lower_wire, o.ties, o.elastics, o.next_visit]), [.7, 1.8, 2.4, 2.4, 2, 2, 1.8]);
  else doc.text('No orthodontic records.');
  const L = db.prepare('SELECT * FROM ledger WHERE patient_id=? AND deleted_at IS NULL ORDER BY date,time').all(pid);
  h1(doc, 'Payment Ledger');
  if (L.length) table(doc, ['Date', 'Type', 'Method', 'Amount', 'TID', 'Notes'], L.map(l => [l.date, l.type === 'in' ? 'Paid' : 'Out', l.method, fmt(l.amount), l.tid, l.notes]), [1.8, 1.2, 2, 2, 2, 4]);
  const B = patientBalance(pid);
  kv(doc, 'Total billed', fmt(B.charged)); kv(doc, 'Total paid', fmt(B.paid)); doc.font('Helvetica-Bold').fillColor('#B91C1C'); kv(doc, 'OUTSTANDING BALANCE', fmt(B.balance)); doc.fillColor('#111');
  h1(doc, "Doctor's Notes"); doc.text(P.notes || ' ', { height: 60 });
  doc.moveDown(3); const y = doc.y; doc.moveTo(380, y).lineTo(555, y).strokeColor('#000').lineWidth(.7).stroke();
  doc.fontSize(9).text('Signature — ' + clinic.doctor, 380, y + 3);
  decorate(doc, 'Dossier: ' + P.full_name); doc.end();
}
function orthoReport(pid, stream) {
  const P = db.prepare('SELECT * FROM patients WHERE id=?').get(pid); if (!P) throw new Error('Patient not found');
  const doc = newDoc(); doc.pipe(stream); doc.y = 45;
  doc.font('Helvetica-Bold').fontSize(18).text('Orthodontic Progress Report', 40, 45).fontSize(11).font('Helvetica').text(`${P.full_name}  (NDC-${String(P.id).padStart(5, '0')})`);
  const O = db.prepare('SELECT * FROM ortho_records WHERE patient_id=? AND deleted_at IS NULL ORDER BY visit_no').all(pid);
  const palette = ['#2F9BE0', '#0891B2', '#059669', '#D97706', '#DC2626', '#7C3AED'];
  O.forEach((o, i) => {
    h1(doc, `Visit #${o.visit_no || i + 1} - ${o.date || ''}`);
    doc.rect(40, doc.y, 6, 44).fill(palette[i % palette.length]); const y0 = doc.y; doc.fillColor('#111');
    doc.x = 54; doc.y = y0; kv(doc, 'Upper wire', o.upper_wire); doc.x = 54; kv(doc, 'Lower wire', o.lower_wire); doc.x = 54; kv(doc, 'Ties', o.ties); doc.x = 54; kv(doc, 'Elastics', o.elastics); doc.x = 40;
    kv(doc, 'Next visit', o.next_visit);
    let tn = {}; try { tn = JSON.parse(o.tooth_notes_json || '{}'); } catch {}
    Object.entries(tn).forEach(([t, n]) => kv(doc, 'Tooth ' + t, n));
    let ph = []; try { ph = JSON.parse(o.photos_json || '[]'); } catch {}
    if (ph.length) imageGrid(doc, ph.map(p => ({ file_path: p, date: o.date })));
  });
  if (!O.length) doc.text('No records.');
  decorate(doc, 'Ortho: ' + P.full_name); doc.end();
}
function receipt(saleId, size, stream) {
  const S = db.prepare('SELECT * FROM pos_sales WHERE id=?').get(saleId); if (!S) throw new Error('Sale not found');
  const clinic = settings.get('clinic'); const P = S.patient_id ? db.prepare('SELECT * FROM patients WHERE id=?').get(S.patient_id) : null;
  const items = JSON.parse(S.items_json || '[]'); const pay = JSON.parse(S.payment_json || '[]');
  const col = settings.get('pdf').color || '#2F9BE0';
  const wide = size === 'A4'; const w = size === '58mm' ? 164 : size === '80mm' ? 227 : 595;
  const estH = 230 + items.length * 20 + pay.length * 16; // thermal rolls have no fixed page length - size to content
  const doc = new PDFDocument({ size: wide ? 'A4' : [w, Math.max(400, estH)], margin: 0 }); doc.pipe(stream);
  const W = doc.page.width; const M = wide ? 42 : 12; const inner = W - M * 2;
  const fs1 = wide ? 10.5 : 8; const fsH = wide ? 20 : 11.5;
  let y = 0;

  /* ---- coloured header band with logo, clinic name & contact ----
     Measured rather than fixed-height, so a long clinic address never overlaps the Tel
     line on a narrow (58/80mm) receipt - the band simply grows to fit. */
  const textX = wide ? M + 68 : M;
  const nameW = inner - (wide ? (textX - M) : 0);
  if (!wide) { doc.font('Helvetica-Bold').fontSize(fsH); } // measure with the real font/size used below
  const addrH = doc.font('Helvetica').fontSize(fs1 - 1).heightOfString(clinic.address, { width: nameW });
  const bandH = (wide ? 20 : 8) + fsH + 3 + addrH + 3 + (fs1 - 1) + (wide ? 16 : 8);
  doc.rect(0, 0, W, bandH).fill(col);
  if (wide && fs.existsSync(LOGO)) { try { doc.image(LOGO, M, (bandH - 56) / 2, { width: 56 }); } catch {} }
  let hy = wide ? 20 : 8;
  doc.fillColor('#fff').font('Helvetica-Bold').fontSize(fsH).text(clinic.name, textX, hy, { width: nameW, align: wide ? 'left' : 'center', lineBreak: false }); hy += fsH + 3;
  doc.font('Helvetica').fontSize(fs1 - 1).fillColor('#EAF3FF').text(clinic.address, textX, hy, { width: nameW, align: wide ? 'left' : 'center' }); hy += addrH + 3;
  doc.text('Tel: ' + clinic.phone, textX, hy, { width: nameW, align: wide ? 'left' : 'center', lineBreak: false });
  y = bandH + (wide ? 22 : 12);

  /* ---- "RECEIPT" ribbon + meta row ---- */
  doc.fillColor('#111').font('Helvetica-Bold').fontSize(wide ? 15 : 10.5).text('PAYMENT RECEIPT', M, y, { width: inner, align: wide ? 'left' : 'center' });
  y += wide ? 20 : 14;
  doc.font('Helvetica').fontSize(fs1 - .5).fillColor('#555')
    .text(`Receipt #${String(S.id).padStart(5, '0')}`, M, y, { continued: !wide, width: inner })
  if (wide) doc.text(`${S.date}   ${S.time || ''}`, M, y, { width: inner, align: 'right' });
  else doc.text(`   •   ${S.date} ${S.time || ''}`, { align: 'center' });
  y = doc.y + (wide ? 4 : 2);
  doc.moveTo(M, y).lineTo(W - M, y).lineWidth(.7).strokeColor(col).stroke(); y += wide ? 10 : 6;

  /* ---- patient chip ---- */
  if (P) {
    doc.fillColor('#111').font('Helvetica-Bold').fontSize(fs1).text('Patient: ', M, y, { continued: true }).font('Helvetica').text(P.full_name);
    if (P.phone) doc.font('Helvetica').fillColor('#555').fontSize(fs1 - 1).text(P.phone, M, doc.y, { width: inner, align: wide ? 'left' : 'center' });
    y = doc.y + (wide ? 8 : 5);
  }

  /* ---- items table ---- */
  const cols = wide ? [inner * .46, inner * .14, inner * .18, inner * .22] : [inner * .5, inner * .16, inner * .34];
  const head = () => {
    doc.rect(M, y, inner, wide ? 20 : 14).fill(col); doc.fillColor('#fff').font('Helvetica-Bold').fontSize(fs1 - (wide ? 0 : .5));
    let x = M + 4;
    const labels = wide ? ['Item', 'Qty', 'Price', 'Amount'] : ['Item', 'Qty', 'Amount'];
    labels.forEach((l, i) => { doc.text(l, x, y + (wide ? 5 : 3), { width: cols[i] - 4, align: i === labels.length - 1 ? 'right' : 'left', lineBreak: false }); x += cols[i]; });
    y += wide ? 22 : 16; doc.fillColor('#111').font('Helvetica').fontSize(fs1 - (wide ? 0 : .5));
  };
  head();
  items.forEach((it, ri) => {
    const line = (Number(it.price) * Number(it.qty) - Number(it.discount || 0));
    const h = Math.max(wide ? 16 : 12, doc.heightOfString(it.name, { width: cols[0] - 4 }));
    if (ri % 2) doc.rect(M, y - 1, inner, h + 3).fill('#F3F8FF');
    doc.fillColor('#111'); let x = M + 4;
    doc.text(it.name, x, y, { width: cols[0] - 4 }); x += cols[0];
    if (wide) { doc.text(String(it.qty), x, y, { width: cols[1] - 4 }); x += cols[1]; doc.text(Number(it.price).toLocaleString(), x, y, { width: cols[2] - 4 }); x += cols[2]; }
    else { doc.text(String(it.qty), x, y, { width: cols[1] - 4 }); x += cols[1]; }
    doc.text(line.toLocaleString() + (it.discount ? ` (-${it.discount})` : ''), x, y, { width: cols[cols.length - 1] - 4, align: 'right' });
    y += h + (wide ? 5 : 3);
  });
  y += wide ? 4 : 2; doc.moveTo(M, y).lineTo(W - M, y).lineWidth(.6).strokeColor('#D8E3EE').dash(2, { space: 2 }).stroke().undash(); y += wide ? 10 : 7;

  /* ---- totals block, right-aligned ---- */
  const totLine = (label, val, opts = {}) => {
    doc.font(opts.bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(opts.big ? fs1 + (wide ? 4 : 2) : fs1 - (wide ? 0 : .5)).fillColor(opts.color || '#111');
    doc.text(label, M, y, { width: inner * .6 }); doc.text(val, M + inner * .6, y, { width: inner * .4, align: 'right' }); y = doc.y + (opts.big ? 3 : 2);
  };
  totLine('Subtotal', Number(S.subtotal).toLocaleString());
  if (S.discount) totLine('Discount', '-' + Number(S.discount).toLocaleString(), { color: '#B45309' });
  if (S.tax) totLine('Tax', Number(S.tax).toLocaleString());
  y += 2; doc.rect(M, y, inner, wide ? 24 : 18).fill(col); doc.fillColor('#fff').font('Helvetica-Bold').fontSize(fs1 + (wide ? 4 : 1.5))
    .text('TOTAL', M + 8, y + (wide ? 6 : 3), { continued: false }).text(fmt(S.total), M, y + (wide ? 6 : 3), { width: inner - 8, align: 'right' });
  y += (wide ? 24 : 18) + (wide ? 10 : 6);

  pay.forEach(p => { totLine(p.method + (p.tid ? ` (TID ${p.tid})` : ''), Number(p.amount).toLocaleString()); });
  if (S.total - S.paid > 0.009) totLine('BALANCE DUE', fmt(S.total - S.paid), { bold: true, big: true, color: '#B91C1C' });
  else totLine('Status', 'PAID IN FULL ✓', { bold: true, color: '#047857' });

  /* ---- footer ---- */
  y += wide ? 18 : 10; doc.moveTo(M, y).lineTo(W - M, y).lineWidth(.7).strokeColor(col).stroke(); y += wide ? 10 : 8;
  doc.font('Helvetica-Oblique').fontSize(fs1 - (wide ? 1 : .5)).fillColor('#555').text('Thank you for visiting us — get well soon!', M, y, { width: inner, align: 'center' });
  y = doc.y + (wide ? 4 : 2);
  doc.font('Helvetica').fontSize(fs1 - (wide ? 2 : 1.5)).fillColor('#999').text(clinic.name + '  •  ' + (clinic.whatsapp || clinic.phone), M, y, { width: inner, align: 'center' });
  doc.end();
}
/* generic table report: {title, subtitle, columns:[], rows:[[]], summary:[[k,v]]} */
function tableReport({ title, subtitle, columns, rows, summary }, stream) {
  const doc = newDoc({ extra: columns.length > 7 ? { layout: 'landscape' } : {} }); doc.pipe(stream); doc.y = 44;
  doc.font('Helvetica-Bold').fontSize(17).fillColor('#111').text(title || 'Report', 40, 44);
  doc.font('Helvetica').fontSize(9).fillColor('#555').text((subtitle || '') + '   Generated ' + new Date().toLocaleString()); doc.moveDown(.5).fillColor('#111');
  (summary || []).forEach(([k, v]) => kv(doc, k, v)); doc.moveDown(.3);
  table(doc, columns, rows.map(r => r.map(c => (typeof c === 'number' ? c.toLocaleString() : c))), columns.map(() => 1));
  decorate(doc, title); doc.end();
}
module.exports = { dossier, orthoReport, receipt, tableReport, patientBalance };
