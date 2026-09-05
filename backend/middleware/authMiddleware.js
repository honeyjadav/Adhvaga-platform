const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('./errorMiddleware');
const User = require('../models/User');

/**
 * Verifies the Bearer token sent by the frontend's axios interceptor
 * (Authorization: Bearer <token>) and attaches the authenticated user
 * to req.user. Throws 401 on missing/invalid/expired token, or if the
 * user no longer exists / has been deactivated.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized, no token provided');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new ApiError(401, 'Not authorized, user no longer exists');
  }
  if (!user.isActive) {
    throw new ApiError(403, 'This account has been deactivated');
  }

  req.user = user;
  next();
});

/**
 * Restricts a route to admins only. Must be used AFTER `protect`.
 * Usage: router.get('/admin-only', protect, adminOnly, handler)
 */
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new (require('./errorMiddleware').ApiError)(403, 'Admin access required'));
  }
  next();
};

module.exports = { protect, adminOnly };
