App.ready(async () => {
  const c = $('#content'); c.innerHTML = App.pageHead('Daily Expenses', '', '') + `<div class="grid g4 mb" id="tot"></div><div id="box"></div>`;
  const cats = () => (App.settings.expense_categories || ['Rent', 'Electricity', 'Dental Supplies', 'Lab', 'Salary', 'Misc']);
  const ctl = await Crud.page({
    box: $('#box'), endpoint: 'expenses', exportName: 'expenses', pdfTitle: 'Expense Report', addLabel: ['Add Expense'],
    filters: [{ name: 'from', label: 'From', type: 'date' }, { name: 'to', label: 'To', type: 'date' }, { name: 'category', label: 'Category', type: 'select', options: cats() }],
    defaults: () => ({ date: today(), method: 'Cash' }),
    fields: [{ name: 'date', label: 'Date', type: 'date', required: true }, { name: 'time', label: 'Time', type: 'time' },
      { name: 'category', label: 'Category', type: 'select', options: cats(), blank: true, required: true },
      { name: 'amount', label: 'Amount (PKR)', type: 'number', required: true }, { name: 'paid_to', label: 'Paid to' },
      { name: 'method', label: 'Method', type: 'select', options: ['Cash', 'EasyPaisa', 'JazzCash', 'Bank Transfer', 'Card'] },
      { name: 'notes', label: 'Notes', type: 'textarea', full: true }],
    formExtra: '<label class="f">Receipt photo<input type="file" id="rc" accept="image/*" capture="environment"></label>',
    beforeSave: async (v, row, m) => { const f = $('#rc', m.body).files; if (f && f.length) v.receipt_image = (await API.upload('receipts', f))[0].path; return v; },
    columns: [{ key: 'date', label: 'Date', edit: 'text' }, { key: 'time', label: 'Time' }, { key: 'category', label: 'Category', edit: 'text' }, { key: 'amount', label: 'Amount', edit: 'number', render: r => money(r.amount) }, { key: 'paid_to', label: 'Paid to', edit: 'text' }, { key: 'method', label: 'Method' }, { key: 'receipt_image', label: 'Receipt', render: r => r.receipt_image ? `<a href="${esc(r.receipt_image)}" target="_blank">📎</a>` : '' }],
    pdfSummary: rows => [['Total', money(rows.reduce((s, r) => s + Number(r.rows ? 0 : 0), 0))]],
    onChange: refreshTotals, onLoad: refreshTotals
  });
  async function refreshTotals(rows) {
    rows = rows || ctl.table.state.rows; const sum = a => a.reduce((s, r) => s + Number(r.amount || 0), 0);
    const d = today(); const wk = addDays(d, -6); const mo = d.slice(0, 7);
    $('#tot').innerHTML = [['Today', sum(rows.filter(r => r.date === d))], ['Last 7 days', sum(rows.filter(r => r.date >= wk))], ['This month', sum(rows.filter(r => (r.date || '').startsWith(mo)))], ['All shown', sum(rows)]]
      .map(t => `<div class="card kpi"><div class="ic">${ic('expenses', 26)}</div><div><small>${t[0]}</small><b>${money(t[1])}</b></div></div>`).join('');
  }
});
