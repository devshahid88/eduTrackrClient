import { ApiResponse, BaseEntity } from '../common';

// Fixed DashboardUser interface
export interface DashboardUser extends BaseEntity {
  _id: string;
  id: string;              // ✅ Changed from optional to required
  firstName?: string;
  lastName?: string;
  username: string;
  email: string;
  role: 'Admin' | 'Teacher' | 'Student';
  status: 'active' | 'pending' | 'inactive' | 'blocked';
  department?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
}

// Rest of your interfaces remain the same...
export interface UserStats {
  total: number;
  active: number;
  pending: number;
  inactive: number;
  byRole: {
    admins: number;
    teachers: number;
    students: number;
  };
  recentRegistrations: number;
}

export interface UserFilters {
  role?: 'admin' | 'teacher' | 'student' | 'all';
  status?: 'active' | 'pending' | 'inactive' | 'blocked' | 'all';
  search?: string;
  department?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface UsersResponse extends ApiResponse<DashboardUser[]> {
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    usersPerPage: number;
  };
}
