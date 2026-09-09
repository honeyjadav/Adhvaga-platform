import apiCallService from './APICallService.js';

export async function login({ email, password }) {
  const { data } = await apiCallService.login({ email, password });
  return data;
}

export async function verifyLoginOtp({ email, otp }) {
  const { data } = await apiCallService.verifyLoginOtp({ email, otp });
  return data;
}

export async function register({ name, email, password }) {
  const { data } = await apiCallService.register({ name, email, password });
  return data;
}

export async function fetchProfile() {
  const { data } = await apiCallService.getMe();
  return data;
}

export async function forgotPassword(email) {
  const { data } = await apiCallService.forgotPassword(email);
  return data;
}

export async function resetPassword({ token, newPassword }) {
  const { data } = await apiCallService.resetPassword({ token, newPassword });
  return data;
}

export async function requestOtp(email) {
  const { data } = await apiCallService.requestOtp(email);
  return data;
}

export async function verifyOtp({ email, otp }) {
  const { data } = await apiCallService.verifyOtp({ email, otp });
  return data;
}