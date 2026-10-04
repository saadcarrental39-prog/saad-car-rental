import React from 'react';

/**
 * Dual feet + inch input (Module 1, Step 4). Mobile-friendly numeric pad.
 * value = { ft: number, in: number }
 */
export default function FeetInchInput({ label, value, onChange }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="number"
            inputMode="decimal"
            min="0"
            className="input-field"
            placeholder="Feet"
            value={value.ft ?? ''}
            onChange={(e) => onChange({ ...value, ft: e.target.value === '' ? '' : Number(e.target.value) })}
          />
          <div className="text-[11px] text-text-secondary mt-1 text-center">ft</div>
        </div>
        <div className="flex-1">
          <input
            type="number"
            inputMode="decimal"
            min="0"
            max="11"
            className="input-field"
            placeholder="Inch"
            value={value.in ?? ''}
            onChange={(e) => onChange({ ...value, in: e.target.value === '' ? '' : Number(e.target.value) })}
          />
          <div className="text-[11px] text-text-secondary mt-1 text-center">inch</div>
        </div>
      </div>
    </div>
  );
}
