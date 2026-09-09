const Tour = require('../models/Tour');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorMiddleware');

const getTours = asyncHandler(async (req, res) => {
  const { search, category, minPrice, maxPrice, minRating, minDuration, maxDuration, sortBy } = req.query;
  const filter = {};

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

  // Exclude gallery from list view (card view only needs heroImage)
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

const createTour = asyncHandler(async (req, res) => {
  if (!Array.isArray(req.body.departures) || req.body.departures.length === 0) {
    throw new ApiError(400, 'At least one departure date is required');
  }
  const payload = {
    ...req.body,
    gallery: req.body.gallery?.length ? req.body.gallery : [req.body.heroImage].filter(Boolean),
  };
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

module.exports = { getTours, getFeaturedTours, getTourById, createTour, updateTour, deleteTour };