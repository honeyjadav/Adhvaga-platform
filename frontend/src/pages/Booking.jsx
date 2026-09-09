import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Users, CalendarDays, MessageSquare } from 'lucide-react';
import BookingSummary from '../components/booking/BookingSummary.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { getTourById } from '../services/tours.js';
import { bookingSchema } from '../utils/validationSchemas.js';
import { useAuth } from '../hooks/useAuth.js';

export default function Booking() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: tour, isLoading, error, reload } = useFetch(() => getTourById(id), [id]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      startDate: searchParams.get('date') || '',
      travelers: 1,
      fullName: user?.name || '',
      email: user?.email || '',
      phone: '',
      specialRequests: '',
    },
  });

  const travelers = watch('travelers') || 1;
  const startDate = watch('startDate');

  if (isLoading) return <LoadingSpinner fullPage label="Preparing booking form..." />;
  if (error) return <div className="mx-auto max-w-3xl px-4 py-16"><ErrorState message={error} onRetry={reload} /></div>;
  if (!tour) return null;

  const onSubmit = (values) => {
    // Carry booking details forward to the payment step via router state,
    // where the actual booking + payment intent are created.
    navigate(`/payment/${tour.id}`, { state: { ...values, tourId: tour.id } });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="section-label">Step 1 of 2</p>
      <h1 className="mt-1 font-display text-3xl font-semibold">Booking Details</h1>
      <p className="mt-2 text-sm text-lagoon-500">Tell us who&apos;s traveling and when — we&apos;ll take care of the rest.</p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6 p-6 lg:col-span-2">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-lagoon-700">
                <CalendarDays size={14} className="mr-1 inline" /> Start date
              </label>
              <input type="date" className="input-field" {...register('startDate')} />
              {errors.startDate && <p className="field-error">{errors.startDate.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-lagoon-700">
                <Users size={14} className="mr-1 inline" /> Number of travelers
              </label>
              <Controller
                name="travelers"
                control={control}
                render={({ field }) => (
                  <input
                    type="number"
                    min={1}
                    max={tour.maxTravelers}
                    className="input-field"
                    value={field.value}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
              {errors.travelers && <p className="field-error">{errors.travelers.message}</p>}
            </div>
          </div>

          <div className="border-t border-sand-200 pt-6">
            <h3 className="mb-4 font-semibold text-lagoon-900">Traveler information</h3>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-lagoon-700">Full name</label>
                <input className="input-field" placeholder="As per government ID" {...register('fullName')} />
                {errors.fullName && <p className="field-error">{errors.fullName.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-lagoon-700">Email</label>
                <input type="email" className="input-field" placeholder="you@example.com" {...register('email')} />
                {errors.email && <p className="field-error">{errors.email.message}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-lagoon-700">Phone number</label>
                <input className="input-field" placeholder="+91 98765 43210" {...register('phone')} />
                {errors.phone && <p className="field-error">{errors.phone.message}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-lagoon-700">
                  <MessageSquare size={14} className="mr-1 inline" /> Special requests (optional)
                </label>
                <textarea
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Dietary needs, accessibility requirements, etc."
                  {...register('specialRequests')}
                />
                {errors.specialRequests && <p className="field-error">{errors.specialRequests.message}</p>}
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full">Proceed to Payment</button>
        </form>

        <div className="lg:col-span-1">
          <BookingSummary tour={tour} travelers={travelers} startDate={startDate} />
        </div>
      </div>
    </div>
  );
}
