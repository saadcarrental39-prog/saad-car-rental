import React, { useEffect, useState } from 'react';
import api from '../services/api';

/**
 * Drop this into any entity detail view: <CustomFieldsEditor entityType="customer" entityId={5} />
 * Renders whatever fields the admin defined in Settings > Custom Fields
 * for that entity type, pre-filled with saved values, and saves on blur.
 */
export default function CustomFieldsEditor({ entityType, entityId }) {
  const [fields, setFields] = useState([]);
  const [saved, setSaved] = useState(false);

  const load = () => api.get(`/custom-fields/values/${entityType}/${entityId}`).then((r) => setFields(r.data));
  useEffect(() => { if (entityId) load(); }, [entityType, entityId]);

  const updateLocal = (defId, value) => setFields(fields.map((f) => f.id === defId ? { ...f, value } : f));

  const save = (defId, value) => {
    api.put(`/custom-fields/values/${entityType}/${entityId}`, { values: { [defId]: value } })
      .then(() => { setSaved(true); setTimeout(() => setSaved(false), 1500); });
  };

  if (!fields.length) return null;

  return (
    <div className="card">
      <div className="text-sm font-semibold text-text-secondary uppercase mb-2">Additional Details</div>
      <div className="grid sm:grid-cols-2 gap-3">
        {fields.map((f) => (
          <div key={f.id}>
            <label className="text-xs text-text-secondary block mb-1">{f.field_name}{f.is_required ? ' *' : ''}</label>
            {f.field_type === 'dropdown' ? (
              <select className="input-field" value={f.value || ''} onChange={(e) => { updateLocal(f.id, e.target.value); save(f.id, e.target.value); }}>
                <option value="">Select...</option>
                {(f.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input
                type={f.field_type === 'number' ? 'number' : f.field_type === 'date' ? 'date' : 'text'}
                className="input-field"
                value={f.value || ''}
                onChange={(e) => updateLocal(f.id, e.target.value)}
                onBlur={(e) => save(f.id, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>
      {saved && <div className="text-success text-xs mt-2">Saved ✓</div>}
    </div>
  );
}
