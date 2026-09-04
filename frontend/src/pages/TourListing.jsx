import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import FilterSidebar from '../components/tours/FilterSidebar.jsx';
import TourCard from '../components/tours/TourCard.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { getTours } from '../services/tours.js';

const SORT_OPTIONS = [
  { value: '', label: 'Most relevant' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating_desc', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest' },
];

export default function TourListing() {
  const [searchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: undefined,
    maxPrice: undefined,
    minDuration: undefined,
    maxDuration: undefined,
    minRating: undefined,
    sortBy: '',
  });

  const fetchKey = useMemo(() => JSON.stringify(filters), [filters]);
  const { data: tours, isLoading, error, reload } = useFetch(() => getTours(filters), [fetchKey]);

  const resetFilters = () =>
    setFilters({
      search: '',
      category: '',
      minPrice: undefined,
      maxPrice: undefined,
      minDuration: undefined,
      maxDuration: undefined,
      minRating: undefined,
      sortBy: '',
    });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="section-label">Explore</p>
        <h1 className="mt-1 font-display text-3xl font-semibold">Tour Packages</h1>
        <p className="mt-2 text-sm text-lagoon-500">
          {filters.search ? `Showing results for "${filters.search}"` : 'Browse every trip currently open for booking.'}
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <FilterSidebar filters={filters} onChange={setFilters} onReset={resetFilters} />
        </div>

        {/* Mobile filter toggle */}
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="btn-secondary w-fit lg:hidden"
        >
          <SlidersHorizontal size={16} /> Filters
        </button>

        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 flex bg-lagoon-900/50 backdrop-blur-sm lg:hidden">
            <div className="ml-auto h-full w-80 max-w-full overflow-y-auto bg-sand-50 p-4">
              <div className="mb-3 flex justify-end">
                <button onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters">
                  <X size={22} className="text-lagoon-600" />
                </button>
              </div>
              <FilterSidebar filters={filters} onChange={setFilters} onReset={resetFilters} />
            </div>
          </div>
        )}

        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-lagoon-500">
              {tours ? `${tours.length} tour${tours.length !== 1 ? 's' : ''} found` : ''}
            </p>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters((f) => ({ ...f, sortBy: e.target.value }))}
              className="input-field w-auto !py-2 text-sm"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {isLoading && <LoadingSpinner fullPage label="Finding tours..." />}
          {error && <ErrorState message={error} onRetry={reload} />}

          {tours && tours.length === 0 && (
            <div className="card p-10 text-center">
              <p className="font-semibold text-lagoon-900">No tours match your filters</p>
              <p className="mt-1 text-sm text-lagoon-500">Try adjusting the price range or category.</p>
              <button onClick={resetFilters} className="btn-secondary mt-4">Reset Filters</button>
            </div>
          )}

          {tours && tours.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {tours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
