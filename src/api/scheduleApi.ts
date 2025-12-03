import axiosInstance from './axiosInstance';
import { 
  ApiResponse, 
  Schedule, 
  Department, 
  Course, 
  Teacher, 
  WeeklyScheduleParams,
  MONGODB_ID_REGEX 
} from '../types';

// Get all schedules
export const getAllSchedules = async (): Promise<ApiResponse<Schedule[]>> => {
  try {
    const response = await axiosInstance.get('/api/schedules');
    return response.data;
  } catch (error: any) {
    console.error('getAllSchedules error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to fetch schedules');
  }
};

// Get schedules by department
export const getSchedulesByDepartment = async (departmentId: string): Promise<ApiResponse<Schedule[]>> => {
  try {
    if (!MONGODB_ID_REGEX.test(departmentId)) {
      throw new Error('Invalid department ID format');
    }
    const response = await axiosInstance.get(`/api/schedules/department/${departmentId}`);
    return response.data;
  } catch (error: any) {
    console.error('getSchedulesByDepartment error:', {
      departmentId,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });
    throw new Error(error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to fetch schedules by department');
  }
};

// Create a new schedule
export const createSchedule = async (scheduleData: Partial<Schedule>): Promise<ApiResponse<Schedule>> => {
  try {
    const response = await axiosInstance.post('/api/schedules/create', scheduleData);
    return response.data;
  } catch (error: any) {
    console.error('createSchedule error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to create schedule');
  }
};

// Update a schedule
export const updateSchedule = async (scheduleId: string, scheduleData: Partial<Schedule>): Promise<ApiResponse<Schedule>> => {
  try {
    if (!MONGODB_ID_REGEX.test(scheduleId)) {
      throw new Error('Invalid schedule ID format');
    }
    const response = await axiosInstance.put(`/api/schedules/${scheduleId}`, scheduleData);
    return response.data;
  } catch (error: any) {
    console.error('updateSchedule error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to update schedule');
  }
};

// Delete a schedule
export const deleteSchedule = async (scheduleId: string): Promise<ApiResponse<{ success: boolean }>> => {
  try {
    if (!MONGODB_ID_REGEX.test(scheduleId)) {
      throw new Error('Invalid schedule ID format');
    }
    const response = await axiosInstance.delete(`/api/schedules/${scheduleId}`);
    return response.data;
  } catch (error: any) {
    console.error('deleteSchedule error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to delete schedule');
  }
};

// Get all teachers
export const getAllTeachers = async (): Promise<ApiResponse<Teacher[]>> => {
  try {
    const response = await axiosInstance.get('/api/teachers');
    return response.data;
  } catch (error: any) {
    console.error('getAllTeachers error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to fetch teachers');
  }
};

// Get teachers by department
export const getTeachersByDepartment = async (departmentId: string): Promise<ApiResponse<Teacher[]>> => {
  try {
    if (!MONGODB_ID_REGEX.test(departmentId)) {
      throw new Error('Invalid department ID format');
    }
    const response = await axiosInstance.get(`/api/teachers/department/${departmentId}`);
    return response.data;
  } catch (error: any) {
    console.error('getTeachersByDepartment error:', {
      departmentId,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });
    if (error.response?.status === 404) {
      return { success: false, data: [], message: 'No teachers found for this department' };
    }
    throw new Error(error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to fetch teachers by department');
  }
};

// Get all departments
export const getAllDepartments = async (): Promise<ApiResponse<Department[]>> => {
  try {
    const response = await axiosInstance.get('/api/departments');
    return response.data;
  } catch (error: any) {
    console.error('getAllDepartments error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to fetch departments');
  }
};

// Get all courses
export const getAllCourses = async (): Promise<ApiResponse<Course[]>> => {
  try {
    const response = await axiosInstance.get('/api/courses');
    return response.data;
  } catch (error: any) {
    console.error('getAllCourses error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to fetch courses');
  }
};

// Get courses by department
export const getCoursesByDepartment = async (departmentId: string): Promise<ApiResponse<Course[]>> => {
  try {
    if (!MONGODB_ID_REGEX.test(departmentId)) {
      throw new Error('Invalid department ID format');
    }
    const response = await axiosInstance.get(`/api/courses/department/${departmentId}`);
    return response.data;
  } catch (error: any) {
    console.error('getCoursesByDepartment error:', {
      departmentId,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });
    throw new Error(error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to fetch courses by department');
  }
};

// Get schedule by ID
export const getScheduleById = async (scheduleId: string): Promise<ApiResponse<Schedule>> => {
  try {
    if (!MONGODB_ID_REGEX.test(scheduleId)) {
      throw new Error('Invalid schedule ID format');
    }
    const response = await axiosInstance.get(`/api/schedules/${scheduleId}`);
    return response.data;
  } catch (error: any) {
    console.error('getScheduleById error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to fetch schedule by ID');
  }
};

// Get weekly schedule
export const getWeeklySchedule = async ({ departmentId, weekStart }: WeeklyScheduleParams): Promise<ApiResponse<Schedule[]>> => {
  try {
    if (!MONGODB_ID_REGEX.test(departmentId)) {
      throw new Error('Invalid department ID format');
    }
    const response = await axiosInstance.get(`/api/schedules/weekly`, {
      params: { departmentId, weekStart },
    });
    return response.data;
  } catch (error: any) {
    console.error('getWeeklySchedule error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to fetch weekly schedule');
  }
};
