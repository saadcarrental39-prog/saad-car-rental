import React, { useEffect, useState } from 'react';
import api from '../services/api';

const STATUS_BADGE = { available: 'badge-success', reserved: 'badge-warning', rented: 'badge-warning', maintenance: 'badge-danger', unavailable: 'badge-neutral' };

export default function MachineryPage() {
  const [machines, setMachines] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', daily_rate: '' });
  const [bookingFor, setBookingFor] = useState(null);
  const [booking, setBooking] = useState({ customer_id: '', start_at: '', end_at: '', rate_type: 'daily', rate_amount: '', notes: '' });
  const [error, setError] = useState('');

  const load = () => api.get('/machinery').then((r) => setMachines(r.data));
  useEffect(() => { load(); api.get('/customers').then((r) => setCustomers(r.data)); }, []);

  const addMachine = () => {
    if (!form.name) return;
    api.post('/machinery', form).then(() => { setForm({ name: '', daily_rate: '' }); setShowForm(false); load(); });
  };

  const submitBooking = (machineId) => {
    setError('');
    api.post(`/machinery/${machineId}/bookings`, booking)
      .then(() => { setBookingFor(null); setBooking({ customer_id: '', start_at: '', end_at: '', rate_type: 'daily', rate_amount: '', notes: '' }); load(); })
      .catch((e) => setError(e.response?.data?.error || 'Booking failed'));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Machinery Rental</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>+ Add Machine</button>
      </div>

      {showForm && (
        <div className="card mb-4 grid sm:grid-cols-2 gap-3">
          <input className="input-field" placeholder="Machine name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input type="number" className="input-field" placeholder="Daily rate (Rs.)" value={form.daily_rate} onChange={(e) => setForm({ ...form, daily_rate: e.target.value })} />
          <button className="btn-primary sm:col-span-2" onClick={addMachine}>Save Machine</button>
        </div>
      )}

      {error && <div className="badge badge-danger mb-3">{error}</div>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {machines.map((m) => (
          <div key={m.id} className="card">
            <div className="flex justify-between items-start">
              <div className="font-semibold">{m.name}</div>
              <span className={`badge ${STATUS_BADGE[m.status] || 'badge-neutral'}`}>{m.status}</span>
            </div>
            <div className="text-sm text-text-secondary mt-1">
              {m.hourly_rate && <div>Hourly: Rs. {m.hourly_rate}</div>}
              {m.daily_rate && <div>Daily: Rs. {m.daily_rate}</div>}
            </div>
            <button className="btn-outline text-xs mt-3" onClick={() => setBookingFor(bookingFor === m.id ? null : m.id)}>
              {bookingFor === m.id ? 'Cancel' : 'Book'}
            </button>

            {bookingFor === m.id && (
              <div className="mt-3 space-y-2 border-t border-border pt-3">
                <select className="input-field" value={booking.customer_id} onChange={(e) => setBooking({ ...booking, customer_id: e.target.value })}>
                  <option value="">Customer (optional)</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <input type="datetime-local" className="input-field text-xs" value={booking.start_at}
                    onChange={(e) => setBooking({ ...booking, start_at: e.target.value })} />
                  <input type="datetime-local" className="input-field text-xs" value={booking.end_at}
                    onChange={(e) => setBooking({ ...booking, end_at: e.target.value })} />
                </div>
                <input type="number" className="input-field" placeholder="Total rate (Rs.)" value={booking.rate_amount}
                  onChange={(e) => setBooking({ ...booking, rate_amount: e.target.value })} />
                <button className="btn-primary w-full text-sm" onClick={() => submitBooking(m.id)}>Confirm Booking</button>
              </div>
            )}
          </div>
        ))}
        {!machines.length && <div className="text-text-secondary">No machines added yet.</div>}
      </div>
    </div>
  );
}
