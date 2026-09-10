import APICallService from './APICallService';

export async function createPaymentIntent({ amount, currency = 'inr', bookingId }) {
  const { data } = await APICallService.createPaymentIntent({ amount, currency, bookingId });
  return data;
}

export async function confirmPayment({ bookingId, paymentIntentId }) {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = paymentIntentId;
  const { data } = await APICallService.confirmPayment({
    bookingId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });
  return data;
}