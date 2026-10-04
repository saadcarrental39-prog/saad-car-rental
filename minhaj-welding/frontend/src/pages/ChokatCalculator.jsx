import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import FeetInchInput from '../components/FeetInchInput';
import BreakdownTable from '../components/BreakdownTable';
import RateSelector from '../components/RateSelector';
import PriceSummary from '../components/PriceSummary';
import ActionBar from '../components/ActionBar';

export default function ChokatCalculator() {
  const { categoryId } = useParams();
  const [category, setCategory] = useState(null);
  const [styles, setStyles] = useState([]);
  const [styleId, setStyleId] = useState('');
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState('');

  const [height, setHeight] = useState({ ft: '', in: '' });
  const [width, setWidth] = useState({ ft: '', in: '' });
  const [paithaanCount, setPaithaanCount] = useState(2);
  const [laarCount, setLaarCount] = useState(0);
  const [roshandan, setRoshandan] = useState(false);
  const [roshandanLaarCount, setRoshandanLaarCount] = useState(0);
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
      setCategory(res.data.find((c) => String(c.id) === String(categoryId)));
    });
    api.get('/catalog/styles', { params: { category_id: categoryId } }).then((res) => {
      setStyles(res.data);
      if (res.data.length) setStyleId(res.data[0].id);
    });
    api.get('/customers').then((res) => setCustomers(res.data));
  }, [categoryId]);

  useEffect(() => {
    if (styleId) {
      api.get('/rates', { params: { style_id: styleId } }).then((res) => setActiveRate(res.data[0] || null));
    }
  }, [styleId]);

  const buildInputs = () => ({
    height_ft: height.ft, height_in: height.in,
    width_ft: width.ft, width_in: width.in,
    paithaan_count: paithaanCount,
    laar_count: laarCount,
    roshandan,
    roshandan_laar_count: roshandanLaarCount,
  });

  const calculate = useCallback(() => {
    if (!style || height.ft === '' || width.ft === '') return;
    setError('');
    api.post('/measurements/calculate', {
      category_id: Number(categoryId),
      style_id: Number(styleId),
      formula_key: style.formula_key,
      inputs: buildInputs(),
      manual_value: manualValue === '' ? null : manualValue,
      manual_reason: manualReason,
      rate_source: rateValue.rate_source,
      custom_rate: rateValue.custom_rate,
      historical_rate_id: rateValue.historical_rate_id,
      discount_amount: extras.discount_amount,
      discount_percent: extras.discount_percent,
      labour_amount: extras.labour_amount,
      transport_amount: extras.transport_amount,
    }).then((res) => setResult(res.data)).catch((err) => setError(err.response?.data?.error || 'Calculation failed'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [style, height, width, paithaanCount, laarCount, roshandan, roshandanLaarCount, manualValue, rateValue, extras]);

  useEffect(() => { calculate(); }, [calculate]);

  const handleSave = () => {
    if (!result) return;
    setSaving(true);
    api.post('/measurements', {
      customer_id: customerId || null,
      category_id: Number(categoryId),
      style_id: Number(styleId),
      formula_key: style.formula_key,
      formula_version: style.formula_version,
      inputs: buildInputs(),
      manual_value: manualValue === '' ? null : manualValue,
      manual_reason: manualReason,
      rate_source: rateValue.rate_source,
      custom_rate: rateValue.custom_rate,
      historical_rate_id: rateValue.historical_rate_id,
      discount_amount: extras.discount_amount,
      discount_percent: extras.discount_percent,
      labour_amount: extras.labour_amount,
      transport_amount: extras.transport_amount,
    }).then((res) => setSavedId(res.data.id)).catch((err) => setError(err.response?.data?.error || 'Save failed'))
      .finally(() => setSaving(false));
  };

  const isWindow = style?.formula_key === 'chokat_window';

  return (
    <div className="max-w-4xl">
      <h1 className="text-xl font-bold mb-1">{category?.name || 'Chokat'} Calculator</h1>
      <p className="text-text-secondary text-sm mb-4">Enter dimensions — totals calculate live as you type.</p>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="card space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Style</label>
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
            <div className="grid grid-cols-2 gap-3">
              <FeetInchInput label="Height" value={height} onChange={setHeight} />
              <FeetInchInput label="Width" value={width} onChange={setWidth} />
            </div>

            {style?.formula_key !== 'chokat_bathroom' && style?.formula_key !== 'chokat_roshandan' && (
              <div>
                <label className="text-sm font-medium mb-1 block">Paithaan Count</label>
                <div className="flex gap-2 flex-wrap">
                  {[0, 1, 2, 3].map((n) => (
                    <button key={n} onClick={() => setPaithaanCount(n)}
                      className={`px-3 py-1.5 rounded-input border ${paithaanCount === n ? 'bg-brand text-white border-brand' : 'border-border'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isWindow && (
              <>
                <div>
                  <label className="text-sm font-medium mb-1 block">Laar Count</label>
                  <div className="flex gap-2 flex-wrap">
                    {[0, 1, 2, 3, 4].map((n) => (
                      <button key={n} onClick={() => setLaarCount(n)}
                        className={`px-3 py-1.5 rounded-input border ${laarCount === n ? 'bg-brand text-white border-brand' : 'border-border'}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={roshandan} onChange={(e) => setRoshandan(e.target.checked)} />
                  <span className="text-sm">Roshandan</span>
                </label>
                {roshandan && (
                  <div>
                    <label className="text-sm font-medium mb-1 block">Roshandan Laar Count</label>
                    <input type="number" className="input-field w-24" min="0" value={roshandanLaarCount}
                      onChange={(e) => setRoshandanLaarCount(Number(e.target.value))} />
                  </div>
                )}
              </>
            )}

            <div className="border-t border-border pt-3">
              <label className="text-sm font-medium mb-1 block">Manual Override (optional)</label>
              <div className="flex gap-2">
                <input type="number" className="input-field" placeholder="Override total (Running Ft)"
                  value={manualValue} onChange={(e) => setManualValue(e.target.value)} />
              </div>
              {manualValue !== '' && (
                <input type="text" className="input-field mt-2" placeholder="Reason for override"
                  value={manualReason} onChange={(e) => setManualReason(e.target.value)} />
              )}
            </div>
          </div>

          {activeRate !== undefined && (
            <RateSelector categoryId={categoryId} styleId={styleId} activeRate={activeRate} value={rateValue} onChange={setRateValue} />
          )}
        </div>

        <div className="space-y-4">
          {error && <div className="badge badge-danger">{error}</div>}
          {result && <BreakdownTable breakdown={result.calc_breakdown} total={result.final_value} unit={result.unit} />}
          <PriceSummary extras={extras} onExtrasChange={setExtras} result={result} />
          <div className="card">
            <ActionBar
              onSave={handleSave}
              saving={saving}
              onPdf={savedId ? () => alert('Generate/attach this measurement via a Quotation to get a PDF.') : undefined}
              onPrint={() => window.print()}
            />
            {savedId && <div className="text-success text-sm mt-2">Saved ✓ (Measurement #{savedId}). Add it to a Quotation from the Quotations page.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
