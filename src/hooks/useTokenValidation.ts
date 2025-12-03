import { useState, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { DecodedToken, TokenValidationResult } from '../types/components/routes';

export const useTokenValidation = () => {
  const [isValidating, setIsValidating] = useState(false);

  const validateToken = useCallback((token: string | null): TokenValidationResult => {
    if (!token) {
      return {
        isValid: false,
        isExpired: false,
        error: 'No token provided'
      };
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      const isExpired = decoded.exp < currentTime;

      return {
        isValid: !isExpired,
        isExpired,
        decoded,
        error: isExpired ? 'Token expired' : undefined
      };
    } catch (error) {
      return {
        isValid: false,
        isExpired: false,
        error: 'Invalid token format'
      };
    }
  }, []);

  const validateStoredToken = useCallback((): TokenValidationResult => {
    const storedToken = localStorage.getItem('accessToken');
    return validateToken(storedToken);
  }, [validateToken]);

  return {
    validateToken,
    validateStoredToken,
    isValidating,
    setIsValidating
  };
};
