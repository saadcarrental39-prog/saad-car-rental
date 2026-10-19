/* POS: fast checkout, patient auto-fill, custom items, discount, split payment, receipt print */
App.ready(async () => {
  const q = new URLSearchParams(location.search); const svcAll = await API.get('services');
  const c = $('#content'); c.innerHTML = App.pageHead('Point of Sale', '', `<button class="btn sec" id="svc-edit">${bi('🛠 Manage Services')}</button><button class="btn sec" id="reprint">${bi('🖨 Reprint Receipt')}</button>`) +
    `<div class="pos"><div><div class="toolbar"><input id="sf" class="grow" placeholder="Search service…"><select id="cat"><option value="">All categories</option>${[...new Set(svcAll.map(s => s.category))].filter(Boolean).map(x => `<option>${esc(x)}</option>`).join('')}</select><button class="btn sm sec" id="custom">➕ Custom item</button></div><div class="svc-grid" id="svcs"></div></div>
    <div class="card"><h3>Bill</h3><div style="position:relative"><input id="psearch" placeholder="Patient (optional) — search name/phone…" autocomplete="off"><input type="hidden" id="pid"><div class="pdrop hidden" style="position:absolute;left:0;right:0;z-index:20;background:var(--bg);border:1px solid var(--border);border-radius:10px;max-height:200px;overflow:auto"></div></div>
    <div class="tbl-wrap mt" style="max-height:260px"><table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Disc</th><th>Total</th><th></th></tr></thead><tbody id="cart"></tbody></table></div>
    <div class="mt"><div class="flex between"><span>Subtotal</span><b id="sub">PKR 0</b></div><div class="flex between items-center"><span>Discount</span><span class="flex gap"><input id="dv" type="number" value="0" style="width:80px"><select id="dt" style="width:90px"><option value="fixed">PKR</option><option value="percent">%</option></select></span></div>
    <div class="flex between items-center" id="taxrow"><span>Tax %</span><input id="tp" type="number" value="0" style="width:80px"></div><div class="flex between mt"><span>Total</span><div class="total-box" id="tot">PKR 0</div></div></div>
    <h3 class="mt">Payment</h3><div id="pays"></div><button class="btn sm sec" id="addpay">➕ Add payment method</button>
    <div class="flex between mt"><span>Paid</span><b id="paid">PKR 0</b></div><div class="flex between"><span>Change / Balance</span><b id="chg">PKR 0</b></div>
    <button class="btn" style="width:100%;margin-top:14px" id="checkout">${bi('✅ Complete Sale')}</button></div></div>`;
  UI.bindPickers(c);
  let cart = []; let pat = null;
  const taxCfg = App.settings.pos || {};
  $('#taxrow').classList.toggle('hidden', !taxCfg.tax_enabled); $('#tp').value = taxCfg.tax_percent || 0;
  function renderSvc() {
    const qv = $('#sf').value.toLowerCase(), cat = $('#cat').value;
    $('#svcs').innerHTML = svcAll.filter(s => s.active && (!cat || s.category === cat) && (!qv || s.name.toLowerCase().includes(qv))).map(s => `<button class="svc" data-id="${s.id}"><b>${esc(s.name)}</b><small>${money(s.price)}</small></button>`).join('') || '<p class="muted">No services</p>';
    $$('.svc', c).forEach(b => b.onclick = () => addItem(svcAll.find(s => s.id == b.dataset.id)));
  }
  $('#sf').oninput = renderSvc; $('#cat').onchange = renderSvc; renderSvc();
  $('#custom').onclick = () => UI.modal({ title: 'Custom item', size: 'small', body: '<label class="f">Name<input id="cn"></label><label class="f">Price<input id="cp" type="number"></label>', buttons: [{ label: 'Add', keep: false, onClick: () => addItem({ name: $('#cn').value || 'Custom item', price: Number($('#cp').value) || 0 }) }] });
  function addItem(s) { const ex = cart.find(i => i.name === s.name && !i._custom); if (ex && s.id) ex.qty++; else cart.push({ name: s.name, price: s.price, qty: 1, discount: 0, tooth_no: '', _custom: !s.id }); renderCart(); }
  function renderCart() {
    $('#cart').innerHTML = cart.map((i, k) => `<tr><td>${esc(i.name)}</td><td><input type="number" min="1" value="${i.qty}" data-q="${k}" style="width:56px"></td><td><input type="number" value="${i.price}" data-p="${k}" style="width:80px"></td><td><input type="number" value="${i.discount}" data-d="${k}" style="width:70px"></td><td>${money(i.price * i.qty - i.discount)}</td><td><button data-rm="${k}">✕</button></td></tr>`).join('') || `<tr><td colspan="6" class="center muted">Cart empty — click a service</td></tr>`;
    $$('[data-q]', c).forEach(el => el.oninput = () => { cart[el.dataset.q].qty = Math.max(1, Number(el.value) || 1); calc(); });
    $$('[data-p]', c).forEach(el => el.oninput = () => { cart[el.dataset.p].price = Number(el.value) || 0; calc(); });
    $$('[data-d]', c).forEach(el => el.oninput = () => { cart[el.dataset.d].discount = Number(el.value) || 0; calc(); });
    $$('[data-rm]', c).forEach(el => el.onclick = () => { cart.splice(el.dataset.rm, 1); renderCart(); }); calc();
  }
  let pays = [{ method: 'Cash', amount: 0, tid: '', sender: '' }];
  function renderPays() {
    $('#pays').innerHTML = pays.map((p, k) => `<div class="flex gap mb" data-pk="${k}"><select data-pm>${['Cash', 'EasyPaisa', 'JazzCash', 'Bank Transfer', 'Card'].map(m => `<option ${m === p.method ? 'selected' : ''}>${m}</option>`).join('')}</select><input type="number" data-pa placeholder="Amount" value="${p.amount || ''}">${['EasyPaisa', 'JazzCash'].includes(p.method) ? `<input data-pt placeholder="TID" value="${p.tid || ''}"><input data-ps placeholder="Sender #" value="${p.sender || ''}">` : ''}${pays.length > 1 ? '<button data-prm>✕</button>' : ''}</div>`).join('');
    $$('[data-pk]', c).forEach(row => { const k = row.dataset.pk;
      row.querySelector('[data-pm]').onchange = e => { pays[k].method = e.target.value; renderPays(); }; row.querySelector('[data-pa]').oninput = e => { pays[k].amount = Number(e.target.value) || 0; calc(); };
      const t = row.querySelector('[data-pt]'); if (t) t.oninput = e => pays[k].tid = e.target.value; const s = row.querySelector('[data-ps]'); if (s) s.oninput = e => pays[k].sender = e.target.value;
      const rm = row.querySelector('[data-prm]'); if (rm) rm.onclick = () => { pays.splice(k, 1); renderPays(); calc(); }; });
  }
  $('#addpay').onclick = () => { pays.push({ method: 'Cash', amount: 0 }); renderPays(); }; renderPays();
  function calc() {
    const sub = cart.reduce((s, i) => s + i.price * i.qty - i.discount, 0); const dv = Number($('#dv').value) || 0, dt = $('#dt').value;
    const disc = dt === 'percent' ? sub * dv / 100 : dv; const tax = taxCfg.tax_enabled ? (sub - disc) * (Number($('#tp').value) || 0) / 100 : 0; const tot = Math.max(0, sub - disc + tax);
    const paid = pays.reduce((s, p) => s + Number(p.amount || 0), 0);
    $('#sub').textContent = money(sub); $('#tot').textContent = money(tot); $('#paid').textContent = money(paid);
    const diff = tot - paid; $('#chg').textContent = money(Math.abs(diff)); $('#chg').className = diff > 0 ? 'out' : 'in'; $('#chg').previousElementSibling.textContent = diff > 0 ? 'Balance due' : 'Change';
  }
  $('#dv').oninput = calc; $('#dt').onchange = calc; $('#tp').oninput = calc;
  $('#pid').addEventListener('change', async () => { pat = $('#pid').value ? await API.get('patients/' + $('#pid').value) : null; });
  if (q.get('patient')) { const p = await API.get('patients/' + q.get('patient')); $('#psearch').value = p.full_name; $('#pid').value = p.id; pat = p; }
  $('#checkout').onclick = async () => {
    if (!cart.length) return UI.toast('Add at least one item', { type: 'err' });
    const payload = { patient_id: $('#pid').value || null, items: cart, discount_type: $('#dt').value, discount_value: Number($('#dv').value) || 0, tax_percent: Number($('#tp').value) || 0, payments: pays.filter(p => p.amount > 0) };
    try { const sale = await API.post('pos/checkout', payload); UI.toast('Sale recorded ✔', { type: 'good' });
      const m = UI.modal({ title: 'Receipt ready', size: 'small', body: `<p>Sale #${sale.id} — Total ${money(sale.total)}</p>`, buttons: [{ label: '🖨 58mm', cls: 'sec', onClick: () => API.openPdf('pdf/receipt/' + sale.id + '?size=58mm') }, { label: '🖨 80mm', cls: 'sec', onClick: () => API.openPdf('pdf/receipt/' + sale.id + '?size=80mm') }, { label: '🖨 A4', onClick: () => API.openPdf('pdf/receipt/' + sale.id + '?size=A4') }] });
      cart = []; pays = [{ method: 'Cash', amount: 0 }]; $('#pid').value = ''; $('#psearch').value = ''; $('#dv').value = 0; renderCart(); renderPays();
    } catch (e) { UI.toast(e.message, { type: 'err' }); }
  };
  $('#svc-edit').onclick = () => Crud.page({ box: (() => { const m = UI.modal({ title: 'Manage Services', size: 'wide', buttons: [{ label: 'Close', cls: 'sec' }] }); return m.body; })(),
    endpoint: 'services', exportName: 'services', addLabel: ['Add Service'],
    fields: [{ name: 'name', label: 'Name', required: true }, { name: 'urdu_name', label: 'Urdu name' }, { name: 'price', label: 'Price (PKR)', type: 'number', required: true }, { name: 'category', label: 'Category' }, { name: 'active', label: 'Active', type: 'checkbox', default: 1 }],
    columns: [{ key: 'name', label: 'Name', edit: 'text' }, { key: 'urdu_name', label: 'Urdu' }, { key: 'price', label: 'Price', edit: 'number', render: r => money(r.price) }, { key: 'category', label: 'Category', edit: 'text' }, { key: 'active', label: 'Active', render: r => r.active ? '✔' : '✕' }], onChange: () => location.reload() });
  $('#reprint').onclick = async () => { const id = prompt('Enter receipt/sale # to reprint:'); if (id) API.openPdf('pdf/receipt/' + id); };
});
