const Booking = require('../models/Booking');
const Tour = require('../models/Tour');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorMiddleware');

const getMyBookings = asyncHandler(async (req, res) => {
  res.json(await Booking.find({ user: req.user._id }).sort({ createdAt: -1 }));
});

const getAllBookings = asyncHandler(async (req, res) => {
  res.json(await Booking.find().sort({ createdAt: -1 }));
});

// @desc    Create a booking against a specific departure
// @route   POST /api/bookings
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
  const { tourId, departureId, travelers, totalPrice } = req.body;
  const numTravelers = Number(travelers);

  if (!departureId) throw new ApiError(400, 'departureId is required');
  if (!numTravelers || numTravelers < 1) throw new ApiError(400, 'travelers must be at least 1');

  const tour = await Tour.findById(tourId);
  if (!tour) throw new ApiError(404, 'Tour not found');

  const departure = tour.departures.id(departureId);
  if (!departure) throw new ApiError(404, 'Departure date not found for this tour');

  // Atomic check-and-decrement: only succeeds if the departure still has
  // enough slots at the moment of the update, preventing overbooking
  // under concurrent requests.
  const updatedTour = await Tour.findOneAndUpdate(
    {
      _id: tourId,
      departures: {
        $elemMatch: { _id: departureId, availableSlots: { $gte: numTravelers } },
      },
    },
    { $inc: { 'departures.$.availableSlots': -numTravelers } },
    { new: true }
  );

  if (!updatedTour) {
    throw new ApiError(409, 'Not enough slots available for this departure');
  }

  const booking = await Booking.create({
    tour: tour._id,
    tourTitle: tour.title,
    departureId,
    startDate: departure.date,
    user: req.user._id,
    travelers: numTravelers,
    totalPrice,
  });

  res.status(201).json(booking);
});

// @desc    Update a booking's status (confirm/cancel), restoring slots on cancellation
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
const updateBookingStatus = asyncHandler(async (req, res) => {
  const allowed = ['pending', 'confirmed', 'cancelled'];
  if (!allowed.includes(req.body.status)) throw new ApiError(400, 'Invalid booking status');

  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Booking not found');

  const wasCancelled = booking.status === 'cancelled';
  const isNowCancelled = req.body.status === 'cancelled';

  booking.status = req.body.status;
  await booking.save();

  // Restore slots only on the transition INTO cancelled (not if it was
  // already cancelled, to avoid double-crediting slots back).
  if (isNowCancelled && !wasCancelled) {
    await Tour.updateOne(
      { _id: booking.tour, 'departures._id': booking.departureId },
      { $inc: { 'departures.$.availableSlots': booking.travelers } }
    );
  }

  res.json(booking);
});

module.exports = { getMyBookings, getAllBookings, createBooking, updateBookingStatus };