import api, { USE_MOCK_API, mockDelay } from './api.js';
import { REVIEWS } from '../data/mockData.js';

let reviewsStore = [...REVIEWS];

export async function getReviewsByTour(tourId) {
  if (USE_MOCK_API) {
    const results = reviewsStore.filter((r) => r.tourId === tourId);
    return mockDelay(results, 400);
  }
  const { data } = await api.get(`/reviews`, { params: { tourId } });
  return data;
}

export async function createReview({ tourId, userName, rating, comment }) {
  if (USE_MOCK_API) {
    const newReview = {
      id: `r${Date.now()}`,
      tourId,
      userName,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };
    reviewsStore = [newReview, ...reviewsStore];
    return mockDelay(newReview, 500);
  }
  const { data } = await api.post('/reviews', { tourId, rating, comment });
  return data;
}
