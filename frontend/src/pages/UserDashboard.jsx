import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, CalendarCheck, Heart, MapPin, Clock3 } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { useAuth } from '../hooks/useAuth.js';
import { getMyBookings } from '../services/bookings.js';
import { getTours } from '../services/tours.js';
import { formatCurrency, formatDate, STATUS_BADGE_STYLES, capitalize } from '../utils/formatters.js';

const TABS = [
  { key: 'bookings', label: 'My Bookings', icon: CalendarCheck },
  { key: 'wishlist', label: 'Wishlist', icon: Heart },
  { key: 'profile', label: 'Profile', icon: User },
];

export default function UserDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings');

  // ---- Bookings (real API, derives user from auth token server-side) ----
  const {
    data: bookings,
    isLoading,
    error,
    reload,
  } = useFetch(() => getMyBookings(), [user?.id]);

  // ---- Wishlist tours (real API: GET /tours?ids=id1,id2,...) ----
  const {
    data: wishlistTours,
    isLoading: wishlistLoading,
    error: wishlistError,
    reload: reloadWishlist,
  } = useFetch(
    () => (user?.wishlist?.length ? getTours({ ids: user.wishlist.join(',') }) : Promise.resolve([])),
    [user?.wishlist]
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-lagoon-100 text-xl font-semibold text-lagoon-700">
          {user?.name?.charAt(0) || 'U'}
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold text-lagoon-900">{user?.name}</h1>
          <p className="text-sm text-lagoon-500">{user?.email}</p>
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="card h-fit w-full space-y-1 p-3 lg:w-56">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                activeTab === key ? 'bg-lagoon-600 text-white' : 'text-lagoon-600 hover:bg-sand-100'
              }`}
            >
              <Icon size={17} /> {label}
            </button>
          ))}
        </aside>

        <div className="flex-1">
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              {isLoading && <LoadingSpinner fullPage label="Loading your bookings..." />}
              {error && <ErrorState message={error} onRetry={reload} />}

              {!isLoading && !error && bookings && bookings.length === 0 && (
                <div className="card p-10 text-center">
                  <p className="font-semibold text-lagoon-900">No bookings yet</p>
                  <p className="mt-1 text-sm text-lagoon-500">Start exploring tours to plan your next trip.</p>
                  <Link to="/tours" className="btn-primary mt-4 inline-flex">Explore Tours</Link>
                </div>
              )}

              {bookings?.map((booking) => (
                <div
                  key={booking.id}
                  className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-lagoon-900">{booking.tourTitle}</p>
                    <p className="mt-1 text-xs text-lagoon-500">
                      Booking ID: {booking.id} · {booking.travelers} traveler{booking.travelers > 1 ? 's' : ''} ·{' '}
                      {formatDate(booking.startDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-display text-lg font-semibold text-lagoon-800">
                      {formatCurrency(booking.totalPrice)}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE_STYLES[booking.status]}`}
                    >
                      {capitalize(booking.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="space-y-4">
              {wishlistLoading && <LoadingSpinner fullPage label="Loading your wishlist..." />}
              {wishlistError && <ErrorState message={wishlistError} onRetry={reloadWishlist} />}

              {!wishlistLoading && !wishlistError && (wishlistTours || []).length === 0 && (
                <div className="card p-10 text-center">
                  <p className="font-semibold text-lagoon-900">Your wishlist is empty</p>
                  <p className="mt-1 text-sm text-lagoon-500">Tap the heart icon on any tour to save it here.</p>
                  <Link to="/tours" className="btn-primary mt-4 inline-flex">Browse Tours</Link>
                </div>
              )}

              {!wishlistLoading &&
                !wishlistError &&
                (wishlistTours || []).map((tour) => (
                  <Link
                    key={tour.id}
                    to={`/tours/${tour.id}`}
                    className="card flex items-center gap-4 p-4 transition hover:shadow-soft"
                  >
                    <img src={tour.heroImage} alt={tour.title} className="h-16 w-20 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="font-semibold text-lagoon-900">{tour.title}</p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-lagoon-500">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} /> {tour.destination}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock3 size={12} /> {tour.duration}d
                        </span>
                      </div>
                    </div>
                    <span className="font-display font-semibold text-lagoon-800">{formatCurrency(tour.price)}</span>
                  </Link>
                ))}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="card space-y-5 p-6">
              <h3 className="font-display text-lg font-semibold text-lagoon-900">Profile Information</h3>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-lagoon-700">Full name</label>
                  <input className="input-field" defaultValue={user?.name} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-lagoon-700">Email</label>
                  <input className="input-field" defaultValue={user?.email} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-lagoon-700">Account type</label>
                  <input className="input-field capitalize" value={user?.role} disabled />
                </div>
              </div>
              <button type="button" className="btn-primary">Save Changes</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}