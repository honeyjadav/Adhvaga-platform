import React from 'react';
import StarRating from './StarRating.jsx';
import { formatDate } from '../../utils/formatters.js';

export default function ReviewList({ reviews = [] }) {
  if (!reviews.length) {
    return (
      <div className="card p-6 text-center text-sm text-lagoon-400">
        No reviews yet — be the first to share your experience.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="card p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lagoon-100 text-sm font-semibold text-lagoon-700">
                {review.userName.charAt(0)}
              </span>
              <div>
                <p className="text-sm font-semibold text-lagoon-900">{review.userName}</p>
                <p className="text-xs text-lagoon-400">{formatDate(review.createdAt)}</p>
              </div>
            </div>
            <StarRating value={review.rating} readOnly size={15} />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-lagoon-600">{review.comment}</p>
        </div>
      ))}
    </div>
  );
}
