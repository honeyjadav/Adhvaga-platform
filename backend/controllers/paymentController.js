const crypto = require('crypto');
const Booking = require('../models/Booking');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorMiddleware');

const createPaymentIntent = asyncHandler(async (req, res) => {
  const { amount, currency = 'inr', bookingId } = req.body;
  if (!amount || amount <= 0) throw new ApiError(400, 'A valid payment amount is required');
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new ApiError(503, 'Razorpay is not configured on the server');
  }

  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: Math.round(Number(amount) * 100), currency: currency.toUpperCase(), receipt: String(bookingId || Date.now()) }),
  });
  const order = await response.json();
  if (!response.ok) throw new ApiError(response.status, order.error?.description || 'Could not create Razorpay order');
  res.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID });
});

const confirmPayment = asyncHandler(async (req, res) => {
  const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new ApiError(400, 'Razorpay payment details are required');
  }
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');
  if (expectedSignature !== razorpaySignature) throw new ApiError(400, 'Invalid Razorpay payment signature');

  const booking = await Booking.findByIdAndUpdate(
    bookingId,
    { status: 'confirmed', paymentIntentId: razorpayPaymentId, paidAt: new Date() },
    { new: true }
  );
  if (!booking) throw new ApiError(404, 'Booking not found');
  res.json({ success: true, bookingId, paymentIntentId: razorpayPaymentId, status: 'confirmed' });
});

module.exports = { createPaymentIntent, confirmPayment };