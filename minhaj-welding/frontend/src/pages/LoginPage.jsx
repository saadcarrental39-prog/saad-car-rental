import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
      const dest = location.state?.from || '/';
      navigate(dest, { replace: true });
    } catch (err) {
      if (err.response?.data?.error) setError(err.response.data.error);
      else if (err.response) setError(`Backend chal nahi raha (error ${err.response.status}). "MW Backend" window check karein - agar wahan error hai to install.bat dobara chalayen.`);
      else setError('Server se connection nahi ho raha. Backend (port 3001) chal raha hai? start.bat dobara chalayen.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <form onSubmit={handleSubmit} className="card w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="font-bold text-2xl">MINHAJ</div>
          <div className="font-bold text-2xl text-brand -mt-1">WELDING</div>
          <div className="text-xs text-text-secondary mt-1">Management System</div>
        </div>

        {error && <div className="badge badge-danger mb-3 block text-center">{error}</div>}

        <label className="text-sm font-medium block mb-1">Email</label>
        <input type="email" className="input-field mb-3" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label className="text-sm font-medium block mb-1">Password</label>
        <input type="password" className="input-field mb-4" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <button type="submit" className="btn-primary w-full" disabled={busy}>{busy ? 'Signing in...' : 'Sign In'}</button>

        <p className="text-xs text-text-secondary text-center mt-4">
          Default (change immediately): admin@minhajwelding.com / changeme123
        </p>
      </form>
    </div>
  );
}
