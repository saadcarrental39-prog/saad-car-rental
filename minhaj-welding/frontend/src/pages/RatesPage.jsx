import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function RatesPage() {
  const [rates, setRates] = useState([]);
  const [editing, setEditing] = useState(null); // rate being edited
  const [newRate, setNewRate] = useState('');
  const [reason, setReason] = useState('');
  const [history, setHistory] = useState({});

  const load = () => api.get('/rates').then((r) => setRates(r.data));
  useEffect(() => { load(); }, []);

  const openHistory = (rateId) => {
    api.get(`/rates/${rateId}/history`).then((res) => setHistory((h) => ({ ...h, [rateId]: res.data })));
  };

  const submitChange = (rateId) => {
    if (!newRate) return;
    api.put(`/rates/${rateId}/value`, { new_rate: Number(newRate), reason })
      .then(() => { setEditing(null); setNewRate(''); setReason(''); load(); });
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Pricing & Market Rates</h1>
      <p className="text-text-secondary text-sm mb-4">
        Changing a rate here affects <strong>future calculations only</strong>. Already-saved measurements,
        quotations and invoices keep their original locked-in rate.
      </p>

      <div className="card overflow-x-auto">
        <table className="table-flat min-w-[700px]">
          <thead>
            <tr>
              <th>Category</th><th>Style</th><th>Unit</th><th>Min</th><th>Max</th><th>Current</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {rates.map((r) => (
              <React.Fragment key={r.id}>
                <tr>
                  <td>{r.category_name}</td>
                  <td>{r.style_name || '—'}</td>
                  <td>{r.unit}</td>
                  <td>{r.min_rate ?? '—'}</td>
                  <td>{r.max_rate ?? '—'}</td>
                  <td className="font-semibold">Rs. {r.current_rate}</td>
                  <td><span className={`badge ${r.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>{r.status}</span></td>
                  <td className="flex gap-2">
                    <button className="btn-ghost text-xs" onClick={() => setEditing(editing === r.id ? null : r.id)}>Edit</button>
                    <button className="btn-ghost text-xs" onClick={() => openHistory(r.id)}>History</button>
                  </td>
                </tr>
                {editing === r.id && (
                  <tr>
                    <td colSpan={8}>
                      <div className="flex flex-wrap gap-2 items-center bg-blue-50 p-3 rounded-input">
                        <input type="number" className="input-field w-32" placeholder="New rate"
                          value={newRate} onChange={(e) => setNewRate(e.target.value)} />
                        <input type="text" className="input-field flex-1 min-w-[200px]" placeholder="Reason (e.g. steel price increase)"
                          value={reason} onChange={(e) => setReason(e.target.value)} />
                        <button className="btn-primary" onClick={() => submitChange(r.id)}>Confirm Change</button>
                      </div>
                    </td>
                  </tr>
                )}
                {history[r.id] && (
                  <tr>
                    <td colSpan={8}>
                      <div className="text-xs text-text-secondary p-2">
                        <strong>Rate History:</strong>{' '}
                        {history[r.id].map((h) => (
                          <span key={h.id} className="mr-3">
                            Rs. {h.old_rate ?? '—'} → Rs. {h.new_rate} ({new Date(h.changed_at).toLocaleDateString()}{h.reason ? `, ${h.reason}` : ''})
                          </span>
                        ))}
                        {!history[r.id].length && <span>No changes recorded yet.</span>}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
