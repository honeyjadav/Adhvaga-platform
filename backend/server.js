require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
connectDB();

const app = express();

// Core middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Adhvaga API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
// Next up (not yet built): tours, bookings, payments, reviews
// app.use('/api/tours', require('./routes/tourRoutes'));
// app.use('/api/bookings', require('./routes/bookingRoutes'));
// app.use('/api/payments', require('./routes/paymentRoutes'));
// app.use('/api/reviews', require('./routes/reviewRoutes'));

// 404 + error handling (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
