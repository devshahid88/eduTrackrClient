import { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import axiosInstance from './axiosInstance';
import store from '../redux/store';
import { RefreshTokenResponse, ApiErrorResponse, CustomAxiosRequestConfig } from '../types';

export const refreshToken = async (): Promise<string | null> => {
  try {
    const response: AxiosResponse<RefreshTokenResponse> = await axiosInstance.post(
      "/auth/refresh-token", 
      {}, 
      { 
        withCredentials: true 
      }
    );
    
    const newAccessToken = response.data.data.accessToken;
    console.log(response.data.data);
    console.log('new accesstoken', newAccessToken);
    
    // Update localStorage immediately
    localStorage.setItem('accessToken', newAccessToken);
    
    return newAccessToken;
  } catch (error) {
    console.error("Refresh token request failed", error);
    
    // Clear everything on refresh failure
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    
    return null;
  }
};

export const setupInterceptor = (axiosInstance: AxiosInstance): void => {
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Try to get token from Redux first, then localStorage
      const state = store.getState();
      let token = state.auth.accessToken;
      
      if (!token) {
        token = localStorage.getItem('accessToken');
      }
      
      if (token) {
        // Use standard header assignment
        config.headers.Authorization = `Bearer ${token.trim()}`;
        console.log(`[Axios Interceptor] Added token to ${config.url}`);
      } else {
        console.warn(`[Axios Interceptor] No token found for ${config.url}`);
      }
      return config;
    },

    (error: AxiosError) => {
      console.error("Axios request interceptor error", error);
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError<ApiErrorResponse>) => {
      const originalRequest = error.config as CustomAxiosRequestConfig & InternalAxiosRequestConfig;

      if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh-token') {
        originalRequest._retry = true;

        try {
          console.log('Token expired! Attempting to refresh...');
          const newAccessToken = await refreshToken();

          if (newAccessToken) {
            store.dispatch({ type: 'auth/refreshTokenSuccess', payload: newAccessToken });
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axiosInstance(originalRequest);
          } else {
            throw new Error('Token refresh failed');
          }
        } catch (refreshError) {
          console.error("Token refresh failed, logging out...", refreshError);
          store.dispatch({ type: 'auth/logout' });
          window.location.href = "/auth/student-login";
          return Promise.reject(refreshError);
        }
      }

      if (error.response?.status === 403 && 
          error.response.data?.message === 'Access denied. Your account has been blocked.') {
        alert("Your account has been blocked. Please contact support.");
        store.dispatch({ type: 'auth/logout' });
        window.location.href = "/auth/student-login";
      }

      return Promise.reject(error);
    }
  );
};
