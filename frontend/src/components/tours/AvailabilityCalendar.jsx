import React, { useMemo, useState } from 'react';
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
  startOfToday,
  addMonths,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// In a real app, unavailable dates would come from the API per tour.
// Here we mock it deterministically off the tour id so it looks consistent.
function isUnavailable(date, tourId) {
  const seed = tourId ? tourId.charCodeAt(tourId.length - 1) : 0;
  return (date.getDate() + seed) % 7 === 0;
}

export default function AvailabilityCalendar({ tourId, selectedDate, onSelectDate }) {
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const today = startOfToday();

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    return eachDayOfInterval({ start, end });
  }, [month]);

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

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-lagoon-400">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1">
        {days.map((day) => {
          const disabled = isBefore(day, today) || !isSameMonth(day, month) || isUnavailable(day, tourId);
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
    </div>
  );
}
