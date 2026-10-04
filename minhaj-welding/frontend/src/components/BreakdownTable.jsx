import React from 'react';

/**
 * Displays the component-by-component breakdown returned by the calc
 * engine (Module 1, Step 6) — full transparency, no hidden math.
 */
export default function BreakdownTable({ breakdown = {}, total, unit = 'Running Ft' }) {
  const entries = Object.entries(breakdown);
  return (
    <div className="card">
      <div className="text-sm font-semibold mb-2 text-text-secondary uppercase">Auto Calculation</div>
      <div className="divide-y divide-border">
        {entries.map(([label, value]) => (
          <div key={label} className="flex justify-between py-1.5 text-sm">
            <span>{label}</span>
            <span className="font-medium">{Number(value).toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between pt-3 mt-2 border-t-2 border-text font-bold">
        <span>TOTAL</span>
        <span>{Number(total).toFixed(2)} {unit}</span>
      </div>
    </div>
  );
}
