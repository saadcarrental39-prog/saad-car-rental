/* Patient Reminders: auto-generated + manual, Pending/Done/Skipped, editable before sending */
App.ready(async () => {
  const c = $('#content'); c.innerHTML = App.pageHead('Reminders', '', `<button class="btn" id="gen">${bi('🔄 Generate Now')}</button>`) +
    `<div class="toolbar"><select id="st"><option value="">All</option><option>Pending</option><option>Done</option><option>Skipped</option></select><select id="ty"><option value="">All types</option><option>Appointment</option><option>Ortho next visit</option><option>Follow-up</option><option>Payment due</option><option>Birthday</option></select></div><div id="list"></div>`;
  $('#gen').onclick = async () => { const r = await API.post('reminders/generate'); UI.toast(`${r.created} new reminder(s) generated ✔`, { type: 'good' }); load(); };
  async function load() {
    const rows = await API.get('reminders' + API.qs({ status: $('#st').value, type: $('#ty').value, limit: 100000, sort: 'due_date', dir: 'asc' }));
    $('#list').innerHTML = rows.length ? rows.map(r => `<div class="card mb flex between items-center wrap" data-id="${r.id}"><div><b>${esc(r.patient_name || '')}</b> <span class="pill" style="background:${{Appointment:'#3B82F6','Ortho next visit':'#06B6D4','Follow-up':'#10B981','Payment due':'#F59E0B',Birthday:'#EC4899'}[r.type] || '#3B82F6'}">${esc(r.type)}</span><div class="muted" style="font-size:.82rem">${esc(r.due_date)} · ${esc(r.message).slice(0, 90)}${r.message.length > 90 ? '…' : ''}</div></div>
      <div class="flex gap"><span class="pill" style="background:${r.status === 'Pending' ? 'var(--warning)' : r.status === 'Done' ? 'var(--success)' : 'var(--danger)'}">${esc(r.status)}</span>
      <a class="btn sm sec" href="tel:${esc(r.patient_phone || '')}">📞</a><button class="btn sm ok" data-net data-wa>${ic('whatsappicon', 16)}</button><button class="btn sm sec" data-mail data-net>📧</button><button class="btn sm sec" data-snooze>⏰</button><button class="btn sm" data-done>✔ Done</button><button class="btn sm dng" data-skip>Skip</button></div></div>`).join('') : '<p class="muted">No reminders 🎉</p>';
    $$('[data-id]', c).forEach(card => { const r = rows.find(x => x.id == card.dataset.id);
      const wa = card.querySelector('[data-wa]'); if (wa) wa.onclick = () => WA.compose({ patient: { full_name: r.patient_name, id: r.patient_id }, phone: r.patient_whatsapp || r.patient_phone, message: r.message, onSent: () => mark(r.id, 'Done') });
      const mail = card.querySelector('[data-mail]'); if (mail) mail.onclick = () => WA.mail('', App.settings.clinic.name + ' — ' + r.type, r.message);
      card.querySelector('[data-done]').onclick = () => mark(r.id, 'Done'); card.querySelector('[data-skip]').onclick = () => mark(r.id, 'Skipped');
      card.querySelector('[data-snooze]').onclick = () => UI.modal({ title: 'Snooze / re-schedule', size: 'small', body: `<label class="f">New due date<input type="date" id="sd" value="${addDays(r.due_date, 1)}"></label>`, buttons: [{ label: 'Save', onClick: async () => { await API.put('reminders/' + r.id, { due_date: $('#sd').value, status: 'Pending' }); load(); } }] }); }); }
  async function mark(id, status) { await API.put('reminders/' + id, { status }); UI.toast('Updated ✔', { type: 'good' }); load(); }
  $('#st').onchange = load; $('#ty').onchange = load; await load();
});
