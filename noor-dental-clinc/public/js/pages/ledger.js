/* Ledger: clinic + per-patient, methods, accounts book, daily open/close, TID tracking */
App.ready(async () => {
  const c = $('#content'); c.innerHTML = App.pageHead('Ledger', '', `<button class="btn ok" id="rp">${bi('💵 Receive Payment')}</button><button class="btn sec" id="po">${bi('💸 Record Expense/Out')}</button><a class="btn sec" href="/reports.html?type=outstanding">⏳ Paid/Unpaid Report</a>`) +
    `<div class="grid g4 mb" id="sum"></div><div class="grid g2 mb" id="acc"></div><div id="box"></div>`;
  async function summary() {
    const s = await API.get('ledger-summary' + API.qs({ date: $('#df') ? $('#df').value : today() }));
    $('#sum').innerHTML = [['Opening balance', s.opening], ["Today's In", s.in], ["Today's Out", s.out], ['Closing balance', s.closing]]
      .map((t, i) => `<div class="card kpi"><div class="ic">${['🏦', '📥', '📤', '💼'][i]}</div><div><small>${t[0]}</small><b class="${i === 1 ? 'in' : i === 2 ? 'out' : ''}">${money(t[1])}</b></div></div>`).join('');
    $('#acc').innerHTML = `<div class="card"><h3>Bank / Wallet accounts</h3>${s.accounts.map(a => `<div class="flex between" style="padding:5px 0;border-bottom:1px solid var(--border)"><span>${esc(a.name)} <span class="muted">(${esc(a.type)})</span></span><b>${money(a.balance)}</b></div>`).join('')}</div>
    <div class="card"><h3>Period totals</h3><p>Week: <span class="in">${money(s.week.i)}</span> / <span class="out">${money(s.week.o)}</span></p><p>Month: <span class="in">${money(s.month.i)}</span> / <span class="out">${money(s.month.o)}</span></p><p>Year: <span class="in">${money(s.year.i)}</span> / <span class="out">${money(s.year.o)}</span></p></div>`;
  }
  await Crud.page({ box: $('#box'), endpoint: 'ledger', exportName: 'ledger', pdfTitle: 'Ledger Report', noAdd: true,
    filters: [{ name: 'from', label: 'From', type: 'date' }, { name: 'to', label: 'To', type: 'date' }, { name: 'method', label: 'Method', type: 'select', options: ['Cash', 'EasyPaisa', 'JazzCash', 'Bank Transfer', 'Card'] }, { name: 'type', label: 'Type', type: 'select', options: [['in', 'In'], ['out', 'Out']] }],
    columns: [{ key: 'date', label: 'Date' }, { key: 'time', label: 'Time' }, { key: 'type', label: 'Type', render: r => `<span class="${r.type}">${r.type === 'in' ? '▲ In' : '▼ Out'}</span>` }, { key: 'patient_name', label: 'Patient' }, { key: 'amount', label: 'Amount', render: r => money(r.amount) }, { key: 'method', label: 'Method' }, { key: 'account', label: 'Account' }, { key: 'tid', label: 'TID' }, { key: 'category', label: 'Category' }, { key: 'notes', label: 'Notes' }],
    actions: { edit: 0, dup: 0, del: 1 }, empty: 'No transactions', onLoad: () => summary(), onChange: summary,
    after: (box) => { box.insertAdjacentHTML('afterbegin', `<label class="muted" style="font-size:.8rem">As of <input type="date" id="df" value="${today()}" style="width:auto;display:inline-block"></label>`); $('#df', box).onchange = summary; }
  });
  $('#rp').onclick = () => payFormGeneric();
  $('#po').onclick = () => UI.editModal({ title: '💸 Record Cash Out', size: 'small', values: { date: today(), method: 'Cash', type: 'out', category: 'Misc' }, fields: [{ name: 'amount', label: 'Amount', type: 'number', required: true }, { name: 'method', label: 'Method', type: 'select', options: ['Cash', 'EasyPaisa', 'JazzCash', 'Bank Transfer', 'Card'] }, { name: 'category', label: 'Category', options: App.settings.expense_categories, type: 'select' }, { name: 'date', label: 'Date', type: 'date' }, { name: 'notes', label: 'Notes', type: 'textarea', full: true }],
    onSave: async v => { await API.post('ledger', { ...v, type: 'out' }); UI.toast('Recorded ✔', { type: 'good' }); location.reload(); } });
  function payFormGeneric() {
    UI.editModal({ title: '💵 Receive Payment', size: 'wide', values: { date: today(), method: 'Cash' }, fields: [{ name: 'patient_id', label: 'Patient (optional)', type: 'patient' }, { name: 'amount', label: 'Amount', type: 'number', required: true }, { name: 'method', label: 'Method', type: 'select', options: ['Cash', 'EasyPaisa', 'JazzCash', 'Bank Transfer', 'Card'] }, { name: 'date', label: 'Date', type: 'date' }, { name: 'tid', label: 'TID' }, { name: 'sender', label: 'Sender number' }, { name: 'notes', label: 'Notes', type: 'textarea', full: true }],
      onSave: async v => { await API.post('ledger', { ...v, type: 'in', category: 'Patient payment' }); UI.toast('Recorded ✔', { type: 'good' }); location.reload(); } });
  }
});
