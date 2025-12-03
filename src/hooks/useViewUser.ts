import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';
import { Department } from '../../src/types/features/department-management';

interface User {
  _id?: string;
  id?: string;
  username: string;
  email: string;
  firstname?: string;
  lastname?: string;
  role: 'Student' | 'Teacher' | 'Admin';
  department?: string;
  class?: string;
  courses?: any[];
  isBlock: boolean;
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
}

interface CourseInfo {
  _id?: string;
  name?: string;
  courseName?: string;
  code?: string;
  courseCode?: string;
  courseId?: string;
  department?: string;
  semester?: number;
}

export const useViewUser = (user: User | null) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await axiosInstance.get('/api/departments');
        
        if (response.data?.success && Array.isArray(response.data.data)) {
          setDepartments(response.data.data);
        } else {
          setDepartments([]);
        }
      } catch (error: any) {
        console.error('Error fetching departments:', error);
        setError('Failed to load department information');
        setDepartments([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDepartments();
    }
  }, [user]);

  // Get department name by ID
  const getDepartmentName = useCallback((departmentId: string): string => {
    if (!departmentId) return 'Not assigned';
    
    const department = departments.find(dept => dept._id === departmentId);
    return department?.name || departmentId;
  }, [departments]);

  // Process courses data
  const getProcessedCourses = useCallback((): CourseInfo[] => {
    if (!user?.courses || !Array.isArray(user.courses) || user.courses.length === 0) {
      return [];
    }

    return user.courses.map((course, index) => ({
      _id: course._id || course.courseId || `course-${index}`,
      name: course.name || course.courseName || 'Unnamed Course',
      code: course.code || course.courseCode || 'N/A',
      department: course.department,
      semester: course.semester
    }));
  }, [user?.courses]);

  // Get user's department (for students and teachers)
  const getUserDepartment = useCallback((): string => {
    if (!user) return 'Not assigned';

    if (user.role === 'Teacher') {
      return getDepartmentName(user.department || '');
    }

    if (user.role === 'Student' && user.courses && user.courses.length > 0) {
      // For students, get department from first course
      const firstCourse = user.courses[0];
      const departmentId = firstCourse?.department || user.department;
      return getDepartmentName(departmentId || '');
    }

    return getDepartmentName(user.department || '');
  }, [user, getDepartmentName]);

  // Get user status
  const getUserStatus = useCallback((): { status: string; variant: 'success' | 'warning' | 'danger' } => {
    if (!user) return { status: 'Unknown', variant: 'warning' };
    
    if (user.isBlock) {
      return { status: 'Blocked', variant: 'danger' };
    }
    
    return { status: 'Active', variant: 'success' };
  }, [user]);

  // Get user initials for avatar fallback
  const getUserInitials = useCallback((): string => {
    if (!user) return '';
    
    const firstName = user.firstname || '';
    const lastName = user.lastname || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }, [user]);

  // Get user display name
  const getUserDisplayName = useCallback((): string => {
    if (!user) return '';
    
    const firstName = user.firstname || '';
    const lastName = user.lastname || '';
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    
    return user.username;
  }, [user]);

  return {
    departments,
    loading,
    error,
    getDepartmentName,
    getProcessedCourses,
    getUserDepartment,
    getUserStatus,
    getUserInitials,
    getUserDisplayName
  };
};
