import { ApiResponse, BaseEntity } from '../common';

// Department Types
export interface Department extends BaseEntity {
  _id: string;
  name: string;
  code: string;
  establishedDate?: string;
  headOfDepartment?: string;
  departmentEmail?: string;
  departmentPhone?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Form Data Types
export interface DepartmentFormData {
  name: string;
  code: string;
  establishedDate: string;
  headOfDepartment: string;
  departmentEmail: string;
  departmentPhone: string;
  active: boolean;
}

export interface CreateDepartmentRequest extends DepartmentFormData {}
export interface UpdateDepartmentRequest extends Partial<DepartmentFormData> {}

// Validation Types
export interface DepartmentFormErrors {
  name?: string;
  code?: string;
  establishedDate?: string;
  headOfDepartment?: string;
  departmentEmail?: string;
  departmentPhone?: string;
  general?: string;
}

// API Response Types
export type DepartmentResponse = ApiResponse<Department>;
export type DepartmentsResponse = ApiResponse<Department[]>;

// Department Statistics
export interface DepartmentStats {
  total: number;
  active: number;
  inactive: number;
  recentlyCreated: number;
  averageCoursesPerDepartment: number;
}
