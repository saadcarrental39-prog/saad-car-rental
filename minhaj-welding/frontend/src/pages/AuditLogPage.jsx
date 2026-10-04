import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [entityType, setEntityType] = useState('');
  const [error, setError] = useState('');

  const load = () => api.get('/audit-log', { params: { entity_type: entityType || undefined } })
    .then((r) => setLogs(r.data))
    .catch((e) => setError(e.response?.data?.error || 'Access denied (Admin/Manager only)'));

  useEffect(() => { load(); }, [entityType]);

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Audit Log</h1>
      <p className="text-text-secondary text-sm mb-4">Every rate change, formula edit, and price override is recorded here — visible to Admin & Manager roles.</p>

      {error && <div className="badge badge-danger mb-3">{error}</div>}

      <div className="mb-3">
        <select className="input-field w-48" value={entityType} onChange={(e) => setEntityType(e.target.value)}>
          <option value="">All types</option>
          <option value="rate">Rates</option>
          <option value="measurement">Measurements</option>
          <option value="quotation">Quotations</option>
          <option value="invoice">Invoices</option>
          <option value="user">Users</option>
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="table-flat min-w-[700px]">
          <thead><tr><th>When</th><th>Entity</th><th>Action</th><th>Old</th><th>New</th><th>By</th></tr></thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <td>{new Date(l.changed_at).toLocaleString()}</td>
                <td>{l.entity_type} #{l.entity_id}</td>
                <td>{l.action}</td>
                <td>{l.old_value}</td>
                <td>{l.new_value}</td>
                <td>{l.changed_by_name || '—'}</td>
              </tr>
            ))}
            {!logs.length && !error && <tr><td colSpan={6} className="text-text-secondary">No entries yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
