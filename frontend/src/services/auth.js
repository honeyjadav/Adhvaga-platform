import api, { USE_MOCK_API, mockDelay } from './api.js';
import { USERS } from '../data/mockData.js';

function mockToken(user) {
  return `mock-jwt-${user.id}-${Date.now()}`;
}

export async function login({ email, password }) {
  if (USE_MOCK_API) {
    await mockDelay(null, 500);
    const user = USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.password !== password) {
      throw new Error('Invalid email or password');
    }
    const { password: _pw, ...safeUser } = user;
    return { user: safeUser, token: mockToken(user) };
  }
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

export async function register({ name, email, password, role = 'user' }) {
  if (USE_MOCK_API) {
    await mockDelay(null, 600);
    const exists = USERS.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      throw new Error('An account with this email already exists');
    }
    const newUser = {
      id: `u${USERS.length + 1}`,
      name,
      email,
      role,
      wishlist: [],
    };
    USERS.push({ ...newUser, password });
    return { user: newUser, token: mockToken(newUser) };
  }
  const { data } = await api.post('/auth/register', { name, email, password, role });
  return data;
}

export async function fetchProfile() {
  if (USE_MOCK_API) {
    return mockDelay(null, 300);
  }
  const { data } = await api.get('/auth/me');
  return data;
}
