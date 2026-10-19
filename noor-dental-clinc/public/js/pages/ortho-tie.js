/* Orthodontic Tie Sheet: opens as a REGISTER (one row per patient under ortho care, like
   the Patients list) and drills into a per-patient tooth-chart + visit-timeline view.
   Works for a freshly quick-added "direct" patient exactly the same as a fully profiled
   one - all that matters is they have (or are about to get) an ortho visit. */
const FDI_UPPER = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28];
const FDI_LOWER = [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];

/* Shared "set up / find a patient" entry point - search an existing patient (any patient,
   quick-added or fully profiled) or add a brand-new one on the spot, then jump into their
   ortho record. Used by both the register view's header button and (for convenience) kept
   available on the detail view too. */
function orthoPickerHtml() {
  return `<div style="position:relative;max-width:420px;flex:1;min-width:220px"><input id="psearch" data-psearch placeholder="Search name / phone…" autocomplete="off"><input type="hidden" id="pid"><div class="pdrop hidden" style="position:absolute;left:0;right:0;z-index:20;background:var(--bg);border:1px solid var(--border);border-radius:10px;max-height:220px;overflow:auto"></div></div>${btn('sec', '➕', 'New Patient', '', 'id="qnp"')}`;
}
function wireOrthoPicker(root, onPick) {
  UI.bindPickers(root);
  $('#pid', root).addEventListener('change', () => { const id = Number($('#pid', root).value); if (id) onPick(id); });
  $('#qnp', root).onclick = () => UI.editModal({ title: '🦷 New Patient', fields: [
      { name: 'full_name', label: 'Name', required: true }, { name: 'phone', label: 'Phone', type: 'tel' },
      { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], blank: true }, { name: 'age', label: 'Age', type: 'number' }],
    onSave: async v => { if (!v.whatsapp) v.whatsapp = v.phone; const p = await API.post('patients', v); UI.toast('Patient added ✔ — now add their ortho visit', { type: 'good' }); onPick(p.id); } });
}

App.ready(async () => {
  const q = new URLSearchParams(location.search); let pid = q.get('patient') ? Number(q.get('patient')) : null;
  const c = $('#content');
  const setPid = id => { pid = id ? Number(id) : null; const u = new URL(location.href); if (pid) u.searchParams.set('patient', pid); else u.searchParams.delete('patient'); history.replaceState(null, '', u); };

  async function route() { if (pid) await renderDetail(pid); else await renderRegister(); }

  /* ---------------- register (default landing view) ---------------- */
  async function renderRegister() {
    c.innerHTML = App.pageHead('Orthodontic Tie Sheet', '', '') +
      `<div class="card mb"><label class="f">Set up ortho for a patient<div class="flex gap items-center wrap">${orthoPickerHtml()}</div></label></div>
      <div class="toolbar"><input id="rq" class="grow" placeholder="Search ortho patients…"></div><div id="rtbl"></div>`;
    wireOrthoPicker(c, id => { setPid(id); route(); });
    const tbl = UI.table($('#rtbl'), { pageSize: 100000, empty: 'No patients under ortho care yet — use "New Patient" above, or pick an existing one, to set up their first visit.', rows: [],
      columns: [
        { key: 'patient_name', label: 'Patient', render: r => `<div class="flex items-center gap"><img src="${esc(avatarOf({ photo: r.patient_photo, gender: r.patient_gender }))}" alt="" style="width:28px;height:28px;border-radius:50%;object-fit:cover"><b>${esc(r.patient_name)}</b></div>` },
        { key: 'patient_phone', label: 'Phone' }, { key: 'visit_count', label: 'Visits', align: 'center' },
        { key: 'last_date', label: 'Last visit' }, { key: 'upper_wire', label: 'Upper wire' }, { key: 'lower_wire', label: 'Lower wire' },
        { key: 'ties', label: 'Ties' }, { key: 'next_visit', label: 'Next visit', render: r => r.next_visit ? `<span class="pill" style="background:var(--primary)">${esc(r.next_visit)}</span>` : '—' }],
      trailing: r => `<button data-act="open" class="btn sm" style="margin-left:6px">Open →</button>`,
      onAction: (act, r) => { if (act === 'open') { setPid(r.patient_id); route(); } } });
    async function load() { tbl.setRows(await API.get('ortho-register' + API.qs({ q: $('#rq').value }))); }
    $('#rq').oninput = debounce(load); await load();
  }

  /* ---------------- per-patient detail (tooth chart + visit timeline) ---------------- */
  async function renderDetail(id) {
    const p = await API.get('patients/' + id).catch(() => null);
    if (!p) { setPid(null); return route(); }
    c.innerHTML = App.pageHead('Orthodontic Tie Sheet', '', '') +
      `<div class="card mb"><label class="f">Switch patient<div class="flex gap items-center wrap">${orthoPickerHtml()}</div></label></div>
      <a href="#" id="back-reg" class="muted">← All ortho patients</a><div id="body" class="mt"></div>`;
    wireOrthoPicker(c, newId => { setPid(newId); route(); });
    $('#psearch', c).value = p.full_name; $('#pid', c).value = id;
    $('#back-reg').onclick = e => { e.preventDefault(); setPid(null); route(); };
    async function load() {
      const records = await API.get('ortho_records' + API.qs({ patient_id: id, sort: 'visit_no', dir: 'asc', limit: 1000 }));
      $('#body').innerHTML = `<div class="page-head"><h2>${esc(p.full_name)} <span class="muted">(${records.length} visit${records.length === 1 ? '' : 's'})</span></h2><div class="flex gap">${btn('', '➕', 'New Visit', '', 'id="nv"')}<button class="btn sec" id="pdf">${bi(ic('pdf', 16) + ' Export Report')}</button><a class="btn sec" href="/patients.html?id=${id}">👁 Patient Profile</a></div></div>
      <div class="card mb"><h3>Tooth chart</h3><p class="muted" style="font-size:.82rem">Click a tooth to add/edit a note for the latest visit.</p>
      <div class="teeth mt">${FDI_UPPER.map(t => `<div class="tooth" data-t="${t}">${t}</div>`).join('')}</div><div class="teeth mt">${FDI_LOWER.map(t => `<div class="tooth lower" data-t="${t}">${t}</div>`).join('')}</div></div>
      <div id="timeline"></div>`;
      const latest = records[records.length - 1]; let notes = {}; if (latest) try { notes = JSON.parse(latest.tooth_notes_json || '{}'); } catch {}
      $$('.tooth', c).forEach(el => { if (notes[el.dataset.t]) el.classList.add('has'); el.title = notes[el.dataset.t] || ''; el.onclick = () => toothNote(el.dataset.t, latest, notes); });
      $('#nv').onclick = () => visitForm(null, records.length + 1, load); $('#pdf').onclick = () => API.openPdf('pdf/ortho/' + id);
      $('#timeline').innerHTML = records.length ? `<div class="grid" style="gap:14px">${records.slice().reverse().map(o => visitCard(o)).join('')}</div>` : '<p class="muted">No ortho records yet — add the first visit.</p>';
      $$('[data-edit]', c).forEach(b => b.onclick = () => visitForm(records.find(r => r.id == b.dataset.edit), null, load));
      $$('[data-del]', c).forEach(b => b.onclick = async () => { if (await UI.confirm('Delete this visit record?')) { await API.del('ortho_records/' + b.dataset.del); UI.deleted('ortho_records', b.dataset.del, load); load(); } });
      $$('[data-up]', c).forEach(b => b.onclick = () => uploadOrthoPhotos(records.find(r => r.id == b.dataset.up), load));
      $$('.o-gallery figure', c).forEach(f => f.onclick = () => window.open(f.dataset.src, '_blank'));
    }
    function visitCard(o) {
      let photos = []; try { photos = JSON.parse(o.photos_json || '[]'); } catch {}
      return `<div class="card"><div class="flex between items-center mb"><h3>Visit #${o.visit_no} — ${esc(o.date || '')}</h3><div class="row-act"><button data-up="${o.id}" title="Add photos">📷</button><button data-edit="${o.id}" title="Edit">${ic('edit_patient', 18)}</button><button data-del="${o.id}" title="Delete">${ic('delete_icon', 18)}</button></div></div>
      <div class="grid g2"><p><span class="muted">Upper wire:</span> ${esc(o.upper_wire || '—')}</p><p><span class="muted">Lower wire:</span> ${esc(o.lower_wire || '—')}</p><p><span class="muted">Ties:</span> ${esc(o.ties || '—')}</p><p><span class="muted">Elastics:</span> ${esc(o.elastics || '—')}</p><p><span class="muted">Next visit:</span> ${esc(o.next_visit || '—')}</p></div>
      ${o.notes ? `<p class="muted">${esc(o.notes)}</p>` : ''}${photos.length ? `<div class="gallery o-gallery mt">${photos.map(p => `<figure data-src="${esc(p)}"><img src="${esc(p)}" loading="lazy" alt=""></figure>`).join('')}</div>` : ''}</div>`;
    }
    function toothNote(t, latest, notes) {
      UI.modal({ title: `Tooth ${t} note`, size: 'small', body: `<textarea id="tn" rows="4" placeholder="Movement note, rotation, etc.">${esc(notes[t] || '')}</textarea>`,
        buttons: [{ label: 'Cancel', cls: 'sec' }, { label: '💾 Save', keep: true, onClick: async m => { const v = $('#tn').value.trim(); if (!latest) { latest = (await API.post('ortho_records', { patient_id: id, visit_no: 1, date: today() })); }
          notes = { ...notes, [t]: v }; if (!v) delete notes[t]; await API.put('ortho_records/' + latest.id, { tooth_notes_json: notes }); m.close(); load(); } }] });
    }
    function visitForm(row, nextNo, after) {
      UI.editModal({ title: row ? 'Edit visit' : 'New ortho visit', size: 'wide', values: row || { date: today(), visit_no: nextNo },
        fields: [{ name: 'visit_no', label: 'Visit #', type: 'number', required: true }, { name: 'date', label: 'Date', type: 'date', required: true },
          { name: 'upper_wire', label: 'Upper wire type + gauge' }, { name: 'lower_wire', label: 'Lower wire type + gauge' },
          { name: 'ties', label: 'Ties (color / type / O-tie / chain / power chain)' }, { name: 'elastics', label: 'Elastics (size, direction)' },
          { name: 'next_visit', label: 'Next visit date', type: 'date' }, { name: 'notes', label: 'Tooth movement notes', type: 'textarea', full: true }],
        onSave: async v => { if (row) await API.put('ortho_records/' + row.id, { ...v, patient_id: id }); else await API.post('ortho_records', { ...v, patient_id: id }); UI.toast('Saved ✔', { type: 'good' }); after(); } });
    }
    function uploadOrthoPhotos(row, after) {
      UI.modal({ title: 'Add before/after photos', body: '<input type="file" id="of" multiple accept="image/*">', buttons: [{ label: 'Cancel', cls: 'sec' }, { label: '⬆️ Upload', keep: true, onClick: async m => { const files = $('#of').files; if (!files.length) return; const up = await API.upload('ortho', files, id); let photos = []; try { photos = JSON.parse(row.photos_json || '[]'); } catch {} photos.push(...up.map(f => f.path)); await API.put('ortho_records/' + row.id, { photos_json: photos }); UI.toast('Uploaded ✔', { type: 'good' }); m.close(); after(); } }] });
    }
    await load();
  }

  await route();
});
