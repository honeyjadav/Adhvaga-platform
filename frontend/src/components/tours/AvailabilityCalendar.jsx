import React, { useEffect, useMemo, useState } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isBefore,
  isAfter,
  startOfToday,
  addMonths,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getTourAvailability } from '../../services/tours.js';

export default function AvailabilityCalendar({ tourId, selectedDate, onSelectDate }) {
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const today = startOfToday();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const from = startOfMonth(month);
    const to = endOfMonth(addMonths(month, 1)); // fetch a bit ahead so month-nav feels instant

    getTourAvailability(tourId, {
      from: from.toISOString(),
      to: to.toISOString(),
    })
      .then((data) => {
        if (!cancelled) setAvailability(data);
      })
      .catch(() => {
        if (!cancelled) setAvailability(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [tourId, month]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    return eachDayOfInterval({ start, end });
  }, [month]);

  const isDayUnavailable = (day) => {
    if (!availability) return true; // fail safe: block selection until we know real data

    if (availability.bookingType === 'fixed') {
      // For fixed tours, "available" means at least one departure lands on this exact day
      // with open slots. Departures are usually shown as a dropdown instead of a calendar,
      // but this keeps the calendar consistent if it's reused for fixed tours too.
      return !(availability.departures || []).some(
        (d) => isSameDay(new Date(d.date), day) && d.availableSlots > 0
      );
    }

    // Flexible tour
    if (availability.availableFrom && isBefore(day, new Date(availability.availableFrom))) return true;
    if (availability.availableUntil && isAfter(day, new Date(availability.availableUntil))) return true;

    const isBlackedOut = (availability.blackoutDates || []).some((d) => isSameDay(new Date(d), day));
    if (isBlackedOut) return true;

    const dayKey = format(day, 'yyyy-MM-dd');
    const bookedCount = availability.bookedByDate?.[dayKey] || 0;
    return bookedCount >= availability.dailyCapacity;
  };

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => setMonth((m) => subMonths(m, 1))}
          aria-label="Previous month"
          className="rounded-full p-1.5 text-lagoon-500 hover:bg-sand-100"
        >
          <ChevronLeft size={18} />
        </button>
        <p className="font-semibold text-lagoon-900">{format(month, 'MMMM yyyy')}</p>
        <button
          onClick={() => setMonth((m) => addMonths(m, 1))}
          aria-label="Next month"
          className="rounded-full p-1.5 text-lagoon-500 hover:bg-sand-100"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {loading ? (
        <div className="flex h-56 items-center justify-center text-sm text-lagoon-400">Checking availability...</div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-lagoon-400">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-1">
            {days.map((day) => {
              const disabled = isBefore(day, today) || !isSameMonth(day, month) || isDayUnavailable(day);
              const selected = selectedDate && isSameDay(day, selectedDate);
              return (
                <button
                  key={day.toISOString()}
                  disabled={disabled}
                  onClick={() => onSelectDate?.(day)}
                  className={`aspect-square rounded-lg text-xs font-medium transition ${
                    !isSameMonth(day, month)
                      ? 'text-transparent'
                      : disabled
                        ? 'cursor-not-allowed text-sand-300'
                        : selected
                          ? 'bg-lagoon-600 text-white'
                          : 'text-lagoon-700 hover:bg-lagoon-50'
                  }`}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center gap-4 text-xs text-lagoon-400">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-lagoon-600" /> Selected</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-sand-300" /> Unavailable</span>
          </div>
        </>
      )}
    </div>
  );
}