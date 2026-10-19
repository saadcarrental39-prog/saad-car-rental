/* Waiting Room: daily token queue. Check-in -> Waiting -> Serving -> Done, with a live
   "now serving / next up" view and a paid/unpaid badge on every patient (so the front
   desk always knows who still owes from a previous visit before they're called in). */
App.ready(async () => {
  const c = $('#content');
  c.innerHTML = App.pageHead('Waiting Room', '', `${btn('', '➕', 'Check-in Patient', '', 'id="ci"')}<a class="btn sec" href="/appointments.html">${ic('appointment', 16)} Appointments</a>`) +
    `<div class="grid g2 mb" id="serving-wrap"></div>
    <div class="grid g2"><div class="card"><h3>Waiting <span id="wc" class="muted"></span></h3><div id="waiting-list"></div></div>
    <div class="card"><h3>Completed today <span id="dc" class="muted"></span></h3><div id="done-list"></div></div></div>`;

  const balBadge = b => b > 0.5 ? `<span class="pill" style="background:var(--danger)">Due ${money(b)}</span>` : b < -0.5 ? `<span class="pill" style="background:var(--success)">Credit ${money(-b)}</span>` : `<span class="pill" style="background:var(--success)">Paid</span>`;
  const avatar = r => avatarOf({ photo: r.patient_photo, gender: r.patient_gender });

  async function load() {
    const v = await API.get('queue-today');
    $('#wc').textContent = `(${v.waiting_count})`; $('#dc').textContent = `(${v.done_count})`;

    const servingCard = v.serving ? `<div class="card" style="border:2px solid var(--primary)">
        <h3>🔔 Now Serving</h3>
        <div class="flex gap items-center mt"><img src="${esc(avatar(v.serving))}" alt="" style="width:56px;height:56px;border-radius:50%;object-fit:cover">
          <div class="grow"><div style="font-size:1.3rem;font-weight:700">Token #${v.serving.token_no} — ${esc(v.serving.patient_name)}</div>
          <div class="muted">${esc(v.serving.patient_phone || '')} ${v.serving.reason ? '· ' + esc(v.serving.reason) : ''}</div>${balBadge(v.serving.balance)}</div></div>
        <div class="flex gap mt"><button class="btn ok" id="done-btn">✔ Mark Done</button><button class="btn sec" id="done-bill-btn">🛒 Done + Bill Now</button><a class="btn sec" href="/patients.html?id=${v.serving.patient_id}">👁 Profile</a></div>
      </div>`
      : `<div class="card center" style="display:flex;flex-direction:column;align-items:center;justify-content:center">
        <h3>No one being served right now</h3>${v.next[0] ? `<p class="muted mt">Next up: Token #${v.next[0].token_no} — ${esc(v.next[0].patient_name)}</p><button class="btn mt" id="call-next">📣 Call Next</button>` : '<p class="muted mt">Queue is empty.</p>'}</div>`;

    const nextCard = `<div class="card"><h3>Up Next</h3>${v.next.length ? v.next.map((r, i) => `<div class="flex between items-center" style="padding:8px 0;${i ? 'border-top:1px solid var(--border)' : ''}"><div class="flex gap items-center"><img src="${esc(avatar(r))}" alt="" style="width:34px;height:34px;border-radius:50%;object-fit:cover"><div><b>#${r.token_no} ${esc(r.patient_name)}</b><div class="muted" style="font-size:.78rem">${esc(r.patient_phone || '')}</div></div></div>${balBadge(r.balance)}</div>`).join('') : '<p class="muted">Nobody else waiting.</p>'}</div>`;
    $('#serving-wrap').innerHTML = servingCard + nextCard;

    const waiting = v.all.filter(r => r.status === 'Waiting');
    $('#waiting-list').innerHTML = waiting.length ? waiting.map(r => `<div class="flex between items-center" data-row="${r.id}" style="padding:8px 0;border-top:1px solid var(--border)"><div class="flex gap items-center"><img src="${esc(avatar(r))}" alt="" style="width:34px;height:34px;border-radius:50%;object-fit:cover"><div><b>#${r.token_no} ${esc(r.patient_name)}</b><div class="muted" style="font-size:.78rem">Checked in ${esc(r.checkin_at || '')} ${r.reason ? '· ' + esc(r.reason) : ''}</div></div></div><div class="flex gap items-center">${balBadge(r.balance)}<button class="btn sm" data-call="${r.id}">📣 Call</button><button class="btn sm dng" data-cancel="${r.id}">✕</button></div></div>`).join('') : '<p class="muted">Nobody waiting.</p>';
    const done = v.all.filter(r => r.status === 'Done');
    $('#done-list').innerHTML = done.length ? done.map(r => `<div class="flex between items-center" style="padding:8px 0;border-top:1px solid var(--border)"><div><b>#${r.token_no} ${esc(r.patient_name)}</b><div class="muted" style="font-size:.78rem">${esc(r.called_at || '')} → ${esc(r.done_at || '')}</div></div><div class="flex gap items-center">${balBadge(r.balance)}<a class="btn sm sec" href="/patients.html?id=${r.patient_id}">👁</a></div></div>`).join('') : '<p class="muted">None yet today.</p>';

    if ($('#call-next')) $('#call-next').onclick = () => callToken(v.next[0].id);
    if ($('#done-btn')) $('#done-btn').onclick = () => markDone(v.serving.id);
    if ($('#done-bill-btn')) $('#done-bill-btn').onclick = async () => { await markDone(v.serving.id, true); };
    $$('[data-call]', c).forEach(b => b.onclick = () => callToken(b.dataset.call));
    $$('[data-cancel]', c).forEach(b => b.onclick = async () => { if (await UI.confirm('Remove this patient from today\'s queue?')) { await API.del('queue/' + b.dataset.cancel + '?reason=cancelled'); load(); } });
  }
  async function callToken(id) { await API.put('queue/' + id, { status: 'Serving', called_at: nowT() }); load(); }
  async function markDone(id, bill) { await API.put('queue/' + id, { status: 'Done', done_at: nowT() }); if (bill) { const row = (await API.get('queue-today')).all.find(r => r.id == id) || (await API.get('queue/' + id)); location.href = '/pos.html?patient=' + row.patient_id; return; } load(); }

  $('#ci').onclick = () => UI.editModal({ title: '📝 Check-in Patient', size: 'wide', fields: [
      { name: 'patient_id', label: 'Patient', type: 'patient', required: true },
      { name: 'reason', label: 'Reason for visit (optional)' }],
    extra: `<div class="flex items-center gap mt"><span class="muted" style="font-size:.85rem">Patient not registered yet?</span><button type="button" class="btn sm sec" id="ci-np">➕ New Patient</button></div>`,
    onOpen: m => { $('#ci-np', m.body).onclick = () => UI.editModal({ title: '🦷 New Patient', fields: [
          { name: 'full_name', label: 'Name', required: true }, { name: 'phone', label: 'Phone', type: 'tel' },
          { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], blank: true }, { name: 'age', label: 'Age', type: 'number' }],
        onSave: async v => { if (!v.whatsapp) v.whatsapp = v.phone; const p = await API.post('patients', v);
          $('[name=patient_id]', m.body).value = p.id; m.body.querySelector('[data-psearch]').value = p.full_name; UI.toast('Patient added ✔', { type: 'good' }); } }); },
    onSave: async v => { await API.post('queue', v); UI.toast('Checked in ✔', { type: 'good' }); load(); } });

  await load();
});
