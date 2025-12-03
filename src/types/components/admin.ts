import React from 'react';
import { Concern, CreateConcernRequest, UpdateConcernRequest } from '../features/concern-management';
import { Department, DepartmentFormData } from '../features/department-management';
import { Schedule,ScheduleDetails,ScheduleFilters,ScheduleStats,DayOfWeek,Course,TimeSlotConfig,ScheduleFormErrors,ScheduleFormData,Teacher } from '../features/schedule-management';
import { User } from '../common';

// Concern Management Component Types
export interface ViewConcernModalProps {
  concern: Concern;
  onClose: () => void;
}

export interface EditConcernModalProps {
  concern: Concern;
  onClose: () => void;
  onSave: (concernData: UpdateConcernRequest) => Promise<void>;
}

export interface ConcernTableProps {
  concerns: Concern[];
  onEdit: (concern: Concern) => void;
  onView: (concern: Concern) => void;
  loading?: boolean;
  className?: string;
}

export interface AddConcernModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (concernData: CreateConcernRequest) => Promise<void>;
  loading?: boolean;
}

// Dashboard Stat Card Types
export interface StatCardProps {
  icon: string;
  iconColor: 'blue' | 'purple' | 'teal' | 'amber' | 'green' | 'red' | 'gray';
  value: string | number;
  label: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  gradient: string;
  className?: string;
}

// Admin Sidebar Types
export interface AdminSideBarProps {
  activePage?: string;
  onClose?: () => void;
  isSidebarOpen?: boolean;
}

export interface SidebarMenuItem {
  name: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
}

export interface SidebarSection {
  section: string;
  items: SidebarMenuItem[];
}

// Admin Header Types
export interface AdminHeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  className?: string;
}

// Generic Admin Table Types
export interface AdminTableColumn<T> {
  key: keyof T | string;
  title: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  className?: string;
}

export interface AdminTableAction<T> {
  label: string;
  onClick: (item: T) => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  icon?: React.ReactNode;
  disabled?: (item: T) => boolean;
}

export interface AdminTableProps<T> {
  data: T[];
  columns: AdminTableColumn<T>[];
  actions?: AdminTableAction<T>[];
  onRowClick?: (item: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

//  StatusBadgeProps interface
export interface StatusBadgeProps {
  status: string;
 variant?: 'default' | 'concern' | 'user' | 'general' | 'success' | 'warning' | 'danger' | 'info';   size?: 'sm' | 'md' | 'lg';
  className?: string;
}



export interface RoleBadgeProps {
  role: string;
  className?: string;
}

// Department Component Props
export interface DepartmentTableProps {
  departments: Department[];
  onEdit: (department: Department) => void;
  onDelete: (department: Department) => void;
  onView: (department: Department) => void;
  loading?: boolean;
  className?: string;
}

export interface ViewDepartmentModalProps {
  department: any;
  onClose: () => void;
}

export interface DepartmentModalProps {
  department?: Department;
  onClose: () => void;
  onSave: (data: DepartmentFormData) => Promise<void>;
  mode: 'add' | 'edit';
  loading?: boolean;
}

export interface DeleteConfirmationModalProps {
  department: Department | null;
  onClose: () => void;
  onConfirm: (departmentId: string) => Promise<void>;
  loading?: boolean;
}

export interface ActionButtonsProps<T = any> {
  item: T;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  onView: (item: T) => void;
  className?: string;
}

// Form Validation Props
export interface FormFieldProps {
  label: string;
  name: string;
  type: 'text' | 'email' | 'tel' | 'date';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}
// Schedule Component Props
export interface WeeklyCalendarViewProps {
  className?: string;
  timeSlotConfig?: TimeSlotConfig;
  onScheduleClick?: (schedule: Schedule) => void;
  schedules?:any
}

export interface ScheduleTableProps {
  schedules: Schedule[];
  departments: Department[];
  selectedDepartment?: string;
  loading?: boolean;
  onEdit: (schedule: Schedule) => void;
  onDelete: (scheduleId: string) => void;
  className?: string;
}

export interface ScheduleModalProps {
  schedule: Schedule | null;
  departments: Department[];
  courses: Course[];
  teachers: Teacher[];
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export interface EditScheduleModalProps {
  schedule: Schedule | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  departments: Department[];
  semesters: any;
  loading?: boolean;
}

export interface ScheduleFiltersProps {
  filters: ScheduleFilters;
  departments: Department[];
  onFilterChange: (filters: ScheduleFilters) => void;
  onClearFilters: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export interface ScheduleStatsProps {
  stats: ScheduleStats;
  departments: Department[];
  courses: Course[];
  className?: string;
}

// Schedule Card Props
export interface ScheduleCardProps {
  schedule: Schedule;
  scheduleDetails: ScheduleDetails;
  colorClass: string;
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
}

// Time Slot Props
export interface TimeSlotProps {
  timeSlot: string;
  day: DayOfWeek;
  schedules: Schedule[];
  onScheduleClick: (schedule: Schedule) => void;
  getDepartmentColorClass: (departmentId: string | Department) => string;
}

// Schedule Form Component Props
export interface ScheduleFormProps {
  onSuccess?: (schedule: Schedule) => void;
  onCancel?: () => void;
  initialData?: Partial<ScheduleFormData>;
  className?: string;
  onScheduleAdded?:any
}

export interface ScheduleFormFieldProps {
  name: keyof ScheduleFormData;
  label: string;
  type: 'select' | 'time';
  icon: React.ComponentType<any>;
  options?: Array<{ value: string; label: string }>;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => void;
}

export interface DependentSelectProps {
  departments: Department[];
  courses: Course[];
  teachers: Teacher[];
  formData: ScheduleFormData;
  onChange: (name: keyof ScheduleFormData, value: string) => void;
  loading: boolean;
  errors: ScheduleFormErrors;
}
// Update the existing ScheduleTableProps
export interface ScheduleTableProps {
  className?: string;
  onScheduleEdit?: (schedule: Schedule) => void;
  onScheduleDelete?: (scheduleId: string) => void;
  showFilters?: boolean;
  maxHeight?: string;
}

// Add table-specific types
export interface ScheduleTableColumn {
  key: string;
  title: string;
  sortable?: boolean;
  width?: string;
  render?: (schedule: Schedule, departments: Department[]) => React.ReactNode;
}

export interface ScheduleTableRowProps {
  schedule: Schedule;
  departments: Department[];
  onEdit: (schedule: Schedule) => void;
  onDelete: (scheduleId: string) => void;
}

