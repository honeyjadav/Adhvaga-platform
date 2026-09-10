export const APIs = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  CHANGE_PASSWORD: '/auth/change-password',
  LOGOUT: '/auth/logout',
  GET_ME: '/auth/me',
  UPDATE_PROFILE: '/auth/profile',

  // Tours
  TOURS: '/tours',
  FEATURED_TOURS: '/tours/featured',
  TOUR_BY_ID: (id) => `/tours/${id}`,
  TOUR_AVAILABILITY: (id) => `/tours/${id}/availability`,

  // Bookings
  MY_BOOKINGS: '/bookings/me',
  BOOKINGS: '/bookings',
  BOOKING_STATUS: (id) => `/bookings/${id}/status`,

  // Reviews
  REVIEWS: '/reviews',

  // Payments
  CREATE_PAYMENT_INTENT: '/payments/create-intent',
  CONFIRM_PAYMENT: '/payments/confirm',

  // Upload
  UPLOAD_IMAGE: '/upload',

  // Admin
  ADMIN_STATS: '/admin/stats',
};