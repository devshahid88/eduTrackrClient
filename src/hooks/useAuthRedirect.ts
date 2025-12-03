import { useMemo } from 'react';
import { RouteRedirectMap } from '../types/components/routes';

export const useAuthRedirect = () => {
  const redirectMap: RouteRedirectMap = useMemo(() => ({
    Admin: '/admin/dashboard',
    Teacher: '/teacher/dashboard',
    Student: '/student/dashboard',
    default: '/auth/student-login'
  }), []);

  const getRedirectPath = (role: string): string => {
    return redirectMap[role as keyof RouteRedirectMap] || redirectMap.default;
  };

  const getLoginPath = (role?: string): string => {
    if (!role) return '/auth/student-login';
    
    const loginMap: Record<string, string> = {
      Admin: '/auth/admin-login',
      Teacher: '/auth/teacher-login',
      Student: '/auth/student-login'
    };
    
    return loginMap[role] || '/auth/student-login';
  };

  return {
    redirectMap,
    getRedirectPath,
    getLoginPath
  };
};
