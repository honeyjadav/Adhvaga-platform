import api from './api';
import { APIs } from '../constants/APIConstants';

class APICallService {
  // ---- Auth ----
  login(formData) {
    return api.post(APIs.LOGIN, formData);
  }

  register(formData) {
    return api.post(APIs.REGISTER, formData);
  }

  forgotPassword(email) {
    return api.post(APIs.FORGOT_PASSWORD, { email });
  }

  resetPassword(formData) {
    // formData: { token, newPassword }
    return api.post(APIs.RESET_PASSWORD, formData);
  }

  verifyEmail(token) {
    return api.get(`/auth/verify-email/${token}`);
  }

  resendVerification(email) {
    return api.post('/auth/resend-verification', { email });
  }

  requestOtp(email) {
    return api.post('/auth/request-otp', { email });
  }

  verifyOtp(formData) {
    return api.post('/auth/verify-otp', formData);
  }

  verifyLoginOtp(formData) {
    return api.post('/auth/verify-login-otp', formData);
  }

  changePassword(formData) {
    return api.put(APIs.CHANGE_PASSWORD, formData);
  }

  logout() {
    return api.post(APIs.LOGOUT);
  }

  getMe() {
    return api.get(APIs.GET_ME);
  }

  updateProfile(formData) {
    return api.put(APIs.UPDATE_PROFILE, formData);
  }

  // ---- Tours ----
  getTours(params) {
    return api.get(APIs.TOURS, { params });
  }

  getFeaturedTours() {
    return api.get(APIs.FEATURED_TOURS);
  }

  getTourById(id) {
    return api.get(APIs.TOUR_BY_ID(id));
  }

  getTourAvailability(id, params) {
    return api.get(APIs.TOUR_AVAILABILITY(id), { params });
  }

  createTour(payload) {
    return api.post(APIs.TOURS, payload);
  }

  updateTour(id, payload) {
    return api.put(APIs.TOUR_BY_ID(id), payload);
  }

  deleteTour(id) {
    return api.delete(APIs.TOUR_BY_ID(id));
  }

  // ---- Bookings ----
  getMyBookings() {
    return api.get(APIs.MY_BOOKINGS);
  }

  getAllBookings() {
    return api.get(APIs.BOOKINGS);
  }

  createBooking(payload) {
    return api.post(APIs.BOOKINGS, payload);
  }

  updateBookingStatus(id, status) {
    return api.patch(APIs.BOOKING_STATUS(id), { status });
  }

  // ---- Reviews ----
  getReviewsByTour(tourId) {
    return api.get(APIs.REVIEWS, { params: { tourId } });
  }

  createReview(payload) {
    return api.post(APIs.REVIEWS, payload);
  }

  // ---- Payments ----
  createPaymentIntent(payload) {
    return api.post(APIs.CREATE_PAYMENT_INTENT, payload);
  }

  confirmPayment(payload) {
    return api.post(APIs.CONFIRM_PAYMENT, payload);
  }

   uploadImage(formData) {
    return api.post(APIs.UPLOAD_IMAGE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

    // ---- Admin ----
  getDashboardStats() {
    return api.get(APIs.ADMIN_STATS);
  }
}

export default new APICallService();