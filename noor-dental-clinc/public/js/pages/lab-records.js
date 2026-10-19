/* Lab Records: tooth/mould samples sent out to a lab (Islamabad/Peshawar/etc.) for work
   like crowns, dentures or impressions, and tracked until they come back. Status is a
   simple Pending -> Sent to Lab -> Available cycle, with one-click "Mark Available" so
   the front desk can clear it the moment the courier/call comes in. */
App.ready(async () => {
  const c = $('#content');
  c.innerHTML = App.pageHead('Lab Records', '', '') + `<div class="grid g4 mb" id="tot"></div><div id="box"></div>`;
  const locations = (App.settings.lab_locations || ['Islamabad', 'Peshawar']);
  const tests = (App.settings.lab_tests || ['Crown', 'Bridge', 'Denture', 'Impression / Mould', 'Braces Wire', 'Retainer', 'Other']);
  const STATUS_COLOR = { Pending: 'var(--warning)', 'Sent to Lab': 'var(--primary)', Available: 'var(--success)' };

  const ctl = await Crud.page({
    box: $('#box'), endpoint: 'labs', exportName: 'lab_records', pdfTitle: 'Lab Records', addLabel: ['Send to Lab', ''],
    filters: [{ name: 'from', label: 'Sent from', type: 'date' }, { name: 'to', label: 'Sent to', type: 'date' }, { name: 'status', label: 'Status', type: 'select', options: ['Pending', 'Sent to Lab', 'Available'] }, { name: 'lab_name', label: 'Lab', type: 'select', options: locations }],
    defaults: () => ({ sent_date: today(), status: 'Pending' }),
    fields: [{ name: 'patient_id', label: 'Patient', type: 'patient', required: true },
      { name: 'lab_name', label: 'Sent to (city / lab)', type: 'select', options: locations, blank: true, required: true },
      { name: 'test_type', label: 'Item / Test', type: 'select', options: tests, blank: true },
      { name: 'tooth_no', label: 'Tooth # (FDI)' }, { name: 'sample_desc', label: 'Sample / notes for the lab', full: true },
      { name: 'sent_date', label: 'Date sent', type: 'date', required: true }, { name: 'expected_date', label: 'Expected back', type: 'date' },
      { name: 'cost', label: 'Lab cost (PKR)', type: 'number' },
      { name: 'status', label: 'Status', type: 'select', options: ['Pending', 'Sent to Lab', 'Available'] },
      { name: 'sent_by', label: 'Sent by (staff name)' }],
    columns: [
      { key: 'patient_name', label: 'Patient', render: r => `<a href="/patients.html?id=${r.patient_id}">${esc(r.patient_name)}</a>` },
      { key: 'lab_name', label: 'Sent to', edit: 'text' }, { key: 'test_type', label: 'Item', edit: 'text' }, { key: 'tooth_no', label: 'Tooth' },
      { key: 'sent_date', label: 'Sent', edit: 'text' }, { key: 'expected_date', label: 'Expected', edit: 'text' },
      { key: 'cost', label: 'Cost', render: r => r.cost ? money(r.cost) : '' },
      { key: 'status', label: 'Status', render: r => `<span class="pill" style="background:${STATUS_COLOR[r.status] || 'var(--primary)'}">${esc(r.status)}</span>` }],
    extra: r => r.status !== 'Available' ? `<button data-act="avail" title="Mark Available">✔</button>` : '',
    onAction: async (act, row) => { if (act === 'avail') { await API.put('labs/' + row.id, { status: 'Available', received_date: today() }); UI.toast('Marked available ✔', { type: 'good' }); ctl.reload(); refreshTotals(); } },
    onChange: refreshTotals, onLoad: refreshTotals
  });
  function refreshTotals(rows) {
    rows = rows || ctl.table.state.rows;
    const n = s => rows.filter(r => r.status === s).length;
    $('#tot').innerHTML = [['Pending', n('Pending'), 'var(--warning)'], ['Sent to Lab', n('Sent to Lab'), 'var(--primary)'], ['Available (ready to collect)', n('Available'), 'var(--success)'], ['Total', rows.length, 'var(--text)']]
      .map(t => `<div class="card kpi"><div class="ic" style="background:${t[2]}">🧪</div><div><small>${t[0]}</small><b>${t[1]}</b></div></div>`).join('');
  }
});
