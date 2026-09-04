import api, { USE_MOCK_API, mockDelay } from './api.js';
import { TOURS } from '../data/mockData.js';

// In-memory mutable copy so admin CRUD operations persist for the session.
let toursStore = [...TOURS];

export async function getTours(filters = {}) {
  if (USE_MOCK_API) {
    let results = [...toursStore];
    const { search, category, minPrice, maxPrice, minRating, minDuration, maxDuration, sortBy } = filters;

    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (t) => t.title.toLowerCase().includes(q) || t.destination.toLowerCase().includes(q)
      );
    }
    if (category) {
      results = results.filter((t) => t.category === category);
    }
    if (minPrice != null) results = results.filter((t) => t.price >= minPrice);
    if (maxPrice != null) results = results.filter((t) => t.price <= maxPrice);
    if (minRating != null) results = results.filter((t) => t.rating >= minRating);
    if (minDuration != null) results = results.filter((t) => t.duration >= minDuration);
    if (maxDuration != null) results = results.filter((t) => t.duration <= maxDuration);

    switch (sortBy) {
      case 'price_asc':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'rating_desc':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }
    return mockDelay(results, 500);
  }
  const { data } = await api.get('/tours', { params: filters });
  return data;
}

export async function getTourById(id) {
  if (USE_MOCK_API) {
    const tour = toursStore.find((t) => t.id === id);
    if (!tour) throw new Error('Tour not found');
    return mockDelay(tour, 400);
  }
  const { data } = await api.get(`/tours/${id}`);
  return data;
}

export async function getFeaturedTours() {
  if (USE_MOCK_API) {
    const featured = [...toursStore].sort((a, b) => b.rating - a.rating).slice(0, 4);
    return mockDelay(featured, 500);
  }
  const { data } = await api.get('/tours/featured');
  return data;
}

export async function createTour(payload) {
  if (USE_MOCK_API) {
    const newTour = {
      id: `t${Date.now()}`,
      rating: 0,
      reviewCount: 0,
      gallery: payload.heroImage ? [payload.heroImage] : [],
      itinerary: payload.itinerary || [],
      createdAt: new Date().toISOString(),
      ...payload,
    };
    toursStore = [newTour, ...toursStore];
    return mockDelay(newTour, 500);
  }
  const { data } = await api.post('/tours', payload);
  return data;
}

export async function updateTour(id, payload) {
  if (USE_MOCK_API) {
    toursStore = toursStore.map((t) => (t.id === id ? { ...t, ...payload } : t));
    const updated = toursStore.find((t) => t.id === id);
    return mockDelay(updated, 500);
  }
  const { data } = await api.put(`/tours/${id}`, payload);
  return data;
}

export async function deleteTour(id) {
  if (USE_MOCK_API) {
    toursStore = toursStore.filter((t) => t.id !== id);
    return mockDelay({ success: true }, 400);
  }
  const { data } = await api.delete(`/tours/${id}`);
  return data;
}
