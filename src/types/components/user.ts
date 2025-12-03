import React from 'react';
import { DashboardUser } from '../features/user-management';
import { Department, Course } from '../features/schedule-management';

// ✅ Use existing DashboardUser interface


export interface EditUserModalProps {
  user: {
    _id?: string;
    id?: string;
    username: string;
    email: string;
    firstname?: string;
    lastname?: string;
    role: 'student' | 'teacher' | 'admin';
    department?: string;
    class?: string;
    courses?: string[];
    isBlock?: boolean;
    profileImage?: string;
  } | null;
  onClose: () => void;
  onSave: (user: any) => void;
}

// Form field props adapted to existing interface
export interface UserFormFieldProps {
  name: string;
  label: string;
  type: 'text' | 'email' | 'select' | 'checkbox';
  value: string | boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ value: string; label: string }>;
  className?: string;
}
// Add to existing user component types

export interface AddUserModalProps {
  onClose: () => void;
  onSave: (user: DashboardUser) => void;
  loading?: boolean;
  className?: string;
}

export interface AddUserFormFieldProps {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'checkbox';
  value: string | boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  className?: string;
}

// Rest of the component props remain similar but adapted to existing types...
