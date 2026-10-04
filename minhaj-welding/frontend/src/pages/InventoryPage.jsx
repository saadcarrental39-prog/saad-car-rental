import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', unit: 'pc', quantity: '', cost_price: '', selling_price: '', min_stock: '' });
  const [moveFor, setMoveFor] = useState(null);
  const [moveQty, setMoveQty] = useState('');
  const [moveReason, setMoveReason] = useState('purchase');

  const load = () => api.get('/inventory').then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const addItem = () => {
    if (!form.name) return;
    api.post('/inventory', form).then(() => { setForm({ name: '', unit: 'pc', quantity: '', cost_price: '', selling_price: '', min_stock: '' }); setShowForm(false); load(); });
  };

  const submitMove = (id) => {
    if (!moveQty) return;
    const qty = moveReason === 'used_on_project' || moveReason === 'sold' ? -Math.abs(Number(moveQty)) : Math.abs(Number(moveQty));
    api.post(`/inventory/${id}/movements`, { change_qty: qty, reason: moveReason }).then(() => { setMoveFor(null); setMoveQty(''); load(); });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Inventory</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>+ Add Item</button>
      </div>

      {showForm && (
        <div className="card mb-4 grid sm:grid-cols-3 gap-3">
          <input className="input-field" placeholder="Item name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input-field" placeholder="Unit (ft/pc/kg)" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
          <input type="number" className="input-field" placeholder="Opening quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          <input type="number" className="input-field" placeholder="Cost price" value={form.cost_price} onChange={(e) => setForm({ ...form, cost_price: e.target.value })} />
          <input type="number" className="input-field" placeholder="Selling price" value={form.selling_price} onChange={(e) => setForm({ ...form, selling_price: e.target.value })} />
          <input type="number" className="input-field" placeholder="Low-stock alert at" value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: e.target.value })} />
          <button className="btn-primary sm:col-span-3" onClick={addItem}>Save Item</button>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="table-flat min-w-[700px]">
          <thead><tr><th>Item</th><th>Qty</th><th>Cost</th><th>Selling</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {items.map((it) => (
              <React.Fragment key={it.id}>
                <tr>
                  <td>{it.name}</td>
                  <td>{it.quantity} {it.unit}</td>
                  <td>Rs. {it.cost_price}</td>
                  <td>Rs. {it.selling_price}</td>
                  <td>{it.low_stock ? <span className="badge badge-danger">Low Stock</span> : <span className="badge badge-success">OK</span>}</td>
                  <td><button className="btn-ghost text-xs" onClick={() => setMoveFor(moveFor === it.id ? null : it.id)}>Adjust Stock</button></td>
                </tr>
                {moveFor === it.id && (
                  <tr>
                    <td colSpan={6}>
                      <div className="flex flex-wrap gap-2 items-center bg-blue-50 p-3 rounded-input">
                        <select className="input-field w-40" value={moveReason} onChange={(e) => setMoveReason(e.target.value)}>
                          <option value="purchase">Purchase (stock in)</option>
                          <option value="adjustment">Adjustment (+)</option>
                          <option value="used_on_project">Used on project (-)</option>
                          <option value="sold">Sold (-)</option>
                        </select>
                        <input type="number" className="input-field w-28" placeholder="Qty" value={moveQty} onChange={(e) => setMoveQty(e.target.value)} />
                        <button className="btn-primary" onClick={() => submitMove(it.id)}>Confirm</button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {!items.length && <tr><td colSpan={6} className="text-text-secondary">No inventory items yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
