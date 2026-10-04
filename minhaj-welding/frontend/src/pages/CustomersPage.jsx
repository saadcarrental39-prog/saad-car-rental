import React, { useEffect, useState } from 'react';
import api from '../services/api';
import IconImg from '../components/IconImg';
import CustomFieldsEditor from '../components/CustomFieldsEditor';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', whatsapp: '', area: '', address: '' });
  const [expandedId, setExpandedId] = useState(null);

  const load = (q) => api.get('/customers', { params: { search: q || undefined } }).then((r) => setCustomers(r.data));
  useEffect(() => { load(); }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    load(e.target.value);
  };

  const handleAdd = () => {
    if (!form.name) return;
    api.post('/customers', form).then(() => { setForm({ name: '', phone: '', whatsapp: '', area: '', address: '' }); setShowForm(false); load(); });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Customers</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>+ Add Customer</button>
      </div>

      {showForm && (
        <div className="card mb-4 grid sm:grid-cols-2 gap-3">
          <input className="input-field" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input-field" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="input-field" placeholder="WhatsApp Number" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
          <input className="input-field" placeholder="Area (Hangu/Kohat/Thall/Doaba/Karak)" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
          <input className="input-field sm:col-span-2" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <button className="btn-primary sm:col-span-2" onClick={handleAdd}>Save Customer</button>
        </div>
      )}

      <div className="relative mb-3">
        <IconImg name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2" />
        <input className="input-field pl-10" placeholder="Search by name, phone, area..." value={search} onChange={handleSearch} />
      </div>

      <div className="card overflow-x-auto">
        <table className="table-flat min-w-[600px]">
          <thead><tr><th>Name</th><th>Phone</th><th>Area</th><th></th></tr></thead>
          <tbody>
            {customers.map((c) => (
              <React.Fragment key={c.id}>
                <tr>
                  <td>{c.name}</td>
                  <td>{c.phone}</td>
                  <td>{c.area}</td>
                  <td className="flex gap-2">
                    {c.phone && <a href={`tel:${c.phone}`} className="btn-ghost text-xs">Call</a>}
                    {(c.whatsapp || c.phone) && (
                      <a href={`https://wa.me/${(c.whatsapp || c.phone).replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="btn-ghost text-xs">WhatsApp</a>
                    )}
                    <button className="btn-ghost text-xs" onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}>
                      {expandedId === c.id ? 'Hide Details' : 'More Details'}
                    </button>
                  </td>
                </tr>
                {expandedId === c.id && (
                  <tr><td colSpan={4}><CustomFieldsEditor entityType="customer" entityId={c.id} /></td></tr>
                )}
              </React.Fragment>
            ))}
            {!customers.length && <tr><td colSpan={4} className="text-text-secondary">No customers yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
