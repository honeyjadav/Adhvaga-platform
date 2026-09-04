import api, { USE_MOCK_API, mockDelay } from './api.js';
import { BOOKINGS } from '../data/mockData.js';

let bookingsStore = [...BOOKINGS];

export async function getMyBookings(userId) {
  if (USE_MOCK_API) {
    const results = bookingsStore.filter((b) => b.userId === userId);
    return mockDelay(results, 450);
  }
  const { data } = await api.get('/bookings/me');
  return data;
}

export async function getAllBookings() {
  if (USE_MOCK_API) {
    return mockDelay([...bookingsStore], 450);
  }
  const { data } = await api.get('/bookings');
  return data;
}

export async function createBooking(payload) {
  if (USE_MOCK_API) {
    const newBooking = {
      id: `b${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...payload,
    };
    bookingsStore = [newBooking, ...bookingsStore];
    return mockDelay(newBooking, 600);
  }
  const { data } = await api.post('/bookings', payload);
  return data;
}

export async function updateBookingStatus(id, status) {
  if (USE_MOCK_API) {
    bookingsStore = bookingsStore.map((b) => (b.id === id ? { ...b, status } : b));
    return mockDelay(bookingsStore.find((b) => b.id === id), 400);
  }
  const { data } = await api.patch(`/bookings/${id}/status`, { status });
  return data;
}
