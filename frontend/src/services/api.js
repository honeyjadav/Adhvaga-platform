import axios from 'axios';
import { store } from '../redux/store.js';
import { logout } from '../redux/slices/authSlice.js';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Flip this off once a real backend is wired up. Every service function
// checks this flag and falls back to local mock data so the whole app
// works standalone during frontend development.
export const USE_MOCK_API = (import.meta.env.VITE_USE_MOCK_API ?? 'false') === 'true';

// Per-domain override: lets one API (e.g. auth) go live against the real
// backend while others stay on mock data until they're built. Falls back
// to the global USE_MOCK_API flag if the specific var isn't set.
function resolveMockFlag(envVar) {
  const value = import.meta.env[envVar];
  if (value === undefined) return USE_MOCK_API;
  return value === 'true';
}

export const USE_MOCK_AUTH = resolveMockFlag('VITE_USE_MOCK_AUTH');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach the JWT (if present) to every outgoing request.
api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize errors and force logout on 401s from a real backend.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      store.dispatch(logout());
    }
    const message =
      error.response?.data?.message || error.message || 'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);

// Small helper to fake network latency for the mock layer so loading
// states are visible and feel realistic during development.
export const mockDelay = (data, ms = 500) =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms));

export default api;
