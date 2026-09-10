import APICallService from './APICallService';

export async function getDashboardStats() {
  const { data } = await APICallService.getDashboardStats();
  return data;
}