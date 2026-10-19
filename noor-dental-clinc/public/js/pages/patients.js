/* Patients: CRM list + full profile (visits, treatments, imaging, payments, files) */
const PF = [
  { name: 'full_name', label: 'Name', required: true }, { name: 'urdu_name', label: 'Local name' },
  { name: 'cnic', label: 'CNIC' }, { name: 'phone', label: 'Phone', type: 'tel' }, { name: 'whatsapp', label: 'WhatsApp', type: 'tel' },
  { name: 'email', label: 'Email', type: 'email' }, { name: 'age', label: 'Age', type: 'number' }, { name: 'dob', label: 'Date of birth', type: 'date' },
  { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], blank: true }, { name: 'address', label: 'Address' },
  { name: 'guarantor', label: 'Guaranteed Patient (referred by)' },
  { name: 'medical_history', label: 'Medical history', type: 'textarea', full: true }, { name: 'allergies', label: 'Allergies', type: 'textarea', full: true },
  { name: 'notes', label: 'Notes', type: 'textarea', full: true }];
const pid = n => 'NDC-' + String(n).padStart(5, '0');
const cfHtml = obj => `<div class="full" style="margin-bottom:10px"><b>Custom fields</b><div id="cfs">${Object.entries(obj || {}).map(([k, v]) => cfRow(k, v)).join('')}</div><button type="button" class="btn sm sec" id="cf-add">➕ Add field</button></div><label class="f">Photo<input type="file" id="ph" accept="image/*" capture="user"></label>
<label class="f full">Signature<div style="border:1px solid var(--border);border-radius:10px;background:#fff;touch-action:none"><canvas id="sig" width="600" height="140" style="width:100%;height:140px;display:block;cursor:crosshair"></canvas></div>
<div class="flex gap mt"><button type="button" class="btn sm sec" id="sig-clear">✕ Clear signature</button><span class="muted" style="font-size:.78rem;align-self:center">Sign with mouse or finger — saved when you press Save below.</span></div></label>`;
const cfRow = (k = '', v = '') => `<div class="flex gap" style="margin:6px 0"><input placeholder="Field name" class="cfk" value="${esc(k)}"><input placeholder="Value" class="cfv" value="${esc(v)}"><button type="button" class="btn sm dng" onclick="this.parentElement.remove()">✕</button></div>`;

/* Signature pad: mouse + touch/pen via Pointer Events. Pre-loads an existing signature
   image (if any) so re-opening Edit doesn't wipe it, but any new stroke replaces it. */
function wireSignaturePad(m, existingUrl) {
  const cv = $('#sig', m.body); const x = cv.getContext('2d'); let drawn = false, drawing = false, last = null;
  const clear = () => { x.clearRect(0, 0, cv.width, cv.height); };
  clear();
  if (existingUrl) { const im = new Image(); im.onload = () => x.drawImage(im, 0, 0, cv.width, cv.height); im.src = existingUrl; }
  const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * (cv.width / r.width), (e.clientY - r.top) * (cv.height / r.height)]; };
  cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); drawing = true; drawn = true; last = pos(e); e.preventDefault(); });
  cv.addEventListener('pointermove', e => { if (!drawing) return; const p = pos(e); x.strokeStyle = '#111'; x.lineWidth = 2.4; x.lineCap = 'round'; x.beginPath(); x.moveTo(...last); x.lineTo(...p); x.stroke(); last = p; e.preventDefault(); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => cv.addEventListener(ev, () => drawing = false));
  $('#sig-clear', m.body).onclick = () => { clear(); drawn = true; m._sigCleared = true; };
  m._getSignatureBlob = () => new Promise(res => { if (!drawn) return res(null); cv.toBlob(b => res(b), 'image/png'); });
}

function patientForm(row, after) {
  UI.editModal({ title: row ? '✏️ Edit Patient' : ic('patient', 18) + ' New Patient', fields: PF, values: row || {}, size: 'wide', draftKey: row ? null : 'patient-new',
    extra: cfHtml(row ? JSON.parse(row.custom_fields_json || '{}') : {}), onOpen: m => { $('#cf-add', m.body).onclick = () => $('#cfs', m.body).insertAdjacentHTML('beforeend', cfRow()); wireSignaturePad(m, row && row.signature); },
    onSave: async (v, m) => {
      const cf = {}; $$('.cfk', m.body).forEach((k, i) => { if (k.value.trim()) cf[k.value.trim()] = $$('.cfv', m.body)[i].value; }); v.custom_fields_json = cf;
      const f = $('#ph', m.body).files; if (f.length) v.photo = (await API.upload('patients', f))[0].path;
      const sigBlob = await m._getSignatureBlob();
      if (sigBlob) v.signature = (await API.upload('patients', [new File([sigBlob], 'signature.png', { type: 'image/png' })]))[0].path;
      else if (m._sigCleared) v.signature = '';
      if (!v.whatsapp) v.whatsapp = v.phone;
      const r = row ? await API.put('patients/' + row.id, v) : await API.post('patients', v); UI.toast('Patient saved ✔', { type: 'good' }); after && after(r);
    } });
}

/* A patient counts as "incomplete" once they've only ever been through the fast walk-in
   add - the full profile (CNIC, address, medical history etc.) was never filled in. Used
   to surface a standing "Create Profile" call-to-action instead of relying on people to
   remember the pencil icon means "finish this later too". */
const isIncomplete = p => !p.cnic && !p.address && !p.medical_history;

/* Quick add: just enough to register a walk-in for a checkup right now (name is the only
   thing that's actually required). The full profile - CNIC, address, medical history,
   guarantor, signature, custom fields - is a separate, optional step via "Create Profile",
   so nobody has to fill in a long form before they can even see today's patient. */
function quickAddPatient(after) {
  UI.editModal({ title: ic('patient', 18) + ' Add Patient (quick)', size: 'small', fields: [
      { name: 'full_name', label: 'Name', required: true }, { name: 'phone', label: 'Phone', type: 'tel' },
      { name: 'whatsapp', label: 'WhatsApp', type: 'tel' }, { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], blank: true },
      { name: 'age', label: 'Age', type: 'number' }],
    onSave: async v => {
      if (!v.whatsapp) v.whatsapp = v.phone; const r = await API.post('patients', v);
      UI.toast(`${r.full_name} added ✔ — full profile can be completed any time`, { type: 'good', timeout: 7000, actions: [{ label: '📋 Complete Profile Now', onClick: () => patientForm(r, after) }] });
      after && after(r);
    } });
}

App.ready(async () => {
  const q = new URLSearchParams(location.search);
  if (q.get('id')) return profile(Number(q.get('id')));
  const c = $('#content'); c.innerHTML = App.pageHead('Patients', '', `${btn('', ic('patient', 16), 'Add Patient', '', 'id="add"')}<button class="btn sec" id="inbox">${bi('📥 Imaging Inbox')} <span id="inb-n"></span></button><a class="btn sec" href="/reports.html?type=outstanding">⏳ Paid/Unpaid Report</a>`) +
    `<div class="toolbar"><input class="grow" id="q" placeholder="Search name / phone / CNIC…"><select id="sort"><option value="id|desc">Newest first</option><option value="full_name|asc">Name A–Z</option><option value="age|asc">Age ↑</option></select><select id="gf"><option value="">All genders</option><option>Male</option><option>Female</option><option>Other</option></select>
    <button class="btn sm sec" id="xc">CSV</button><button class="btn sm sec" id="xx">Excel</button><button class="btn sm sec" id="bulk">${ic('whatsappicon', 16)} Bulk WhatsApp</button></div><div id="tb"></div>`;
  let page = 0; const SZ = 50; let rows = [];
  /* Register-style columns, matching the clinic's paper register layout:
     S.No | Patient Name | Time | Procedure | Paid | Balance | Total | Guaranteed Patient | Address | Cell # | Signature */
  const tbl = UI.table($('#tb'), { pageSize: 100000, empty: 'No patients found', rows: [], columns: [
    { key: 'sno', label: 'S.No', render: (r) => String(rows.indexOf(r) + 1) },
    { key: 'full_name', label: 'Patient Name', edit: 'text', render: r => `<a href="/patients.html?id=${r.id}" class="flex items-center gap" style="color:var(--text)"><img src="${esc(avatarOf(r))}" alt="" style="width:28px;height:28px;border-radius:50%;object-fit:cover;flex:none"><span><b>${esc(r.full_name)}</b>${r.urdu_name ? `<div class="muted" style="font-size:.75em">${esc(r.urdu_name)}</div>` : ''}</span></a>` },
    { key: 'time', label: 'Time' },
    { key: 'procedure', label: 'Procedure' },
    { key: 'paid', label: 'Paid', render: r => money(r.paid) },
    { key: 'balance', label: 'Balance', render: r => `<span class="${r.balance > 0 ? 'out' : r.balance < 0 ? 'in' : ''}">${money(r.balance)}</span>` },
    { key: 'total', label: 'Total', render: r => money(r.total) },
    { key: 'guarantor', label: 'Guaranteed Patient', edit: 'text' },
    { key: 'address', label: 'Patient Address', edit: 'text' },
    { key: 'phone', label: 'Cell #', edit: 'text' },
    { key: 'signature', label: 'Signature', render: r => r.signature ? `<img src="${esc(r.signature)}" alt="signature" style="height:26px;object-fit:contain;background:#fff;border-radius:4px;padding:1px">` : '<span class="muted">—</span>' }],
    actions: { edit: 1, dup: 1, del: 1 }, extra: r => `<button data-act="wa" data-net title="WhatsApp">${ic('whatsappicon', 18)}</button>`,
    /* "Profile" gets its own labeled button after Delete, where the actions column has extra room, rather
       than a bare icon crowded in with the rest. Patients who were only ever quick-added also get a
       standing "Create Profile" call-to-action right there, instead of relying on the pencil icon. */
    trailing: r => (isIncomplete(r) ? `<button data-act="profile" title="Fill in CNIC, address, medical history etc." class="btn sm" style="margin-left:6px">📋 Create Profile</button>` : '') + `<button data-act="view" title="Open patient profile" class="btn sm sec" style="margin-left:6px">👁 Profile</button>`,
    onInline: (r, k, v) => API.put('patients/' + r.id, { [k]: v }),
    onAction: async (a, r) => {
      if (a === 'view') location.href = '/patients.html?id=' + r.id; else if (a === 'profile' || a === 'edit') patientForm(r, load);
      else if (a === 'dup') { await API.post(`patients/${r.id}/duplicate`); load(); } else if (a === 'wa') WA.compose({ patient: r, key: 'custom' });
      else if (a === 'del') { if (await UI.confirm(`Delete <b>${esc(r.full_name)}</b> and hide all their records? Goes to Trash for 30 days.`)) { await API.del('patients/' + r.id + '?reason=deleted'); UI.deleted('patients', r.id, load); load(); } }
    } });
  async function load() {
    const [sort, dir] = $('#sort').value.split('|'); const p = { q: $('#q').value, sort, dir, limit: 100000 }; if ($('#gf').value) p.gender = $('#gf').value;
    rows = await API.get('patients-register' + API.qs(p)); tbl.setRows(rows); API.get('images' + API.qs({ unassigned: 1 })).then(i => { $('#inb-n').textContent = i.length ? `(${i.length})` : ''; }).catch(() => {});
  }
  $('#q').oninput = debounce(load); $('#sort').onchange = load; $('#gf').onchange = load; $('#add').onclick = () => quickAddPatient(load);
  const ex = k => { const d = tbl.exportData(); UI.exportRows('patients', d.headers, d.rows, k); }; $('#xc').onclick = () => ex('csv'); $('#xx').onclick = () => ex('xls');
  $('#bulk').onclick = () => WA.bulk(rows.filter(r => r.phone || r.whatsapp).map(r => ({ name: r.full_name, phone: r.whatsapp || r.phone, patient_id: r.id, message: WA.fill((App.settings.templates || {}).custom, WA.vars(r)) })), 'Bulk WhatsApp — all listed patients');
  $('#inbox').onclick = inbox; await load(); if (q.get('new')) quickAddPatient(load);
});

async function inbox() {
  const list = await API.get('images' + API.qs({ unassigned: 1 }));
  const m = UI.modal({ title: '📥 Imaging Inbox — unassigned images', size: 'wide', body: `<p class="muted mb">Images auto-imported from <code>uploads/intake/</code>. Name files like <code>PID_12_tooth16.jpg</code> to auto-assign to patient #12.</p><div class="gallery">${list.map(i => `<figure><img src="${esc(i.file_path)}" alt=""><figcaption>${esc(i.date)} ${esc(i.time || '')}<div style="position:relative;margin-top:4px"><input data-ps placeholder="Assign to patient…" data-img="${i.id}" style="font-size:.75rem"><input type="hidden" id="h${i.id}"><div class="pdrop hidden" style="position:absolute;left:0;right:0;z-index:30;background:var(--bg);border:1px solid var(--border)"></div></div></figcaption></figure>`).join('') || '<p class="muted">Inbox empty ✔</p>'}</div>`, buttons: [{ label: 'Close', cls: 'sec' }] });
  $$('[data-ps]', m.body).forEach(inp => { const drop = inp.parentElement.querySelector('.pdrop');
    inp.oninput = debounce(async () => { const r = await API.get('patients' + API.qs({ q: inp.value, limit: 6 })); drop.innerHTML = r.map(p => `<a href="#" data-id="${p.id}" style="display:block;padding:5px 8px;color:var(--text)">${esc(p.full_name)}</a>`).join(''); drop.classList.remove('hidden'); });
    drop.onclick = async e => { e.preventDefault(); const a = e.target.closest('a'); if (!a) return; await API.post(`images/${inp.dataset.img}/assign`, { patient_id: a.dataset.id }); UI.toast('Assigned ✔', { type: 'good' }); inp.closest('figure').remove(); }; });
}

/* ---------------- profile ---------------- */
async function profile(id) {
  const c = $('#content'); let D; const reload = async () => { D = await API.get(`patients/${id}/full`); draw(); };
  const P = () => D.patient;
  function draw() {
    const p = P(), b = D.balance; let cf = {}; try { cf = JSON.parse(p.custom_fields_json || '{}'); } catch {}
    const tab = sessionStorage.getItem('ptab') || 'over';
    c.innerHTML = `<div class="page-head"><a href="/patients.html" class="btn sec sm">← ${bi('Patients')}</a><div class="flex gap wrap">
      <button class="btn" id="edit">${bi('✏️ Edit')}</button><button class="btn" id="dossier">${bi(ic('pdf', 16) + ' Full PDF')}</button><button class="btn ok" id="wa" data-net>${bi(ic('whatsappicon', 16) + ' WhatsApp')}</button>
      <a class="btn sec" href="tel:${esc(p.phone || '')}">${bi('📞 Call')}</a><button class="btn sec" id="mail" data-net>${bi('📧 Email')}</button>
      <a class="btn sec" href="/ortho-tie.html?patient=${id}">${bi(ic('orthobrasis', 16) + ' Ortho')}</a><a class="btn sec" href="/pos.html?patient=${id}">${bi(ic('pos', 16) + ' POS')}</a><a class="btn sec" href="/appointments.html?new=1&patient=${id}">${bi(ic('appointment', 16) + ' Appointment')}</a></div></div>
      <div class="card flex gap wrap items-center mb"><img src="${esc(avatarOf(p))}" alt="${esc(p.full_name)}" style="width:96px;height:96px;border-radius:20px;object-fit:cover"><div class="grow"><h1>${esc(p.full_name)}</h1>${p.urdu_name ? `<div class="muted" style="font-size:1rem">${esc(p.urdu_name)}</div>` : ''}<div class="muted">${pid(p.id)} · ${esc(p.gender || '')} ${p.age ? '· ' + p.age + ' yrs' : ''} · ${esc(p.phone || '')}</div></div>
      <div class="right"><div class="muted">Billed ${money(b.charged)} · Paid ${money(b.paid)}</div><div style="font-size:1.6rem;font-weight:700;color:${b.balance > 0 ? 'var(--danger)' : 'var(--success)'}">${b.balance > 0 ? 'Due ' : b.balance < 0 ? 'Credit ' : 'Balance '}${money(Math.abs(b.balance))}</div></div></div>
      ${b.balance > 0.5 ? `<div class="warn-bar flex between items-center wrap"><span>⚠️ <b>${money(b.balance)}</b> is still unpaid from this patient's previous visit(s) — collect it before starting new treatment.</span><button class="btn sm" id="pay-now">💵 Receive Payment</button></div>` : ''}
      <div class="tabs">${[['over', 'Overview'], ['visits', 'Visits'], ['treat', 'Treatments'], ['img', 'X-rays & Photos'], ['pay', 'Payments'], ['files', 'Files'], ['sales', 'Receipts']].map(t => `<button class="tab ${tab === t[0] ? 'active' : ''}" data-t="${t[0]}">${t[1]}</button>`).join('')}</div><div id="tabc"></div>`;
    $('#edit').onclick = () => patientForm(p, reload); $('#dossier').onclick = () => API.openPdf('pdf/patient/' + id);
    if ($('#pay-now')) $('#pay-now').onclick = () => payForm({ patient_id: id }, reload);
    $('#wa').onclick = () => WA.compose({ patient: p, key: 'custom' }); $('#mail').onclick = () => WA.mail(p.email, 'Noor Dental Clinic', '');
    $$('.tab').forEach(t => t.onclick = () => { sessionStorage.setItem('ptab', t.dataset.t); $$('.tab').forEach(x => x.classList.toggle('active', x === t)); showTab(t.dataset.t); }); showTab(tab);
  }
  function showTab(t) { ({ over, visits, treat, img, pay, files, sales })[t]($('#tabc')); }
  function over(el) {
    const p = P(); let cf = {}; try { cf = JSON.parse(p.custom_fields_json || '{}'); } catch {}
    const rows = [['CNIC', p.cnic], ['Phone', p.phone], ['WhatsApp', p.whatsapp], ['Email', p.email], ['Date of birth', p.dob], ['Address', p.address], ['Guaranteed Patient', p.guarantor], ...Object.entries(cf)];
    el.innerHTML = `<div class="grid g2"><div class="card"><h3>Personal info</h3>${rows.map(r => `<p><span class="muted">${esc(r[0])}:</span> ${esc(r[1] || '—')}</p>`).join('')}
    <p><span class="muted">Signature:</span></p>${p.signature ? `<img src="${esc(p.signature)}" alt="signature" style="max-width:220px;background:#fff;border:1px solid var(--border);border-radius:8px;padding:6px">` : '<p class="muted">Not captured</p>'}</div><div class="card"><h3>Medical</h3><p><span class="muted">History:</span> ${esc(p.medical_history || '—')}</p><p><span class="muted">Allergies:</span> ${esc(p.allergies || '—')}</p><p><span class="muted">Notes:</span> ${esc(p.notes || '—')}</p></div></div>`;
  }
  function visits(el) {
    const ev = [...D.appointments.map(a => ({ d: a.date + ' ' + a.time, t: `📅 ${a.treatment || 'Appointment'} — ${a.status}`, n: a.notes })), ...D.treatments.map(t => ({ d: (t.date || '') + ' 99', t: `🦷 ${t.name}${t.tooth_no ? ' (tooth ' + t.tooth_no + ')' : ''} — ${money(t.cost)}`, n: t.notes })), ...D.ortho.map(o => ({ d: (o.date || '') + ' 98', t: `😁 Ortho visit #${o.visit_no}`, n: o.upper_wire ? 'Upper ' + o.upper_wire : '' }))].sort((a, b) => b.d.localeCompare(a.d));
    el.innerHTML = `<div class="card"><div class="timeline">${ev.map(e => `<div class="ev"><b>${esc(e.d.replace(/ 9\d$/, ''))}</b><div>${esc(e.t)}</div><div class="muted">${esc(e.n || '')}</div></div>`).join('') || '<p class="muted">No visits yet.</p>'}</div></div>`;
  }
  async function treat(el) {
    await Crud.page({ box: el, endpoint: 'treatments', params: () => ({ patient_id: id }), addLabel: ['Add Treatment'], exportName: 'treatments', defaults: () => ({ date: today(), doctor: (App.settings.clinic || {}).doctor }), beforeSave: v => ({ ...v, patient_id: id }), onChange: reload_soft,
      fields: [{ name: 'name', label: 'Treatment', required: true }, { name: 'tooth_no', label: 'Tooth # (FDI)' }, { name: 'cost', label: 'Cost (PKR)', type: 'number' }, { name: 'date', label: 'Date', type: 'date' }, { name: 'doctor', label: 'Doctor' }, { name: 'notes', label: 'Notes', type: 'textarea', full: true }],
      columns: [{ key: 'date', label: 'Date', edit: 'text' }, { key: 'name', label: 'Treatment', edit: 'text' }, { key: 'tooth_no', label: 'Tooth', edit: 'text' }, { key: 'cost', label: 'Cost', edit: 'number', render: r => money(r.cost) }, { key: 'doctor', label: 'Doctor' }, { key: 'notes', label: 'Notes', edit: 'text' }] });
  }
  async function reload_soft() { D.balance = await API.get(`patients/${id}/balance`); }
  function img(el) {
    const list = D.images;
    el.innerHTML = `<div class="toolbar">${btn('', '⬆️', 'Upload X-ray / Photo', '', 'id="up"')}<button class="btn sec" id="cmp">${bi('↔ Compare')}</button><input type="file" id="fi" multiple accept="image/*" class="hidden"></div>
    <div class="gallery">${list.map(i => `<figure data-id="${i.id}"><img loading="lazy" src="${esc(i.file_path)}" alt="${esc(i.type)} ${esc(i.date)}"><figcaption>${esc(i.date)} ${i.tooth_no ? '· T' + esc(i.tooth_no) : ''} ${i.site ? '· ' + esc(i.site) : ''}<br>${esc(i.type)}</figcaption></figure>`).join('') || '<p class="muted">No images yet.</p>'}</div>`;
    $('#up').onclick = () => $('#fi').click();
    $('#fi').onchange = e => { const files = e.target.files; if (!files.length) return;
      UI.editModal({ title: `Tag ${files.length} image(s)`, fields: [{ name: 'type', label: 'Type', type: 'select', options: ['xray', 'photo', 'before', 'after', 'scan', 'other'] }, { name: 'tooth_no', label: 'Tooth #' }, { name: 'site', label: 'Site' }, { name: 'date', label: 'Date', type: 'date', default: today() }, { name: 'notes', label: 'Notes', type: 'textarea', full: true }],
        onSave: async v => { const up = await API.upload('xrays', files, id); for (const f of up) await API.post('images', { ...v, patient_id: id, file_path: f.path, time: nowT() }); UI.toast('Uploaded ✔', { type: 'good' }); reload(); } }); };
    $$('.gallery figure', el).forEach(f => f.onclick = () => lightbox(list.find(i => i.id == f.dataset.id)));
    $('#cmp').onclick = () => compare(list);
  }
  function lightbox(i) {
    const m = UI.modal({ title: `${esc(i.type)} — ${esc(i.date)} ${esc(i.time || '')} ${i.tooth_no ? '· tooth ' + esc(i.tooth_no) : ''}`, size: 'wide', body: `<img src="${esc(i.file_path)}" alt="" style="max-width:100%;max-height:70vh;display:block;margin:auto;border-radius:12px"><p class="muted center mt">${esc(i.site || '')} ${esc(i.notes || '')}</p>`,
      buttons: [{ label: '🗑 Delete', cls: 'dng', onClick: async () => { await API.del('images/' + i.id); UI.deleted('images', i.id, reload); reload(); } }, { label: '✏️ Edit tags', cls: 'sec', keep: true, onClick: () => { m.close(); UI.editModal({ title: 'Edit image', values: i, fields: [{ name: 'type', label: 'Type' }, { name: 'tooth_no', label: 'Tooth #' }, { name: 'site', label: 'Site' }, { name: 'date', label: 'Date', type: 'date' }, { name: 'notes', label: 'Notes', type: 'textarea', full: true }], onSave: async v => { await API.put('images/' + i.id, v); reload(); } }); } },
        { label: '🖊 Annotate', keep: true, onClick: () => { m.close(); annotate(i); } }] });
  }
  function annotate(i) {
    const im = new Image(); im.src = i.file_path; im.onload = () => {
      const sc = Math.min(1, 900 / im.naturalWidth); const W = im.naturalWidth * sc, H = im.naturalHeight * sc; let tool = 'pen', color = '#EF4444'; const ops = []; let cur = null;
      const m = UI.modal({ title: '🖊 Annotate — arrows, circles, text', size: 'wide', sticky: true, body: `<div class="toolbar">${['pen', 'arrow', 'circle', 'text'].map(t => `<button class="btn sm ${t === 'pen' ? '' : 'sec'}" data-tl="${t}">${t}</button>`).join('')}<input type="color" id="ac" value="${color}" style="width:50px"><button class="btn sm sec" id="au">↶ Undo</button><button class="btn sm sec" id="aclr">Clear</button></div><canvas id="cv" width="${W}" height="${H}" style="max-width:100%;border-radius:10px;cursor:crosshair;background:#000"></canvas>`,
        buttons: [{ label: 'Cancel', cls: 'sec' }, { label: '💾 Save copy', keep: true, onClick: async () => { await API.post('images/annotated', { image_id: i.id, dataUrl: $('#cv', m.body).toDataURL('image/png') }); UI.toast('Annotated copy saved ✔', { type: 'good' }); m.close(); reload(); } }] });
      const cv = $('#cv', m.body), x = cv.getContext('2d');
      const draw = o => { x.strokeStyle = x.fillStyle = o.c; x.lineWidth = 3; x.lineCap = 'round';
        if (o.t === 'pen') { x.beginPath(); o.p.forEach((q, k) => k ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1])); x.stroke(); }
        if (o.t === 'circle') { x.beginPath(); x.ellipse((o.a[0] + o.b[0]) / 2, (o.a[1] + o.b[1]) / 2, Math.abs(o.b[0] - o.a[0]) / 2 || 1, Math.abs(o.b[1] - o.a[1]) / 2 || 1, 0, 0, 7); x.stroke(); }
        if (o.t === 'arrow') { const ang = Math.atan2(o.b[1] - o.a[1], o.b[0] - o.a[0]); x.beginPath(); x.moveTo(...o.a); x.lineTo(...o.b); x.stroke(); x.beginPath(); x.moveTo(...o.b); x.lineTo(o.b[0] - 16 * Math.cos(ang - .4), o.b[1] - 16 * Math.sin(ang - .4)); x.lineTo(o.b[0] - 16 * Math.cos(ang + .4), o.b[1] - 16 * Math.sin(ang + .4)); x.closePath(); x.fill(); }
        if (o.t === 'text') { x.font = 'bold 22px Inter,Arial'; x.fillText(o.s, o.a[0], o.a[1]); } };
      const redraw = () => { x.clearRect(0, 0, W, H); x.drawImage(im, 0, 0, W, H); ops.forEach(draw); if (cur) draw(cur); };
      const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
      cv.onmousedown = e => { const p = pos(e); if (tool === 'text') { const s = prompt('Text:'); if (s) { ops.push({ t: 'text', a: p, s, c: color }); redraw(); } return; } cur = { t: tool, c: color, a: p, b: p, p: [p] }; };
      cv.onmousemove = e => { if (!cur) return; const p = pos(e); cur.b = p; if (cur.t === 'pen') cur.p.push(p); redraw(); }; addEventListener('mouseup', () => { if (cur) { ops.push(cur); cur = null; redraw(); } });
      $$('[data-tl]', m.body).forEach(b => b.onclick = () => { tool = b.dataset.tl; $$('[data-tl]', m.body).forEach(z => z.classList.toggle('sec', z !== b)); });
      $('#ac', m.body).oninput = e => color = e.target.value; $('#au', m.body).onclick = () => { ops.pop(); redraw(); }; $('#aclr', m.body).onclick = () => { ops.length = 0; redraw(); }; redraw();
    };
  }
  function compare(list) {
    if (list.length < 2) return UI.toast('Upload at least 2 images to compare', { type: 'err' });
    const opts = n => list.map((i, k) => `<option value="${k}" ${k === n ? 'selected' : ''}>${esc(i.date)} ${esc(i.type)} ${i.tooth_no ? 'T' + esc(i.tooth_no) : ''} #${i.id}</option>`).join('');
    const m = UI.modal({ title: '↔ Compare before / after', size: 'wide', body: `<div class="toolbar"><select id="ca">${opts(list.length - 1)}</select><select id="cb">${opts(0)}</select></div><div id="cs"></div><h3 class="mt">Slider</h3><div class="compare" id="slider"></div>`, buttons: [{ label: 'Close', cls: 'sec' }] });
    const go = () => { const A = list[$('#ca', m.body).value], B = list[$('#cb', m.body).value];
      $('#cs', m.body).innerHTML = `<div class="grid g2"><div><b>${esc(A.date)}</b><img src="${esc(A.file_path)}" style="width:100%;border-radius:10px"></div><div><b>${esc(B.date)}</b><img src="${esc(B.file_path)}" style="width:100%;border-radius:10px"></div></div>`;
      $('#slider', m.body).innerHTML = `<img src="${esc(A.file_path)}"><div class="top" style="width:50%"><img src="${esc(B.file_path)}" style="width:${$('#slider', m.body).clientWidth || 640}px"></div><input type="range" min="0" max="100" value="50">`;
      $('#slider input', m.body).oninput = e => { $('#slider .top', m.body).style.width = e.target.value + '%'; }; };
    $('#ca', m.body).onchange = go; $('#cb', m.body).onchange = go; go();
  }
  async function pay(el) {
    let bal = 0; const rows = D.ledger.map(l => { bal += l.type === 'in' ? -l.amount : l.amount; return { ...l, run: bal }; });
    const charge = D.sales.reduce((s, x) => s + x.total, 0);
    el.innerHTML = `<div class="toolbar">${btn('ok', '💵', 'Receive Payment', '', 'id="rp"')}<a class="btn sec" href="/pos.html?patient=${id}">${bi(ic('pos', 16) + ' New bill')}</a></div><div class="card mb">Total billed (POS): <b>${money(charge)}</b> · Paid: <b class="in">${money(D.balance.paid)}</b> · Balance: <b class="${D.balance.balance > 0 ? 'out' : 'in'}">${money(D.balance.balance)}</b></div>
    <div class="tbl-wrap"><table><thead><tr><th>Date</th><th>Method</th><th>TID</th><th>Sender</th><th>In</th><th>Out</th><th>Notes</th></tr></thead><tbody>${D.ledger.map(l => `<tr><td>${esc(l.date)} ${esc(l.time || '')}</td><td>${esc(l.method)}</td><td>${esc(l.tid || '')}</td><td>${esc(l.sender || '')}</td><td class="in">${l.type === 'in' ? money(l.amount) : ''}</td><td class="out">${l.type === 'out' ? money(l.amount) : ''}</td><td>${esc(l.notes || '')}${l.screenshot ? ` <a href="${esc(l.screenshot)}" target="_blank">📎</a>` : ''}</td></tr>`).join('') || '<tr><td colspan="7" class="center muted">No payments</td></tr>'}</tbody></table></div>`;
    $('#rp').onclick = () => payForm({ patient_id: id }, reload);
  }
  function files(el) {
    el.innerHTML = `<div class="toolbar">${btn('', '⬆️', 'Upload file (any format)', '', 'id="fu"')}<input type="file" id="ff" multiple class="hidden"></div><div class="tbl-wrap"><table><thead><tr><th>File</th><th>Date</th><th>Notes</th><th></th></tr></thead><tbody>${D.files.map(f => `<tr><td><a href="${esc(f.file_path)}" target="_blank">📎 ${esc(f.original_name)}</a></td><td>${esc(f.date)}</td><td>${esc(f.notes || '')}</td><td><button class="btn sm dng" data-del="${f.id}">🗑</button></td></tr>`).join('') || '<tr><td colspan="4" class="center muted">No files</td></tr>'}</tbody></table></div>`;
    $('#fu').onclick = () => $('#ff').click();
    $('#ff').onchange = async e => { const up = await API.upload('patients', e.target.files, id); for (const f of up) await API.post('files', { patient_id: id, file_path: f.path, original_name: f.name, date: today() }); UI.toast('Uploaded ✔', { type: 'good' }); reload(); };
    $$('[data-del]', el).forEach(b => b.onclick = async () => { await API.del('files/' + b.dataset.del); UI.deleted('files', b.dataset.del, reload); reload(); });
  }
  function sales(el) {
    el.innerHTML = `<div class="tbl-wrap"><table><thead><tr><th>#</th><th>Date</th><th>Items</th><th>Total</th><th>Paid</th><th></th></tr></thead><tbody>${D.sales.map(s => `<tr><td>${s.id}</td><td>${esc(s.date)}</td><td>${JSON.parse(s.items_json || '[]').map(i => esc(i.name)).join(', ')}</td><td>${money(s.total)}</td><td>${money(s.paid)}</td><td><button class="btn sm" data-r="${s.id}">🖨 Receipt</button></td></tr>`).join('') || '<tr><td colspan="6" class="center muted">No receipts</td></tr>'}</tbody></table></div>`;
    $$('[data-r]', el).forEach(b => b.onclick = () => API.openPdf(`pdf/receipt/${b.dataset.r}`));
  }
  await reload();
}
/* shared: receive-payment dialog (EasyPaisa/JazzCash keep TID + sender + screenshot) */
function payForm(base, done) {
  const methods = ['Cash', 'EasyPaisa', 'JazzCash', 'Bank Transfer', 'Card'];
  UI.editModal({ title: '💵 Receive Payment', values: { date: today(), method: 'Cash', ...base }, size: 'small', fields: [{ name: 'amount', label: 'Amount (PKR)', type: 'number', required: true }, { name: 'method', label: 'Method', type: 'select', options: methods }, { name: 'date', label: 'Date', type: 'date' }, { name: 'tid', label: 'TID (EasyPaisa/JazzCash)' }, { name: 'sender', label: 'Sender number' }, { name: 'notes', label: 'Notes', type: 'textarea', full: true }],
    extra: '<label class="f">Screenshot<input type="file" id="shot" accept="image/*"></label>',
    onSave: async (v, m) => { if (['EasyPaisa', 'JazzCash'].includes(v.method) && (!v.tid || !v.sender)) throw new Error('TID and sender number are required for ' + v.method); const f = $('#shot', m.body).files; if (f.length) v.screenshot = (await API.upload('payments', f, base.patient_id))[0].path;
      await API.post('ledger', { ...v, type: 'in', patient_id: base.patient_id, category: 'Patient payment' }); UI.toast('Payment recorded ✔', { type: 'good' }); done && done(); } });
}
