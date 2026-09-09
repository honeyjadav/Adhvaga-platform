const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getTours,
  getFeaturedTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
} = require('../controllers/tourController');
const { createTourValidation, updateTourValidation } = require('../middleware/validators/tourValidators');

router.get('/', getTours);
router.get('/featured', getFeaturedTours);
router.get('/:id', getTourById);
router.post('/', protect, adminOnly, createTourValidation, createTour);
router.put('/:id', protect, adminOnly, updateTourValidation, updateTour);
router.delete('/:id', protect, adminOnly, deleteTour);

module.exports = router;