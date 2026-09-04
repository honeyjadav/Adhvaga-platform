import React from 'react';

export default function ItineraryList({ itinerary = [] }) {
  if (!itinerary.length) {
    return <p className="text-sm text-lagoon-400">Itinerary details will be shared closer to departure.</p>;
  }

  return (
    <ol className="relative space-y-6 border-l border-sand-200 pl-6">
      {itinerary.map((item) => (
        <li key={item.day} className="relative">
          <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full bg-lagoon-600 text-[11px] font-bold text-white">
            {item.day}
          </span>
          <h4 className="font-semibold text-lagoon-900">{item.title}</h4>
          <p className="mt-1 text-sm text-lagoon-500">{item.description}</p>
        </li>
      ))}
    </ol>
  );
}
