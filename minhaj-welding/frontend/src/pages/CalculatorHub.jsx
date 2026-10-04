import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import IconImg from '../components/IconImg';

const TILES = [
  { match: 'Chokat - Door', label: 'Door Chokat', icon: 'pos', route: (id) => `/calculators/chokat/${id}` },
  { match: 'Chokat - Window', label: 'Window Chokat', icon: 'pos', route: (id) => `/calculators/chokat/${id}` },
  { match: 'Chokat - Bathroom', label: 'Bathroom Chokat', icon: 'pos', route: (id) => `/calculators/chokat/${id}` },
  { match: 'Chokat - Roshandan', label: 'Roshandan Chokat', icon: 'pos', route: (id) => `/calculators/chokat/${id}` },
];

export default function CalculatorHub() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/catalog/categories').then((res) => setCategories(res.data));
  }, []);

  const findCatId = (name) => categories.find((c) => c.name === name)?.id;

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Calculators</h1>
      <p className="text-text-secondary text-sm mb-4">Select what you want to measure and price.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {TILES.map((tile) => {
          const catId = findCatId(tile.match);
          return (
            <button
              key={tile.match}
              disabled={!catId}
              onClick={() => navigate(tile.route(catId))}
              className="card flex flex-col items-center gap-2 py-6 hover:border-brand transition-colors disabled:opacity-40"
            >
              <IconImg name={tile.icon} size={36} />
              <span className="font-medium text-sm text-center">{tile.label}</span>
            </button>
          );
        })}

        <button onClick={() => navigate('/calculators/gate')} className="card flex flex-col items-center gap-2 py-6 hover:border-brand transition-colors">
          <IconImg name="pos" size={36} />
          <span className="font-medium text-sm">Gate (Sq Ft)</span>
        </button>
        <button onClick={() => navigate('/calculators/railing')} className="card flex flex-col items-center gap-2 py-6 hover:border-brand transition-colors">
          <IconImg name="pos" size={36} />
          <span className="font-medium text-sm">Railing</span>
        </button>
        <button onClick={() => navigate('/calculators/fiber')} className="card flex flex-col items-center gap-2 py-6 hover:border-brand transition-colors">
          <IconImg name="pos" size={36} />
          <span className="font-medium text-sm">Fiber Sheet</span>
        </button>
      </div>

      <div className="card mt-6 text-sm text-text-secondary">
        More calculators (Aluminium, Construction BOQ, Machinery Rental) are added in the next phase —
        see <code>brain.md</code> for the current build status.
      </div>
    </div>
  );
}
