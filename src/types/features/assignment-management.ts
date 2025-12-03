import { ApiResponse, BaseEntity } from '../common';
import { Department } from './department-management';  // ✅ Import Department
// import { Course as CourseType } from './course-management'; // optional: if you split Course out

// Core Entities
export interface Assignment extends BaseEntity {
  _id: string;
  title: string;
  description: string;
  instructions?: string;
  dueDate: string; // ISO date string
  createdAt?: string;
  updatedAt?: string;
  maxMarks: number;
  maxPoints?: number; // Alternative field name
  courseName?: string;
  courseId?: string | Course;
  departmentName?: string;
  departmentId?: string | Department;
  teacherId: string | Teacher;
  teacherName?: string;
  submissionFormat?: string;
  attachments?: Attachment[];
  allowLateSubmission?: boolean;
  isActive: boolean;
  submissions?: Submission[];
  semester?: string;
  class?: string;
}

// Submission
export interface Submission extends BaseEntity {
  _id: string;
  assignmentId: string;
  studentId: string;
  studentName?: string;
  submittedAt: string;
  isLate: boolean;
  grade?: number;
  feedback?: string;
  attachments: Attachment[];
  submissionText?: string;
  status: SubmissionStatus;
}

// Attachment
export interface Attachment {
  _id?: string;
  name: string;
  originalName?: string;
  url: string;
  size?: number;
  mimeType?: string;
  uploadedAt?: string;
}

// Teacher
export interface Teacher extends BaseEntity {
  _id: string;
  name?: string;
  username: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  department?: string;
}

// Course (deduplicated)
export interface Course extends BaseEntity {
  _id: string;
  name: string;
  code: string;
  semester: number;
  departmentId: string;
  credits: number; // Added semicolon
}

// Enums and Types
export type SubmissionStatus = 'pending' | 'submitted' | 'graded' | 'late' | 'rejected';
export type AssignmentStatus = 'draft' | 'published' | 'closed' | 'archived';
export type AssignmentPriority = 'low' | 'medium' | 'high' | 'urgent';

// Filters
export interface AssignmentFilters {
  course?: string;
  department?: string;
  status?: AssignmentFilterStatus;
  sortBy?: AssignmentSortBy;
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
  teacher?: string;
  isLate?: boolean;
}

export type AssignmentFilterStatus =
  | 'all'
  | 'pending'
  | 'submitted'
  | 'overdue'
  | 'upcoming'
  | 'active'
  | 'expired';

export type AssignmentSortBy =
  | 'dueDate'
  | 'createdAt'
  | 'title'
  | 'course'
  | 'marks';

// Form Data Types
export interface CreateAssignmentData {
  title: string;
  description: string;
  instructions?: string;
  dueDate: string;
  maxMarks: number;
  courseId: string;
  departmentId: string;
  submissionFormat: string;
  allowLateSubmission: boolean;
  attachments?: File[];
}

export interface SubmitAssignmentData {
  assignmentId: string;
  submissionText?: string;
  files?: File[];
}

// API Response Types
export type AssignmentsResponse = ApiResponse<Assignment[]>;
export type AssignmentResponse = ApiResponse<Assignment>;
export type SubmissionResponse = ApiResponse<Submission>;
export type SubmissionsResponse = ApiResponse<Submission[]>;

// Statistics
export interface AssignmentStats {
  total: number;
  pending: number;
  submitted: number;
  overdue: number;
  graded: number;
  averageGrade?: number;
  submissionRate: number;
}
