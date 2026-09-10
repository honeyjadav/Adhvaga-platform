import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock3, Star, Users, CheckCircle2 } from 'lucide-react';
import ImageGallery from '../components/tours/ImageGallery.jsx';
import ItineraryList from '../components/tours/ItineraryList.jsx';
import AvailabilityCalendar from '../components/tours/AvailabilityCalendar.jsx';
import ReviewForm from '../components/reviews/ReviewForm.jsx';
import ReviewList from '../components/reviews/ReviewList.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { getTourById, getTourAvailability } from '../services/tours.js';
import { getReviewsByTour } from '../services/reviews.js';
import { formatCurrency } from '../utils/formatters.js';

export default function TourDetail() {
  const { id } = useParams();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDeparture, setSelectedDeparture] = useState(null);
  const [capacityNote, setCapacityNote] = useState(null); // e.g. "6 spots left" or null while unknown
  const { data: tour, isLoading, error, reload } = useFetch(() => getTourById(id), [id]);
  const {
    data: reviews,
    isLoading: reviewsLoading,
    setData: setReviews,
  } = useFetch(() => getReviewsByTour(id), [id]);

  const isFlexible = tour?.bookingType === 'flexible';

  // For flexible tours, once a date is picked, check real remaining capacity for that day.
  useEffect(() => {
    if (!tour || !isFlexible || !selectedDate) {
      setCapacityNote(null);
      return;
    }
    let cancelled = false;
    const dayStr = selectedDate.toISOString().slice(0, 10);

    getTourAvailability(tour.id, { from: dayStr, to: dayStr })
      .then((data) => {
        if (cancelled) return;
        const booked = data.bookedByDate?.[dayStr] || 0;
        const remaining = (data.dailyCapacity || 0) - booked;
        setCapacityNote(remaining > 0 ? remaining : 0);
      })
      .catch(() => {
        if (!cancelled) setCapacityNote(null);
      });

    return () => { cancelled = true; };
  }, [tour, isFlexible, selectedDate]);

  if (isLoading) return <LoadingSpinner fullPage label="Loading tour details..." />;
  if (error) return <div className="mx-auto max-w-3xl px-4 py-16"><ErrorState message={error} onRetry={reload} /></div>;
  if (!tour) return null;

  const handleReviewAdded = (review) => setReviews((prev) => [review, ...(prev || [])]);

  const totalFixedSlots = (tour.departures || []).reduce((sum, d) => sum + (d.availableSlots || 0), 0);
  const totalFixedMax = (tour.departures || []).reduce((sum, d) => sum + (d.maxTravelers || 0), 0);

  const canBook = isFlexible
    ? Boolean(selectedDate) && (capacityNote === null || capacityNote > 0)
    : Boolean(selectedDeparture) && selectedDeparture.availableSlots > 0;

  const bookingHref = () => {
    const params = new URLSearchParams();
    if (isFlexible && selectedDate) {
      params.set('date', selectedDate.toISOString().slice(0, 10));
    }
    if (!isFlexible && selectedDeparture) {
      params.set('departureId', selectedDeparture._id || selectedDeparture.id);
    }
    const qs = params.toString();
    return `/booking/${tour.id}${qs ? `?${qs}` : ''}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-5 text-xs text-lagoon-400">
        <Link to="/tours" className="hover:text-lagoon-600">Tours</Link> / <span className="text-lagoon-600">{tour.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <ImageGallery images={tour.gallery} title={tour.title} />

          <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="rounded-full bg-lagoon-100 px-3 py-1 text-xs font-semibold text-lagoon-700">
                  {tour.category}
                </span>
                <h1 className="mt-3 font-display text-3xl font-semibold text-lagoon-900">{tour.title}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-lagoon-500">
                  <span className="flex items-center gap-1"><MapPin size={15} /> {tour.destination}</span>
                  <span className="flex items-center gap-1"><Clock3 size={15} /> {tour.duration} days</span>
                  <span className="flex items-center gap-1">
                    <Users size={15} /> {isFlexible ? `Max ${tour.dailyCapacity}/day` : `Max ${totalFixedMax}`}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-amber-600">
                    <Star size={15} fill="currentColor" strokeWidth={0} /> {tour.rating} ({tour.reviewCount} reviews)
                  </span>
                </div>
              </div>
            </div>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-lagoon-600">{tour.summary}</p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-lagoon-900">Itinerary</h2>
            <div className="mt-5"><ItineraryList itinerary={tour.itinerary} /></div>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-lagoon-900">Availability</h2>

            {isFlexible ? (
              <>
                <p className="mt-1 text-sm text-lagoon-500">Pick a date to check availability before booking.</p>
                <div className="mt-5 max-w-sm">
                  <AvailabilityCalendar tourId={tour.id} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
                </div>
              </>
            ) : (
              <>
                <p className="mt-1 text-sm text-lagoon-500">Choose one of the scheduled group departures.</p>
                <div className="mt-5 max-w-sm space-y-2">
                  {(tour.departures || []).map((d) => {
                    const id = d._id || d.id;
                    const soldOut = d.availableSlots === 0;
                    const selected = selectedDeparture && (selectedDeparture._id || selectedDeparture.id) === id;
                    return (
                      <button
                        key={id}
                        disabled={soldOut}
                        onClick={() => setSelectedDeparture(d)}
                        className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm transition ${
                          soldOut
                            ? 'cursor-not-allowed border-sand-200 text-sand-300'
                            : selected
                              ? 'border-lagoon-600 bg-lagoon-50 text-lagoon-800'
                              : 'border-sand-200 text-lagoon-700 hover:border-lagoon-300'
                        }`}
                      >
                        <span>{new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span className="font-semibold">{soldOut ? 'Sold out' : `${d.availableSlots} left`}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-lagoon-900">Reviews</h2>
            <div className="mt-5 space-y-5">
              <ReviewForm tourId={tour.id} onReviewAdded={handleReviewAdded} />
              {reviewsLoading ? <LoadingSpinner label="Loading reviews..." /> : <ReviewList reviews={reviews || []} />}
            </div>
          </div>
        </div>

        {/* Booking CTA card */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24 space-y-5 p-6">
            <div>
              <span className="text-xs text-lagoon-400">Starting from</span>
              <p className="font-display text-3xl font-semibold text-lagoon-900">{formatCurrency(tour.price)}</p>
              <span className="text-xs text-lagoon-400">per traveler</span>
            </div>

            <ul className="space-y-2 text-sm text-lagoon-600">
              <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-lagoon-500" /> Free cancellation up to 7 days before</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-lagoon-500" /> All permits & entry fees included</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-lagoon-500" /> Verified local guides</li>
            </ul>

            <div className="rounded-xl bg-sand-100 px-4 py-3 text-sm text-lagoon-600">
              {isFlexible ? (
                selectedDate ? (
                  capacityNote === null ? (
                    <span>Checking availability...</span>
                  ) : capacityNote > 0 ? (
                    <span><strong className="text-lagoon-800">{capacityNote} spots</strong> left on this date</span>
                  ) : (
                    <span className="text-rose-600">Fully booked on this date — try another day</span>
                  )
                ) : (
                  <span>Select a date to see availability</span>
                )
              ) : totalFixedSlots > 0 ? (
                <span><strong className="text-lagoon-800">{totalFixedSlots} slots</strong> left across upcoming departures</span>
              ) : (
                <span className="text-rose-600">Fully booked — join the waitlist</span>
              )}
            </div>

            {canBook ? (
              <Link to={bookingHref()} className="btn-primary w-full">
                Book Now
              </Link>
            ) : (
              <button disabled className="btn-primary w-full cursor-not-allowed opacity-50">
                {isFlexible ? 'Select a date to continue' : 'Select a departure to continue'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}