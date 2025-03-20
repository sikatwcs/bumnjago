
import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from './auth';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Array<'admin' | 'user' | 'questioner'>;
}

export const ProtectedRoute = ({ 
  children, 
  allowedRoles = ['admin', 'user', 'questioner'] 
}: ProtectedRouteProps) => {
  const { user, role } = useAuth();
  const location = useLocation();

  if (!user) {
    // User is not logged in, redirect to login page
    return <Navigate to="/auth?mode=login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(role as any)) {
    // User doesn't have the required role
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and has the required role
  return <>{children}</>;
};

interface RoleGateProps {
  children: ReactNode;
  allowedRoles: Array<'admin' | 'user' | 'questioner'>;
  fallback?: ReactNode;
}

export const RoleGate = ({ 
  children, 
  allowedRoles, 
  fallback = null 
}: RoleGateProps) => {
  const { role } = useAuth();

  if (!role || !allowedRoles.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
