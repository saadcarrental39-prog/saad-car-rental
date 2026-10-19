/* Settings: theme customizer, clinic info, hours, templates, categories, colors, users, backup/restore, trash, audit */
App.ready(async () => {
  const c = $('#content'); const S = App.settings; const isAdmin = App.user.role === 'admin';
  c.innerHTML = App.pageHead('Settings', '', '') + `<div class="tabs" id="tabs">${[['clinic', 'Clinic'], ['theme', 'Theme'], ['hours', 'Hours & Colors'], ['services', 'Services'], ['templates', 'WhatsApp Templates'], ['users', 'Users'], ['backup', 'Backup'], ['trash', 'Trash'], ['audit', 'Audit Log'], ['account', 'My Account']]
    .filter(t => isAdmin || ['account'].includes(t[0])).map(t => `<button class="tab" data-t="${t[0]}">${t[1]}</button>`).join('')}</div><div id="tc"></div>`;
  const tabs = { clinic, theme, hours, services, templates, users, backup, trash, audit, account };
  $$('.tab', c).forEach(b => b.onclick = () => go(b.dataset.t));
  function go(t) { $$('.tab', c).forEach(b => b.classList.toggle('active', b.dataset.t === t)); location.hash = t; tabs[t]($('#tc')); }
  go((location.hash || '#clinic').slice(1) in tabs ? (location.hash || '#clinic').slice(1) : (isAdmin ? 'clinic' : 'account'));

  function saveBtn(key, get) { return async () => { await API.put('settings/' + key, { value: get() }); App.settings[key] = get(); localStorage.setItem('noor_settings', JSON.stringify(App.settings)); UI.toast('Saved ✔', { type: 'good' }); }; }

  function clinic(el) { const v = S.clinic || {};
    el.innerHTML = `<div class="card">${UI.fields([{ name: 'name', label: 'Clinic name' }, { name: 'doctor', label: 'Doctor' }, { name: 'address', label: 'Address', full: true }, { name: 'whatsapp', label: 'WhatsApp number' }, { name: 'phone', label: 'Contact phone' }, { name: 'email', label: 'Email' }, { name: 'developer', label: 'Developer' }], v)}<button class="btn mt" id="sv">${bi('💾 Save')}</button></div>`;
    $('#sv', el).onclick = saveBtn('clinic', () => UI.read(el)); }

  function theme(el) { const t = Theme.get();
    el.innerHTML = `<div class="card"><div class="form-grid">
      <label class="f">Dark / Light <select id="tm"><option value="dark" ${t.mode === 'dark' ? 'selected' : ''}>Dark</option><option value="light" ${t.mode === 'light' ? 'selected' : ''}>Light</option></select></label>
      <label class="f">Primary color <input type="color" id="pc" value="${t.primary}"></label>
      <label class="f">Accent color <input type="color" id="ac" value="${t.accent}"></label>
      <label class="f">Background tone (dark mode) <input type="color" id="bg" value="${t.bg}"></label>
      <label class="f">Border radius: <span id="rv">${t.radius}px</span><input type="range" id="rr" min="4" max="28" value="${t.radius}"></label>
      <label class="f">Font size: <span id="fv">${t.fontSize}px</span><input type="range" id="fs" min="13" max="19" value="${t.fontSize}"></label></div>
      <div class="mt flex gap"><button class="btn" id="apply">${bi('👁 Preview')}</button><button class="btn ok" id="sv">${bi('💾 Save for everyone')}</button><button class="btn sec" id="rst">${bi('↺ Reset defaults')}</button></div></div>`;
    const live = () => Theme.save({ mode: $('#tm', el).value, primary: $('#pc', el).value, accent: $('#ac', el).value, bg: $('#bg', el).value, radius: Number($('#rr', el).value), fontSize: Number($('#fs', el).value) }, false);
    $$('#tm,#pc,#ac,#bg,#rr,#fs', el).forEach(i => i.addEventListener('input', () => { $('#rv', el).textContent = $('#rr', el).value + 'px'; $('#fv', el).textContent = $('#fs', el).value + 'px'; live(); }));
    $('#apply', el).onclick = live; $('#sv', el).onclick = async () => { const v = live(); await API.put('settings/theme', { value: v }); UI.toast('Theme saved for the whole clinic ✔', { type: 'good' }); };
    $('#rst', el).onclick = () => { Theme.save(Theme.DEF); theme(el); }; }

  function hours(el) { const h = S.hours || {}, col = S.colors || {};
    el.innerHTML = `<div class="grid g2"><div class="card"><h3>Clinic hours</h3>${UI.fields([{ name: 'open', label: 'Opens', type: 'time' }, { name: 'close', label: 'Closes', type: 'time' }, { name: 'slot', label: 'Slot size (minutes)', type: 'number' }], h)}<button class="btn mt" id="sh">${bi('💾 Save')}</button></div>
    <div class="card"><h3>Appointment status colors</h3>${Object.keys(col).map(k => `<label class="f">${k}<input type="color" data-c="${k}" value="${col[k]}"></label>`).join('')}<button class="btn mt" id="sc">${bi('💾 Save')}</button></div>
    <div class="card"><h3>Expense categories</h3><div id="ecl">${(S.expense_categories || []).map((x, i) => `<div class="flex gap mb"><input value="${esc(x)}" data-ec="${i}"><button class="btn sm dng" data-ecrm="${i}">✕</button></div>`).join('')}</div><button class="btn sm sec" id="ecadd">➕ Add</button><button class="btn mt" id="secat">${bi('💾 Save')}</button></div>
    <div class="card"><h3>Doctors</h3><div id="dcl">${(S.doctors || []).map((x, i) => `<div class="flex gap mb"><input value="${esc(x)}" data-dc="${i}"><button class="btn sm dng" data-dcrm="${i}">✕</button></div>`).join('')}</div><button class="btn sm sec" id="dcadd">➕ Add</button><button class="btn mt" id="sdoc">${bi('💾 Save')}</button></div>
    <div class="card"><h3>POS options</h3>${UI.fields([{ name: 'tax_enabled', label: 'Enable tax', type: 'checkbox' }, { name: 'tax_percent', label: 'Tax %', type: 'number' }, { name: 'receipt_size', label: 'Receipt size', type: 'select', options: ['58mm', '80mm', 'A4'] }], S.pos || {})}<button class="btn mt" id="spos">${bi('💾 Save')}</button></div>
    <div class="card"><h3>PDF dossier branding</h3>${UI.fields([{ name: 'header', label: 'Header text' }, { name: 'footer', label: 'Footer text', full: true }, { name: 'watermark', label: 'Watermark text' }, { name: 'color', label: 'Accent color', type: 'color' }], S.pdf || {})}<button class="btn mt" id="spdf">${bi('💾 Save')}</button></div></div>`;
    $('#sh', el).onclick = saveBtn('hours', () => UI.read(el)); $('#spos', el).onclick = saveBtn('pos', () => UI.read(el)); $('#spdf', el).onclick = saveBtn('pdf', () => UI.read(el));
    $('#sc', el).onclick = async () => { const v = {}; $$('[data-c]', el).forEach(i => v[i.dataset.c] = i.value); await API.put('settings/colors', { value: v }); App.settings.colors = v; localStorage.setItem('noor_settings', JSON.stringify(App.settings)); UI.toast('Saved ✔', { type: 'good' }); };
    const listSave = (sel, key) => async () => { const v = $$(sel, el).map(i => i.value).filter(Boolean); await API.put('settings/' + key, { value: v }); App.settings[key] = v; localStorage.setItem('noor_settings', JSON.stringify(App.settings)); UI.toast('Saved ✔', { type: 'good' }); };
    $('#ecadd', el).onclick = () => $('#ecl', el).insertAdjacentHTML('beforeend', `<div class="flex gap mb"><input data-ec><button class="btn sm dng" data-ecrm>✕</button></div>`);
    $('#dcadd', el).onclick = () => $('#dcl', el).insertAdjacentHTML('beforeend', `<div class="flex gap mb"><input data-dc><button class="btn sm dng" data-dcrm>✕</button></div>`);
    el.addEventListener('click', e => { if (e.target.matches('[data-ecrm],[data-dcrm]')) e.target.parentElement.remove(); });
    $('#secat', el).onclick = listSave('[data-ec]', 'expense_categories'); $('#sdoc', el).onclick = listSave('[data-dc]', 'doctors'); }

  async function services(el) { await Crud.page({ box: el, endpoint: 'services', exportName: 'services', addLabel: ['Add Service'],
    fields: [{ name: 'name', label: 'Name', required: true }, { name: 'urdu_name', label: 'Local name' }, { name: 'price', label: 'Price (PKR)', type: 'number', required: true }, { name: 'category', label: 'Category' }, { name: 'active', label: 'Active', type: 'checkbox', default: 1 }],
    columns: [{ key: 'name', label: 'Name', edit: 'text' }, { key: 'urdu_name', label: 'Local name', edit: 'text' }, { key: 'price', label: 'Price', edit: 'number', render: r => money(r.price) }, { key: 'category', label: 'Category', edit: 'text' }, { key: 'active', label: 'Active', edit: 'number', render: r => r.active ? '✔' : '✕' }] }); }

  function templates(el) { const T = S.templates || {}; const help = 'Available: {name} {clinic} {doctor} {phone} {date} {time} {amount}';
    el.innerHTML = `<p class="muted mb">${help}</p><div class="card">${Object.keys(T).map(k => `<label class="f">${k} template<textarea data-tm="${k}" rows="2">${esc(T[k])}</textarea></label>`).join('')}<button class="btn mt" id="stp">${bi('💾 Save all')}</button></div>`;
    $('#stp', el).onclick = async () => { const v = { ...T }; $$('[data-tm]', el).forEach(t => v[t.dataset.tm] = t.value); await API.put('settings/templates', { value: v }); App.settings.templates = v; localStorage.setItem('noor_settings', JSON.stringify(App.settings)); UI.toast('Saved ✔', { type: 'good' }); }; }

  async function users(el) {
    const list = await API.get('users');
    el.innerHTML = `<div class="toolbar">${btn('', '➕', 'Add User', '', 'id="ua"')}</div><div class="tbl-wrap"><table><thead><tr><th>Username</th><th>Name</th><th>Role</th><th>Added</th><th></th></tr></thead><tbody>${list.map(u => `<tr><td>${esc(u.username)}</td><td>${esc(u.full_name)}</td><td>${esc(u.role)}</td><td>${esc((u.created_at || '').slice(0, 10))}</td><td>${u.username !== App.user.username ? `<button class="btn sm dng" data-du="${u.id}">🗑</button>` : '<span class="muted">you</span>'}</td></tr>`).join('')}</tbody></table></div>`;
    $('#ua', el).onclick = () => UI.editModal({ title: 'Add user', fields: [{ name: 'username', label: 'Username', required: true }, { name: 'password', label: 'Password', type: 'password', required: true }, { name: 'full_name', label: 'Full name' }, { name: 'role', label: 'Role', type: 'select', options: [['receptionist', 'Receptionist'], ['accountant', 'Accountant'], ['admin', 'Admin']] }], onSave: async v => { await API.post('users', v); UI.toast('User added ✔', { type: 'good' }); users(el); } });
    $$('[data-du]', el).forEach(b => b.onclick = async () => { if (await UI.confirm('Remove this user?')) { await API.del('users/' + b.dataset.du); users(el); } }); }

  async function backup(el) {
    const info = await API.get('backup/list');
    el.innerHTML = `<div class="grid g2"><div class="card"><h3>Backup now</h3><p class="muted">Last backup: ${info.last ? new Date(info.last.at).toLocaleString() : 'never'} ${info.age_hours != null && info.age_hours > 24 ? '⚠️' : ''}</p>
      <button class="btn mt" id="bk1">${bi('💾 Backup Now (ZIP)')}</button><div class="mt"><label class="f">Auto-backup every (hours) <input id="abh" type="number" value="${(S.system || {}).autobackup_hours || 6}" style="width:100px;display:inline-block"></label><button class="btn sm sec" id="sabh">Save</button></div></div>
      <div class="card"><h3>Restore</h3><p class="muted">Restoring replaces the current database. Type RESTORE to confirm.</p><input type="file" id="rf" accept=".zip"><input id="rc" placeholder='Type "RESTORE" to confirm' class="mt"><button class="btn dng mt" id="rbtn">${bi('♻ Restore from file')}</button></div></div>
      <div class="card mt"><h3>Recent backups</h3><div class="tbl-wrap"><table><thead><tr><th>File</th><th>Size</th><th>Date</th><th></th></tr></thead><tbody>${info.backups.map(b => `<tr><td>${esc(b.name)}</td><td>${(b.size / 1e6).toFixed(1)} MB</td><td>${new Date(b.mtime).toLocaleString()}</td><td><a class="btn sm" href="/api/backup/download?name=${encodeURIComponent(b.name)}&token=${API.token()}">⬇</a></td></tr>`).join('') || '<tr><td colspan="4" class="center muted">No backups yet</td></tr>'}</tbody></table></div></div>`;
    $('#bk1', el).onclick = async () => { UI.toast('Creating backup…'); try { const r = await API.post('backup/create'); UI.toast('Backup created ✔ ' + r.file.split('/').pop(), { type: 'good' }); backup(el); } catch (e) { UI.toast(e.message, { type: 'err' }); } };
    $('#sabh', el).onclick = async () => { const v = { ...(S.system || {}), autobackup_hours: Number($('#abh', el).value) || 6 }; await API.put('settings/system', { value: v }); App.settings.system = v; localStorage.setItem('noor_settings', JSON.stringify(App.settings)); UI.toast('Saved ✔', { type: 'good' }); };
    $('#rbtn', el).onclick = async () => { if ($('#rc', el).value !== 'RESTORE') return UI.toast('Type RESTORE exactly to confirm', { type: 'err' }); const f = $('#rf', el).files[0]; if (!f) return UI.toast('Choose a backup ZIP file', { type: 'err' });
      const fd = new FormData(); fd.append('file', f); try { const res = await fetch('/api/backup/restore?confirm=RESTORE', { method: 'POST', headers: { 'x-token': API.token() }, body: fd }); const d = await res.json(); if (!res.ok) throw new Error(d.error);
        UI.toast('Restoring… the server will restart. Reload in a few seconds.', { type: 'good', timeout: 8000 }); setTimeout(() => location.reload(), 4000); } catch (e) { UI.toast(e.message, { type: 'err' }); } }; }

  async function trash(el) {
    const list = await API.get('trash');
    el.innerHTML = `<div class="toolbar"><span class="muted">${list.length} item(s) in trash (auto-purged after 30 days)</span><span class="grow"></span><button class="btn sec dng sm" id="purge">🗑 Purge all now</button></div><div class="tbl-wrap"><table><thead><tr><th>Table</th><th>Item</th><th>Deleted</th><th></th></tr></thead><tbody>${list.map(t => `<tr><td>${esc(t.table)}</td><td>${esc(t.label)}</td><td>${new Date(t.deleted_at).toLocaleString()}</td><td><button class="btn sm ok" data-r="${t.table}|${t.id}">↩ Restore</button></td></tr>`).join('') || '<tr><td colspan="4" class="center muted">Trash is empty</td></tr>'}</tbody></table></div>`;
    $$('[data-r]', el).forEach(b => b.onclick = async () => { const [table, id] = b.dataset.r.split('|'); await API.post('trash/restore', { table, id }); UI.toast('Restored ✔', { type: 'good' }); trash(el); });
    $('#purge', el).onclick = async () => { if (await UI.confirm('Permanently delete everything in Trash? This cannot be undone.')) { await API.post('trash/purge', { all: true }); trash(el); } }; }

  async function audit(el) { const list = await API.get('audit'); el.innerHTML = `<div class="tbl-wrap"><table><thead><tr><th>Time</th><th>User</th><th>Action</th><th>Table</th><th>Record</th></tr></thead><tbody>${list.map(a => `<tr><td>${esc((a.timestamp || '').replace('T', ' ').slice(0, 19))}</td><td>${esc(a.user)}</td><td>${esc(a.action)}</td><td>${esc(a.table || '')}</td><td>${a.record_id || ''}</td></tr>`).join('')}</tbody></table></div>`; }

  function account(el) { el.innerHTML = `<div class="card" style="max-width:480px"><h3>Change username / password</h3>
    ${UI.fields([{ name: 'old_password', label: 'Current password', type: 'password', required: true }, { name: 'new_username', label: 'New username (optional)' }, { name: 'new_password', label: 'New password', type: 'password', required: true }])}<button class="btn mt" id="cp">${bi('💾 Update')}</button></div>`;
    $('#cp', el).onclick = async () => { try { await API.post('auth/change-password', UI.read(el)); localStorage.removeItem('noor_default_pw'); UI.toast('Updated ✔ please log in again', { type: 'good' }); setTimeout(App.logout, 1200); } catch (e) { UI.toast(e.message, { type: 'err' }); } }; }
});
