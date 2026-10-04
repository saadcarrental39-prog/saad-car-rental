import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'viewer' });
  const [error, setError] = useState('');

  const load = () => api.get('/users').then((r) => setUsers(r.data)).catch((e) => setError(e.response?.data?.error || 'Access denied'));
  useEffect(() => { load(); api.get('/users/roles').then((r) => setRoles(r.data)); }, []);

  const addUser = () => {
    if (!form.name || !form.email || !form.password) return;
    api.post('/users', form)
      .then(() => { setForm({ name: '', email: '', phone: '', password: '', role: 'viewer' }); setShowForm(false); load(); })
      .catch((e) => setError(e.response?.data?.error || 'Failed to create user'));
  };

  const changeRole = (id, role) => api.put(`/users/${id}`, { role }).then(load);
  const toggleActive = (id, is_active) => api.put(`/users/${id}`, { is_active: is_active ? 0 : 1 }).then(load);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Users & Roles</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>+ Add User</button>
      </div>

      {error && <div className="badge badge-danger mb-3">{error}</div>}

      {showForm && (
        <div className="card mb-4 grid sm:grid-cols-2 gap-3">
          <input className="input-field" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input-field" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input-field" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input type="password" className="input-field" placeholder="Temporary password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <select className="input-field sm:col-span-2" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            {roles.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <button className="btn-primary sm:col-span-2" onClick={addUser}>Create User</button>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="table-flat min-w-[600px]">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <select className="input-field text-xs py-1" value={u.role} onChange={(e) => changeRole(u.id, e.target.value)}>
                    {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td><span className={`badge ${u.is_active ? 'badge-success' : 'badge-neutral'}`}>{u.is_active ? 'active' : 'disabled'}</span></td>
                <td><button className="btn-ghost text-xs" onClick={() => toggleActive(u.id, u.is_active)}>{u.is_active ? 'Disable' : 'Enable'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
