import React from 'react';
import { Star, RotateCcw } from 'lucide-react';
import { CATEGORIES } from '../../data/mockData.js';

const DURATIONS = [
  { label: 'Any duration', min: undefined, max: undefined },
  { label: '1–3 days', min: 1, max: 3 },
  { label: '4–6 days', min: 4, max: 6 },
  { label: '7+ days', min: 7, max: undefined },
];

export default function FilterSidebar({ filters, onChange, onReset }) {
  const update = (patch) => onChange({ ...filters, ...patch });

  return (
    <aside className="card h-fit w-full shrink-0 space-y-7 p-5 lg:w-64">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-lagoon-900">Filters</h3>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs font-semibold text-lagoon-400 hover:text-lagoon-600"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      <div>
        <p className="section-label mb-3">Category</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => update({ category: '' })}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              !filters.category
                ? 'border-lagoon-600 bg-lagoon-600 text-white'
                : 'border-sand-200 text-lagoon-600 hover:border-lagoon-300'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => update({ category: cat })}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                filters.category === cat
                  ? 'border-lagoon-600 bg-lagoon-600 text-white'
                  : 'border-sand-200 text-lagoon-600 hover:border-lagoon-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="section-label mb-3">Price range</p>
        <div className="flex items-center gap-3">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice ?? ''}
            onChange={(e) => update({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
            className="input-field !py-2"
          />
          <span className="text-lagoon-300">–</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice ?? ''}
            onChange={(e) => update({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
            className="input-field !py-2"
          />
        </div>
      </div>

      <div>
        <p className="section-label mb-3">Duration</p>
        <div className="space-y-2">
          {DURATIONS.map((d) => (
            <label key={d.label} className="flex cursor-pointer items-center gap-2 text-sm text-lagoon-600">
              <input
                type="radio"
                name="duration"
                className="h-4 w-4 accent-lagoon-600"
                checked={filters.minDuration === d.min && filters.maxDuration === d.max}
                onChange={() => update({ minDuration: d.min, maxDuration: d.max })}
              />
              {d.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="section-label mb-3">Minimum rating</p>
        <div className="flex flex-col gap-2">
          {[4.5, 4, 3.5, 0].map((r) => (
            <label key={r} className="flex cursor-pointer items-center gap-2 text-sm text-lagoon-600">
              <input
                type="radio"
                name="rating"
                className="h-4 w-4 accent-lagoon-600"
                checked={(filters.minRating ?? 0) === r}
                onChange={() => update({ minRating: r || undefined })}
              />
              {r > 0 ? (
                <span className="flex items-center gap-1">
                  <Star size={13} className="text-amber-500" fill="currentColor" /> {r}+
                </span>
              ) : (
                'Any rating'
              )}
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
