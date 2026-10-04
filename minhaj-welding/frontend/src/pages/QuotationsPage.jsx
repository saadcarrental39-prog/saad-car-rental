import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [extraItems, setExtraItems] = useState([]); // hardware, frame pipe, etc.
  const [addons, setAddons] = useState([]);

  const load = () => api.get('/quotations').then((r) => setQuotations(r.data));
  useEffect(() => {
    load();
    api.get('/customers').then((r) => setCustomers(r.data));
    api.get('/measurements', { params: { status: 'saved' } }).then((r) => setMeasurements(r.data));
    api.get('/addons').then((r) => setAddons(r.data));
  }, []);

  const toggleId = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const measurementsTotal = measurements
    .filter((m) => selectedIds.includes(m.id))
    .reduce((sum, m) => sum + m.total_price, 0);
  const extraItemsTotal = extraItems.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.rate) || 0), 0);
  const selectedTotal = measurementsTotal + extraItemsTotal;

  const addExtraRow = () => setExtraItems([...extraItems, { description: '', quantity: 1, unit: 'pc', rate: '' }]);
  const addFromCatalog = (addonId) => {
    const a = addons.find((x) => String(x.id) === String(addonId));
    if (!a) return;
    setExtraItems([...extraItems, { description: a.name, quantity: 1, unit: a.unit, rate: a.default_rate }]);
  };
  const updateExtraRow = (idx, field, value) => {
    const next = [...extraItems];
    next[idx] = { ...next[idx], [field]: value };
    setExtraItems(next);
  };
  const removeExtraRow = (idx) => setExtraItems(extraItems.filter((_, i) => i !== idx));

  const handleCreate = () => {
    if (!selectedIds.length && !extraItems.length) return;
    api.post('/quotations', {
      customer_id: customerId || null,
      measurement_ids: selectedIds,
      extra_items: extraItems.filter((it) => it.description && it.rate),
      discount_amount: discount,
      notes,
    }).then(() => {
      setShowBuilder(false);
      setSelectedIds([]);
      setExtraItems([]);
      setDiscount(0);
      setNotes('');
      load();
      api.get('/measurements', { params: { status: 'saved' } }).then((r) => setMeasurements(r.data));
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Quotations</h1>
        <button className="btn-primary" onClick={() => setShowBuilder(!showBuilder)}>+ New Quotation</button>
      </div>

      {showBuilder && (
        <div className="card mb-4 space-y-3">
          <select className="input-field" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="">Select customer...</option>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>)}
          </select>

          <div>
            <div className="text-sm font-medium mb-2">Select saved measurements to include:</div>
            <div className="max-h-64 overflow-y-auto border border-border rounded-input">
              {measurements.map((m) => (
                <label key={m.id} className="flex items-center gap-3 px-3 py-2 border-b border-border last:border-0 hover:bg-blue-50">
                  <input type="checkbox" checked={selectedIds.includes(m.id)} onChange={() => toggleId(m.id)} />
                  <span className="flex-1 text-sm">{m.category_name} — {m.final_value?.toFixed(2)} {m.unit}</span>
                  <span className="text-sm font-medium">Rs. {m.total_price?.toFixed(0)}</span>
                </label>
              ))}
              {!measurements.length && <div className="p-3 text-sm text-text-secondary">No saved (un-quoted) measurements available. Create some from Calculators first.</div>}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-medium">Extra Line Items (hardware, frame pipe, transport, etc.)</div>
              <div className="flex gap-2">
                <select className="input-field text-xs py-1" value="" onChange={(e) => addFromCatalog(e.target.value)}>
                  <option value="">+ Insert from catalog...</option>
                  {addons.map((a) => <option key={a.id} value={a.id}>{a.name} (Rs. {a.default_rate}/{a.unit})</option>)}
                </select>
                <button className="btn-ghost text-xs" onClick={addExtraRow}>+ Blank Item</button>
              </div>
            </div>
            {extraItems.map((it, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input className="input-field flex-1" placeholder="Description (e.g. Gate Handle + Lock)"
                  value={it.description} onChange={(e) => updateExtraRow(idx, 'description', e.target.value)} />
                <input type="number" className="input-field w-20" placeholder="Qty" value={it.quantity}
                  onChange={(e) => updateExtraRow(idx, 'quantity', e.target.value)} />
                <input className="input-field w-20" placeholder="Unit" value={it.unit}
                  onChange={(e) => updateExtraRow(idx, 'unit', e.target.value)} />
                <input type="number" className="input-field w-28" placeholder="Rate (Rs.)" value={it.rate}
                  onChange={(e) => updateExtraRow(idx, 'rate', e.target.value)} />
                <button className="btn-ghost text-xs text-danger" onClick={() => removeExtraRow(idx)}>✕</button>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <input type="number" className="input-field" placeholder="Overall discount (Rs.)" value={discount} onChange={(e) => setDiscount(e.target.value)} />
            <input type="text" className="input-field" placeholder="Notes / terms" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-border">
            <div className="font-semibold">Subtotal: Rs. {selectedTotal.toFixed(2)}</div>
            <button className="btn-primary" onClick={handleCreate} disabled={!selectedIds.length && !extraItems.length}>Create Quotation</button>
          </div>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="table-flat min-w-[600px]">
          <thead><tr><th>No.</th><th>Customer</th><th>Total</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {quotations.map((q) => (
              <tr key={q.id}>
                <td>{q.quotation_no}</td>
                <td>{q.customer_name || 'Walk-in'}</td>
                <td>Rs. {q.total_amount?.toFixed(0)}</td>
                <td><span className="badge badge-neutral">{q.status}</span></td>
                <td><Link to={`/quotations/${q.id}`} className="text-brand text-sm">Open</Link></td>
              </tr>
            ))}
            {!quotations.length && <tr><td colSpan={5} className="text-text-secondary">No quotations yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
