import React, { useMemo, useState , useEffect } from 'react';
import ReviewForm from '../components/reviews/ReviewForm.jsx';
import ReviewList from '../components/reviews/ReviewList.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { getReviewsByTour } from '../services/reviews.js';
import { getTours } from '../services/tours.js';

export default function ReviewsPage() {
  const { data: tours } = useFetch(() => getTours(), []);
  const [tourId, setTourId] = useState(null);
  const { data: reviews, isLoading, setData } = useFetch(
  () => (tourId ? getReviewsByTour(tourId) : Promise.resolve([])),
  [tourId]
);

  const selectedTour = useMemo(() => tours?.find((t) => t.id === tourId), [tours, tourId]);

  const handleReviewAdded = (review) => setData((prev) => [review, ...(prev || [])]);
  useEffect(() => {
  if (tours?.length && !tourId) setTourId(tours[0].id);
}, [tours, tourId]);
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="section-label">Traveler feedback</p>
      <h1 className="mt-1 font-display text-3xl font-semibold">Reviews</h1>
      <p className="mt-2 text-sm text-lagoon-500">Read what travelers thought, or share your own experience.</p>

      <div className="mt-6">
        <label className="mb-1.5 block text-sm font-medium text-lagoon-700">Select a tour</label>
        <select value={tourId} onChange={(e) => setTourId(e.target.value)} className="input-field max-w-sm">
          {tours?.map((t) => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
      </div>

      {selectedTour && (
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-sand-100 px-4 py-3 text-sm text-lagoon-600">
          <img src={selectedTour.heroImage} alt={selectedTour.title} className="h-10 w-14 rounded-lg object-cover" />
          <span>
            <strong>{selectedTour.rating}</strong> average rating from <strong>{selectedTour.reviewCount}</strong> reviews
          </span>
        </div>
      )}

      <div className="mt-8 space-y-5">
        <ReviewForm tourId={tourId} onReviewAdded={handleReviewAdded} />
        {isLoading ? <LoadingSpinner label="Loading reviews..." /> : <ReviewList reviews={reviews || []} />}
      </div>
    </div>
  );
}
