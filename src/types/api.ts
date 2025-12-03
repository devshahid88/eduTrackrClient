import { ApiResponse, BaseEntity } from './common';

// Remove the duplicate Schedule, Department, Course, Teacher interfaces
// Import them from schedule-management instead

// Keep only the general API types here
export interface Notification extends BaseEntity {
  _id: string;
  userId: string;
  userModel: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  sender: string;
  senderModel: string;
  role: string;
  data: any;
  timestamp: string;
}

// API Response Types for other entities
export type NotificationListResponse = ApiResponse<Notification[]>;

// Request Parameter Types for other features
export interface WeeklyScheduleParams {
  departmentId: string;
  weekStart: string;
}

// Auth Types
export interface RefreshTokenResponse {
  data: {
    accessToken: string;
  };
}

export interface ApiErrorResponse {
  message: string;
}

// Re-export schedule types for convenience
export type { 
  Schedule, 
  Department, 
  Course, 
  Teacher,
  ScheduleFormData,
  CreateSchedulePayload 
} from './features/schedule-management';
