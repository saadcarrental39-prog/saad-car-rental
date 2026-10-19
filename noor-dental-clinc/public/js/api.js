/* Thin fetch wrapper for the local Express API */
const API = {
  token: () => localStorage.getItem('noor_token'),
  setSession(token, user) { localStorage.setItem('noor_token', token); localStorage.setItem('noor_user', JSON.stringify(user)); },
  user() { try { return JSON.parse(localStorage.getItem('noor_user') || 'null'); } catch { return null; } },
  clear() { localStorage.removeItem('noor_token'); localStorage.removeItem('noor_user'); },
  async req(method, url, body, raw) {
    let res;
    try {
      res = await fetch('/api/' + url, { method, headers: { 'Content-Type': 'application/json', 'x-token': API.token() || '' }, body: body === undefined ? undefined : JSON.stringify(body) });
    } catch (e) {
      const err = new Error('Cannot reach the clinic server. Make sure start.bat (npm start) is running.'); err.network = true; throw err;
    }
    if (res.status === 401 && !url.startsWith('auth/login')) { API.clear(); if (!location.pathname.endsWith('index.html') && location.pathname !== '/') location.href = '/index.html'; throw new Error('Session expired'); }
    if (raw) return res;
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Request failed (' + res.status + ')');
    API.lastTotal = Number(res.headers.get('X-Total-Count') || 0);
    return data;
  },
  get: u => API.req('GET', u), post: (u, b) => API.req('POST', u, b || {}), put: (u, b) => API.req('PUT', u, b), del: u => API.req('DELETE', u),
  qs(o) { const p = new URLSearchParams(); Object.entries(o || {}).forEach(([k, v]) => { if (v !== '' && v != null) p.set(k, v); }); const s = p.toString(); return s ? '?' + s : ''; },
  async upload(kind, files, pid) {
    const fd = new FormData(); [...files].forEach(f => fd.append('files', f));
    const res = await fetch(`/api/upload/${kind}${pid ? '?pid=' + pid : ''}`, { method: 'POST', headers: { 'x-token': API.token() || '' }, body: fd });
    const d = await res.json(); if (!res.ok) throw new Error(d.error || 'Upload failed'); return d;
  },
  openPdf(url) { window.open(`/api/${url}${url.includes('?') ? '&' : '?'}token=${API.token()}`, '_blank'); },
  async pdfTable(payload) {
    const res = await API.req('POST', 'pdf/table', payload, true); if (!res.ok) throw new Error('PDF failed');
    window.open(URL.createObjectURL(await res.blob()), '_blank');
  }
};
