/* Appointments: day/week/month calendar (drag-drop), configurable slots, print slip, reminders, recurring, waiting list */
const STATUSES = ['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'No-show'];
function apptFields(patientPresetId) {
  return [{ name: 'patient_id', label: 'Patient', type: 'patient', required: true },
    { name: 'date', label: 'Date', type: 'date', required: true, default: today() }, { name: 'time', label: 'Time', type: 'time', required: true },
    { name: 'duration', label: 'Duration (min)', type: 'number', default: (App.settings.hours || {}).slot || 30 },
    { name: 'treatment', label: 'Treatment', type: 'select', options: () => (App._svc || []).map(s => s.name).concat(['Other']), blank: true },
    { name: 'doctor', label: 'Doctor', type: 'select', options: () => (App.settings.doctors || ['Dr. M. AlNoor Orakzai']) },
    { name: 'status', label: 'Status', type: 'select', options: STATUSES, default: 'Scheduled' },
    { name: 'color_tag', label: 'Color tag', type: 'color', default: '#3B82F6' }, { name: 'reminder_flag', label: 'Send reminder', type: 'checkbox', default: 1 },
    { name: 'recurrence', label: 'Recurring', type: 'select', options: [['', 'None'], ['weekly', 'Weekly ×4'], ['monthly', 'Monthly ×3']], blank: false },
    { name: 'notes', label: 'Notes', type: 'textarea', full: true }];
}
function apptForm(row, after, presetDate, presetPatient) {
  UI.editModal({ title: row ? '✏️ Edit Appointment' : ic('appointment', 18) + ' New Appointment', size: 'wide', fields: apptFields(),
    values: row || { date: presetDate || today(), time: nowT(), patient_id: presetPatient || '' },
    onSave: async (v, m) => {
      if (v.recurrence) { const n = v.recurrence === 'weekly' ? 4 : 3, step = v.recurrence === 'weekly' ? 7 : 30; delete v.recurrence;
        for (let i = 0; i < n; i++) await API.post('appointments', { ...v, date: addDays(v.date, i * step) }); }
      else if (row) await API.put('appointments/' + row.id, v); else await API.post('appointments', v);
      UI.toast('Saved ✔', { type: 'good' }); after && after();
    } });
}
App.ready(async () => {
  App._svc = await API.get('services').catch(() => []);
  const q = new URLSearchParams(location.search);
  const c = $('#content'); c.innerHTML = App.pageHead('Appointments', '', `${btn('', ic('appointment', 16), 'New Appointment', '', 'id="add"')}<button class="btn sec" id="wl">${bi('⏳ Waiting List')}</button><button class="btn sec" id="hrs">${bi('🕒 Clinic Hours')}</button>`) +
    `<div class="toolbar"><div class="flex gap"><button class="btn sm sec" data-v="day">Day</button><button class="btn sm sec" data-v="week">Week</button><button class="btn sm sec" data-v="month">Month</button></div><button class="btn sm sec" id="prev">‹</button><b id="lbl" style="min-width:160px;text-align:center"></b><button class="btn sm sec" id="next">›</button><button class="btn sm sec" id="tod">Today</button><span class="grow"></span><select id="sf"><option value="">All statuses</option>${STATUSES.map(s => `<option>${s}</option>`).join('')}</select><input id="q" placeholder="Search patient/treatment…"></div>
    <div id="cal" class="card"></div>`;
  let view = localStorage.getItem('noor_calview') || 'week'; let cur = q.get('date') || today(); let rows = [];
  const setView = v => { view = v; localStorage.setItem('noor_calview', v); $$('[data-v]').forEach(b => b.classList.toggle('sec', b.dataset.v !== v)); render(); };
  $$('[data-v]').forEach(b => b.onclick = () => setView(b.dataset.v));
  $('#prev').onclick = () => { cur = addDays(cur, view === 'day' ? -1 : view === 'week' ? -7 : -30); load(); }; $('#next').onclick = () => { cur = addDays(cur, view === 'day' ? 1 : view === 'week' ? 7 : 30); load(); };
  $('#tod').onclick = () => { cur = today(); load(); }; $('#sf').onchange = render; $('#q').oninput = debounce(render);
  $('#add').onclick = () => apptForm(null, load, cur, q.get('patient')); $('#hrs').onclick = hoursDialog; $('#wl').onclick = waitingList;
  function monday(d) { const x = new Date(d + 'T00:00:00'); const wd = (x.getDay() + 6) % 7; x.setDate(x.getDate() - wd); return localDate(x); }
  async function load() {
    let from, to; if (view === 'day') { from = to = cur; } else if (view === 'week') { from = monday(cur); to = addDays(from, 6); } else { from = cur.slice(0, 8) + '01'; to = addDays(addDays(from, 32).slice(0, 8) + '01', -1); }
    rows = await API.get('appointments' + API.qs({ from, to, limit: 100000 })); render();
    $('#lbl').textContent = view === 'day' ? cur : view === 'week' ? `${from} – ${to}` : new Date(cur + '-01T00:00:00').toLocaleDateString('en', { month: 'long', year: 'numeric' });
  }
  function filtered() { const sf = $('#sf').value, qq = $('#q').value.toLowerCase(); return rows.filter(a => (!sf || a.status === sf) && (!qq || (a.patient_name || '').toLowerCase().includes(qq) || (a.treatment || '').toLowerCase().includes(qq))); }
  function chip(a) { return `<span class="ev-chip" draggable="true" data-id="${a.id}" style="background:${a.color_tag || '#3B82F6'}" title="${esc(a.patient_name || '')} - ${esc(a.treatment || '')}">${esc(a.time)} ${esc(a.patient_name || '')}</span>`; }
  function render() {
    const box = $('#cal'); const list = filtered(); const hrs = App.settings.hours || { open: '08:00', close: '18:00', slot: 30 };
    if (view === 'month') {
      const first = new Date(cur.slice(0, 8) + '01T00:00:00'); const wd = (first.getDay() + 6) % 7; const dim = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
      let html = '<div class="cal">' + ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => `<div class="dh">${d}</div>`).join('');
      for (let i = 0; i < wd; i++) html += '<div></div>';
      for (let d = 1; d <= dim; d++) { const ds = `${cur.slice(0, 8)}${pad2(d)}`; const items = list.filter(a => a.date === ds);
        html += `<div class="day ${ds === today() ? 'today' : ''}" data-date="${ds}"><div class="n">${d}</div>${items.slice(0, 3).map(chip).join('')}${items.length > 3 ? `<small class="muted">+${items.length - 3} more</small>` : ''}</div>`; }
      box.innerHTML = html + '</div>'; bindDnD(box, 'date');
    } else {
      const days = view === 'day' ? [cur] : [...Array(7)].map((_, i) => addDays(monday(cur), i));
      const slots = []; let [h, m] = hrs.open.split(':').map(Number); const [eh, em] = hrs.close.split(':').map(Number);
      while (h < eh || (h === eh && m < em)) { slots.push(pad2(h) + ':' + pad2(m)); m += Number(hrs.slot || 30); if (m >= 60) { m -= 60; h++; } }
      box.innerHTML = `<div class="slots" style="--cols:${days.length}"><div></div>${days.map(d => `<div class="center"><b>${d === today() ? '📍' : ''}${esc(d.slice(5))}</b><div class="muted" style="font-size:.75rem">${new Date(d + 'T00:00:00').toLocaleDateString('en', { weekday: 'short' })}</div></div>`).join('')}
      ${slots.map(t => `<div class="t">${t}</div>${days.map(d => `<div class="cell" data-date="${d}" data-time="${t}">${list.filter(a => a.date === d && a.time.slice(0, 5) <= t && addMin(a.time, a.duration) > t).map(chip).join('')}</div>`).join('')}`).join('')}</div>`;
      bindDnD(box, 'date-time');
    }
    $$('.ev-chip', box).forEach(el => el.onclick = () => open(list.find(a => a.id == el.dataset.id)));
  }
  function addMin(t, m) { const [h, mi] = t.split(':').map(Number); const d = new Date(2000, 0, 1, h, mi + Number(m || 30)); return pad2(d.getHours()) + ':' + pad2(d.getMinutes()); }
  function bindDnD(box, mode) {
    $$('.ev-chip', box).forEach(el => el.ondragstart = e => e.dataTransfer.setData('text', el.dataset.id));
    $$(mode === 'date' ? '.day' : '.cell', box).forEach(cell => {
      cell.ondragover = e => { e.preventDefault(); cell.classList.add('drop'); }; cell.ondragleave = () => cell.classList.remove('drop');
      cell.ondrop = async e => { e.preventDefault(); cell.classList.remove('drop'); const id = e.dataTransfer.getData('text'); const patch = { date: cell.dataset.date }; if (cell.dataset.time) patch.time = cell.dataset.time;
        await API.put('appointments/' + id, patch); UI.toast('Rescheduled ✔', { type: 'good' }); load(); };
    });
  }
  function open(a) {
    UI.modal({ title: `${esc(a.patient_name || '')} — ${esc(a.date)} ${esc(a.time)}`, body: `<p><b>Treatment:</b> ${esc(a.treatment || '-')}</p><p><b>Doctor:</b> ${esc(a.doctor || '-')}</p><p><b>Status:</b> <span class="pill" style="background:${a.color_tag}">${esc(a.status)}</span></p><p><b>Notes:</b> ${esc(a.notes || '-')}</p>`,
      buttons: [{ label: '🖨 Slip', cls: 'sec', onClick: () => printSlip(a) }, { label: ic('whatsappicon', 15) + ' Remind', cls: 'ok', keep: true, onClick: m => { WA.compose({ patient: a, key: 'reminder', vars: { date: a.date, time: a.time }, phone: a.patient_whatsapp || a.patient_phone }); } },
        { label: '✏️ Edit', cls: 'sec', keep: true, onClick: m => { m.close(); apptForm(a, load); } }, { label: '🗑 Delete', cls: 'dng', onClick: async () => { await API.del('appointments/' + a.id); UI.deleted('appointments', a.id, load); load(); } }] });
  }
  function printSlip(a) {
    const w = window.open('', '_blank', 'width=400,height=500'); const cl = App.settings.clinic || {};
    w.document.write(`<html><head><title>Slip</title><style>body{font-family:Arial;width:80mm;padding:8px;font-size:12px}h2{margin:4px 0;text-align:center}p{margin:3px 0}hr{border:none;border-top:1px dashed #000}</style></head><body><h2>${esc(cl.name)}</h2><p style="text-align:center">${esc(cl.address)}</p><hr><p><b>Patient:</b> ${esc(a.patient_name)}</p><p><b>Date:</b> ${esc(a.date)} &nbsp; <b>Time:</b> ${esc(a.time)}</p><p><b>Treatment:</b> ${esc(a.treatment || '-')}</p><p><b>Doctor:</b> ${esc(a.doctor || '-')}</p><hr><p style="text-align:center">Please arrive 10 min early.</p></body></html>`);
    w.document.close(); w.print();
  }
  function hoursDialog() {
    UI.editModal({ title: '🕒 Clinic Hours', size: 'small', values: App.settings.hours, fields: [{ name: 'open', label: 'Open', type: 'time' }, { name: 'close', label: 'Close', type: 'time' }, { name: 'slot', label: 'Slot size (min)', type: 'number' }],
      onSave: async v => { const h = { ...App.settings.hours, ...v }; await API.put('settings/hours', { value: h }); App.settings.hours = h; localStorage.setItem('noor_settings', JSON.stringify(App.settings)); render(); } });
  }
  async function waitingList() {
    const list = await API.get('waiting_list');
    const m = UI.modal({ title: '⏳ Waiting List', size: 'wide', body: `<div class="toolbar">${btn('', '➕', 'Add', '', 'id="wadd"')}</div><div class="tbl-wrap"><table><thead><tr><th>Name</th><th>Phone</th><th>Treatment</th><th>Notes</th><th></th></tr></thead><tbody>${list.map(w => `<tr><td>${esc(w.name)}</td><td>${esc(w.phone)}</td><td>${esc(w.treatment || '')}</td><td>${esc(w.notes || '')}</td><td><button class="btn sm ok" data-book="${w.id}">${ic('appointment', 14)} Book</button><button class="btn sm dng" data-del="${w.id}">🗑</button></td></tr>`).join('') || '<tr><td colspan="5" class="center muted">Empty</td></tr>'}</tbody></table></div>`, buttons: [{ label: 'Close', cls: 'sec' }] });
    $('#wadd', m.body).onclick = () => UI.editModal({ title: 'Add to waiting list', fields: [{ name: 'name', label: 'Name', required: true }, { name: 'phone', label: 'Phone' }, { name: 'treatment', label: 'Treatment' }, { name: 'notes', label: 'Notes', type: 'textarea', full: true }], onSave: async v => { await API.post('waiting_list', v); m.close(); waitingList(); } });
    $$('[data-del]', m.body).forEach(b => b.onclick = async () => { await API.del('waiting_list/' + b.dataset.del); m.close(); waitingList(); });
    $$('[data-book]', m.body).forEach(b => b.onclick = () => { const w = list.find(x => x.id == b.dataset.book); m.close(); apptForm({ date: today(), time: nowT(), treatment: w.treatment, notes: 'From waiting list: ' + w.name }, load); });
  }
  setView(view); await load(); if (q.get('new')) apptForm(null, load, q.get('date'), q.get('patient'));
});
