const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createPaymentIntent, confirmPayment } = require('../controllers/paymentController');

router.use(protect);
router.post('/create-intent', createPaymentIntent);
router.post('/confirm', confirmPayment);

module.exports = router;