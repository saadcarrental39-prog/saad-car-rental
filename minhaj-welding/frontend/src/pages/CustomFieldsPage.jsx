import React, { useEffect, useState } from 'react';
import api from '../services/api';

const ENTITY_TYPES = [
  { key: 'customer', label: 'Customers' },
  { key: 'project', label: 'Projects' },
  { key: 'measurement', label: 'Measurements' },
];
const FIELD_TYPES = ['text', 'number', 'date', 'dropdown', 'image', 'file'];

export default function CustomFieldsPage() {
  const [entityType, setEntityType] = useState('customer');
  const [defs, setDefs] = useState([]);
  const [form, setForm] = useState({ field_name: '', field_type: 'text', options: '', is_required: false });

  const load = () => api.get('/custom-fields/defs', { params: { entity_type: entityType } }).then((r) => setDefs(r.data));
  useEffect(() => { load(); }, [entityType]);

  const addField = () => {
    if (!form.field_name) return;
    const options = form.field_type === 'dropdown' ? form.options.split(',').map((o) => o.trim()).filter(Boolean) : undefined;
    api.post('/custom-fields/defs', { entity_type: entityType, field_name: form.field_name, field_type: form.field_type, options, is_required: form.is_required })
      .then(() => { setForm({ field_name: '', field_type: 'text', options: '', is_required: false }); load(); });
  };
  const deleteField = (id) => api.delete(`/custom-fields/defs/${id}`).then(load);

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold mb-1">Custom Fields</h1>
      <p className="text-text-secondary text-sm mb-4">
        Add extra fields to Customers, Projects, or Measurements without any code change — e.g. "CNIC Number", "Referred By", "Site Access Notes".
      </p>

      <div className="flex gap-2 mb-4">
        {ENTITY_TYPES.map((e) => (
          <button key={e.key} onClick={() => setEntityType(e.key)}
            className={`px-3 py-1.5 rounded-input text-sm border ${entityType === e.key ? 'bg-brand text-white border-brand' : 'border-border'}`}>
            {e.label}
          </button>
        ))}
      </div>

      <div className="card mb-4 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <input className="input-field" placeholder="Field name (e.g. CNIC Number)" value={form.field_name}
            onChange={(e) => setForm({ ...form, field_name: e.target.value })} />
          <select className="input-field" value={form.field_type} onChange={(e) => setForm({ ...form, field_type: e.target.value })}>
            {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        {form.field_type === 'dropdown' && (
          <input className="input-field" placeholder="Options, comma-separated (e.g. A,B,C)" value={form.options}
            onChange={(e) => setForm({ ...form, options: e.target.value })} />
        )}
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.is_required} onChange={(e) => setForm({ ...form, is_required: e.target.checked })} />
          Required
        </label>
        <button className="btn-primary" onClick={addField}>Add Field</button>
      </div>

      <div className="card divide-y divide-border">
        {defs.map((d) => (
          <div key={d.id} className="flex justify-between items-center py-2">
            <div>
              <div className="text-sm font-medium">{d.field_name} {d.is_required ? <span className="text-danger">*</span> : ''}</div>
              <div className="text-xs text-text-secondary">{d.field_type}{d.options ? ` (${d.options.join(', ')})` : ''}</div>
            </div>
            <button className="text-danger text-xs" onClick={() => deleteField(d.id)}>Delete</button>
          </div>
        ))}
        {!defs.length && <div className="text-sm text-text-secondary py-2">No custom fields for {ENTITY_TYPES.find((e) => e.key === entityType)?.label} yet.</div>}
      </div>
    </div>
  );
}
