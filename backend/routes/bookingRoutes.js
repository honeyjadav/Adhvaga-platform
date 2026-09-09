const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getMyBookings,
  getAllBookings,
  createBooking,
  updateBookingStatus,
} = require('../controllers/bookingController');

router.use(protect);
router.get('/me', getMyBookings);
router.get('/', adminOnly, getAllBookings);
router.post('/', createBooking);
router.patch('/:id/status', adminOnly, updateBookingStatus);

module.exports = router;