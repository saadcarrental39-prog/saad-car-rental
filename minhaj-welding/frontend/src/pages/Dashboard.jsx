import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import IconImg from '../components/IconImg';

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="card flex items-center gap-3">
      <IconImg name={icon} size={40} />
      <div>
        <div className="text-xs text-text-secondary uppercase">{label}</div>
        <div className="text-xl font-bold">{value}</div>
        {sub && <div className="text-xs text-text-secondary">{sub}</div>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [measurements, setMeasurements] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    api.get('/measurements').then((r) => setMeasurements(r.data)).catch(() => {});
    api.get('/quotations').then((r) => setQuotations(r.data)).catch(() => {});
    api.get('/invoices').then((r) => setInvoices(r.data)).catch(() => {});
  }, []);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayRevenue = invoices
    .filter((i) => (i.updated_at || '').slice(0, 10) === todayStr)
    .reduce((sum, i) => sum + i.paid_amount, 0);
  const monthlyIncome = invoices.reduce((sum, i) => sum + i.paid_amount, 0);
  const outstanding = invoices.reduce((sum, i) => sum + i.balance_amount, 0);

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Dashboard</h1>
      <p className="text-text-secondary text-sm mb-4">MINHAJ WELDING — quick overview.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard icon="todays_revenue" label="Today's Revenue" value={`Rs. ${todayRevenue.toFixed(0)}`} />
        <StatCard icon="monthly_income" label="Total Collected" value={`Rs. ${monthlyIncome.toFixed(0)}`} />
        <StatCard icon="ledger" label="Outstanding" value={`Rs. ${outstanding.toFixed(0)}`} />
        <StatCard icon="pos" label="Saved Measurements" value={measurements.length} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold">Recent Measurements</h2>
            <Link to="/calculators" className="text-brand text-sm">+ New</Link>
          </div>
          <table className="table-flat">
            <thead><tr><th>Category</th><th>Value</th><th>Total</th></tr></thead>
            <tbody>
              {measurements.slice(0, 6).map((m) => (
                <tr key={m.id}>
                  <td>{m.category_name}</td>
                  <td>{m.final_value?.toFixed(2)} {m.unit}</td>
                  <td>Rs. {m.total_price?.toFixed(0)}</td>
                </tr>
              ))}
              {!measurements.length && <tr><td colSpan={3} className="text-text-secondary">No measurements yet.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold">Recent Quotations</h2>
            <Link to="/quotations" className="text-brand text-sm">View all</Link>
          </div>
          <table className="table-flat">
            <thead><tr><th>No.</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {quotations.slice(0, 6).map((q) => (
                <tr key={q.id}>
                  <td>{q.quotation_no}</td>
                  <td>{q.customer_name || '—'}</td>
                  <td>Rs. {q.total_amount?.toFixed(0)}</td>
                  <td><span className="badge badge-neutral">{q.status}</span></td>
                </tr>
              ))}
              {!quotations.length && <tr><td colSpan={4} className="text-text-secondary">No quotations yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
