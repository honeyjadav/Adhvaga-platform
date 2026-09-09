const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getMe,
  updateMe,
  changePassword,
  forgotPassword,
  resetPassword,
  requestOtp,
  verifyLoginOtp,
  verifyOtp,
  verifyEmail,
  resendVerification,
  logout,
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  otpRequestValidation,
  otpVerificationValidation,
} = require('../middleware/validators/authValidators');

// Public
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/verify-login-otp', otpVerificationValidation, verifyLoginOtp);
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.post('/reset-password', resetPasswordValidation, resetPassword);
router.post('/request-otp', otpRequestValidation, requestOtp);
router.post('/verify-otp', otpVerificationValidation, verifyOtp);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', forgotPasswordValidation, resendVerification);

// Private (requires Authorization: Bearer <token>)
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfileValidation, updateMe);
router.put('/change-password', protect, changePasswordValidation, changePassword);
router.post('/logout', protect, logout);

module.exports = router;