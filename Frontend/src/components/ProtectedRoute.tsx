import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store';
import { useSessionManager } from '../hooks/useSessionManager';
import { LoadingAnimation } from './LoadingAnimation';
import { SessionExpiryWarning } from './SessionExpiryWarning';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo = '/login',
}) => {
  const location = useLocation();
  const { isAuthenticated, loading, logout } = useAuthStore();
  
  console.log('ProtectedRoute - Auth state:', { isAuthenticated, loading, requireAuth });
  
  // Simplified session management for now
  const isSessionValid = true; // Temporarily disable session validation

  // Show loading while checking authentication
  if (loading) {
    console.log('ProtectedRoute - Showing loading');
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f0f23' }}>
        <div style={{ color: '#ffffff' }}>Loading...</div>
      </div>
    );
  }

  // Redirect if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    console.log('ProtectedRoute - Redirecting to login');
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Redirect if user is authenticated but trying to access auth pages
  if (!requireAuth && isAuthenticated) {
    console.log('ProtectedRoute - Redirecting authenticated user');
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  console.log('ProtectedRoute - Rendering children');
  return <>{children}</>;
};

// Higher-order component for route protection
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  options: { requireAuth?: boolean; redirectTo?: string } = {}
) => {
  return (props: P) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

// Route guard hook
export const useRouteGuard = () => {
  const { isAuthenticated } = useAuthStore();
  const { isSessionValid } = useSessionManager();
  
  return {
    isAuthenticated,
    isSessionValid,
    canAccess: (requireAuth: boolean = true) => {
      if (!requireAuth) return true;
      return isAuthenticated && isSessionValid;
    },
  };
};