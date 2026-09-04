import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Lock, ShieldCheck } from 'lucide-react';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '15px',
      color: '#0f2f2c',
      fontFamily: '"Inter", sans-serif',
      '::placeholder': { color: '#a7b3b1' },
    },
    invalid: { color: '#e11d48' },
  },
};

export default function StripeCardForm({ clientSecret, onSuccess, onError, isProcessingExternally }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [cardError, setCardError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setCardError(null);

    const card = elements.getElement(CardElement);

    try {
      // With USE_MOCK_API the clientSecret is a fake value, so we skip the
      // real confirmCardPayment call and simulate a short processing delay.
      const isMockSecret = clientSecret?.startsWith('mock_client_secret');

      if (isMockSecret) {
        if (!card) throw new Error('Card details are required.');
        await new Promise((resolve) => setTimeout(resolve, 1200));
        onSuccess({ id: `mock_pi_${Date.now()}` });
        return;
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card },
      });

      if (error) {
        setCardError(error.message);
        onError?.(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent);
      }
    } catch (err) {
      setCardError(err.message);
      onError?.(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const busy = submitting || isProcessingExternally;

  return (
    <form onSubmit={handleSubmit} className="card space-y-5 p-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-lagoon-700">Card details</label>
        <div className="rounded-xl border border-sand-200 bg-white px-4 py-3.5 focus-within:border-lagoon-400 focus-within:ring-2 focus-within:ring-lagoon-200">
          <CardElement options={CARD_ELEMENT_OPTIONS} onChange={(e) => setCardError(e.error?.message || null)} />
        </div>
        {cardError && <p className="field-error">{cardError}</p>}
      </div>

      <button type="submit" disabled={!stripe || busy} className="btn-primary w-full">
        <Lock size={15} /> {busy ? 'Processing payment...' : 'Confirm & Pay'}
      </button>

      <p className="flex items-center justify-center gap-1.5 text-xs text-lagoon-400">
        <ShieldCheck size={13} /> Payments are securely processed by Stripe
      </p>
    </form>
  );
}
