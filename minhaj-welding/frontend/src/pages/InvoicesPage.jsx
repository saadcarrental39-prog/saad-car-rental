import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [payingId, setPayingId] = useState(null);
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('cash');

  const load = () => api.get('/invoices').then((r) => setInvoices(r.data));
  useEffect(() => { load(); }, []);

  const submitPayment = (id) => {
    if (!amount) return;
    api.post(`/invoices/${id}/payments`, { amount: Number(amount), mode })
      .then(() => { setPayingId(null); setAmount(''); load(); });
  };

  const statusBadge = (status) => {
    const map = { paid: 'badge-success', partial: 'badge-warning', unpaid: 'badge-danger' };
    return <span className={`badge ${map[status] || 'badge-neutral'}`}>{status}</span>;
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Invoices</h1>
      <div className="card overflow-x-auto">
        <table className="table-flat min-w-[700px]">
          <thead><tr><th>No.</th><th>Customer</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {invoices.map((inv) => (
              <React.Fragment key={inv.id}>
                <tr>
                  <td>{inv.invoice_no}</td>
                  <td>{inv.customer_name || 'Walk-in'}</td>
                  <td>Rs. {inv.total_amount.toFixed(0)}</td>
                  <td>Rs. {inv.paid_amount.toFixed(0)}</td>
                  <td>Rs. {inv.balance_amount.toFixed(0)}</td>
                  <td>{statusBadge(inv.status)}</td>
                  <td>
                    {inv.status !== 'paid' && (
                      <button className="btn-ghost text-xs" onClick={() => setPayingId(payingId === inv.id ? null : inv.id)}>
                        Record Payment
                      </button>
                    )}
                  </td>
                </tr>
                {payingId === inv.id && (
                  <tr>
                    <td colSpan={7}>
                      <div className="flex flex-wrap gap-2 items-center bg-blue-50 p-3 rounded-input">
                        <input type="number" className="input-field w-32" placeholder="Amount"
                          value={amount} onChange={(e) => setAmount(e.target.value)} />
                        <select className="input-field w-32" value={mode} onChange={(e) => setMode(e.target.value)}>
                          <option value="cash">Cash</option>
                          <option value="bank">Bank</option>
                          <option value="other">Other</option>
                        </select>
                        <button className="btn-primary" onClick={() => submitPayment(inv.id)}>Save Payment</button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {!invoices.length && <tr><td colSpan={7} className="text-text-secondary">No invoices yet. Convert an approved quotation into one.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
