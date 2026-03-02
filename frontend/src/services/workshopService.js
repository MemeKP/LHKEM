import api from './api';

export const workshopService = {
  getAllWorkshops: async () => {
    const response = await api.get('/workshops');
    return response.data;
  },

  getWorkshopById: async (id) => {
    const response = await api.get(`/workshops/${id}`);
    return response.data;
  },

  registerForWorkshop: async (registrationData) => {
    const response = await api.post('/enroll', registrationData);
    return response.data;
  },

  incrementView: async (id) => {
    const response = await api.patch(`/workshops/${id}/view`);
    return response.data;
  }
};