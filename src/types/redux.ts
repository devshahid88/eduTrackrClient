import { User } from './common';
import { Schedule as APISchedule, Notification as APINotification } from './api';

// Redux State Types
export interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

export interface ScheduleState {
  schedules: APISchedule[];
  weeklySchedule: APISchedule[];
  selectedDepartment: string | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface NotificationState {
  notifications: APINotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

// Redux Action Payload Types
export interface LoginSuccessPayload {
  accessToken: string;
  user: User;
}

export interface UpdateScheduleArgs {
  scheduleId: string;
  scheduleData: Partial<APISchedule>;
}

export interface WeeklyScheduleArgs {
  departmentId: string;
  weekStart: string;
}

// Axios Config Extension
export interface CustomAxiosRequestConfig {
  _retry?: boolean;
}

