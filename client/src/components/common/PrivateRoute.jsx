import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import FullScreenLoader from './FullScreenLoader';

/**
 * PrivateRoute component that handles authentication and protected routes.
 * Redirects to login if user is not authenticated.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @returns {React.ReactNode} - Rendered component
 */
const PrivateRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  console.log('[COMPONENT] PrivateRoute auth state:', {
    user,
    isAuthenticated,
    isLoading,
    location: location.pathname
  });

  if (isLoading) {
    console.log('[COMPONENT] PrivateRoute: Loading state');
    return <FullScreenLoader />;
  }

  console.log('[COMPONENT] PrivateRoute: Auth check', {
    isAuthenticated,
    hasUser: !!user,
    userDetails: user
  });

  if (!isAuthenticated || !user) {
    console.log('[COMPONENT] PrivateRoute: Redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('[COMPONENT] PrivateRoute: Rendering children');
  return children;
};

export default PrivateRoute; 