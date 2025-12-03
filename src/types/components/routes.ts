import { JSX } from 'react';

// JWT Token Interface
export interface DecodedToken {
  exp: number;
  iat?: number;
  role: 'Admin' | 'Teacher' | 'Student' | string;
  userId?: string;
  username?: string;
  email?: string;
}

// Route Component Props
export interface ProtectedRouteProps {
  allowedRoles: string[];
  fallbackRoute?: string;
}

export interface AuthRouteProps {
  element: JSX.Element;
}

// Authentication States
export interface AuthCheckResult {
  isAuthenticated: boolean;
  isLoading: boolean;
  userRole?: string;
  error?: string;
}

// Route Configuration
export interface RouteRedirectMap {
  Admin: string;
  Teacher: string;
  Student: string;
  default: string;
}

// Token Validation Result
export interface TokenValidationResult {
  isValid: boolean;
  isExpired: boolean;
  decoded?: DecodedToken;
  error?: string;
}
