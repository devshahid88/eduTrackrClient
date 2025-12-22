import axiosInstance from './axiosInstance';

export const announcementApi = {
  createAnnouncement: async (data: any) => {
    const response = await axiosInstance.post('/api/announcements', data);
    return response.data;
  },
  
  getAllAnnouncements: async () => {
    const response = await axiosInstance.get('/api/announcements');
    return response.data;
  },

  getAnnouncementById: async (id: string) => {
    const response = await axiosInstance.get(`/api/announcements/${id}`);
    return response.data;
  },

  updateAnnouncement: async (id: string, data: any) => {
    const response = await axiosInstance.put(`/api/announcements/${id}`, data);
    return response.data;
  },

  deleteAnnouncement: async (id: string) => {
    const response = await axiosInstance.delete(`/api/announcements/${id}`);
    return response.data;
  }
};
