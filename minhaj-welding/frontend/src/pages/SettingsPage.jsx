import React, { useEffect, useState } from 'react';
import api from '../services/api';
import IconImg from '../components/IconImg';

const FIELDS = [
  { group: 'Business', items: [
    ['business_name', 'Business Name'], ['owner_1_name', 'Owner 1 Name'], ['owner_1_phone', 'Owner 1 Phone'],
    ['owner_2_name', 'Owner 2 Name'], ['owner_2_phone', 'Owner 2 Phone'], ['service_areas', 'Service Areas (comma separated)'],
  ]},
  { group: 'WhatsApp', items: [
    ['whatsapp_number', 'Business WhatsApp (e.g. 923310092592)'],
  ]},
  { group: 'Email (Gmail SMTP)', items: [
    ['email_smtp_host', 'SMTP Host'], ['email_smtp_port', 'SMTP Port'],
    ['email_smtp_user', 'Gmail Address'], ['email_smtp_pass', 'Gmail App Password', 'password'],
  ]},
];

const TEMPLATE_KEYS = [
  ['whatsapp_template_quotation', 'WhatsApp — Quotation message'],
  ['whatsapp_template_invoice', 'WhatsApp — Invoice message'],
  ['whatsapp_template_reminder', 'WhatsApp — Payment reminder'],
];

export default function SettingsPage() {
  const [settings, setSettings] = useState({});
  const [icons, setIcons] = useState([]);
  const [msg, setMsg] = useState('');

  const loadIcons = () => api.get('/icons').then((r) => setIcons(r.data)).catch(() => {});
  useEffect(() => {
    api.get('/settings').then((r) => setSettings(r.data));
    loadIcons();
  }, []);

  const save = () => api.put('/settings', settings).then(() => { setMsg('Settings saved ✓'); setTimeout(() => setMsg(''), 2500); });

  const uploadIcon = (name, file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    api.post(`/icons/${name}`, fd).then(() => { loadIcons(); setMsg(`Icon "${name}" replaced ✓ (refresh page to see it everywhere)`); })
      .catch((e) => setMsg(e.response?.data?.error || 'Upload failed'));
  };
  const resetIcon = (name) => api.delete(`/icons/${name}`).then(() => { loadIcons(); setMsg(`Icon "${name}" reset to default ✓`); });

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-bold mb-4">Settings</h1>
      {msg && <div className="badge badge-success mb-3">{msg}</div>}

      {FIELDS.map((g) => (
        <div key={g.group} className="card mb-4">
          <h2 className="font-semibold mb-3">{g.group}</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {g.items.map(([key, label, type]) => (
              <div key={key}>
                <label className="text-xs text-text-secondary block mb-1">{label}</label>
                <input type={type || 'text'} className="input-field" value={settings[key] || ''}
                  onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="card mb-4">
        <h2 className="font-semibold mb-1">Message Templates</h2>
        <p className="text-xs text-text-secondary mb-3">
          Variables: {'{customer_name} {quotation_no} {invoice_no} {amount} {balance} {pdf_link}'}. Leave empty to use defaults.
        </p>
        {TEMPLATE_KEYS.map(([key, label]) => (
          <div key={key} className="mb-3">
            <label className="text-xs text-text-secondary block mb-1">{label}</label>
            <textarea rows={3} className="input-field" value={settings[key] || ''}
              onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} />
          </div>
        ))}
      </div>

      <button className="btn-primary mb-6" onClick={save}>Save Settings</button>

      <div className="card">
        <h2 className="font-semibold mb-1">Icons & Assets</h2>
        <p className="text-xs text-text-secondary mb-3">Upload an SVG or PNG to replace any icon. Works offline. Reset restores the default.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {icons.map((ic) => (
            <div key={ic.name} className="border border-border rounded-card p-3 flex items-center gap-3">
              <IconImg name={ic.name} size={36} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{ic.name}</div>
                <div className="text-[11px] text-text-secondary">{ic.overridden ? 'Custom' : 'Default'}</div>
              </div>
              <label className="btn-outline text-xs cursor-pointer">
                Upload
                <input type="file" accept=".svg,.png" className="hidden" onChange={(e) => uploadIcon(ic.name, e.target.files[0])} />
              </label>
              {ic.overridden && <button className="btn-ghost text-xs" onClick={() => resetIcon(ic.name)}>Reset</button>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
