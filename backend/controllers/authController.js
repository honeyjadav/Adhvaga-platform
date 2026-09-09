const crypto = require('crypto');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const { ApiError } = require('../middleware/errorMiddleware');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  // Public registration always creates a regular "user" account. Admin
  // accounts are provisioned separately (seed script, or an existing
  // admin promoting a user via the future admin user-management endpoint)
  // — never trust a client-supplied role on the open register endpoint.
  const rawVerificationToken = crypto.randomBytes(32).toString('hex');
  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: 'user',
    isEmailVerified: false,
    emailVerificationToken: crypto.createHash('sha256').update(rawVerificationToken).digest('hex'),
    emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000,
  });

  const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${rawVerificationToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Verify your Adhvaga email',
    text: `Welcome to Adhvaga. Verify your email within 24 hours: ${verifyUrl}`,
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful. Check your email to verify your account.',
  });
});

// @desc    Log in an existing user (Step 1: Verify credentials and send 2FA OTP)
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'This account has been deactivated');
  }

  if (!user.isEmailVerified) {
    throw new ApiError(403, 'Please verify your email before logging in');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Generate and send OTP for 2FA
  const otp = String(crypto.randomInt(100000, 1000000));
  user.loginOtpHash = crypto.createHash('sha256').update(otp).digest('hex');
  user.loginOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  user.loginOtpAttempts = 0;
  await user.save({ validateBeforeSave: false });

  await sendEmail({
    to: user.email,
    subject: 'Your Adhvaga login verification code',
    text: `Your two-factor authentication code is: ${otp}\n\nThis code expires in 10 minutes. If you did not attempt to log in, please ignore this email.`,
  });

  res.status(200).json({
    success: true,
    message: 'Verification code sent to your email. Please enter it to complete login.',
  });
});

// @desc    Get the currently authenticated user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  // req.user is attached by the `protect` middleware
  res.status(200).json({
    success: true,
    user: req.user.toSafeObject(),
  });
});

// @desc    Update current user's profile (name/phone)
// @route   PUT /api/auth/me
// @access  Private
const updateMe = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;

  if (name !== undefined) req.user.name = name;
  if (phone !== undefined) req.user.phone = phone;

  await req.user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated',
    user: req.user.toSafeObject(),
  });
});

// @desc    Change current user's password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
});

// @desc    Request a password reset link
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  // Always return the same response whether or not the account exists,
  // so this endpoint can't be used to discover which emails are registered.
  const genericResponse = {
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent.',
  };

  if (!user) {
    return res.status(200).json(genericResponse);
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${rawToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Reset your Adhvaga password',
      text: `You requested a password reset. Click this link to set a new password (valid for 30 minutes): ${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.`,
    });
  } catch (err) {
    // Roll back the token so a broken mail send doesn't leave a dangling
    // valid reset token the user can never actually use.
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(500, 'Could not send reset email, please try again later');
  }

  res.status(200).json(genericResponse);
});

// @desc    Reset password using the token emailed to the user
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+password');

  if (!user) {
    throw new ApiError(400, 'Reset link is invalid or has expired');
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const jwtToken = generateToken(user);

  res.status(200).json({
    success: true,
    message: 'Password reset successful',
    token: jwtToken,
    user: user.toSafeObject(),
  });
});

const requestOtp = asyncHandler(async (req, res) => {
  const email = req.body.email.toLowerCase();
  const response = {
    success: true,
    message: 'If an account with that email exists, a one-time code has been sent.',
  };
  const user = await User.findOne({ email }).select('+loginOtpHash +loginOtpExpires +loginOtpAttempts');
  if (!user || !user.isActive) return res.json(response);

  const otp = String(crypto.randomInt(100000, 1000000));
  user.loginOtpHash = crypto.createHash('sha256').update(otp).digest('hex');
  user.loginOtpExpires = Date.now() + 10 * 60 * 1000;
  user.loginOtpAttempts = 0;
  await user.save({ validateBeforeSave: false });
  await sendEmail({
    to: user.email,
    subject: 'Your Adhvaga login code',
    text: `Your Adhvaga login code is ${otp}. It expires in 10 minutes. If you did not request this, ignore this email.`,
  });
  res.json(response);
});

// @desc    Verify 2FA OTP and complete login (Step 2: Verify OTP and return JWT)
// @route   POST /api/auth/verify-login-otp
// @access  Public
const verifyLoginOtp = asyncHandler(async (req, res) => {
  const email = req.body.email.toLowerCase();
  const { otp } = req.body;
  const user = await User.findOne({ email }).select('+loginOtpHash +loginOtpExpires +loginOtpAttempts +password');
  if (!user || !user.isActive || !user.loginOtpHash || !user.loginOtpExpires) {
    throw new ApiError(401, 'Invalid or expired verification code');
  }
  if (user.loginOtpAttempts >= 5) {
    throw new ApiError(429, 'Too many verification attempts. Please request a new code.');
  }

  user.loginOtpAttempts += 1;
  const submittedHash = crypto.createHash('sha256').update(otp).digest('hex');
  
  let valid = false;
  try {
    valid = crypto.timingSafeEqual(Buffer.from(submittedHash), Buffer.from(user.loginOtpHash));
  } catch (err) {
    valid = false;
  }

  if (!valid || user.loginOtpExpires.getTime() < Date.now()) {
    await user.save({ validateBeforeSave: false });
    throw new ApiError(401, 'Invalid or expired verification code');
  }

  // Clear OTP and update last login
  user.loginOtpHash = undefined;
  user.loginOtpExpires = undefined;
  user.loginOtpAttempts = 0;
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    user: user.toSafeObject(),
  });
});

// @desc    Legacy OTP login (without password) - kept for backwards compatibility
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = asyncHandler(async (req, res) => {
  const email = req.body.email.toLowerCase();
  const { otp } = req.body;
  const user = await User.findOne({ email }).select('+loginOtpHash +loginOtpExpires +loginOtpAttempts');
  if (!user || !user.isActive || !user.loginOtpHash || !user.loginOtpExpires) {
    throw new ApiError(401, 'Invalid or expired OTP');
  }
  if (user.loginOtpAttempts >= 5) throw new ApiError(429, 'Too many OTP attempts. Request a new code.');
  user.loginOtpAttempts += 1;
  const submittedHash = crypto.createHash('sha256').update(otp).digest('hex');
  
  let valid = false;
  try {
    valid = crypto.timingSafeEqual(Buffer.from(submittedHash), Buffer.from(user.loginOtpHash));
  } catch (err) {
    valid = false;
  }

  if (!valid || user.loginOtpExpires.getTime() < Date.now()) {
    await user.save({ validateBeforeSave: false });
    throw new ApiError(401, 'Invalid or expired OTP');
  }

  user.loginOtpHash = undefined;
  user.loginOtpExpires = undefined;
  user.loginOtpAttempts = 0;
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });
  res.json({ success: true, message: 'Login successful', token: generateToken(user), user: user.toSafeObject() });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  }).select('+emailVerificationToken +emailVerificationExpires');

  if (!user) throw new ApiError(400, 'Email verification link is invalid or has expired');
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });
  res.json({ success: true, message: 'Email verified successfully. You can now log in.' });
});

const resendVerification = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+emailVerificationToken +emailVerificationExpires');
  const response = { success: true, message: 'If that account exists and is unverified, a verification email has been sent.' };
  if (!user || user.isEmailVerified) return res.json(response);

  const rawToken = crypto.randomBytes(32).toString('hex');
  user.emailVerificationToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  await user.save({ validateBeforeSave: false });
  await sendEmail({
    to: user.email,
    subject: 'Verify your Adhvaga email',
    text: `Verify your email within 24 hours: ${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${rawToken}`,
  });
  res.json(response);
});

// @desc    Log out (stateless JWT — client just discards the token)
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  // Nothing to invalidate server-side for a stateless JWT. This endpoint
  // exists so the frontend has a symmetric call to make (and so a future
  // refresh-token / cookie-based flow can hook in here without changing
  // the frontend contract).
  res.status(200).json({ success: true, message: 'Logged out' });
});

module.exports = {
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
};