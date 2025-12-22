import axiosInstance from './axiosInstance';

export const resourceApi = {
  createResource: async (data: any) => {
    const response = await axiosInstance.post('/api/resources', data);
    return response.data;
  },
  
  getAllResources: async () => {
    const response = await axiosInstance.get('/api/resources');
    return response.data;
  },

  getResourceById: async (id: string) => {
    const response = await axiosInstance.get(`/api/resources/${id}`);
    return response.data;
  },

  updateResource: async (id: string, data: any) => {
    const response = await axiosInstance.put(`/api/resources/${id}`, data);
    return response.data;
  },

  deleteResource: async (id: string) => {
    const response = await axiosInstance.delete(`/api/resources/${id}`);
    return response.data;
  }
};
