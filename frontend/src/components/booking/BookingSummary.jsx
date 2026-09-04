import React from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { MapPin, Clock3, Users, CalendarDays } from 'lucide-react';

export default function BookingSummary({ tour, travelers, startDate, showBreakdown = true }) {
  if (!tour) return null;
  const subtotal = tour.price * travelers;
  const taxes = Math.round(subtotal * 0.05);
  const total = subtotal + taxes;

  return (
    <div className="card sticky top-24 space-y-5 p-5">
      <div className="flex gap-3">
        <img src={tour.heroImage} alt={tour.title} className="h-20 w-20 shrink-0 rounded-xl object-cover" />
        <div>
          <h4 className="font-display font-semibold leading-snug text-lagoon-900">{tour.title}</h4>
          <p className="mt-1 flex items-center gap-1 text-xs text-lagoon-500">
            <MapPin size={12} /> {tour.destination}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-lagoon-500">
            <Clock3 size={12} /> {tour.duration} days
          </p>
        </div>
      </div>

      <div className="space-y-2 border-t border-sand-200 pt-4 text-sm text-lagoon-600">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5"><Users size={14} /> Travelers</span>
          <span className="font-medium">{travelers}</span>
        </div>
        {startDate && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5"><CalendarDays size={14} /> Start date</span>
            <span className="font-medium">{formatDate(startDate)}</span>
          </div>
        )}
      </div>

      {showBreakdown && (
        <div className="space-y-2 border-t border-sand-200 pt-4 text-sm">
          <div className="flex justify-between text-lagoon-500">
            <span>{formatCurrency(tour.price)} × {travelers} traveler{travelers > 1 ? 's' : ''}</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-lagoon-500">
            <span>Taxes & fees (5%)</span>
            <span>{formatCurrency(taxes)}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-sand-200 pt-4">
        <span className="font-semibold text-lagoon-900">Total</span>
        <span className="font-display text-xl font-semibold text-lagoon-800">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
