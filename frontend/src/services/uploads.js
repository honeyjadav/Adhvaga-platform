import APICallService from './APICallService';

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await APICallService.uploadImage(formData);
  return data; // { url: '...' }
}