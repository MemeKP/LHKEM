import api from './api';

/**
 * Shop Service - API calls for shop-related operations
 */

// Get shop by ID (public view)
export const getShopById = async (shopId) => {
  const response = await api.get(`/api/shops/${shopId}`);
  return response.data;
};

// Get my shop (owner view)
export const getMyShop = async () => {
  const response = await api.get('/api/shops/me');
  return response.data;
};

// Get shops by community ID
export const getShopsByCommunity = async (communityId) => {
  const response = await api.get(`/api/shops/community/${communityId}`);
  return response.data;
};

// Get all shops by community ID (admin view)
export const getAdminShopsByCommunity = async (communityId) => {
  const response = await api.get(`/api/shops/community/${communityId}/all`);
  return response.data;
};

// Create new shop
export const createShop = async (shopData) => {
  const response = await api.post('/api/shops', shopData);
  return response.data;
};

// Update shop
export const updateShop = async (shopId, shopData) => {
  const response = await api.put(`/api/shops/${shopId}`, shopData);
  return response.data;
};

export const uploadShopImage = async (shopId, field, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post(`/api/shops/${shopId}/images/${field}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Get pending shops (admin only)
export const getPendingShops = async (communityId) => {
  const response = await api.get(`/api/shops/community/${communityId}/pending`);
  return response.data;
};

// Approve shop (admin only)
export const approveShop = async (shopId) => {
  const response = await api.put(`/api/shops/${shopId}/approve`);
  return response.data;
};

// Reject shop (admin only)
export const rejectShop = async (shopId) => {
  const response = await api.put(`/api/shops/${shopId}/reject`);
  return response.data;
};

// Get shop detail for admins (full data)
export const getShopForAdmin = async (shopId) => {
  const response = await api.get(`/api/shops/${shopId}/admin`);
  return response.data;
};
