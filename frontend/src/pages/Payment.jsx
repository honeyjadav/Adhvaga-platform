import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import StripeCardForm from '../components/payment/StripeCardForm.jsx';
import BookingSummary from '../components/booking/BookingSummary.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { getTourById } from '../services/tours.js';
import { createPaymentIntent, confirmPayment } from '../services/payments.js';
import { createBooking } from '../services/bookings.js';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatCurrency } from '../utils/formatters.js';

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder'
);

export default function Payment() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const bookingDetails = location.state;
  const { data: tour, isLoading, error, reload } = useFetch(() => getTourById(id), [id]);

  const [clientSecret, setClientSecret] = useState(null);
  const [paymentState, setPaymentState] = useState('idle'); // idle | processing | success | failed
  const [failureReason, setFailureReason] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const travelers = bookingDetails?.travelers || 1;
  const total = useMemo(() => {
    if (!tour) return 0;
    const subtotal = tour.price * travelers;
    return subtotal + Math.round(subtotal * 0.05);
  }, [tour, travelers]);

  useEffect(() => {
    if (!tour || !bookingDetails) return;
    createPaymentIntent({ amount: total, bookingId: `${tour.id}-${Date.now()}` })
      .then((res) => setClientSecret(res.clientSecret))
      .catch((err) => toastError(err.message || 'Could not initialize payment.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tour, total]);

  if (!bookingDetails) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="font-semibold text-lagoon-900">No booking in progress</p>
        <p className="mt-2 text-sm text-lagoon-500">Please start a booking before proceeding to payment.</p>
        <Link to={`/tours/${id}`} className="btn-primary mt-5 inline-flex">Back to Tour</Link>
      </div>
    );
  }

  if (isLoading) return <LoadingSpinner fullPage label="Loading order summary..." />;
  if (error) return <div className="mx-auto max-w-3xl px-4 py-16"><ErrorState message={error} onRetry={reload} /></div>;
  if (!tour) return null;

  const handlePaymentSuccess = async (paymentIntent) => {
    setPaymentState('processing');
    try {
      const booking = await createBooking({
        tourId: tour.id,
        tourTitle: tour.title,
        userId: user?.id || 'guest',
        travelers,
        startDate: bookingDetails.startDate,
        totalPrice: total,
      });
      await confirmPayment({ bookingId: booking.id, paymentIntentId: paymentIntent.id });
      setConfirmedBooking(booking);
      setPaymentState('success');
      toastSuccess('Payment successful! Your trip is booked.');
    } catch (err) {
      setFailureReason(err.message || 'Payment could not be confirmed.');
      setPaymentState('failed');
    }
  };

  const handlePaymentError = (message) => {
    setFailureReason(message);
    setPaymentState('failed');
    toastError(message);
  };

  if (paymentState === 'success') {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-lagoon-100 text-lagoon-600">
          <CheckCircle2 size={32} />
        </span>
        <h1 className="mt-5 font-display text-2xl font-semibold text-lagoon-900">Booking Confirmed!</h1>
        <p className="mt-2 text-sm text-lagoon-500">
          A confirmation for <strong>{tour.title}</strong> has been sent to {bookingDetails.email}.
        </p>
        <div className="card mt-6 space-y-2 p-5 text-left text-sm">
          <div className="flex justify-between"><span className="text-lagoon-500">Booking ID</span><span className="font-semibold">{confirmedBooking?.id}</span></div>
          <div className="flex justify-between"><span className="text-lagoon-500">Amount paid</span><span className="font-semibold">{formatCurrency(total)}</span></div>
          <div className="flex justify-between"><span className="text-lagoon-500">Status</span><span className="font-semibold capitalize text-amber-600">Pending confirmation</span></div>
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/dashboard" className="btn-primary">View My Bookings</Link>
          <Link to="/tours" className="btn-secondary">Explore More Tours</Link>
        </div>
      </div>
    );
  }

  if (paymentState === 'failed') {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <XCircle size={32} />
        </span>
        <h1 className="mt-5 font-display text-2xl font-semibold text-lagoon-900">Payment Failed</h1>
        <p className="mt-2 text-sm text-lagoon-500">{failureReason || 'Something went wrong while processing your payment.'}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={() => setPaymentState('idle')} className="btn-primary">Try Again</button>
          <Link to={`/tours/${tour.id}`} className="btn-secondary">Back to Tour</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm font-semibold text-lagoon-500 hover:text-lagoon-700">
        <ArrowLeft size={15} /> Back
      </button>
      <p className="section-label">Step 2 of 2</p>
      <h1 className="mt-1 font-display text-3xl font-semibold">Payment</h1>
      <p className="mt-2 text-sm text-lagoon-500">Enter your card details to confirm your booking.</p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {clientSecret ? (
            <Elements stripe={stripePromise}>
              <StripeCardForm
                clientSecret={clientSecret}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                isProcessingExternally={paymentState === 'processing'}
              />
            </Elements>
          ) : (
            <LoadingSpinner label="Initializing secure payment..." />
          )}
        </div>
        <div className="lg:col-span-1">
          <BookingSummary tour={tour} travelers={travelers} startDate={bookingDetails.startDate} />
        </div>
      </div>
    </div>
  );
}
