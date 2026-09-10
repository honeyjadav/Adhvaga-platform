const express = require('express');
const router = express.Router();
const {
  getTours,
  getFeaturedTours,
  getTourById,
  getTourAvailability,
  createTour,
  updateTour,
  deleteTour,
} = require('../controllers/tourController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getTours);
router.get('/featured', getFeaturedTours);
router.get('/:id', getTourById);
router.get('/:id/availability', getTourAvailability);
router.post('/', protect, adminOnly, createTour);
router.put('/:id', protect, adminOnly, updateTour);
router.delete('/:id', protect, adminOnly, deleteTour);

module.exports = router;