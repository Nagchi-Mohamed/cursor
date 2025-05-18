import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  console.log('[COMPONENT] AdminProtectedRoute auth state:', {
    isAuthenticated,
    user,
    isLoading,
    location: location.pathname
  });

  if (isLoading) {
    console.log('[COMPONENT] AdminProtectedRoute: Loading state');
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  const isAdmin = user?.role === 'admin';
  console.log('[COMPONENT] AdminProtectedRoute: Auth check', {
    isAuthenticated,
    hasUser: !!user,
    userRole: user?.role,
    isAdmin
  });

  if (!isAuthenticated || !user || !isAdmin) {
    console.log('[COMPONENT] AdminProtectedRoute: Redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('[COMPONENT] AdminProtectedRoute: Rendering children');
  return children;
};

export default AdminProtectedRoute; 