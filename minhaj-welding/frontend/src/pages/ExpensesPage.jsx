import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ expense_category_id: '', description: '', amount: '', spent_at: '' });
  const [newCat, setNewCat] = useState('');

  const load = () => api.get('/expenses').then((r) => setExpenses(r.data));
  const loadCats = () => api.get('/expenses/categories').then((r) => setCategories(r.data));
  useEffect(() => { load(); loadCats(); }, []);

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const addExpense = () => {
    if (!form.amount) return;
    api.post('/expenses', form).then(() => { setForm({ expense_category_id: '', description: '', amount: '', spent_at: '' }); setShowForm(false); load(); });
  };

  const addCategory = () => {
    if (!newCat) return;
    api.post('/expenses/categories', { name: newCat }).then(() => { setNewCat(''); loadCats(); });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Expenses</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>+ Add Expense</button>
      </div>

      {showForm && (
        <div className="card mb-4 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <select className="input-field" value={form.expense_category_id} onChange={(e) => setForm({ ...form, expense_category_id: e.target.value })}>
              <option value="">Select category...</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input type="number" className="input-field" placeholder="Amount (Rs.)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            <input type="text" className="input-field" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <input type="date" className="input-field" value={form.spent_at} onChange={(e) => setForm({ ...form, spent_at: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <input type="text" className="input-field flex-1" placeholder="+ New category" value={newCat} onChange={(e) => setNewCat(e.target.value)} />
            <button className="btn-outline" onClick={addCategory}>Add Category</button>
          </div>
          <button className="btn-primary" onClick={addExpense}>Save Expense</button>
        </div>
      )}

      <div className="card mb-4 text-sm"><strong>Total (all time):</strong> Rs. {total.toFixed(2)}</div>

      <div className="card overflow-x-auto">
        <table className="table-flat min-w-[600px]">
          <thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th><th></th></tr></thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id}>
                <td>{(e.spent_at || '').slice(0, 10)}</td>
                <td>{e.category_name || '—'}</td>
                <td>{e.description}</td>
                <td>Rs. {e.amount.toFixed(2)}</td>
                <td>
                  <button className="btn-ghost text-xs text-danger" onClick={() => api.delete(`/expenses/${e.id}`).then(load)}>Delete</button>
                </td>
              </tr>
            ))}
            {!expenses.length && <tr><td colSpan={5} className="text-text-secondary">No expenses recorded yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
