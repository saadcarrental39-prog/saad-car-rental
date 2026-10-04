import React, { useEffect, useState } from 'react';
import api from '../services/api';
import IconImg from '../components/IconImg';

export default function ReportsPage() {
  const [measurements, setMeasurements] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    api.get('/measurements').then((r) => setMeasurements(r.data));
    api.get('/invoices').then((r) => setInvoices(r.data));
    api.get('/quotations').then((r) => setQuotations(r.data));
    api.get('/expenses').then((r) => setExpenses(r.data)).catch(() => {});
    api.get('/projects').then((r) => setProjects(r.data)).catch(() => {});
  }, []);

  const inRange = (dateStr) => {
    const d = (dateStr || '').slice(0, 10);
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  };

  const ms = measurements.filter((m) => inRange(m.created_at));
  const qs = quotations.filter((q) => inRange(q.created_at));
  const inv = invoices.filter((i) => inRange(i.created_at));
  const exp = expenses.filter((e) => inRange(e.spent_at));

  // Group measurements by category
  const byCategory = {};
  ms.forEach((m) => {
    const k = m.category_name || 'Other';
    byCategory[k] = byCategory[k] || { count: 0, total: 0 };
    byCategory[k].count += 1;
    byCategory[k].total += m.total_price;
  });

  const invoiced = inv.reduce((s, i) => s + i.total_amount, 0);
  const collected = inv.reduce((s, i) => s + i.paid_amount, 0);
  const outstanding = inv.reduce((s, i) => s + i.balance_amount, 0);
  const totalExpenses = exp.reduce((s, e) => s + e.amount, 0);
  const netProfit = collected - totalExpenses;

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <IconImg name="reports" size={28} />
        <h1 className="text-xl font-bold">Reports</h1>
      </div>
      <p className="text-text-secondary text-sm mb-4">
        Calculated live from your saved data. Expense/profit reports arrive with the Expenses module (next phase).
      </p>

      <div className="card mb-4 flex flex-wrap gap-3 items-end">
        <div><label className="text-xs text-text-secondary block">From</label>
          <input type="date" className="input-field" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div><label className="text-xs text-text-secondary block">To</label>
          <input type="date" className="input-field" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        <button className="btn-ghost" onClick={() => { setFrom(''); setTo(''); }}>Clear</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="card"><div className="text-xs text-text-secondary uppercase">Measurements</div><div className="text-xl font-bold">{ms.length}</div></div>
        <div className="card"><div className="text-xs text-text-secondary uppercase">Quotations</div><div className="text-xl font-bold">{qs.length}</div></div>
        <div className="card"><div className="text-xs text-text-secondary uppercase">Invoiced</div><div className="text-xl font-bold">Rs. {invoiced.toFixed(0)}</div></div>
        <div className="card"><div className="text-xs text-text-secondary uppercase">Collected</div><div className="text-xl font-bold">Rs. {collected.toFixed(0)}</div></div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        <div className="card"><div className="text-xs text-text-secondary uppercase">Outstanding</div><div className="text-lg font-bold">Rs. {outstanding.toFixed(0)}</div></div>
        <div className="card"><div className="text-xs text-text-secondary uppercase">Expenses (in range)</div><div className="text-lg font-bold">Rs. {totalExpenses.toFixed(0)}</div></div>
        <div className="card"><div className="text-xs text-text-secondary uppercase">Net (Collected − Expenses)</div>
          <div className={`text-lg font-bold ${netProfit < 0 ? 'text-danger' : 'text-success'}`}>Rs. {netProfit.toFixed(0)}</div></div>
      </div>

      <div className="card overflow-x-auto mb-4">
        <h2 className="font-semibold mb-2">Projects — Estimated vs Contract Value</h2>
        <table className="table-flat min-w-[500px]">
          <thead><tr><th>Project</th><th>Type</th><th>Contract Value</th><th>Status</th></tr></thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id}><td>{p.name}</td><td>{p.project_type}</td><td>Rs. {(p.contract_value || 0).toLocaleString()}</td><td>{p.status}</td></tr>
            ))}
            {!projects.length && <tr><td colSpan={4} className="text-text-secondary">No projects yet. Open a project for its full profit/margin breakdown.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="card overflow-x-auto">
        <h2 className="font-semibold mb-2">Measurements by Category</h2>
        <table className="table-flat min-w-[400px]">
          <thead><tr><th>Category</th><th>Count</th><th>Total Value</th></tr></thead>
          <tbody>
            {Object.entries(byCategory).map(([k, v]) => (
              <tr key={k}><td>{k}</td><td>{v.count}</td><td>Rs. {v.total.toFixed(0)}</td></tr>
            ))}
            {!ms.length && <tr><td colSpan={3} className="text-text-secondary">No data in this range.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
