const Tour = require('../models/Tour');
const Booking = require('../models/Booking');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Aggregate dashboard stats for the admin overview tab —
//          computed live from the database, no static/mock numbers.
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalTours, totalUsers, totalBookings, revenueResult, monthlyRevenue] = await Promise.all([
    Tour.countDocuments(),
    User.countDocuments(),
    Booking.countDocuments({ status: { $ne: 'cancelled' } }),

    // Total revenue from confirmed (paid) bookings only
    Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),

    // Revenue grouped by month, for the last 6 months, confirmed bookings only
    Booking.aggregate([
      {
        $match: {
          status: 'confirmed',
          createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 5, 1)) },
        },
      },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ]);

  const totalRevenue = revenueResult[0]?.total || 0;

  const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Build a full 6-month timeline (including months with ₹0 revenue) so the
  // chart always shows 6 bars, not just the months that happen to have data.
  const now = new Date();
  const timeline = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    timeline.push({ year: d.getFullYear(), month: d.getMonth() + 1, label: MONTH_LABELS[d.getMonth()] });
  }

  const revenueByKey = Object.fromEntries(
    monthlyRevenue.map((m) => [`${m._id.year}-${m._id.month}`, m.revenue])
  );

  const monthlyRevenueSeries = timeline.map((t) => ({
    month: t.label,
    revenue: revenueByKey[`${t.year}-${t.month}`] || 0,
  }));

  res.json({
    totalRevenue,
    totalBookings,
    totalTours,
    totalUsers,
    monthlyRevenue: monthlyRevenueSeries,
  });
});

module.exports = { getDashboardStats };