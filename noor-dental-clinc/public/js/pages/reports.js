/* Reports + Analytics: every report printable + PDF + WhatsApp share, with charts */
const REPORTS = [
  ['daily', '📅 Daily Report'], ['period', '📈 Income / Expense (range)'], ['patient_revenue', '👥 Patient-wise Revenue'],
  ['treatment_revenue', '🦷 Treatment-wise Revenue'], ['doctor_revenue', '🩺 Doctor-wise Revenue'], ['expense_breakdown', '🧾 Expense Breakdown'],
  ['outstanding', '⏳ Outstanding Payments'], ['noshow', '🚫 Appointment No-show Rate'], ['ortho', '😁 Ortho Patient Progress'], ['heatmap', '🔥 Busy Hours Heatmap']];
App.ready(() => {
  const c = $('#content'); c.innerHTML = App.pageHead('Reports & Analytics', '', '') +
    `<div class="toolbar"><select id="type">${REPORTS.map(r => `<option value="${r[0]}">${r[1]}</option>`).join('')}</select><input type="date" id="from" value="${addDays(today(), -29)}"><span class="muted">to</span><input type="date" id="to" value="${today()}"><button class="btn" id="go">${bi('▶ Run')}</button>
    <span class="grow"></span><button class="btn sec" id="pr">${bi('🖨 Print')}</button><button class="btn sec" id="pdf">${bi(ic('pdf', 16) + ' PDF')}</button><button class="btn sec" id="wa" data-net>${bi(ic('whatsappicon', 16) + ' WhatsApp')}</button><button class="btn sec" id="csv">CSV</button><button class="btn sec" id="xls">Excel</button></div>
    <div class="toolbar" style="margin-top:-6px"><span class="muted" style="font-size:.82rem">Quick range:</span><button class="btn sm sec" data-rng="today">Today</button><button class="btn sm sec" data-rng="week">This Week</button><button class="btn sm sec" data-rng="month">This Month</button><button class="btn sm sec" data-rng="year">This Year</button><a class="btn sm sec" href="/reports.html?type=outstanding">⏳ Paid/Unpaid</a></div>
    <div class="card" id="sumcard"></div><div class="card mt" id="chartcard"><div class="chart-box"><canvas id="rc"></canvas></div></div><div class="tbl-wrap mt" id="tblcard"></div>`;
  let cur = null, chart = null;
  $$('[data-rng]').forEach(b => b.onclick = () => {
    const d = today(); const r = b.dataset.rng;
    const from = r === 'today' ? d : r === 'week' ? addDays(d, -((new Date(d + 'T00:00:00').getDay() + 6) % 7)) : r === 'month' ? d.slice(0, 8) + '01' : d.slice(0, 4) + '-01-01';
    $('#from').value = from; $('#to').value = d; run();
  });
  const qType = new URLSearchParams(location.search).get('type'); if (qType && REPORTS.some(r => r[0] === qType)) $('#type').value = qType;
  async function run() {
    const type = $('#type').value; cur = await API.get(`reports/${type}` + API.qs({ from: $('#from').value, to: $('#to').value })).catch(e => { UI.toast(e.message, { type: 'err' }); return null; }); if (!cur) return;
    $('#sumcard').innerHTML = `<h2>${esc(cur.title)}</h2><div class="muted mb">${esc(cur.subtitle)}</div><div class="grid g4">${(cur.summary || []).map(s => `<div><small class="muted">${esc(s[0])}</small><div style="font-size:1.2rem;font-weight:700">${esc(s[1])}</div></div>`).join('')}</div>`;
    $('#tblcard').innerHTML = `<table><thead><tr>${cur.columns.map(x => `<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${cur.rows.map(r => `<tr>${r.map(x => `<td>${esc(String(x))}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${cur.columns.length}" class="center muted">No data for this range</td></tr>`}</tbody></table>`;
    if (chart) chart.destroy(); const ch = cur.chart; $('#chartcard').style.display = ch ? '' : 'none';
    if (ch) chart = App.chart($('#rc'), { type: ch.type === 'doughnut' ? 'doughnut' : ch.type, data: { labels: ch.labels, datasets: [{ label: cur.title, data: ch.values, backgroundColor: ['pie', 'doughnut'].includes(ch.type) ? App.palette : '#3B82F6', borderColor: '#3B82F6', fill: ch.type === 'line', tension: .3, borderRadius: 6 }] }, options: { maintainAspectRatio: false } });
  }
  $('#go').onclick = run; $('#type').onchange = run; run();
  $('#pr').onclick = () => print(); $('#pdf').onclick = () => cur && API.pdfTable(cur);
  $('#csv').onclick = () => cur && UI.exportRows(cur.title.replace(/\s+/g, '_'), cur.columns, cur.rows, 'csv'); $('#xls').onclick = () => cur && UI.exportRows(cur.title.replace(/\s+/g, '_'), cur.columns, cur.rows, 'xls');
  $('#wa').onclick = () => { if (!cur) return; const txt = `${cur.title} (${cur.subtitle})\n` + (cur.summary || []).map(s => `${s[0]}: ${s[1]}`).join('\n'); WA.share(txt); };
});
