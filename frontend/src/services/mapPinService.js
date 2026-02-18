import api from './api';

export const fetchCommunityMap = async (communityId) => {
  const response = await api.get(`/api/communities/${communityId}/communitymap`);
  return response.data;
};

export const saveShopMapPin = async ({ position_x, position_y }) => {
  const response = await api.post('/api/shops/map-pin', {
    position_x,
    position_y,
  });
  return response.data;
};

export const getMyShopMapPin = async () => {
  const response = await api.get('/api/shops/map-pin/me');
  return response.data;
};

export const getShopPinForAdmin = async (shopId) => {
  const response = await api.get(`/api/admin/shop-pins/${shopId}`);
  return response.data;
};

export const approveMapPin = async (pinId) => {
  const response = await api.put(`/api/admin/map-pins/${pinId}/approve`);
  return response.data;
};
