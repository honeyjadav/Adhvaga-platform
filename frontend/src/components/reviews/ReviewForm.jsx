import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reviewSchema } from '../../utils/validationSchemas.js';
import StarRating from './StarRating.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../context/ToastContext.jsx';
import * as reviewsService from '../../services/reviews.js';

export default function ReviewForm({ tourId, onReviewAdded }) {
  const { user, isAuthenticated } = useAuth();
  const { success, error: toastError } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: '' },
  });

  if (!isAuthenticated) {
    return (
      <div className="card p-5 text-sm text-lagoon-500">
        Please log in to leave a review for this tour.
      </div>
    );
  }

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const review = await reviewsService.createReview({
        tourId,
        userName: user.name,
        rating: values.rating,
        comment: values.comment,
      });
      success('Thanks! Your review has been posted.');
      reset({ rating: 0, comment: '' });
      onReviewAdded?.(review);
    } catch (err) {
      toastError(err.message || 'Could not submit your review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 p-5">
      <h4 className="font-display text-base font-semibold text-lagoon-900">Write a review</h4>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-lagoon-700">Your rating</label>
        <Controller
          name="rating"
          control={control}
          render={({ field }) => <StarRating value={field.value} onChange={field.onChange} size={24} />}
        />
        {errors.rating && <p className="field-error">{errors.rating.message}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-lagoon-700">Your review</label>
        <textarea
          rows={4}
          placeholder="Share what stood out about this trip..."
          className="input-field resize-none"
          {...register('comment')}
        />
        {errors.comment && <p className="field-error">{errors.comment.message}</p>}
      </div>

      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? 'Posting...' : 'Post Review'}
      </button>
    </form>
  );
}
