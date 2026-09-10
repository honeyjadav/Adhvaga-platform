import React, { useState } from 'react';
import {
  IndianRupee,
  CalendarCheck,
  Map,
  Users,
  Plus,
  Pencil,
  Trash2,
  Search,
} from 'lucide-react';
import AdminSidebar from '../components/admin/AdminSidebar.jsx';
import StatsCard from '../components/admin/StatsCard.jsx';
import TourFormModal from '../components/admin/TourFormModal.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import Modal from '../components/common/Modal.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { useToast } from '../context/ToastContext.jsx';
import * as toursService from '../services/tours.js';
import * as bookingsService from '../services/bookings.js';
import { getDashboardStats } from '../services/admin.js';
import { formatCurrency, formatDate, STATUS_BADGE_STYLES, capitalize } from '../utils/formatters.js';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="section-label">Admin</p>
        <h1 className="mt-1 font-display text-3xl font-semibold">Adhvaga Control Center</h1>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <AdminSidebar activeTab={activeTab} onSelectTab={setActiveTab} />
        <div className="flex-1">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'tours' && <ToursTab />}
          {activeTab === 'bookings' && <BookingsTab />}
        </div>
      </div>
    </div>
  );
}

function OverviewTab() {
  const { data: stats, isLoading, error, reload } = useFetch(() => getDashboardStats(), []);

  if (isLoading) return <LoadingSpinner fullPage label="Loading dashboard stats..." />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!stats) return null;

  const maxRevenue = Math.max(...stats.monthlyRevenue.map((x) => x.revenue), 1); // avoid /0

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard icon={IndianRupee} label="Total Revenue" value={formatCurrency(stats.totalRevenue)} accent="lagoon" />
        <StatsCard icon={CalendarCheck} label="Total Bookings" value={stats.totalBookings} accent="sky" />
        <StatsCard icon={Map} label="Active Tours" value={stats.totalTours} accent="amber" />
        <StatsCard icon={Users} label="Registered Users" value={stats.totalUsers} accent="lagoon" />
      </div>

      <div className="card p-6">
        <h3 className="mb-5 font-display text-lg font-semibold text-lagoon-900">Revenue, last 6 months</h3>
        <div className="flex h-48 items-end gap-4">
          {stats.monthlyRevenue.map((m) => {
            const heightPct = (m.revenue / maxRevenue) * 100;
            return (
              <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-40 w-full items-end">
                  <div
                    className="w-full rounded-t-lg bg-lagoon-500 transition hover:bg-lagoon-600"
                    style={{ height: `${heightPct}%` }}
                    title={formatCurrency(m.revenue)}
                  />
                </div>
                <span className="text-xs font-medium text-lagoon-500">{m.month}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ToursTab() {
  const { data: tours, isLoading, error, reload, setData } = useFetch(() => toursService.getTours(), []);
  const { success, error: toastError } = useToast();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTour, setEditingTour] = useState(null);
  const [deletingTour, setDeletingTour] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const filtered = (tours || []).filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => {
    setEditingTour(null);
    setModalOpen(true);
  };
  const openEdit = (tour) => {
    setEditingTour(tour);
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      if (editingTour) {
        const updated = await toursService.updateTour(editingTour.id, values);
        setData((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        success('Tour package updated.');
      } else {
        const created = await toursService.createTour(values);
        setData((prev) => [created, ...prev]);
        success('Tour package added.');
      }
      setModalOpen(false);
    } catch (err) {
      toastError(err.message || 'Could not save the tour.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTour) return;
    try {
      await toursService.deleteTour(deletingTour.id);
      setData((prev) => prev.filter((t) => t.id !== deletingTour.id));
      success('Tour package deleted.');
    } catch (err) {
      toastError(err.message || 'Could not delete the tour.');
    } finally {
      setDeletingTour(null);
    }
  };

  // Renders capacity info differently depending on how the tour is booked.
  const renderCapacity = (tour) => {
    if (tour.bookingType === 'flexible') {
      return `${tour.dailyCapacity}/day`;
    }
    const totalSlots = (tour.departures || []).reduce((sum, d) => sum + (d.availableSlots || 0), 0);
    const totalMax = (tour.departures || []).reduce((sum, d) => sum + (d.maxTravelers || 0), 0);
    return `${totalSlots}/${totalMax}`;
  };

  if (isLoading) return <LoadingSpinner fullPage label="Loading tour packages..." />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lagoon-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tours..."
            className="input-field pl-10"
          />
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} /> Add Tour
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-sand-200 text-xs font-semibold uppercase tracking-wide text-lagoon-400">
              <th className="px-5 py-3">Tour</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Price</th>
              <th className="px-5 py-3">Booking Type</th>
              <th className="px-5 py-3">Capacity</th>
              <th className="px-5 py-3">Rating</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((tour) => (
              <tr key={tour.id} className="border-b border-sand-100 last:border-0">
                <td className="flex items-center gap-3 px-5 py-3">
                  <img src={tour.heroImage} alt={tour.title} className="h-10 w-14 rounded-lg object-cover" />
                  <span className="font-medium text-lagoon-900">{tour.title}</span>
                </td>
                <td className="px-5 py-3 text-lagoon-600">{tour.category}</td>
                <td className="px-5 py-3 text-lagoon-600">{formatCurrency(tour.price)}</td>
                <td className="px-5 py-3 text-lagoon-600">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    tour.bookingType === 'flexible' ? 'bg-sky-100 text-sky-700' : 'bg-lagoon-100 text-lagoon-700'
                  }`}>
                    {tour.bookingType === 'flexible' ? 'Any day' : 'Fixed dates'}
                  </span>
                </td>
                <td className="px-5 py-3 text-lagoon-600">{renderCapacity(tour)}</td>
                <td className="px-5 py-3 text-lagoon-600">{tour.rating || '—'}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(tour)} className="rounded-lg p-2 text-lagoon-500 hover:bg-lagoon-50" aria-label="Edit tour">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => setDeletingTour(tour)} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50" aria-label="Delete tour">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-lagoon-400">No tours match your search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <TourFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialTour={editingTour}
        submitting={submitting}
      />

      <Modal isOpen={!!deletingTour} onClose={() => setDeletingTour(null)} title="Delete tour package?" maxWidth="max-w-sm">
        <p className="text-sm text-lagoon-600">
          This will permanently remove <strong>{deletingTour?.title}</strong>. This action cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={() => setDeletingTour(null)} className="btn-secondary">Cancel</button>
          <button onClick={handleDelete} className="rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white hover:bg-rose-700">
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}

function BookingsTab() {
  const { data: bookings, isLoading, error, reload, setData } = useFetch(() => bookingsService.getAllBookings(), []);
  const { success, error: toastError } = useToast();

  const handleStatusChange = async (id, status) => {
    try {
      const updated = await bookingsService.updateBookingStatus(id, status);
      setData((prev) => prev.map((b) => (b.id === id ? updated : b)));
      success(`Booking marked as ${status}.`);
    } catch (err) {
      toastError(err.message || 'Could not update booking status.');
    }
  };

  if (isLoading) return <LoadingSpinner fullPage label="Loading bookings..." />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-sand-200 text-xs font-semibold uppercase tracking-wide text-lagoon-400">
            <th className="px-5 py-3">Booking ID</th>
            <th className="px-5 py-3">Tour</th>
            <th className="px-5 py-3">Travelers</th>
            <th className="px-5 py-3">Start Date</th>
            <th className="px-5 py-3">Amount</th>
            <th className="px-5 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings?.map((booking) => (
            <tr key={booking.id} className="border-b border-sand-100 last:border-0">
              <td className="px-5 py-3 font-medium text-lagoon-900">{booking.id}</td>
              <td className="px-5 py-3 text-lagoon-600">{booking.tourTitle}</td>
              <td className="px-5 py-3 text-lagoon-600">{booking.travelers}</td>
              <td className="px-5 py-3 text-lagoon-600">{formatDate(booking.startDate)}</td>
              <td className="px-5 py-3 text-lagoon-600">{formatCurrency(booking.totalPrice)}</td>
              <td className="px-5 py-3">
                <select
                  value={booking.status}
                  onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                  className={`rounded-full border-none px-3 py-1.5 text-xs font-semibold ${STATUS_BADGE_STYLES[booking.status]}`}
                >
                  {['pending', 'confirmed', 'cancelled'].map((s) => (
                    <option key={s} value={s}>{capitalize(s)}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
