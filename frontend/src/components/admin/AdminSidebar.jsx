import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, Map, CalendarCheck, ArrowLeftCircle } from 'lucide-react';

const TABS = [
  { key: 'overview', label: 'Overview', icon: LayoutGrid },
  { key: 'tours', label: 'Manage Tours', icon: Map },
  { key: 'bookings', label: 'Bookings', icon: CalendarCheck },
];

export default function AdminSidebar({ activeTab, onSelectTab }) {
  return (
    <aside className="card sticky top-24 h-fit w-full shrink-0 space-y-1 p-3 lg:w-56">
      {TABS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onSelectTab(key)}
          className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
            activeTab === key
              ? 'bg-lagoon-600 text-white'
              : 'text-lagoon-600 hover:bg-sand-100'
          }`}
        >
          <Icon size={17} /> {label}
        </button>
      ))}
      <NavLink
        to="/"
        className="mt-3 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-lagoon-400 hover:bg-sand-100"
      >
        <ArrowLeftCircle size={17} /> Back to site
      </NavLink>
    </aside>
  );
}
