import React, { useState } from 'react';
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
import { getTourById } from '../services/tours.js';
import { getReviewsByTour } from '../services/reviews.js';
import { formatCurrency } from '../utils/formatters.js';

export default function TourDetail() {
  const { id } = useParams();
  const [selectedDate, setSelectedDate] = useState(null);
  const { data: tour, isLoading, error, reload } = useFetch(() => getTourById(id), [id]);
  const {
    data: reviews,
    isLoading: reviewsLoading,
    setData: setReviews,
  } = useFetch(() => getReviewsByTour(id), [id]);

  if (isLoading) return <LoadingSpinner fullPage label="Loading tour details..." />;
  if (error) return <div className="mx-auto max-w-3xl px-4 py-16"><ErrorState message={error} onRetry={reload} /></div>;
  if (!tour) return null;

  const handleReviewAdded = (review) => setReviews((prev) => [review, ...(prev || [])]);

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
                  <span className="flex items-center gap-1"><Users size={15} /> Max {tour.maxTravelers}</span>
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
            <p className="mt-1 text-sm text-lagoon-500">Pick a start date to check availability before booking.</p>
            <div className="mt-5 max-w-sm">
              <AvailabilityCalendar tourId={tour.id} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
            </div>
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
              {tour.availableSlots > 0 ? (
                <span><strong className="text-lagoon-800">{tour.availableSlots} slots</strong> left for this season</span>
              ) : (
                <span className="text-rose-600">Fully booked — join the waitlist</span>
              )}
            </div>

            <Link
              to={`/booking/${tour.id}${selectedDate ? `?date=${selectedDate.toISOString().slice(0, 10)}` : ''}`}
              className="btn-primary w-full"
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
