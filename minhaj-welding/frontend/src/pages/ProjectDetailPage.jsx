import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [boqForm, setBoqForm] = useState({ item_type: 'material', description: '', quantity: 1, unit: '', estimated_rate: '' });
  const [milestoneForm, setMilestoneForm] = useState({ title: '', amount: '', due_date: '' });
  const [progressForm, setProgressForm] = useState({ percent_complete: 0, note: '' });
  const [statusVal, setStatusVal] = useState('');

  const load = () => api.get(`/projects/${id}`).then((r) => { setProject(r.data); setStatusVal(r.data.status); });
  useEffect(() => { load(); }, [id]);

  const addBoq = () => {
    if (!boqForm.description) return;
    api.post(`/projects/${id}/boq`, boqForm).then(() => { setBoqForm({ item_type: 'material', description: '', quantity: 1, unit: '', estimated_rate: '' }); load(); });
  };
  const deleteBoq = (boqId) => api.delete(`/projects/boq/${boqId}`).then(load);

  const addMilestone = () => {
    if (!milestoneForm.title || !milestoneForm.amount) return;
    api.post(`/projects/${id}/milestones`, milestoneForm).then(() => { setMilestoneForm({ title: '', amount: '', due_date: '' }); load(); });
  };
  const setMilestoneStatus = (mid, status) => api.put(`/projects/milestones/${mid}`, { status }).then(load);

  const addProgress = () => {
    api.post(`/projects/${id}/progress`, progressForm).then(() => { setProgressForm({ percent_complete: progressForm.percent_complete, note: '' }); load(); });
  };

  const updateStatus = () => api.put(`/projects/${id}`, { status: statusVal }).then(load);

  if (!project) return <div>Loading...</div>;
  const { summary } = project;

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-start mb-1">
        <h1 className="text-xl font-bold">{project.name}</h1>
        <div className="flex items-center gap-2">
          <select className="input-field text-sm py-1" value={statusVal} onChange={(e) => setStatusVal(e.target.value)}>
            {['planning', 'in_progress', 'completed', 'on_hold', 'cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="btn-outline text-xs" onClick={updateStatus}>Update</button>
        </div>
      </div>
      <p className="text-text-secondary text-sm mb-4">{project.project_type} · {project.location}</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="card"><div className="text-xs text-text-secondary uppercase">Contract Value</div><div className="text-lg font-bold">Rs. {(project.contract_value || 0).toLocaleString()}</div></div>
        <div className="card"><div className="text-xs text-text-secondary uppercase">Estimated Cost</div><div className="text-lg font-bold">Rs. {summary.estimatedCost.toFixed(0)}</div></div>
        <div className="card"><div className="text-xs text-text-secondary uppercase">Actual Cost</div><div className="text-lg font-bold">Rs. {summary.actualCost.toFixed(0)}</div></div>
        <div className="card">
          <div className="text-xs text-text-secondary uppercase">Profit / Margin</div>
          <div className={`text-lg font-bold ${summary.profit < 0 ? 'text-danger' : 'text-success'}`}>
            Rs. {summary.profit.toFixed(0)} {summary.margin !== null && `(${summary.margin.toFixed(1)}%)`}
          </div>
        </div>
      </div>

      {/* BOQ */}
      <div className="card mb-4">
        <h2 className="font-semibold mb-2">Bill of Quantities (BOQ)</h2>
        <div className="grid sm:grid-cols-5 gap-2 mb-3">
          <select className="input-field" value={boqForm.item_type} onChange={(e) => setBoqForm({ ...boqForm, item_type: e.target.value })}>
            {['material', 'labour', 'equipment', 'transport', 'subcontractor'].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input className="input-field sm:col-span-2" placeholder="Description" value={boqForm.description} onChange={(e) => setBoqForm({ ...boqForm, description: e.target.value })} />
          <input type="number" className="input-field" placeholder="Qty" value={boqForm.quantity} onChange={(e) => setBoqForm({ ...boqForm, quantity: e.target.value })} />
          <input type="number" className="input-field" placeholder="Rate" value={boqForm.estimated_rate} onChange={(e) => setBoqForm({ ...boqForm, estimated_rate: e.target.value })} />
        </div>
        <button className="btn-outline text-sm mb-3" onClick={addBoq}>+ Add BOQ Item</button>
        <table className="table-flat">
          <thead><tr><th>Type</th><th>Description</th><th>Qty</th><th>Rate</th><th>Est. Cost</th><th></th></tr></thead>
          <tbody>
            {project.boq.map((b) => (
              <tr key={b.id}>
                <td>{b.item_type}</td><td>{b.description}</td><td>{b.quantity} {b.unit}</td>
                <td>Rs. {b.estimated_rate}</td><td>Rs. {b.estimated_cost.toFixed(0)}</td>
                <td><button className="text-danger text-xs" onClick={() => deleteBoq(b.id)}>Delete</button></td>
              </tr>
            ))}
            {!project.boq.length && <tr><td colSpan={6} className="text-text-secondary">No BOQ items yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Milestones */}
      <div className="card mb-4">
        <h2 className="font-semibold mb-2">Milestone Payments</h2>
        <div className="grid sm:grid-cols-3 gap-2 mb-3">
          <input className="input-field" placeholder="Milestone title" value={milestoneForm.title} onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })} />
          <input type="number" className="input-field" placeholder="Amount (Rs.)" value={milestoneForm.amount} onChange={(e) => setMilestoneForm({ ...milestoneForm, amount: e.target.value })} />
          <input type="date" className="input-field" value={milestoneForm.due_date} onChange={(e) => setMilestoneForm({ ...milestoneForm, due_date: e.target.value })} />
        </div>
        <button className="btn-outline text-sm mb-3" onClick={addMilestone}>+ Add Milestone</button>
        <table className="table-flat">
          <thead><tr><th>Title</th><th>Amount</th><th>Due</th><th>Status</th></tr></thead>
          <tbody>
            {project.milestones.map((m) => (
              <tr key={m.id}>
                <td>{m.title}</td><td>Rs. {m.amount}</td><td>{m.due_date || '—'}</td>
                <td>
                  <select className="input-field text-xs py-1" value={m.status} onChange={(e) => setMilestoneStatus(m.id, e.target.value)}>
                    {['pending', 'invoiced', 'paid'].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {!project.milestones.length && <tr><td colSpan={4} className="text-text-secondary">No milestones yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Progress */}
      <div className="card">
        <h2 className="font-semibold mb-2">Progress Log</h2>
        <div className="flex gap-2 mb-3">
          <input type="number" min="0" max="100" className="input-field w-24" value={progressForm.percent_complete}
            onChange={(e) => setProgressForm({ ...progressForm, percent_complete: Number(e.target.value) })} />
          <input className="input-field flex-1" placeholder="Note (e.g. gate frame welded)" value={progressForm.note}
            onChange={(e) => setProgressForm({ ...progressForm, note: e.target.value })} />
          <button className="btn-outline text-sm" onClick={addProgress}>Log</button>
        </div>
        <div className="divide-y divide-border">
          {project.progress.map((p) => (
            <div key={p.id} className="py-2 text-sm flex justify-between">
              <span>{p.note}</span>
              <span className="text-text-secondary">{p.percent_complete}% — {new Date(p.logged_at).toLocaleDateString()}</span>
            </div>
          ))}
          {!project.progress.length && <div className="text-text-secondary text-sm py-2">No progress logged yet.</div>}
        </div>
      </div>
    </div>
  );
}
