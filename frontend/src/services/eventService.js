import api from './api';

export const getCommunityEvents = async (slug, status = 'OPEN') => {
  const response = await api.get(`/api/events/public/${slug}`, {
    params: status ? { status } : undefined,
  });
  return response.data;
};

export const getCommunityEventDetail = async (slug, eventId) => {
  const response = await api.get(`/api/events/public/${slug}/${eventId}`);
  return response.data;
};
