import APICallService from './APICallService';

export async function getTours(params) {
  const { data } = await APICallService.getTours(params);
  return data;
}

export async function getTourById(id) {
  const { data } = await APICallService.getTourById(id);
  return data;
}

export async function getFeaturedTours() {
  const { data } = await APICallService.getFeaturedTours();
  return data;
}

// Returns either { bookingType: 'fixed', departures: [...] }
// or { bookingType: 'flexible', dailyCapacity, availableFrom, availableUntil, blackoutDates, bookedByDate }
export async function getTourAvailability(id, params = {}) {
  const { data } = await APICallService.getTourAvailability(id, params);
  return data;
}

export async function createTour(payload) {
  const { data } = await APICallService.createTour(payload);
  return data;
}

export async function updateTour(id, payload) {
  const { data } = await APICallService.updateTour(id, payload);
  return data;
}

export async function deleteTour(id) {
  const { data } = await APICallService.deleteTour(id);
  return data;
}