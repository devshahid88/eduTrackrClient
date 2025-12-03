import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_URL || 'http://localhost:3000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Request:', config.method?.toUpperCase(), config.url); // Debug log
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout:', error);
      return Promise.reject(new Error('Request timed out. Please try again.'));
    }
    
    if (error.response) {
      const { status, data } = error.response;
      const errorMessage = data?.message || data?.error || 'An error occurred';
      console.error(`API error [${status}]:`, {
        url: error.config?.url,
        message: errorMessage,
        data: data,
      });
      
      switch (status) {
        case 400:
          return Promise.reject(new Error(errorMessage));
        case 401:
          console.error('Unauthorized:', errorMessage);
          return Promise.reject(new Error('Unauthorized access. Please log in again.'));
        case 403:
          console.error('Forbidden:', errorMessage);
          return Promise.reject(new Error('Access forbidden.'));
        case 404:
          console.error('Not found:', errorMessage);
          return Promise.reject(new Error(errorMessage));
        case 409:
          console.error('Conflict:', errorMessage);
          return Promise.reject(new Error(errorMessage));
        case 500:
          console.error('Server error:', errorMessage);
          return Promise.reject(new Error('Server error. Please try again later.'));
        default:
          console.error('API error:', errorMessage);
          return Promise.reject(new Error(errorMessage));
      }
    }
    
    console.error('Unexpected error:', error.message);
    return Promise.reject(new Error(error.message || 'An unexpected error occurred'));
  }
);

export default axiosInstance;