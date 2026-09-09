import api, { USE_MOCK_API, mockDelay } from './api.js';

export async function createPaymentIntent({ amount, currency = 'inr', bookingId }) {
  if (USE_MOCK_API) {
    return mockDelay(
      {
        orderId: `mock_order_${bookingId}_${Date.now()}`,
        amount: Math.round(amount * 100),
        currency: currency.toUpperCase(),
        keyId: 'mock',
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
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = paymentIntentId;
  const { data } = await api.post('/payments/confirm', {
    bookingId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });
  return data;
}
