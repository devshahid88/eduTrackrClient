import { ApiResponse, BaseEntity} from '../common';

// Core Entity
export interface Course extends BaseEntity {
  _id: string;            // MongoDB id
  id: string;             // same as _id for convenience
  name: string;
  code: string;
  departmentId: string;
  semester: number;
  credits: number;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

// DTOs
export type CreateCourseRequest = Omit<
  Course,
  '_id' | 'id' | 'createdAt' | 'updatedAt'
>;
export type UpdateCourseRequest = Partial<CreateCourseRequest> & { _id: string };

// API response types
export type CourseListResponse   = ApiResponse<Course[]>;
export type CourseResponse       = ApiResponse<Course>;

// Filters & Sorting
export interface CourseFilters {
  department?: string;
  semester?: number;
  searchTerm?: string;
}

export type CourseSortBy = 'name' | 'code' | 'semester' | 'credits';
