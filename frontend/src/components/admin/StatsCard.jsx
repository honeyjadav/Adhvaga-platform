import React from 'react';

export default function StatsCard({ icon: Icon, label, value, accent = 'lagoon' }) {
  const accentClasses = {
    lagoon: 'bg-lagoon-100 text-lagoon-700',
    sky: 'bg-sky-100 text-sky-700',
    amber: 'bg-amber-400/15 text-amber-600',
  };

  return (
    <div className="card flex items-center gap-4 p-5">
      <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${accentClasses[accent]}`}>
        <Icon size={20} />
      </span>
      <div>
        <p className="text-xs font-medium text-lagoon-400">{label}</p>
        <p className="font-display text-xl font-semibold text-lagoon-900">{value}</p>
      </div>
    </div>
  );
}
