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

function normalizeToStartOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// @desc    Book a fixed-departure tour (claims a slot on an existing departure)
async function createFixedBooking(req, res) {
  const { tourId, departureId, travelers, totalPrice } = req.body;
  const numTravelers = Number(travelers);

  if (!departureId) throw new ApiError(400, 'departureId is required for fixed tours');
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
}

// @desc    Book a flexible tour on any user-chosen date, subject to daily capacity
async function createFlexibleBooking(req, res) {
  const { tourId, date, travelers, totalPrice } = req.body;
  const numTravelers = Number(travelers);

  if (!date) throw new ApiError(400, 'date is required for flexible tours');
  if (!numTravelers || numTravelers < 1) throw new ApiError(400, 'travelers must be at least 1');

  const tour = await Tour.findById(tourId);
  if (!tour) throw new ApiError(404, 'Tour not found');

  const bookedDay = normalizeToStartOfDay(date);
  const today = normalizeToStartOfDay(new Date());

  if (bookedDay < today) throw new ApiError(400, 'Cannot book a date in the past');

  if (tour.availableFrom && bookedDay < normalizeToStartOfDay(tour.availableFrom)) {
    throw new ApiError(400, 'Selected date is before this tour\'s available window');
  }
  if (tour.availableUntil && bookedDay > normalizeToStartOfDay(tour.availableUntil)) {
    throw new ApiError(400, 'Selected date is after this tour\'s available window');
  }
  const isBlackedOut = (tour.blackoutDates || []).some(
    (d) => normalizeToStartOfDay(d).getTime() === bookedDay.getTime()
  );
  if (isBlackedOut) throw new ApiError(400, 'This tour does not run on the selected date');

  const nextDay = new Date(bookedDay);
  nextDay.setDate(nextDay.getDate() + 1);

  // Sum travelers already booked for this date (excluding cancelled bookings),
  // computed live from the database rather than any stored/static count.
  const existing = await Booking.aggregate([
    {
      $match: {
        tour: tour._id,
        startDate: { $gte: bookedDay, $lt: nextDay },
        status: { $ne: 'cancelled' },
      },
    },
    { $group: { _id: null, total: { $sum: '$travelers' } } },
  ]);
  const alreadyBooked = existing[0]?.total || 0;

  if (alreadyBooked + numTravelers > tour.dailyCapacity) {
    throw new ApiError(409, 'Not enough capacity available for this date');
  }

  const booking = await Booking.create({
    tour: tour._id,
    tourTitle: tour.title,
    startDate: bookedDay,
    user: req.user._id,
    travelers: numTravelers,
    totalPrice,
  });

  res.status(201).json(booking);
}

// @desc    Create a booking; branches on the tour's bookingType
// @route   POST /api/bookings
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
  const { tourId } = req.body;
  const tour = await Tour.findById(tourId).select('bookingType');
  if (!tour) throw new ApiError(404, 'Tour not found');

  if (tour.bookingType === 'flexible') {
    return createFlexibleBooking(req, res);
  }
  return createFixedBooking(req, res);
});

// @desc    Update a booking's status (confirm/cancel), restoring capacity on cancellation
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
  // already cancelled, to avoid double-crediting slots back), and only
  // for fixed tours — flexible tours compute availability live, so
  // cancelling a flexible booking automatically frees capacity with
  // no counter to restore.
  if (isNowCancelled && !wasCancelled && booking.departureId) {
    await Tour.updateOne(
      { _id: booking.tour, 'departures._id': booking.departureId },
      { $inc: { 'departures.$.availableSlots': booking.travelers } }
    );
  }

  res.json(booking);
});

module.exports = { getMyBookings, getAllBookings, createBooking, updateBookingStatus };