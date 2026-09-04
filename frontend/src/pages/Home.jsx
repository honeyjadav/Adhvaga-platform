import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, CalendarDays, Quote, ShieldCheck, Sparkles, Wallet } from 'lucide-react';
import TourCard from '../components/tours/TourCard.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { getFeaturedTours } from '../services/tours.js';
import { TESTIMONIALS } from '../data/mockData.js';

const HIGHLIGHTS = [
  { icon: ShieldCheck, title: 'Verified operators', desc: 'Every tour is vetted for safety and quality before it\u2019s listed.' },
  { icon: Wallet, title: 'Transparent pricing', desc: 'No hidden fees — the price you see includes taxes.' },
  { icon: Sparkles, title: 'Curated experiences', desc: 'Itineraries designed by travelers who\u2019ve done the trip.' },
];

export default function Home() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const { data: featuredTours, isLoading, error, reload } = useFetch(getFeaturedTours, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination) params.set('search', destination);
    if (date) params.set('date', date);
    navigate(`/tours?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-lagoon-900">
        <img
          src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1800&auto=format&fit=crop"
          alt="Mountain valley at sunrise"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-lagoon-900 via-lagoon-900/70 to-lagoon-900/30" />
        <div className="relative mx-auto max-w-5xl px-4 py-24 text-center sm:px-6 sm:py-32 lg:px-8">
          <p className="section-label text-sand-200/80">Adhvaga Tours</p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
            Plan less. Wander more.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-sand-100/90 sm:text-lg">
            Handpicked tours across India's mountains, coastlines, and cities — booked in minutes, remembered for years.
          </p>

          <form
            onSubmit={handleSearch}
            className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 rounded-2xl bg-white p-3 shadow-soft sm:flex-row sm:items-center"
          >
            <div className="flex flex-1 items-center gap-2 px-3 py-2">
              <MapPin size={18} className="shrink-0 text-lagoon-400" />
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Where do you want to go?"
                className="w-full border-none bg-transparent text-sm text-lagoon-900 placeholder:text-lagoon-400 focus:outline-none"
              />
            </div>
            <div className="hidden h-8 w-px bg-sand-200 sm:block" />
            <div className="flex flex-1 items-center gap-2 px-3 py-2">
              <CalendarDays size={18} className="shrink-0 text-lagoon-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border-none bg-transparent text-sm text-lagoon-900 focus:outline-none"
              />
            </div>
            <button type="submit" className="btn-primary shrink-0">
              <Search size={16} /> Search Tours
            </button>
          </form>
        </div>
      </section>

      {/* Highlights */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {HIGHLIGHTS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-lagoon-100 text-lagoon-700">
                <Icon size={20} />
              </span>
              <h3 className="mt-4 font-semibold text-lagoon-900">{title}</h3>
              <p className="mt-1.5 text-sm text-lagoon-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured tours */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="section-label">Handpicked for you</p>
            <h2 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">Featured Tour Packages</h2>
          </div>
          <button onClick={() => navigate('/tours')} className="hidden text-sm font-semibold text-lagoon-600 hover:text-lagoon-800 sm:block">
            View all tours →
          </button>
        </div>

        {isLoading && <LoadingSpinner fullPage label="Loading featured tours..." />}
        {error && <ErrorState message={error} onRetry={reload} />}
        {featuredTours && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        )}
      </section>

      {/* Testimonials */}
      <section className="bg-sky-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="section-label">Traveler stories</p>
            <h2 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">What our travelers say</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.id} className="card p-6">
                <Quote className="text-lagoon-200" size={28} />
                <p className="mt-3 text-sm leading-relaxed text-lagoon-600">{t.quote}</p>
                <p className="mt-4 text-sm font-semibold text-lagoon-900">{t.name}</p>
                <p className="text-xs text-lagoon-400">{t.location}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
