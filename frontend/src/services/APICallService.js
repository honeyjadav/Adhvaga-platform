import api from './api';
import { APIs } from '../constants/APIConstants';

// One place for every raw API call the app makes. Domain service files
// (auth.js, tours.js, etc.) call into this rather than hitting `api`
// directly, and handle mock-vs-real switching on top of it.
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
    // formData: { currentPassword, newPassword }
    // NOTE: backend route is PUT, not PATCH — matching that here.
    return api.put(APIs.CHANGE_PASSWORD, formData);
  }

  logout() {
    return api.post(APIs.LOGOUT);
  }

  getMe() {
    return api.get(APIs.GET_ME);
  }

  updateProfile(formData) {
    // formData: { name, phone } — backend route is PUT, not PATCH.
    return api.put(APIs.UPDATE_PROFILE, formData);
  }
}

export default new APICallService();