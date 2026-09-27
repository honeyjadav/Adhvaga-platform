const Review = require('../models/Review');
const Tour = require('../models/Tour');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorMiddleware');

const getReviewsByTour = asyncHandler(async (req, res) => {
  if (!req.query.tourId) throw new ApiError(400, 'tourId is required');
  res.json(await Review.find({ tour: req.query.tourId }).sort({ createdAt: -1 }));
});

const createReview = asyncHandler(async (req, res) => {
  const { tourId, rating, comment } = req.body;
  const tour = await Tour.findById(tourId);
  if (!tour) throw new ApiError(404, 'Tour not found');

  const review = await Review.create({
    tour: tour._id,
    user: req.user._id,
    userName: req.user.name,
    rating,
    comment: comment || '',
  });
  const aggregate = await Review.aggregate([
    { $match: { tour: tour._id } },
    { $group: { _id: null, rating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } },
  ]);
  await Tour.findByIdAndUpdate(tour._id, {
    rating: Math.round((aggregate[0].rating || 0) * 10) / 10,
    reviewCount: aggregate[0].reviewCount,
  });
  res.status(201).json(review);
});

const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) throw new ApiError(404, 'Review not found');
  res.json({ message: 'Review deleted successfully' });
});


module.exports = { getReviewsByTour, createReview, deleteReview };