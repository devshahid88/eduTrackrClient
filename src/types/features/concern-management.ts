import { BaseEntity, User } from '../common';

// Consolidated Concern Types
export type ConcernStatus = 'pending' | 'in_progress' | 'solved' | 'rejected';
export type ConcernType = 'Academic' | 'Administrative';
export type UserRole = 'student' | 'teacher' | 'admin';

// Main Concern Interface (Consolidated)
export interface Concern extends BaseEntity {
  _id: string;
  title: string;
  description: string;
  type: ConcernType;
  createdBy: User;
  createdByRole: UserRole;
  status: ConcernStatus;
  feedback?: string;
  createdAt: string;
  updatedAt?: string;
}

// API Request/Response Types
export interface CreateConcernRequest {
  title: string;
  description: string;
  type: ConcernType;
}

export interface UpdateConcernRequest {
  _id: string;
  status: ConcernStatus;
  feedback?: string;
}

export interface ConcernFilters {
  status?: ConcernStatus;
  type?: ConcernType;
  role?: UserRole;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Concern Statistics
export interface ConcernStats {
  total: number;
  pending: number;
  inProgress: number;
  solved: number;
  rejected: number;
  byType: {
    academic: number;
    administrative: number;
  };
  byRole: {
    student: number;
    teacher: number;
  };
}
