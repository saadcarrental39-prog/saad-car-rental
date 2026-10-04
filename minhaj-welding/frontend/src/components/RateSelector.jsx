import React, { useEffect, useState } from 'react';
import api from '../services/api';

/**
 * value = { rate_source: 'current'|'custom'|'historical', custom_rate, historical_rate_id, custom_reason }
 */
export default function RateSelector({ categoryId, styleId, activeRate, value, onChange }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (value.rate_source === 'historical' && activeRate?.id) {
      api.get(`/rates/${activeRate.id}/history`).then((res) => setHistory(res.data)).catch(() => {});
    }
  }, [value.rate_source, activeRate?.id]);

  return (
    <div className="card space-y-3">
      <div className="text-sm font-semibold text-text-secondary uppercase">Rate Selection</div>

      <label className="flex items-center gap-2">
        <input
          type="radio"
          checked={value.rate_source === 'current'}
          onChange={() => onChange({ ...value, rate_source: 'current' })}
        />
        <span>
          Current Market Rate: {activeRate ? <strong>Rs. {activeRate.current_rate} / {activeRate.unit}</strong> : <span className="text-danger">Not set</span>}
        </span>
      </label>

      <label className="flex items-center gap-2">
        <input
          type="radio"
          checked={value.rate_source === 'custom'}
          onChange={() => onChange({ ...value, rate_source: 'custom' })}
        />
        <span>Custom Rate</span>
      </label>
      {value.rate_source === 'custom' && (
        <div className="pl-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            type="number"
            className="input-field"
            placeholder="Custom rate (Rs.)"
            value={value.custom_rate ?? ''}
            onChange={(e) => onChange({ ...value, custom_rate: e.target.value })}
          />
          <input
            type="text"
            className="input-field"
            placeholder="Reason (e.g. bulk order discount)"
            value={value.custom_reason ?? ''}
            onChange={(e) => onChange({ ...value, custom_reason: e.target.value })}
          />
        </div>
      )}

      <label className="flex items-center gap-2">
        <input
          type="radio"
          checked={value.rate_source === 'historical'}
          onChange={() => onChange({ ...value, rate_source: 'historical' })}
        />
        <span>Historical Rate</span>
      </label>
      {value.rate_source === 'historical' && (
        <select
          className="input-field ml-6 w-auto"
          value={value.historical_rate_id ?? ''}
          onChange={(e) => onChange({ ...value, historical_rate_id: e.target.value })}
        >
          <option value="">Select a past rate...</option>
          {history.map((h) => (
            <option key={h.id} value={h.rate_id}>
              Rs. {h.new_rate} — {new Date(h.changed_at).toLocaleDateString()}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
