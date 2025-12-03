import React from 'react';
import { Assignment, Submission, AssignmentFilters } from '../features/assignment-management';

// Assignment Card Component Props
export interface AssignmentCardProps {
  assignment: Assignment;
  onView: (assignment: Assignment) => void;
  onSubmit: (assignment: Assignment) => void;
  className?: string;
  showActions?: boolean;
  compact?: boolean;
  onStartSubmission?:any
}

// Assignment List Component Props
export interface AssignmentListProps {
  assignments: Assignment[];
  loading?: boolean;
  onView: (assignment: Assignment) => void;
  onSubmit: (assignment: Assignment) => void;
  onRefresh?: () => void;
  className?: string;
}

// Assignment Filter Component Props
export interface AssignmentFiltersProps {
  filters: AssignmentFilters;
  setFilters: (filters: AssignmentFilters) => void;
  courses: Array<{ _id: string; name: string }>;
  departments: Array<{ _id: string; name: string }>;
  courseNameMap?: Map<string, string>;
  departmentNameMap?: Map<string, string>;
  isStudent?: boolean;
  className?: string;
}

// Assignment Detail Modal Props
export interface AssignmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
  onStartSubmission: (assignment: Assignment) => Promise<void> | void;
  className?: string;
}

// Submission Modal Props
export interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
  onSubmit: (assignmentId: string, data: { submissionText: string; files: File[] }) => Promise<void>;
  className?: string;
}

// Assignment Status Badge Props
export interface AssignmentStatusBadgeProps {
  assignment: Assignment;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}
