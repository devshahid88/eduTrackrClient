// Base API Response Interface
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Base Entity Interface
export interface BaseEntity {
  id: string;
  _id?: string; // For MongoDB responses
  createdAt?: string;
  updatedAt?: string;
}

// Enhanced User Interface (Fixed)
export interface User {
  id: string;
  _id?: string;           // Added: For MongoDB responses
  username: string;
  name?: string;          // Added: User's display name
  email?: string;
  role?: string;
  profileImage?: string;  // Added: Profile image URL
  avatar?: string;        // Alternative avatar field
  firstname?: string;     // Common in user profiles
  lastname?: string;      // Common in user profiles
  department?: string;    // For teachers/students
}

// MongoDB ID validation regex
export const MONGODB_ID_REGEX = /^[0-9a-fA-F]{24}$/;
