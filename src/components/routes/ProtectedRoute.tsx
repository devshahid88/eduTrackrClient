import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { refreshToken } from '../../api/interceptor';
import { refreshTokenSuccess, logout } from '../../redux/slices/authSlice';
import { RootState } from '../../redux/store';
import { ProtectedRouteProps } from '../../types/components/routes';
import { useTokenValidation } from '../../hooks/useTokenValidation';
import { useAuthRedirect } from '../../hooks/useAuthRedirect';

// Loading Component
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
  </div>
);

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  allowedRoles, 
  fallbackRoute 
}) => {
  const { accessToken } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { validateToken } = useTokenValidation();
  const { getRedirectPath, getLoginPath } = useAuthRedirect();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        // Get token from Redux or localStorage
        let token = accessToken || localStorage.getItem('accessToken');
        
        if (!token) {
          setIsAuthenticated(false);
          return;
        }

        // Validate token
        const validation = validateToken(token);
        
        if (validation.isExpired) {
          // Try to refresh token
          console.log('Token expired, attempting refresh...');
          const newToken = await refreshToken();
          
          if (newToken) {
            dispatch(refreshTokenSuccess(newToken));
            setIsAuthenticated(true);
          } else {
            dispatch(logout());
            setIsAuthenticated(false);
          }
        } else if (validation.isValid) {
          // Token is valid
          if (!accessToken) {
            dispatch(refreshTokenSuccess(token));
          }
          setIsAuthenticated(true);
        } else {
          // Token is invalid
          console.error('Token validation failed:', validation.error);
          dispatch(logout());
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        dispatch(logout());
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [accessToken, dispatch, validateToken]);

  // Show loading spinner
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={fallbackRoute || getLoginPath()} replace />;
  }

  // Check role authorization
  try {
    const currentToken = accessToken || localStorage.getItem('accessToken');
    const validation = validateToken(currentToken);
    
    if (!validation.isValid || !validation.decoded) {
      dispatch(logout());
      return <Navigate to={getLoginPath()} replace />;
    }

    const userRole = validation.decoded.role;

    // Allow access if role is permitted
    if (allowedRoles.includes(userRole)) {
      return <Outlet />;
    }

    // Redirect to appropriate dashboard based on role
    const redirectPath = getRedirectPath(userRole);
    return <Navigate to={redirectPath} replace />;
    
  } catch (error) {
    console.error('Role authorization failed:', error);
    dispatch(logout());
    return <Navigate to={getLoginPath()} replace />;
  }
};

export default ProtectedRoute;
