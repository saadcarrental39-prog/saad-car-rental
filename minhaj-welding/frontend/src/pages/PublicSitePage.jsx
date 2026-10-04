import React, { useEffect, useState } from 'react';
import api from '../services/api';

/**
 * MINHAJ WELDING - Public Website (Module 16)
 * No auth, no sidebar — this is what a customer sees at minhajwelding.com.
 * Pulls all content from GET /api/cms/public (edited via Admin > Website)
 * and submits its contact form to POST /api/leads (also public), which
 * shows up in Admin > Leads.
 */
export default function PublicSitePage() {
  const [data, setData] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/cms/public').then((r) => setData(r.data)).catch(() => setError('Could not load site content.'));
  }, []);

  const submitLead = (e) => {
    e.preventDefault();
    if (!form.name) return;
    api.post('/leads', { ...form, source: 'website' })
      .then(() => setSent(true))
      .catch(() => setError('Could not send your message — please call us directly.'));
  };

  if (!data) return <div className="min-h-screen flex items-center justify-center text-text-secondary">Loading...</div>;

  const s = data.settings || {};
  const hero = (data.sections.hero || [])[0] || {};
  const services = data.sections.service || [];
  const projects = data.sections.project || [];
  const testimonials = data.sections.testimonial || [];
  const faqs = data.sections.faq || [];
  const footer = (data.sections.footer || [])[0] || {};

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* ---- Header ---- */}
      <header className="border-b border-border px-6 py-4 flex justify-between items-center">
        <div className="font-bold text-lg">{s.business_name || 'MINHAJ WELDING'}</div>
        <a href="#contact" className="btn-primary text-sm">Get a Quote</a>
      </header>

      {/* ---- Hero ---- */}
      <section className="px-6 py-16 text-center border-b border-border">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">{hero.headline || s.business_name}</h1>
        <p className="text-text-secondary max-w-xl mx-auto mb-6">{hero.subheading}</p>
        {hero.cta_text && <a href={hero.cta_link || '#contact'} className="btn-primary">{hero.cta_text}</a>}
      </section>

      {/* ---- Services ---- */}
      {services.length > 0 && (
        <section className="px-6 py-12 border-b border-border">
          <h2 className="text-xl font-bold text-center mb-8">Our Services</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {services.map((sv) => (
              <div key={sv.id} className="card">
                <div className="font-semibold mb-1">{sv.title}</div>
                <div className="text-sm text-text-secondary">{sv.description}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---- Projects Gallery ---- */}
      {projects.length > 0 && (
        <section className="px-6 py-12 border-b border-border">
          <h2 className="text-xl font-bold text-center mb-8">Our Work</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {projects.map((p) => (
              <div key={p.id} className="card">
                <div className="font-semibold mb-1">{p.title}</div>
                <div className="text-sm text-text-secondary">{p.description}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---- Testimonials ---- */}
      {testimonials.length > 0 && (
        <section className="px-6 py-12 border-b border-border bg-gray-50">
          <h2 className="text-xl font-bold text-center mb-8">What Customers Say</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {testimonials.map((t) => (
              <div key={t.id} className="card">
                <div className="text-sm italic mb-2">"{t.quote}"</div>
                <div className="text-sm font-semibold">— {t.name}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---- FAQs ---- */}
      {faqs.length > 0 && (
        <section className="px-6 py-12 border-b border-border max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((f) => (
              <details key={f.id} className="card">
                <summary className="font-medium cursor-pointer">{f.question}</summary>
                <p className="text-sm text-text-secondary mt-2">{f.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* ---- Contact / Lead Form ---- */}
      <section id="contact" className="px-6 py-16 max-w-md mx-auto">
        <h2 className="text-xl font-bold text-center mb-2">Get a Free Quote</h2>
        <p className="text-text-secondary text-sm text-center mb-6">
          {s.owner_1_phone && `Call ${s.owner_1_phone}`} {s.service_areas && `— serving ${s.service_areas.split(',').join(', ')}`}
        </p>
        {sent ? (
          <div className="badge badge-success block text-center py-3">Thank you! We'll contact you shortly.</div>
        ) : (
          <form onSubmit={submitLead} className="card space-y-3">
            {error && <div className="badge badge-danger block text-center">{error}</div>}
            <input className="input-field" placeholder="Your Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="input-field" placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className="input-field" placeholder="Email (optional)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <textarea className="input-field" rows={4} placeholder="What do you need? (e.g. gate for a 10x8 ft entrance)"
              value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            <button type="submit" className="btn-primary w-full">Send</button>
          </form>
        )}
        {s.whatsapp_number && (
          <a href={`https://wa.me/${s.whatsapp_number}`} target="_blank" rel="noreferrer" className="btn-outline w-full block text-center mt-3">
            Or message us on WhatsApp
          </a>
        )}
      </section>

      <footer className="px-6 py-6 border-t border-border text-center text-xs text-text-secondary">
        {footer.text || `${s.business_name || 'MINHAJ WELDING'} — all rights reserved.`}
      </footer>
    </div>
  );
}
