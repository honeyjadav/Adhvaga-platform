import APICallService from './APICallService';

export async function getReviewsByTour(tourId) {
  const { data } = await APICallService.getReviewsByTour(tourId);
  return data;
}

export async function createReview({ tourId, rating, comment }) {
  const { data } = await APICallService.createReview({ tourId, rating, comment });
  return data;
}