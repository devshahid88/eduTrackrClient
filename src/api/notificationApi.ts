import axiosInstance from './axiosInstance';
import { ApiResponse, Notification, MONGODB_ID_REGEX } from '../types';

export const getNotifications = async (): Promise<ApiResponse<Notification[]>> => {
  try {
    console.log('Fetching notifications');
    const response = await axiosInstance.get('/api/notifications/');
    return response.data;
  } catch (error: any) {
    console.error('getNotifications error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
    });
    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch notifications'
    );
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<ApiResponse<Notification>> => {
  try {
    if (!MONGODB_ID_REGEX.test(notificationId)) {
      throw new Error('Invalid notification ID format');
    }
    const response = await axiosInstance.put(`/api/notifications/${notificationId}/read`);
    return response.data;
  } catch (error: any) {
    console.error('markNotificationAsRead error:', {
      notificationId,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });
    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to mark notification as read'
    );
  }
};

// Mark all notifications as read for the authenticated user
export const markAllNotificationsAsRead = async (): Promise<ApiResponse<{ success: boolean }>> => {
  try {
    const response = await axiosInstance.put('/api/notifications/read-all');
    return response.data;
  } catch (error: any) {
    console.error('markAllNotificationsAsRead error:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to mark all notifications as read'
    );
  }
};

// Delete a notification
export const deleteNotification = async (notificationId: string): Promise<ApiResponse<{ success: boolean }>> => {
  try {
    if (!MONGODB_ID_REGEX.test(notificationId)) {
      throw new Error('Invalid notification ID format');
    }
    const response = await axiosInstance.delete(`/api/notifications/${notificationId}`);
    return response.data;
  } catch (error: any) {
    console.error('deleteNotification error:', {
      notificationId,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });
    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to delete notification'
    );
  }
};
