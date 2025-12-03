import React from 'react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  showItemsPerPage?: boolean;
  showPageInfo?: boolean;
  showJumpToPage?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'minimal';
  maxPagesToShow?: number;
  loading?: boolean;
  disabled?: boolean;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  startItem: number;
  endItem: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PageSizeOption {
  value: number;
  label: string;
}

// Modal Component Types
export interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
}

// Notification Dropdown Types
export interface NotificationDropdownProps {
  notifications: NotificationDropdownItem[];
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
}

export interface NotificationDropdownItem {
  id: string;
  _id: string;
  type: 'message' | 'media' | 'reaction' | 'reply' | string;
  sender: string;
  message: string;
  timestamp: string;
  read: boolean;
  role: string;
}

// Header Component Types
export interface HeaderProps {
  role: 'admin' | 'teacher' | 'student' | string;
  onMenuClick?: () => void;
}

export interface ProfileData {
  name?: string;
  role?: string;
  avatar?: string;
  email?: string;
  profileImage?: string;
}

// Filter Section Types
export interface FilterOption {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  options: FilterSelectOption[];
}

export interface FilterSelectOption {
  value: string;
  label: string;
}

export interface FilterSectionProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  filterOptions?: FilterOption[];
  className?: string;
  placeholder?: string;
}

// Profile Dropdown Types (for Header breakdown)
export interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: ProfileData | null;
  userName: string;
  displayRole: string;
  role: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

// Notification Bell Types (for Header breakdown)
export interface NotificationBellProps {
  unreadCount: number;
  role: string;
  onNavigate: (path: string) => void;
}


