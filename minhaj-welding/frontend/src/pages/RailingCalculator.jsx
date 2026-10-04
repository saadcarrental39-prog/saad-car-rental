import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import FeetInchInput from '../components/FeetInchInput';
import BreakdownTable from '../components/BreakdownTable';
import RateSelector from '../components/RateSelector';
import PriceSummary from '../components/PriceSummary';
import ActionBar from '../components/ActionBar';

export default function RailingCalculator() {
  const [categoryId, setCategoryId] = useState(null);
  const [styles, setStyles] = useState([]);
  const [styleId, setStyleId] = useState('');
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState('');

  const [length, setLength] = useState({ ft: '', in: '' });
  const [pillarCount, setPillarCount] = useState(0);
  const [pillarRate, setPillarRate] = useState(0);
  const [manualValue, setManualValue] = useState('');
  const [manualReason, setManualReason] = useState('');

  const [rateValue, setRateValue] = useState({ rate_source: 'current' });
  const [activeRate, setActiveRate] = useState(null);
  const [extras, setExtras] = useState({});
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [error, setError] = useState('');

  const style = styles.find((s) => String(s.id) === String(styleId));

  useEffect(() => {
    api.get('/catalog/categories').then((res) => {
      const cat = res.data.find((c) => c.name === 'Railing');
      if (cat) {
        setCategoryId(cat.id);
        api.get('/catalog/styles', { params: { category_id: cat.id } }).then((r) => {
          setStyles(r.data);
          if (r.data.length) setStyleId(r.data[0].id);
        });
      }
    });
    api.get('/customers').then((res) => setCustomers(res.data));
  }, []);

  useEffect(() => {
    if (styleId) api.get('/rates', { params: { style_id: styleId } }).then((res) => setActiveRate(res.data[0] || null));
  }, [styleId]);

  const buildInputs = () => ({ length_ft: length.ft, length_in: length.in, pillar_count: pillarCount, pillar_rate: pillarRate });

  const calculate = useCallback(() => {
    if (!style || length.ft === '') return;
    setError('');
    api.post('/measurements/calculate', {
      category_id: categoryId, style_id: Number(styleId), formula_key: style.formula_key,
      inputs: buildInputs(), manual_value: manualValue === '' ? null : manualValue, manual_reason: manualReason,
      rate_source: rateValue.rate_source, custom_rate: rateValue.custom_rate, historical_rate_id: rateValue.historical_rate_id,
      discount_amount: extras.discount_amount, discount_percent: extras.discount_percent,
      labour_amount: extras.labour_amount, transport_amount: extras.transport_amount,
      extra_amount: pillarCount * pillarRate,
    }).then((res) => setResult(res.data)).catch((err) => setError(err.response?.data?.error || 'Calculation failed'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [style, length, pillarCount, pillarRate, manualValue, rateValue, extras]);

  useEffect(() => { calculate(); }, [calculate]);

  const handleSave = () => {
    if (!result) return;
    setSaving(true);
    api.post('/measurements', {
      customer_id: customerId || null, category_id: categoryId, style_id: Number(styleId),
      formula_key: style.formula_key, formula_version: style.formula_version,
      inputs: buildInputs(), manual_value: manualValue === '' ? null : manualValue, manual_reason: manualReason,
      rate_source: rateValue.rate_source, custom_rate: rateValue.custom_rate, historical_rate_id: rateValue.historical_rate_id,
      discount_amount: extras.discount_amount, discount_percent: extras.discount_percent,
      labour_amount: extras.labour_amount, transport_amount: extras.transport_amount,
      extra_amount: pillarCount * pillarRate,
    }).then((res) => setSavedId(res.data.id)).catch((err) => setError(err.response?.data?.error || 'Save failed'))
      .finally(() => setSaving(false));
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-xl font-bold mb-1">Railing Calculator</h1>
      <p className="text-text-secondary text-sm mb-4">Running-foot based. Master Pillar priced separately (count × pillar rate).</p>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="card space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Design</label>
              <select className="input-field" value={styleId} onChange={(e) => setStyleId(e.target.value)}>
                {styles.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Customer (optional)</label>
              <select className="input-field" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="">Walk-in / not selected</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>)}
              </select>
            </div>
            <FeetInchInput label="Railing Length" value={length} onChange={setLength} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Master Pillar Count</label>
                <input type="number" className="input-field" min="0" value={pillarCount}
                  onChange={(e) => setPillarCount(Number(e.target.value))} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Pillar Rate (Rs. each)</label>
                <input type="number" className="input-field" min="0" value={pillarRate}
                  onChange={(e) => setPillarRate(Number(e.target.value))} />
              </div>
            </div>
            <div className="border-t border-border pt-3">
              <label className="text-sm font-medium mb-1 block">Manual Override (optional)</label>
              <input type="number" className="input-field" placeholder="Override length (Running Ft)"
                value={manualValue} onChange={(e) => setManualValue(e.target.value)} />
              {manualValue !== '' && (
                <input type="text" className="input-field mt-2" placeholder="Reason for override"
                  value={manualReason} onChange={(e) => setManualReason(e.target.value)} />
              )}
            </div>
          </div>
          <RateSelector categoryId={categoryId} styleId={styleId} activeRate={activeRate} value={rateValue} onChange={setRateValue} />
        </div>

        <div className="space-y-4">
          {error && <div className="badge badge-danger">{error}</div>}
          {result && <BreakdownTable breakdown={result.calc_breakdown} total={result.final_value} unit={result.unit} />}
          {pillarCount > 0 && (
            <div className="card text-sm flex justify-between">
              <span>Master Pillar ({pillarCount} × Rs. {pillarRate})</span>
              <span className="font-medium">Rs. {(pillarCount * pillarRate).toFixed(2)}</span>
            </div>
          )}
          <PriceSummary extras={extras} onExtrasChange={setExtras} result={result} />
          <div className="card">
            <ActionBar onSave={handleSave} saving={saving} onPrint={() => window.print()} />
            {savedId && <div className="text-success text-sm mt-2">Saved ✓ (Measurement #{savedId})</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
