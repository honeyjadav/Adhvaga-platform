const Tour = require('../models/Tour');
const Booking = require('../models/Booking');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorMiddleware');

const getTours = asyncHandler(async (req, res) => {
  const { search, category, minPrice, maxPrice, minRating, minDuration, maxDuration, sortBy, ids } = req.query;
  const filter = {};

  if (ids) {
    filter._id = { $in: ids.split(',') };
  }
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { destination: { $regex: search, $options: 'i' } },
    ];
  }
  if (category) filter.category = category;
  if (minPrice !== undefined) filter.price = { ...(filter.price || {}), $gte: Number(minPrice) };
  if (maxPrice !== undefined) filter.price = { ...(filter.price || {}), $lte: Number(maxPrice) };
  if (minRating !== undefined) filter.rating = { $gte: Number(minRating) };
  if (minDuration !== undefined) filter.duration = { ...(filter.duration || {}), $gte: Number(minDuration) };
  if (maxDuration !== undefined) filter.duration = { ...(filter.duration || {}), $lte: Number(maxDuration) };

  const sort = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    rating_desc: { rating: -1 },
    newest: { createdAt: -1 },
  }[sortBy] || { createdAt: -1 };

  res.json(await Tour.find(filter).sort(sort).select('-gallery'));
});

const getFeaturedTours = asyncHandler(async (req, res) => {
  // Exclude gallery from featured list view (card view only needs heroImage)
  res.json(await Tour.find().sort({ rating: -1, reviewCount: -1 }).limit(4).select('-gallery'));
});

const getTourById = asyncHandler(async (req, res) => {
  const tour = await Tour.findById(req.params.id);
  if (!tour) throw new ApiError(404, 'Tour not found');
  res.json(tour);
});

// @desc    Get live availability for a flexible tour across a date range,
//          computed from actual bookings in the database (no static data).
// @route   GET /api/tours/:id/availability?from=YYYY-MM-DD&to=YYYY-MM-DD
// @access  Public
const getTourAvailability = asyncHandler(async (req, res) => {
  const tour = await Tour.findById(req.params.id);
  if (!tour) throw new ApiError(404, 'Tour not found');

  if (tour.bookingType !== 'flexible') {
    // Fixed tours already expose their availability directly via departures[]
    return res.json({ bookingType: 'fixed', departures: tour.departures });
  }

  const from = req.query.from ? new Date(req.query.from) : new Date();
  const to = req.query.to
    ? new Date(req.query.to)
    : new Date(new Date().setMonth(from.getMonth() + 2));

  const bookedTotals = await Booking.aggregate([
    {
      $match: {
        tour: tour._id,
        startDate: { $gte: from, $lte: to },
        status: { $ne: 'cancelled' },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$startDate' } },
        totalBooked: { $sum: '$travelers' },
      },
    },
  ]);

  const bookedByDate = Object.fromEntries(bookedTotals.map((b) => [b._id, b.totalBooked]));

  res.json({
    bookingType: 'flexible',
    dailyCapacity: tour.dailyCapacity,
    availableFrom: tour.availableFrom,
    availableUntil: tour.availableUntil,
    blackoutDates: tour.blackoutDates,
    bookedByDate, // e.g. { "2026-09-15": 6, "2026-09-16": 15 }
  });
});

const createTour = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    gallery: req.body.gallery?.length ? req.body.gallery : [req.body.heroImage].filter(Boolean),
  };

  if (payload.bookingType === 'flexible') {
    if (!payload.dailyCapacity) {
      throw new ApiError(400, 'dailyCapacity is required for flexible tours');
    }
    payload.departures = [];
  } else {
    if (!Array.isArray(payload.departures) || payload.departures.length === 0) {
      throw new ApiError(400, 'At least one departure date is required for fixed tours');
    }
    // availableSlots should start equal to maxTravelers for a fresh departure
    payload.departures = payload.departures.map((d) => ({
      ...d,
      availableSlots: d.availableSlots ?? d.maxTravelers,
    }));
  }

  res.status(201).json(await Tour.create(payload));
});

const updateTour = asyncHandler(async (req, res) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!tour) throw new ApiError(404, 'Tour not found');
  res.json(tour);
});

const deleteTour = asyncHandler(async (req, res) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) throw new ApiError(404, 'Tour not found');
  res.json({ success: true });
});

module.exports = {
  getTours,
  getFeaturedTours,
  getTourById,
  getTourAvailability,
  createTour,
  updateTour,
  deleteTour,
};