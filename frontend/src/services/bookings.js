import APICallService from './APICallService';

export async function getMyBookings() {
  const { data } = await APICallService.getMyBookings();
  return data;
}

export async function getAllBookings() {
  const { data } = await APICallService.getAllBookings();
  return data;
}

// payload for fixed tours:    { tourId, departureId, travelers, totalPrice }
// payload for flexible tours: { tourId, date, travelers, totalPrice }
export async function createBooking(payload) {
  const { data } = await APICallService.createBooking(payload);
  return data;
}

export async function updateBookingStatus(id, status) {
  const { data } = await APICallService.updateBookingStatus(id, status);
  return data;
}