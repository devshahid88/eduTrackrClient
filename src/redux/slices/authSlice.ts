import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthState, LoginSuccessPayload } from '../../types';

// Helper function to safely parse user from localStorage
const getStoredUser = (): User | null => {
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      return JSON.parse(userData) as User;
    } catch (error) {
      console.error('Failed to parse user from localStorage:', error);
      return null;
    }
  }
  return null;
};

// Initial state with explicit typing
const initialState: AuthState = {
  accessToken: localStorage.getItem('accessToken') || null,
  user: getStoredUser(),
  isAuthenticated: !!localStorage.getItem('accessToken'),
};

// Create the auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<LoginSuccessPayload>) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.isAuthenticated = true;

      // Persist to localStorage
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    refreshTokenSuccess: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      state.isAuthenticated = true;

      // Update localStorage
      localStorage.setItem('accessToken', action.payload);
    },
    logout: (state) => {
      state.accessToken = null;
      state.user = null;
      state.isAuthenticated = false;

      // Clear localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    },
  },
});

export const { loginSuccess, refreshTokenSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
