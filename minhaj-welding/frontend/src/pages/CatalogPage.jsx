import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function CatalogPage() {
  const [categories, setCategories] = useState([]);
  const [styles, setStyles] = useState([]);
  const [formulaKeys, setFormulaKeys] = useState([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [newCat, setNewCat] = useState({ name: '', unit_type: 'running_ft' });
  const [newStyle, setNewStyle] = useState({ name: '', code: '', formula_key: '' });

  const [materials, setMaterials] = useState([]);
  const [newMaterial, setNewMaterial] = useState({ name: '', unit: '' });

  const [addons, setAddons] = useState([]);
  const [newAddon, setNewAddon] = useState({ name: '', unit: 'pc', default_rate: '' });

  const loadCats = () => api.get('/catalog/categories').then((r) => setCategories(r.data));
  const loadStyles = (catId) => api.get('/catalog/styles', { params: { category_id: catId || undefined } }).then((r) => setStyles(r.data));
  const loadMaterials = (catId) => api.get('/catalog/materials', { params: { category_id: catId || undefined } }).then((r) => setMaterials(r.data));
  const loadAddons = () => api.get('/addons').then((r) => setAddons(r.data));

  useEffect(() => {
    loadCats();
    loadStyles();
    loadMaterials();
    loadAddons();
    api.get('/catalog/styles/formula-keys').then((r) => setFormulaKeys(r.data));
  }, []);

  useEffect(() => { loadStyles(selectedCat); loadMaterials(selectedCat); }, [selectedCat]);

  const addCategory = () => {
    if (!newCat.name) return;
    api.post('/catalog/categories', newCat).then(() => { setNewCat({ name: '', unit_type: 'running_ft' }); loadCats(); });
  };
  const deleteCategory = (id) => {
    if (!confirm('Delete this category? Existing styles/rates referencing it may break.')) return;
    api.delete(`/catalog/categories/${id}`).then(loadCats);
  };

  const addStyle = () => {
    if (!newStyle.name || !newStyle.formula_key || !selectedCat) return;
    api.post('/catalog/styles', { ...newStyle, category_id: selectedCat }).then(() => {
      setNewStyle({ name: '', code: '', formula_key: '' });
      loadStyles(selectedCat);
    });
  };
  const deleteStyle = (id) => {
    if (!confirm('Delete this style?')) return;
    api.delete(`/catalog/styles/${id}`).then(() => loadStyles(selectedCat));
  };
  const duplicateStyle = (id) => api.post(`/catalog/styles/${id}/duplicate`).then(() => loadStyles(selectedCat));

  const addMaterial = () => {
    if (!newMaterial.name || !selectedCat) return;
    api.post('/catalog/materials', { ...newMaterial, category_id: selectedCat }).then(() => {
      setNewMaterial({ name: '', unit: '' });
      loadMaterials(selectedCat);
    });
  };
  const deleteMaterial = (id) => api.delete(`/catalog/materials/${id}`).then(() => loadMaterials(selectedCat));

  const addAddon = () => {
    if (!newAddon.name) return;
    api.post('/addons', newAddon).then(() => { setNewAddon({ name: '', unit: 'pc', default_rate: '' }); loadAddons(); });
  };
  const deleteAddon = (id) => api.delete(`/addons/${id}`).then(loadAddons);

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Categories & Styles</h1>
      <p className="text-text-secondary text-sm mb-4">
        Free-hand editable: add/edit/delete any category or style. Each style's <code>formula_key</code> tells the
        calculator which math to run — see docs/FORMULAS.md for what each key does.
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        {/* ---- Categories ---- */}
        <div className="card">
          <h2 className="font-semibold mb-2">Categories</h2>
          <div className="flex gap-2 mb-3">
            <input className="input-field" placeholder="New category name" value={newCat.name}
              onChange={(e) => setNewCat({ ...newCat, name: e.target.value })} />
            <select className="input-field w-40" value={newCat.unit_type} onChange={(e) => setNewCat({ ...newCat, unit_type: e.target.value })}>
              <option value="running_ft">Running Ft</option>
              <option value="sq_ft">Sq Ft</option>
              <option value="piece">Piece</option>
              <option value="day">Day</option>
              <option value="hour">Hour</option>
            </select>
            <button className="btn-primary" onClick={addCategory}>Add</button>
          </div>
          <div className="divide-y divide-border max-h-96 overflow-y-auto">
            {categories.map((c) => (
              <div key={c.id} className={`flex justify-between items-center py-2 cursor-pointer ${String(selectedCat) === String(c.id) ? 'text-brand font-medium' : ''}`}
                onClick={() => setSelectedCat(c.id)}>
                <span>{c.name} <span className="text-xs text-text-secondary">({c.unit_type})</span></span>
                <button className="text-danger text-xs" onClick={(e) => { e.stopPropagation(); deleteCategory(c.id); }}>Delete</button>
              </div>
            ))}
          </div>
        </div>

        {/* ---- Styles ---- */}
        <div className="card">
          <h2 className="font-semibold mb-2">
            Styles {selectedCat && `— ${categories.find((c) => c.id === selectedCat)?.name || ''}`}
          </h2>
          {!selectedCat && <div className="text-sm text-text-secondary">Select a category on the left to manage its styles.</div>}
          {selectedCat && (
            <>
              <div className="space-y-2 mb-3">
                <input className="input-field" placeholder="Style name (e.g. Window - 4 Laar)" value={newStyle.name}
                  onChange={(e) => setNewStyle({ ...newStyle, name: e.target.value })} />
                <div className="flex gap-2">
                  <input className="input-field" placeholder="Code (optional, e.g. WIN-L-004)" value={newStyle.code}
                    onChange={(e) => setNewStyle({ ...newStyle, code: e.target.value })} />
                  <select className="input-field" value={newStyle.formula_key} onChange={(e) => setNewStyle({ ...newStyle, formula_key: e.target.value })}>
                    <option value="">Formula...</option>
                    {formulaKeys.map((k) => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <button className="btn-primary w-full" onClick={addStyle}>Add Style</button>
              </div>
              <div className="divide-y divide-border max-h-72 overflow-y-auto">
                {styles.map((s) => (
                  <div key={s.id} className="py-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-sm">{s.name}</div>
                        <div className="text-xs text-text-secondary">{s.formula_key} · v{s.formula_version} {s.code ? `· ${s.code}` : ''}</div>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <button className="text-brand" onClick={() => duplicateStyle(s.id)}>Duplicate</button>
                        <button className="text-danger" onClick={() => deleteStyle(s.id)}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
                {!styles.length && <div className="text-sm text-text-secondary py-2">No styles yet in this category.</div>}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ---- Materials ---- */}
      <div className="card mt-4">
        <h2 className="font-semibold mb-2">
          Materials / Profiles {selectedCat && `— ${categories.find((c) => c.id === selectedCat)?.name || ''}`}
        </h2>
        {!selectedCat && <div className="text-sm text-text-secondary">Select a category above to manage its materials (e.g. "5 Inch Profile", "16 Gauge Sheet").</div>}
        {selectedCat && (
          <>
            <div className="flex gap-2 mb-3">
              <input className="input-field" placeholder="Material name" value={newMaterial.name}
                onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })} />
              <input className="input-field w-32" placeholder="Unit" value={newMaterial.unit}
                onChange={(e) => setNewMaterial({ ...newMaterial, unit: e.target.value })} />
              <button className="btn-primary" onClick={addMaterial}>Add</button>
            </div>
            <div className="divide-y divide-border">
              {materials.map((m) => (
                <div key={m.id} className="flex justify-between items-center py-2 text-sm">
                  <span>{m.name} <span className="text-xs text-text-secondary">({m.unit})</span></span>
                  <button className="text-danger text-xs" onClick={() => deleteMaterial(m.id)}>Delete</button>
                </div>
              ))}
              {!materials.length && <div className="text-sm text-text-secondary py-2">No materials yet in this category.</div>}
            </div>
          </>
        )}
      </div>

      {/* ---- Hardware / Addon Catalog ---- */}
      <div className="card mt-4">
        <h2 className="font-semibold mb-1">Hardware & Addon Catalog</h2>
        <p className="text-xs text-text-secondary mb-3">
          Reusable price list for extras (gate handles, locks, fiber frame pipe, transport). These show up when adding
          extra line items to a Quotation, so prices stay consistent instead of being retyped every time.
        </p>
        <div className="flex gap-2 mb-3">
          <input className="input-field flex-1" placeholder="Item name (e.g. Gate Handle)" value={newAddon.name}
            onChange={(e) => setNewAddon({ ...newAddon, name: e.target.value })} />
          <input className="input-field w-28" placeholder="Unit" value={newAddon.unit}
            onChange={(e) => setNewAddon({ ...newAddon, unit: e.target.value })} />
          <input type="number" className="input-field w-32" placeholder="Rate (Rs.)" value={newAddon.default_rate}
            onChange={(e) => setNewAddon({ ...newAddon, default_rate: e.target.value })} />
          <button className="btn-primary" onClick={addAddon}>Add</button>
        </div>
        <div className="divide-y divide-border">
          {addons.map((a) => (
            <div key={a.id} className="flex justify-between items-center py-2 text-sm">
              <span>{a.name} <span className="text-xs text-text-secondary">({a.unit})</span></span>
              <span className="flex items-center gap-3">
                <span className="font-medium">Rs. {a.default_rate}</span>
                <button className="text-danger text-xs" onClick={() => deleteAddon(a.id)}>Delete</button>
              </span>
            </div>
          ))}
          {!addons.length && <div className="text-sm text-text-secondary py-2">No addon items yet.</div>}
        </div>
      </div>
    </div>
  );
}
