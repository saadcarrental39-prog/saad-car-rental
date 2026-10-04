import React from 'react';

export default function PriceSummary({ extras, onExtrasChange, result }) {
  return (
    <div className="card space-y-3">
      <div className="text-sm font-semibold text-text-secondary uppercase">Price</div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-text-secondary">Discount (Rs.)</label>
          <input type="number" className="input-field" value={extras.discount_amount ?? ''}
            onChange={(e) => onExtrasChange({ ...extras, discount_amount: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-text-secondary">Discount (%)</label>
          <input type="number" className="input-field" value={extras.discount_percent ?? ''}
            onChange={(e) => onExtrasChange({ ...extras, discount_percent: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-text-secondary">Labour (Rs.)</label>
          <input type="number" className="input-field" value={extras.labour_amount ?? ''}
            onChange={(e) => onExtrasChange({ ...extras, labour_amount: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-text-secondary">Transport (Rs.)</label>
          <input type="number" className="input-field" value={extras.transport_amount ?? ''}
            onChange={(e) => onExtrasChange({ ...extras, transport_amount: e.target.value })} />
        </div>
      </div>

      {result && (
        <div className="border-t border-border pt-3 space-y-1 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>Rs. {result.price_at_calc?.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Discount</span><span>- Rs. {result.total_discount?.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Labour + Transport{result.extra_amount ? ' + Extra' : ''}</span>
            <span>+ Rs. {(result.labour_amount + result.transport_amount + (result.extra_amount || 0)).toFixed(2)}</span></div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-text">
            <span>TOTAL</span><span>Rs. {result.total_price?.toFixed(2)}</span>
          </div>
          {result.loss_warning && (
            <div className="badge badge-danger mt-2">{result.loss_warning}</div>
          )}
        </div>
      )}
    </div>
  );
}
