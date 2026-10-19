/* ===== PWA: service worker registration (spec item 4) ===== */
let __refreshing = false;
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(r => { console.log('SW registered');
      const notify = reg => UI.updateToast(reg);
      if (r.waiting && navigator.serviceWorker.controller) notify(r);
      r.addEventListener('updatefound', () => { const nw = r.installing; if (nw) nw.addEventListener('statechange', () => { if (nw.state === 'installed' && navigator.serviceWorker.controller) notify(r); }); });
      setInterval(() => r.update().catch(() => {}), 60 * 60 * 1000);
    })
    .catch(e => console.log('SW failed', e));
  /* On a brand-new install, the very first activation calls clients.claim() and fires
     controllerchange immediately - if that lands mid-login (before our own redirect to
     dashboard.html), reloading here would yank the user back to a half-finished login.
     Skip the forced reload on the login page itself; the login flow's own redirect
     already lands on a page the newly-active worker will serve correctly. */
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (__refreshing) return; __refreshing = true;
    if (document.body.dataset.page === 'login') return;
    location.reload();
  });
}
/* capture install prompt early (it can fire before the top bar exists) */
window.__deferredPrompt = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); window.__deferredPrompt = e; App.syncInstall && App.syncInstall(); });
window.addEventListener('appinstalled', () => { window.__deferredPrompt = null; App.syncInstall && App.syncInstall(); UI.toast('App installed ✔', { type: 'good' }); });

/* ===== helpers ===== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const bi = (en) => `<span>${en}</span>`;
const money = n => 'PKR ' + Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });
const pad2 = n => String(n).padStart(2, '0');
const localDate = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const today = () => localDate(new Date());
const nowT = () => { const d = new Date(); return pad2(d.getHours()) + ':' + pad2(d.getMinutes()); };
const addDays = (s, n) => { const d = new Date(s + 'T00:00:00'); d.setDate(d.getDate() + n); return localDate(d); };
const debounce = (f, ms = 250) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => f(...a), ms); }; };
const btn = (cls, icon, en, ur, attrs = '') => `<button class="btn ${cls || ''}" ${attrs}><span>${icon ? icon + ' ' : ''}${en}</span></button>`;
const ic = (name, size = 18) => `<img src="/assets/icons/${name}.png" alt="" class="app-ic" style="width:${size}px;height:${size}px;object-fit:contain;vertical-align:-4px">`;
/* Default patient avatar when no photo is uploaded - picked by gender, falling back to a neutral icon. */
const avatarOf = p => p.photo || (p.gender === 'Female' ? '/assets/icons/female_patient_profile.png' : p.gender === 'Male' ? '/assets/icons/male_patient_profile_icon.png' : '/icons/icon-192.png');

/* ===== UI toolkit ===== */
const UI = {
  toast(msg, o = {}) {
    let box = $('#toasts'); if (!box) { box = document.createElement('div'); box.id = 'toasts'; document.body.appendChild(box); }
    const t = document.createElement('div'); t.className = 'toast ' + (o.type || '');
    t.innerHTML = `<span>${esc(msg)}</span>` + (o.actions || []).map((a, i) => `<button class="btn sm ${a.cls || 'sec'}" data-a="${i}">${a.label}</button>`).join('');
    (o.actions || []).forEach((a, i) => $(`[data-a="${i}"]`, t).onclick = () => { a.onClick && a.onClick(); t.remove(); });
    box.appendChild(t); if (o.timeout !== 0) setTimeout(() => t.remove(), o.timeout || (o.type === 'err' ? 6000 : 3500)); return t;
  },
  updateToast(reg) {
    if ($('#update-toast')) return;
    const t = UI.toast('New version available — Refresh?', { timeout: 0, actions: [
      { label: 'Refresh', cls: '', onClick: () => { (reg.waiting || reg.installing) && (reg.waiting || reg.installing).postMessage({ type: 'SKIP_WAITING' }); } },
      { label: 'Later', onClick: () => {} }] }); t.id = 'update-toast';
  },
  modal(o) {
    const ov = document.createElement('div'); ov.className = 'overlay';
    ov.innerHTML = `<div class="modal ${o.size || ''}" role="dialog"><div class="modal-h"><span>${o.title || ''}</span><button class="icon-btn" data-x style="width:32px;height:32px">✕</button></div><div class="modal-b"></div><div class="modal-f"></div></div>`;
    const api = { el: ov, body: $('.modal-b', ov), close() { clearInterval(api._timer); ov.remove(); o.onClose && o.onClose(); } };
    if (typeof o.body === 'string') api.body.innerHTML = o.body; else if (o.body) api.body.appendChild(o.body);
    const foot = $('.modal-f', ov); if (!(o.buttons || []).length) foot.remove();
    (o.buttons || []).forEach(b => {
      const el = document.createElement('button'); el.className = 'btn ' + (b.cls || ''); el.innerHTML = `<span>${b.label}</span>`; if (b.net) el.dataset.net = 1;
      el.onclick = async () => { el.disabled = true; let r; try { r = b.onClick && await b.onClick(api); } catch (e) { UI.toast(e.message, { type: 'err' }); el.disabled = false; return; } el.disabled = false; if (!b.keep && r !== false) api.close(); };
      foot.appendChild(el);
    });
    $('[data-x]', ov).onclick = api.close; ov.addEventListener('mousedown', e => { if (e.target === ov && !o.sticky) api.close(); });
    ov.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.preventDefault(); api.close(); return; }
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
        const t = e.target; const tag = (t.tagName || '').toLowerCase();
        if (tag === 'textarea') return; // let Enter add a newline in multi-line fields
        if (tag === 'button') return; // native button activation already handles Enter
        e.preventDefault();
        const main = [...foot.querySelectorAll('button')].pop(); // primary action is always the last button (Save)
        if (main) main.click();
      }
    });
    setTimeout(() => { const first = ov.querySelector('.modal-b input, .modal-b select, .modal-b textarea'); if (first) first.focus(); }, 30);
    document.body.appendChild(ov); App.markNet(); return api;
  },
  confirm(msg, o = {}) {
    return new Promise(res => { let done = false; const fin = v => { if (!done) { done = true; res(v); } };
      UI.modal({ title: o.title || 'Please confirm', size: 'small', body: `<p>${msg}</p>`, onClose: () => fin(false),
        buttons: [{ label: 'Cancel', cls: 'sec', onClick: () => fin(false) }, { label: o.ok || 'Yes', cls: o.cls || 'dng', onClick: () => fin(true) }] }); });
  },
  fields(fields, v = {}) {
    return '<div class="form-grid">' + fields.map(f => {
      if (f.type === 'html') return `<div class="full">${f.html}</div>`;
      const val = v[f.name] ?? f.default ?? ''; const a = `name="${f.name}" ${f.required ? 'required' : ''} ${f.placeholder ? `placeholder="${esc(f.placeholder)}"` : ''}`;
      let inp;
      if (f.type === 'select') { const opts = (typeof f.options === 'function' ? f.options() : f.options) || []; inp = `<select ${a}>${f.blank ? '<option value=""></option>' : ''}${opts.map(o => { const [ov, ol] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(ov)}" ${String(ov) === String(val) ? 'selected' : ''}>${esc(ol)}</option>`; }).join('')}</select>`; }
      else if (f.type === 'textarea') inp = `<textarea ${a} rows="${f.rows || 3}">${esc(val)}</textarea>`;
      else if (f.type === 'checkbox') inp = `<input type="checkbox" ${a} ${val && val !== '0' ? 'checked' : ''}>`;
      else if (f.type === 'patient') inp = `<div style="position:relative"><input type="text" data-psearch autocomplete="off" placeholder="Search name / phone…" value="${esc(v.patient_name || f.label2 || '')}"><input type="hidden" name="${f.name}" value="${esc(val)}"><div class="pdrop hidden" style="position:absolute;left:0;right:0;z-index:30;background:var(--bg);border:1px solid var(--border);border-radius:10px;max-height:220px;overflow:auto"></div></div>`;
      else inp = `<input type="${f.type || 'text'}" ${a} value="${esc(val)}" ${f.step ? `step="${f.step}"` : ''} ${f.type === 'number' && !f.step ? 'step="any"' : ''}>`;
      return `<label class="f ${f.full ? 'full' : ''}">${f.label}${inp}</label>`;
    }).join('') + '</div>';
  },
  bindPickers(root) {
    $$('[data-psearch]', root).forEach(inp => {
      const drop = inp.parentElement.querySelector('.pdrop'), hid = inp.parentElement.querySelector('input[type=hidden]');
      const run = debounce(async () => { const r = await API.get('patients' + API.qs({ q: inp.value, limit: 8 })).catch(() => []); drop.innerHTML = r.map(p => `<a href="#" data-id="${p.id}" style="display:block;padding:8px 12px;color:var(--text)">${esc(p.full_name)} <small class="muted">${esc(p.phone || '')}</small></a>`).join('') || '<div class="muted" style="padding:8px">No match</div>'; drop.classList.remove('hidden'); });
      inp.addEventListener('input', () => { hid.value = ''; run(); }); inp.addEventListener('focus', run);
      drop.addEventListener('mousedown', e => { const a = e.target.closest('a'); if (!a) return; e.preventDefault(); hid.value = a.dataset.id; inp.value = a.firstChild.textContent.trim(); drop.classList.add('hidden'); hid.dispatchEvent(new Event('change', { bubbles: true })); });
      inp.addEventListener('blur', () => setTimeout(() => drop.classList.add('hidden'), 150));
    });
  },
  read(root) {
    const o = {}; $$('[name]', root).forEach(el => {
      if (el.type === 'checkbox') o[el.name] = el.checked ? 1 : 0; else if (el.type === 'number') o[el.name] = el.value === '' ? null : Number(el.value); else o[el.name] = el.value;
    }); return o;
  },
  /* add/edit dialog with 5-second draft autosave */
  editModal(o) {
    const draftKey = o.draftKey ? 'draft:' + o.draftKey : null; let vals = { ...(o.values || {}) };
    if (draftKey && !vals.id) { try { const d = JSON.parse(localStorage.getItem(draftKey) || 'null'); if (d) { vals = { ...vals, ...d }; UI.toast('Draft restored'); } } catch {} }
    const m = UI.modal({ title: o.title, size: o.size, sticky: true, body: UI.fields(o.fields, vals) + (o.extra || ''), buttons: [
      { label: 'Cancel', cls: 'sec' },
      { label: '💾 Save', keep: true, onClick: async () => {
        const form = m.body; if (!$$('[required]', form).every(el => el.value !== '' || el.reportValidity())) { const bad = $$('[required]', form).find(el => el.value === ''); bad && bad.reportValidity(); return; }
        await o.onSave(UI.read(form), m); if (draftKey) localStorage.removeItem(draftKey); m.close(); } }] });
    UI.bindPickers(m.body); if (o.onOpen) o.onOpen(m);
    if (draftKey) m._timer = setInterval(() => { try { localStorage.setItem(draftKey, JSON.stringify(UI.read(m.body))); } catch {} }, 5000);
    return m;
  },
  exportRows(name, headers, rows, kind) {
    let blob, ext;
    if (kind === 'xls') { const h = '<html><head><meta charset="utf-8"></head><body><table border="1"><tr>' + headers.map(x => `<th>${esc(x)}</th>`).join('') + '</tr>' + rows.map(r => '<tr>' + r.map(c => `<td>${esc(c)}</td>`).join('') + '</tr>').join('') + '</table></body></html>'; blob = new Blob([h], { type: 'application/vnd.ms-excel' }); ext = 'xls'; }
    else { const q = c => '"' + String(c ?? '').replace(/"/g, '""') + '"'; blob = new Blob(['\ufeff' + [headers, ...rows].map(r => r.map(q).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }); ext = 'csv'; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${name}_${today()}.${ext}`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 3000);
  },
  deleted(table, id, reload, msg) {
    UI.toast(msg || 'Deleted — moved to Trash (30 days)', { timeout: 8000, actions: [{ label: '↩ Undo', cls: '', onClick: async () => { await API.post('trash/restore', { table, id }); UI.toast('Restored ✔', { type: 'good' }); reload && reload(); } }] });
  },
  /* sortable / filterable / inline-editable table */
  table(box, cfg) {
    const S = { q: '', sort: null, dir: 1, page: 0, rows: cfg.rows || [] }; const size = cfg.pageSize || 50;
    const txt = (c, r) => (c.text ? c.text(r) : r[c.key]) ?? '';
    function view() {
      let rows = S.rows; if (S.q) { const q = S.q.toLowerCase(); rows = rows.filter(r => cfg.columns.some(c => String(txt(c, r)).toLowerCase().includes(q))); }
      if (S.sort != null) { const c = cfg.columns[S.sort]; rows = [...rows].sort((a, b) => { const x = txt(c, a), y = txt(c, b); return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), undefined, { numeric: true })) * S.dir; }); }
      return rows;
    }
    function render() {
      const rows = view(); const pages = Math.max(1, Math.ceil(rows.length / size)); if (S.page >= pages) S.page = pages - 1; const slice = rows.slice(S.page * size, S.page * size + size);
      const acts = cfg.actions || {}; const hasAct = acts.edit || acts.del || acts.dup || acts.view || cfg.extra || cfg.trailing;
      box.innerHTML = `<div class="tbl-wrap"><table><thead><tr>${cfg.columns.map((c, i) => `<th data-s="${i}">${c.label}${S.sort === i ? (S.dir > 0 ? ' ▲' : ' ▼') : ''}</th>`).join('')}${hasAct ? '<th style="cursor:default">Actions</th>' : ''}</tr></thead>
      <tbody>${slice.map((r, ri) => `<tr data-i="${S.rows.indexOf(r)}">${cfg.columns.map((c, ci) => `<td ${c.edit ? `data-e="${ci}" title="Double-click to edit"` : ''} style="${c.align ? 'text-align:' + c.align : ''}">${c.render ? c.render(r) : esc(r[c.key])}</td>`).join('')}${hasAct ? `<td><div class="row-act">${acts.view ? '<button data-act="view" title="View">👁</button>' : ''}${acts.edit ? `<button data-act="edit" title="Edit">${ic('edit_patient', 19)}</button>` : ''}${acts.dup ? '<button data-act="dup" title="Duplicate">📋</button>' : ''}${cfg.extra ? cfg.extra(r) : ''}${acts.del ? `<button data-act="del" title="Delete">${ic('delete_icon', 19)}</button>` : ''}${cfg.trailing ? cfg.trailing(r) : ''}</div></td>` : ''}</tr>`).join('') || `<tr><td colspan="${cfg.columns.length + 1}" class="center muted" style="padding:28px">${cfg.empty || 'No records yet — click Add'}</td></tr>`}</tbody></table></div>
      <div class="pager"><span class="muted">${rows.length} record(s)</span>${pages > 1 ? `<button class="btn sm sec" data-pg="-1">‹</button><span>${S.page + 1} / ${pages}</span><button class="btn sm sec" data-pg="1">›</button>` : ''}</div>`;
      App.markNet();
    }
    box.onclick = async e => {
      const th = e.target.closest('th[data-s]'); if (th) { const i = Number(th.dataset.s); S.dir = S.sort === i ? -S.dir : 1; S.sort = i; return render(); }
      const pg = e.target.closest('[data-pg]'); if (pg) { S.page += Number(pg.dataset.pg); return render(); }
      const b = e.target.closest('[data-act]'); if (!b) return; const row = S.rows[e.target.closest('tr').dataset.i]; cfg.onAction && cfg.onAction(b.dataset.act, row, b);
    };
    box.ondblclick = e => {
      const td = e.target.closest('td[data-e]'); if (!td) return; const c = cfg.columns[td.dataset.e]; const row = S.rows[td.parentElement.dataset.i]; const old = row[c.key];
      td.contentEditable = true; td.textContent = old ?? ''; td.focus(); document.getSelection().selectAllChildren(td);
      const done = async ok => { td.contentEditable = false; const val = td.textContent.trim(); if (!ok || val === String(old ?? '')) return render(); try { await cfg.onInline(row, c.key, c.edit === 'number' ? Number(val) : val); row[c.key] = c.edit === 'number' ? Number(val) : val; } catch (er) { UI.toast(er.message, { type: 'err' }); } render(); };
      td.onkeydown = ev => { if (ev.key === 'Enter') { ev.preventDefault(); done(true); } if (ev.key === 'Escape') done(false); }; td.onblur = () => done(true);
    };
    const ctl = { state: S, render, setRows(r) { S.rows = r; render(); }, search(q) { S.q = q; S.page = 0; render(); }, view,
      exportData() { const rows = view(); return { headers: cfg.columns.map(c => c.label), rows: rows.map(r => cfg.columns.map(c => String(txt(c, r)))) }; } };
    render(); return ctl;
  }
};

/* ===== Crud page builder: list + add/edit/duplicate/delete(+undo) + search + export ===== */
const Crud = {
  async page(cfg) {
    const box = cfg.box; const F = cfg.filters || [];
    box.innerHTML = `<div class="toolbar"><input class="grow" id="cq" placeholder="Search…"> ${F.map(f => `<label class="muted" style="font-size:.8rem">${f.label || ''}${f.type === 'select' ? `<select data-f="${f.name}"><option value="">${f.allLabel || 'All'}</option>${f.options.map(o => { const [ov, ol] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(ov)}">${esc(ol)}</option>`; }).join('')}</select>` : `<input type="date" data-f="${f.name}" value="${f.default || ''}">`}</label>`).join('')}
      ${cfg.toolbar || ''} ${cfg.noAdd ? '' : btn('', '➕', cfg.addLabel ? cfg.addLabel[0] : 'Add', '', 'id="cadd"')}
      <button class="btn sm sec" id="cx-csv">CSV</button><button class="btn sm sec" id="cx-xls">Excel</button><button class="btn sm sec" id="cx-pdf">PDF</button></div><div id="cbody"></div><div id="cfoot" class="mt"></div>`;
    const ctl = { cfg };
    const filters = () => { const o = {}; $$('[data-f]', box).forEach(el => { if (el.value) o[el.dataset.f] = el.value; }); return { ...(cfg.params ? cfg.params() : {}), ...o }; };
    /* NOTE: cfg.extra is the per-row "extra action buttons" renderer used by UI.table below -
       cfg.formExtra (a different key) is the modal's extra HTML (e.g. a file input), kept
       separate on purpose so the two unrelated things never collide under one name. */
    const edit = (row) => UI.editModal({ title: row ? (cfg.editTitle || 'Edit') : (cfg.newTitle || 'Add'), fields: typeof cfg.fields === 'function' ? cfg.fields(row) : cfg.fields, values: row || (cfg.defaults ? cfg.defaults() : {}), size: cfg.size, draftKey: cfg.draft && !row ? cfg.draft : null, extra: typeof cfg.formExtra === 'function' ? cfg.formExtra(row) : cfg.formExtra,
      onSave: async (v, m) => { if (cfg.beforeSave) v = await cfg.beforeSave(v, row, m) || v; if (row) await API.put(`${cfg.endpoint}/${row.id}`, v); else await API.post(cfg.endpoint, v); UI.toast('Saved ✔', { type: 'good' }); ctl.reload(); cfg.onChange && cfg.onChange(); } });
    const table = UI.table($('#cbody', box), { columns: cfg.columns, rows: [], pageSize: cfg.pageSize, actions: { edit: 1, del: 1, dup: 1, ...(cfg.actions || {}) }, extra: cfg.extra, empty: cfg.empty,
      onInline: (row, key, val) => API.put(`${cfg.endpoint}/${row.id}`, { [key]: val }),
      onAction: async (act, row, b) => {
        if (act === 'edit') edit(row);
        else if (act === 'dup') { await API.post(`${cfg.endpoint}/${row.id}/duplicate`); UI.toast('Duplicated ✔', { type: 'good' }); ctl.reload(); }
        else if (act === 'del') { if (await UI.confirm('Delete this record? It goes to Trash for 30 days.')) { await API.del(`${cfg.endpoint}/${row.id}`); UI.deleted(cfg.endpoint, row.id, ctl.reload); ctl.reload(); cfg.onChange && cfg.onChange(); } }
        else cfg.onAction && cfg.onAction(act, row, b, ctl);
      } });
    ctl.table = table; ctl.edit = edit;
    ctl.reload = async () => { try { let rows = await API.get(cfg.endpoint + API.qs(filters())); if (cfg.transform) rows = cfg.transform(rows); table.setRows(rows); cfg.onLoad && cfg.onLoad(rows, ctl); } catch (e) { UI.toast(e.message, { type: 'err' }); } };
    $('#cq', box).oninput = e => table.search(e.target.value); $$('[data-f]', box).forEach(el => el.onchange = ctl.reload);
    if ($('#cadd', box)) $('#cadd', box).onclick = () => edit(null);
    const exp = k => { const d = table.exportData(); UI.exportRows(cfg.exportName || cfg.endpoint, d.headers, d.rows, k); };
    $('#cx-csv', box).onclick = () => exp('csv'); $('#cx-xls', box).onclick = () => exp('xls');
    $('#cx-pdf', box).onclick = () => { const d = table.exportData(); API.pdfTable({ title: cfg.pdfTitle || cfg.exportName || cfg.endpoint, subtitle: '', columns: d.headers, rows: d.rows, summary: cfg.pdfSummary ? cfg.pdfSummary(table.view()) : [] }).catch(e => UI.toast(e.message, { type: 'err' })); };
    if (cfg.after) cfg.after(box, ctl);
    await ctl.reload(); return ctl;
  }
};

/* ===== App shell ===== */
const NAV = [
  ['dashboard', ic('dashboard', 20), 'Dashboard'], ['patients', ic('patient', 20), 'Patients'], ['waiting-room', ic('waiting_room', 20), 'Waiting Room'], ['appointments', ic('appointment', 20), 'Appointments'], ['ortho-tie', ic('orthobrasis', 20), 'Ortho Tie Sheet'],
  ['lab-records', ic('pdf', 20), 'Lab Records'], ['pos', ic('pos', 20), 'POS'], ['ledger', ic('ledger', 20), 'Ledger'], ['expenses', ic('expenses', 20), 'Expenses'], ['reports', ic('reports', 20), 'Reports'], ['reminders', ic('reminder', 20), 'Reminders'], ['settings', ic('settings', 20), 'Settings']];
const ROLE_PAGES = { receptionist: ['dashboard', 'patients', 'waiting-room', 'appointments', 'ortho-tie', 'lab-records', 'pos', 'reminders'], accountant: ['dashboard', 'ledger', 'expenses', 'reports', 'patients'] };
const App = {
  settings: (() => { try { return JSON.parse(localStorage.getItem('noor_settings') || '{}'); } catch { return {}; } })(), user: null,
  _q: [], _ready: false,
  ready(fn) { App._ready ? fn() : App._q.push(fn); },
  markNet: debounce(() => {
    const off = !navigator.onLine;
    $$('[data-net]').forEach(el => { el.disabled = off; el.title = off ? 'Needs internet — you are offline' : ''; });
  }, 30),
  setNet() {
    const off = !navigator.onLine; const n = $('#net'); document.documentElement.classList.toggle('offline', off);
    if (n) n.innerHTML = off ? '🔴 Offline — Sab kuch chal raha hai' : ic('online', 14) + ' Online';
    App.markNet();
  },
  syncInstall() {
    const b = $('#install-btn'); if (!b) return; const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    b.classList.toggle('show', !!window.__deferredPrompt && !standalone);
  },
  async install() { const p = window.__deferredPrompt; if (!p) return; p.prompt(); const r = await p.userChoice; window.__deferredPrompt = null; App.syncInstall(); if (r.outcome === 'accepted') UI.toast('Installing… ✔', { type: 'good' }); },
  logout: async () => { try { await API.post('auth/logout'); } catch {} API.clear(); location.href = '/index.html'; },
  async init() {
    const page = document.body.dataset.page; if (page === 'login') return;
    if (!API.token()) { location.href = '/index.html'; return; }
    App.user = API.user() || { role: 'admin', full_name: 'User' };
    App.mount(page);
    try { const s = await API.get('settings'); App.settings = s; localStorage.setItem('noor_settings', JSON.stringify(s)); if (s.theme) { localStorage.setItem('noor_theme', JSON.stringify(s.theme)); Theme.apply(); } } catch (e) { if (e.message === 'Session expired') return; }
    App.setNet(); App.bell();
    App._ready = true; App._q.forEach(f => Promise.resolve().then(f).catch(e => UI.toast(e.message, { type: 'err' }))); App._q = [];
  },
  mount(page) {
    const content = $('#content'); const allowed = ROLE_PAGES[App.user.role]; const nav = NAV.filter(n => !allowed || allowed.includes(n[0]));
    const shell = document.createElement('div'); shell.id = 'shell';
    shell.innerHTML = `<aside id="sidebar" class="${localStorage.getItem('noor_sb') === '1' ? 'collapsed' : ''}"><div class="brand"><img src="/icons/logo.png" alt="Noor Dental Clinic logo"><div class="brand-text"><b>${esc((App.settings.clinic || {}).name || 'Noor Dental Clinic')}</b><small>Dr. M. AlNoor Orakzai</small></div></div>
      <nav class="nav">${nav.map(n => `<a href="/${n[0]}.html" class="${n[0] === page ? 'active' : ''}"><span class="ico">${n[1]}</span><span class="nav-label"><span>${n[2]}</span></span></a>`).join('')}</nav></aside>
      <div id="main"><header id="topbar"><button class="icon-btn" id="sb-toggle" title="Menu">☰</button>
        <div id="gsearch"><span style="position:absolute;left:11px;top:50%;transform:translateY(-50%);pointer-events:none;display:flex">${ic('search', 16)}</span><input id="gs" placeholder="Search patients…" style="padding-left:34px"><div id="gresults" class="hidden"></div></div><span class="grow"></span>
        <button id="install-btn" class="btn sm">${ic('install_app', 16)} Install App</button>
        <span id="net" class="status-pill" title="This shows internet status only (needed for WhatsApp / Email). Patients, appointments, POS, ledger etc. always work without internet.">${ic('online', 14)} Online</span>
        <button class="icon-btn" id="bell" title="Reminders">${ic('bell', 18)}<span class="badge hidden" id="bell-n">0</span></button>
        <button class="icon-btn" id="theme-toggle" title="Dark / Light">☀️</button>
        <div style="position:relative"><button class="icon-btn" id="prof" title="Profile">${ic('profile', 18)}</button><div id="pmenu" class="hidden card" style="position:absolute;right:0;top:46px;width:220px;z-index:60;padding:10px"><b>${esc(App.user.full_name)}</b><div class="muted mb" style="font-size:.8rem">${esc(App.user.role)}</div><a href="/settings.html" class="btn sm sec" style="display:flex;margin-bottom:8px">${ic('settings', 14)} Settings</a><button class="btn sm dng" id="logout" style="width:100%">🚪 Logout</button></div></div>
      </header></div>`;
    document.body.prepend(shell); $('#main', shell).appendChild(content); document.body.dataset.shell = 1;
    Theme.apply(); $('#sb-toggle').onclick = () => { const s = $('#sidebar'); if (innerWidth < 640) s.classList.toggle('open'); else { s.classList.toggle('collapsed'); localStorage.setItem('noor_sb', s.classList.contains('collapsed') ? '1' : '0'); } };
    $('#theme-toggle').onclick = () => Theme.toggle();
    $('#install-btn').onclick = App.install; $('#bell').onclick = () => location.href = '/reminders.html'; $('#logout').onclick = App.logout;
    $('#prof').onclick = () => $('#pmenu').classList.toggle('hidden'); addEventListener('online', App.setNet); addEventListener('offline', App.setNet);
    document.addEventListener('click', e => { if (!e.target.closest('#prof,#pmenu')) $('#pmenu') && $('#pmenu').classList.add('hidden'); if (!e.target.closest('#gsearch')) $('#gresults') && $('#gresults').classList.add('hidden'); });
    /* block WhatsApp/Email actions while offline */
    document.addEventListener('click', e => { const el = e.target.closest('[data-net]'); if (el && !navigator.onLine) { e.preventDefault(); e.stopImmediatePropagation(); UI.toast('You are offline — WhatsApp / Email need internet. Everything else still works.', { type: 'err' }); } }, true);
    new MutationObserver(() => App.markNet()).observe(document.body, { childList: true, subtree: true });
    const gs = $('#gs'); gs.oninput = debounce(async () => { const box = $('#gresults'); if (gs.value.length < 2) return box.classList.add('hidden'); const r = await API.get('patients' + API.qs({ q: gs.value, limit: 8 })).catch(() => []); box.innerHTML = r.map(p => `<a href="/patients.html?id=${p.id}">${esc(p.full_name)} <small class="muted">${esc(p.phone || '')}</small></a>`).join('') || '<div class="muted" style="padding:10px">No match</div>'; box.classList.remove('hidden'); });
    App.syncInstall();
  },
  async bell() { try { const r = await API.get('reminders' + API.qs({ status: 'Pending', to: today() })); const n = $('#bell-n'); if (n && r.length) { n.textContent = r.length; n.classList.remove('hidden'); } } catch {} },
  pageHead(en, ur, right = '') { return `<div class="page-head"><div><h1>${en}</h1></div><div class="flex gap wrap">${right}</div></div>`; },
  chart(canvas, cfg) { const th = getComputedStyle(document.documentElement); Chart.defaults.color = th.getPropertyValue('--muted'); Chart.defaults.borderColor = 'rgba(148,163,184,.15)'; return new Chart(canvas, cfg); },
  palette: ['#3B82F6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6']
};
document.addEventListener('DOMContentLoaded', App.init);
