import React, { useEffect, useState } from 'react';
import api from '../services/api';

const SECTION_TABS = [
  { key: 'hero', label: 'Hero' },
  { key: 'service', label: 'Services' },
  { key: 'project', label: 'Projects Gallery' },
  { key: 'testimonial', label: 'Testimonials' },
  { key: 'faq', label: 'FAQs' },
  { key: 'footer', label: 'Footer' },
];

// Field layout per section — keeps the editor generic and data-driven,
// so adding a new section type later is a config change, not new UI code.
const FIELDS = {
  hero: [['headline', 'Headline'], ['subheading', 'Subheading'], ['cta_text', 'Button Text'], ['cta_link', 'Button Link']],
  service: [['title', 'Title'], ['description', 'Description']],
  project: [['title', 'Title'], ['description', 'Description']],
  testimonial: [['name', 'Customer Name'], ['quote', 'Quote']],
  faq: [['question', 'Question'], ['answer', 'Answer']],
  footer: [['text', 'Footer Text']],
};

export default function WebsiteCmsPage() {
  const [tab, setTab] = useState('hero');
  const [blocks, setBlocks] = useState([]);
  const [newContent, setNewContent] = useState({});

  const load = (section) => api.get('/cms/blocks', { params: { section } }).then((r) => setBlocks(r.data));
  useEffect(() => { load(tab); setNewContent({}); }, [tab]);

  const addBlock = () => {
    api.post('/cms/blocks', { section: tab, content: newContent, sort_order: blocks.length }).then(() => { setNewContent({}); load(tab); });
  };
  const updateBlock = (id, content) => api.put(`/cms/blocks/${id}`, { content }).then(() => load(tab));
  const deleteBlock = (id) => api.delete(`/cms/blocks/${id}`).then(() => load(tab));
  const toggleActive = (id, is_active) => api.put(`/cms/blocks/${id}`, { is_active: is_active ? 0 : 1 }).then(() => load(tab));

  const fields = FIELDS[tab] || [];

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Website</h1>
      <p className="text-text-secondary text-sm mb-4">
        Edit the public website's content here — every section is free-hand: add, edit, delete, or hide any block.
        The live site reads this through <code>GET /api/cms/public</code>.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {SECTION_TABS.map((s) => (
          <button key={s.key} onClick={() => setTab(s.key)}
            className={`px-3 py-1.5 rounded-input text-sm border ${tab === s.key ? 'bg-brand text-white border-brand' : 'border-border'}`}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="card mb-4">
        <h2 className="font-semibold mb-2">+ Add {SECTION_TABS.find((s) => s.key === tab)?.label}</h2>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          {fields.map(([key, label]) => (
            <input key={key} className="input-field" placeholder={label} value={newContent[key] || ''}
              onChange={(e) => setNewContent({ ...newContent, [key]: e.target.value })} />
          ))}
        </div>
        <button className="btn-primary" onClick={addBlock}>Add</button>
      </div>

      <div className="space-y-3">
        {blocks.map((b) => (
          <div key={b.id} className={`card ${!b.is_active ? 'opacity-50' : ''}`}>
            <div className="grid sm:grid-cols-2 gap-3 mb-2">
              {fields.map(([key, label]) => (
                <input key={key} className="input-field" placeholder={label} value={b.content[key] || ''}
                  onChange={(e) => setBlocks(blocks.map((x) => x.id === b.id ? { ...x, content: { ...x.content, [key]: e.target.value } } : x))}
                  onBlur={(e) => updateBlock(b.id, { [key]: e.target.value })} />
              ))}
            </div>
            <div className="flex gap-2">
              <button className="btn-ghost text-xs" onClick={() => toggleActive(b.id, b.is_active)}>{b.is_active ? 'Hide' : 'Show'}</button>
              <button className="text-danger text-xs" onClick={() => deleteBlock(b.id)}>Delete</button>
            </div>
          </div>
        ))}
        {!blocks.length && <div className="text-text-secondary text-sm">No {tab} blocks yet — add one above.</div>}
      </div>
    </div>
  );
}
