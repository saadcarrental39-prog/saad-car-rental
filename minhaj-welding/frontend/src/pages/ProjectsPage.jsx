import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const STATUS_BADGE = { planning: 'badge-neutral', in_progress: 'badge-warning', completed: 'badge-success', on_hold: 'badge-warning', cancelled: 'badge-danger' };

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', customer_id: '', project_type: 'private', contract_value: '', location: '' });

  const load = () => api.get('/projects').then((r) => setProjects(r.data));
  useEffect(() => { load(); api.get('/customers').then((r) => setCustomers(r.data)); }, []);

  const addProject = () => {
    if (!form.name) return;
    api.post('/projects', form).then(() => {
      setForm({ name: '', customer_id: '', project_type: 'private', contract_value: '', location: '' });
      setShowForm(false);
      load();
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Projects</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>+ New Project</button>
      </div>

      {showForm && (
        <div className="card mb-4 grid sm:grid-cols-2 gap-3">
          <input className="input-field" placeholder="Project name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className="input-field" value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })}>
            <option value="">Customer (optional)</option>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="input-field" value={form.project_type} onChange={(e) => setForm({ ...form, project_type: e.target.value })}>
            <option value="private">Private</option>
            <option value="government">Government</option>
          </select>
          <input type="number" className="input-field" placeholder="Contract value (Rs.)" value={form.contract_value} onChange={(e) => setForm({ ...form, contract_value: e.target.value })} />
          <input className="input-field sm:col-span-2" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <button className="btn-primary sm:col-span-2" onClick={addProject}>Create Project</button>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {projects.map((p) => (
          <Link key={p.id} to={`/projects/${p.id}`} className="card block hover:border-brand transition-colors">
            <div className="flex justify-between items-start mb-1">
              <div className="font-semibold">{p.name}</div>
              <span className={`badge ${STATUS_BADGE[p.status] || 'badge-neutral'}`}>{p.status}</span>
            </div>
            <div className="text-sm text-text-secondary">{p.customer_name || 'No customer linked'}</div>
            <div className="text-sm text-text-secondary">{p.project_type} {p.location && `— ${p.location}`}</div>
            {p.contract_value && <div className="font-medium mt-2">Rs. {p.contract_value.toLocaleString()}</div>}
          </Link>
        ))}
        {!projects.length && <div className="text-text-secondary">No projects yet.</div>}
      </div>
    </div>
  );
}
