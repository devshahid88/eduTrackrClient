import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { refreshTokenSuccess } from '../../redux/slices/authSlice';
import { RootState } from '../../redux/store';
import { AuthRouteProps } from '../../types/components/routes';
import { useTokenValidation } from '../../hooks/useTokenValidation';
import { useAuthRedirect } from '../../hooks/useAuthRedirect';

const AuthRoute: React.FC<AuthRouteProps> = ({ element }) => {
  const { accessToken } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  
  const { validateToken } = useTokenValidation();
  const { getRedirectPath } = useAuthRedirect();

  useEffect(() => {
    // Sync token from localStorage to Redux if missing
    if (!accessToken) {
      const validation = validateToken(localStorage.getItem('accessToken'));
      
      if (validation.isValid && validation.decoded) {
        dispatch(refreshTokenSuccess(localStorage.getItem('accessToken')!));
      } else if (validation.error) {
        console.error('Stored token validation failed:', validation.error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      }
    }
  }, [accessToken, dispatch, validateToken]);

  // Check current authentication status
  const currentToken = accessToken || localStorage.getItem('accessToken');
  
  if (currentToken) {
    const validation = validateToken(currentToken);
    
    if (validation.isExpired) {
      // Clean up expired token
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      return element; // Show login page
    }
    
    if (validation.isValid && validation.decoded) {
      // User is authenticated, redirect to appropriate dashboard
      const redirectPath = getRedirectPath(validation.decoded.role);
      return <Navigate to={redirectPath} replace />;
    }
    
    if (validation.error) {
      console.error('Token validation error:', validation.error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  }

  // No valid token, show the login element
  return element;
};

export default AuthRoute;
