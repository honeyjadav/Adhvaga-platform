import api, { USE_MOCK_API, mockDelay } from './api.js';

// In a real backend, this hits POST /api/payments/create-intent which
// creates a Stripe PaymentIntent server-side and returns its client_secret.
export async function createPaymentIntent({ amount, currency = 'inr', bookingId }) {
  if (USE_MOCK_API) {
    return mockDelay(
      {
        clientSecret: `mock_client_secret_${bookingId}_${Date.now()}`,
        amount,
        currency,
      },
      500
    );
  }
  const { data } = await api.post('/payments/create-intent', { amount, currency, bookingId });
  return data;
}

export async function confirmPayment({ bookingId, paymentIntentId }) {
  if (USE_MOCK_API) {
    return mockDelay({ success: true, bookingId, paymentIntentId, status: 'confirmed' }, 900);
  }
  const { data } = await api.post('/payments/confirm', { bookingId, paymentIntentId });
  return data;
}
