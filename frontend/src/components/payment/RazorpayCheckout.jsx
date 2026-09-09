import React, { useState } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Could not load Razorpay Checkout'));
    document.body.appendChild(script);
  });
}

export default function RazorpayCheckout({ order, bookingDetails, onSuccess, onError, isProcessingExternally }) {
  const [submitting, setSubmitting] = useState(false);
  const busy = submitting || isProcessingExternally;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await loadRazorpay();
      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Adhvaga',
        description: 'Tour booking payment',
        order_id: order.orderId,
        prefill: {
          name: bookingDetails.fullName,
          email: bookingDetails.email,
          contact: bookingDetails.phone,
        },
        theme: { color: '#0f766e' },
        handler: onSuccess,
        modal: { ondismiss: () => setSubmitting(false) },
      });
      razorpay.on('payment.failed', (response) => {
        onError(response.error?.description || 'Razorpay payment failed');
        setSubmitting(false);
      });
      razorpay.open();
    } catch (error) {
      setSubmitting(false);
      onError(error.message || 'Could not start Razorpay Checkout');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-5 p-5">
      <div className="rounded-xl bg-sand-100 p-4 text-sm text-lagoon-600">
        You will complete payment securely in Razorpay Checkout.
      </div>
      <button type="submit" disabled={busy} className="btn-primary w-full">
        <Lock size={15} /> {busy ? 'Processing payment...' : 'Pay securely with Razorpay'}
      </button>
      <p className="flex items-center justify-center gap-1.5 text-xs text-lagoon-400">
        <ShieldCheck size={13} /> Payments are securely processed by Razorpay
      </p>
    </form>
  );
}
