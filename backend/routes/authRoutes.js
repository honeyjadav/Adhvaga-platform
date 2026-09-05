const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getMe,
  updateMe,
  changePassword,
  logout,
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
} = require('../middleware/validators/authValidators');

// Public
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Private (requires Authorization: Bearer <token>)
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfileValidation, updateMe);
router.put('/change-password', protect, changePasswordValidation, changePassword);
router.post('/logout', protect, logout);

module.exports = router;
