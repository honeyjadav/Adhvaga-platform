import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Clock3 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export default function TourCard({ tour }) {
  return (
    <Link
      to={`/tours/${tour.id}`}
      className="card group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-soft"
    >
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={tour.heroImage}
          alt={tour.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-lagoon-700 shadow-card">
          {tour.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold leading-snug text-lagoon-900">{tour.title}</h3>
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-amber-400/15 px-2 py-1 text-xs font-semibold text-amber-600">
            <Star size={13} fill="currentColor" strokeWidth={0} /> {tour.rating}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-lagoon-500">
          <span className="flex items-center gap-1"><MapPin size={14} /> {tour.destination}</span>
          <span className="flex items-center gap-1"><Clock3 size={14} /> {tour.duration}d</span>
        </div>

        <p className="line-clamp-2 text-sm text-lagoon-500/90">{tour.summary}</p>

        <div className="mt-auto flex items-center justify-between pt-2">
          <div>
            <span className="text-xs text-lagoon-400">from</span>
            <p className="font-display text-xl font-semibold text-lagoon-800">{formatCurrency(tour.price)}</p>
          </div>
          <span className="rounded-full bg-lagoon-50 px-4 py-2 text-sm font-semibold text-lagoon-700 transition group-hover:bg-lagoon-600 group-hover:text-white">
            View Details
          </span>
        </div>
      </div>
    </Link>
  );
}
