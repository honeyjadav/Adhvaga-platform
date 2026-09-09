const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getReviewsByTour, createReview } = require('../controllers/reviewController');

router.get('/', getReviewsByTour);
router.post('/', protect, createReview);

module.exports = router;