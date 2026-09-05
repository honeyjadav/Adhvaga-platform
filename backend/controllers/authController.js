const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');
const { ApiError } = require('../middleware/errorMiddleware');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  // NOTE: this demo app lets the register form pick "user" or "admin" per
  // the product spec. In a real production system you would NOT trust a
  // client-supplied role for anything beyond "user" — admin accounts would
  // be provisioned separately (invite, seed script, or promoted by an
  // existing admin). Left open here to match the requested UX.
  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: role === 'admin' ? 'admin' : 'user',
  });

  const token = generateToken(user);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    token,
    user: user.toSafeObject(),
  });
});

// @desc    Log in an existing user
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

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

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
  logout,
};
