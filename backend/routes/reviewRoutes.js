const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getReviewsByTour, createReview  ,deleteReview } = require('../controllers/reviewController');

router.get('/', getReviewsByTour);
router.post('/', protect, createReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;