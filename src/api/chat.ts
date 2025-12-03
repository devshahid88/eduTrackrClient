import axiosInstance from './axiosInstance';
import { ChatListItem, ChatMessage } from '../types/features/chat';

export const fetchTeachersByDept = (deptId: string) =>
  axiosInstance.get(`/teachers?department=${deptId}`);

export const fetchChatList = (userId: string) =>
  axiosInstance.get<ChatListItem[]>(`/api/messages/chatlist`, { params: { userId } });

export const fetchMessages = (chatId: string, userId: string) =>
  axiosInstance.get<ChatMessage[]>(`/api/messages/${chatId}`, { params: { userId } });

export const uploadMedia = (
  formData: FormData,
  onProgress: (pct: number) => void
) =>
  axiosInstance.post('/api/messages/upload', formData, {
    onUploadProgress(e) {
      if (typeof e.total === 'number' && e.total > 0) {
        onProgress(Math.round((e.loaded * 100) / e.total));
      }    }
  });

export const sendHttpMessage = (formData: FormData) =>
  axiosInstance.post<ChatMessage>('/api/messages/send', formData);
