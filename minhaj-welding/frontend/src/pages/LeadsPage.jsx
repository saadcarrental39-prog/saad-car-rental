import React, { useEffect, useState } from 'react';
import api from '../services/api';

const STATUS_BADGE = { new: 'badge-warning', contacted: 'badge-neutral', converted: 'badge-success', rejected: 'badge-danger' };

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const load = () => api.get('/leads').then((r) => setLeads(r.data));
  useEffect(() => { load(); }, []);

  const setStatus = (id, status) => api.put(`/leads/${id}/status`, { status }).then(load);
  const convert = (id) => api.post(`/leads/${id}/convert`).then(load);

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Leads</h1>
      <p className="text-text-secondary text-sm mb-4">
        Captured from the public website's contact form (POST /api/leads — no login needed for that endpoint) or added manually.
      </p>

      <div className="card overflow-x-auto">
        <table className="table-flat min-w-[700px]">
          <thead><tr><th>Name</th><th>Phone</th><th>Message</th><th>Source</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id}>
                <td>{l.name}</td>
                <td>{l.phone}</td>
                <td className="max-w-xs truncate">{l.message}</td>
                <td>{l.source}</td>
                <td><span className={`badge ${STATUS_BADGE[l.status] || 'badge-neutral'}`}>{l.status}</span></td>
                <td className="flex gap-2">
                  {l.status !== 'converted' && (
                    <>
                      <button className="btn-ghost text-xs" onClick={() => setStatus(l.id, 'contacted')}>Mark Contacted</button>
                      <button className="btn-ghost text-xs text-success" onClick={() => convert(l.id)}>Convert</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {!leads.length && <tr><td colSpan={6} className="text-text-secondary">No leads yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
