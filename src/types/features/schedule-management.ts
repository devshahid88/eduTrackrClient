import { ApiResponse, BaseEntity, User } from '../common';
export interface Schedule extends BaseEntity {
  _id: string;
  departmentId: Department | string;
  courseId: Course | string;
  teacherId: Teacher | string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  semester: string;
    room?: string; 
  link?: string;
  isLive?: boolean;
  createdAt: string;
  updatedAt: string;
  courseName?: string;
  courseCode?: string;
  teacherName?: string;
  departmentName?: string;
}

// Related Entity Types
export interface Department extends BaseEntity {
  _id: string;
  name: string;
  code: string;
  active: boolean;
   establishedDate?: string;
  headOfDepartment?: string;
  departmentEmail?: string;
  departmentPhone?: string;
}

export interface Course extends BaseEntity {
  _id: string;
  name: string;
  code: string;
  departmentId: string;
  semester?: string;
  credits?: number;
}

export interface Teacher extends BaseEntity {
  _id: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  department: string;
}

// Schedule Form Types
export interface ScheduleFormData {
  departmentId: string;
  courseId: string;
  teacherId: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  semester: string;
  link?: string;
}

export interface CreateScheduleRequest extends ScheduleFormData {}
export interface UpdateScheduleRequest extends Partial<ScheduleFormData> {}

// Schedule Validation Types
export interface ScheduleFormErrors {
  departmentId?: string;
  courseId?: string;
  teacherId?: string;
  day?: string;
  startTime?: string;
  endTime?: string;
  semester?: string;
  general?: string;
}

// Filter Types
export interface ScheduleFilters {
  department?: string;
  day?: DayOfWeek;
  semester?: string;
  teacher?: string;
  searchTerm?: string;
}

// Calendar Types
export interface CalendarTimeSlot {
  time: string;
  schedules: Schedule[];
}

export interface CalendarDay {
  day: DayOfWeek;
  timeSlots: CalendarTimeSlot[];
}

export interface WeeklyCalendarData {
  days: CalendarDay[];
  stats: ScheduleStats;
}

// Statistics Types
export interface ScheduleStats {
  totalClasses: number;
  activeDepartments: number;
  activeCourses: number;
  activeTeachers: number;
  classesByDay: Record<DayOfWeek, number>;
  classesByDepartment: Record<string, number>;
}

// Utility Types
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface ScheduleDetails {
  courseCode: string;
  courseName: string;
  teacherName: string;
  departmentName: string;
  semester: string;
  timeRange: string;
}

// API Response Types
export type ScheduleResponse = ApiResponse<Schedule>;
export type SchedulesResponse = ApiResponse<Schedule[]>;
export type DepartmentsResponse = ApiResponse<Department[]>;
export type CoursesResponse = ApiResponse<Course[]>;
export type TeachersResponse = ApiResponse<Teacher[]>;

// Time Utility Types
export interface TimeSlotConfig {
  startHour: number;
  endHour: number;
  intervalMinutes: number;
}

export interface TimeRange {
  start: string;
  end: string;
  durationMinutes: number;
}

export interface ScheduleFormData {
  department: string;    // ✅ Form field name (not departmentId)
  course: string;        // ✅ Form field name (not courseId) 
  teacher: string;       // ✅ Form field name (not teacherId)
  day: DayOfWeek;        // ✅ Already correct
  startTime: string;     // ✅ Already correct
  endTime: string;       // ✅ Already correct
}

// Schedule Form Errors (Updated to match form fields)
export interface ScheduleFormErrors {
  department?: string;   // ✅ Matches form field
  course?: string;       // ✅ Matches form field
  teacher?: string;      // ✅ Matches form field
  day?: string;
  startTime?: string;
  endTime?: string;
  general?: string;
}

// API Payload (Separate from form data)
export interface CreateSchedulePayload {
  departmentId: string;  // ✅ API expects this format
  courseId: string;      // ✅ API expects this format
  teacherId: string;     // ✅ API expects this format
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  semester: string;
}

// Update Payload (for editing)
export interface UpdateSchedulePayload extends Partial<CreateSchedulePayload> {
  _id: string;
}

// Form Validation Rules
export interface ValidationRule {
  required?: boolean;
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  custom?: (value: string, formData: ScheduleFormData) => string | null;
}

export interface ScheduleFormConfig {
  fields: Record<keyof ScheduleFormData, ValidationRule>;
}

// API Integration Types
export interface CreateSchedulePayload {
  departmentId: string;
  courseId: string;
  teacherId: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  semester: string;
}
