import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, type PortalSide, type UserRole } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredRoles?: UserRole[];
  fallbackPath?: string;
  portal?: PortalSide;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredRoles,
  fallbackPath = '/login',
  portal,
}) => {
  const { loading, currentPortal, isUserAuthenticated, isAdminAuthenticated, hasRole, hasAnyRole } =
    useAuth();

  const targetPortal = portal ?? currentPortal;
  const isAuthenticated =
    targetPortal === 'admin' ? isAdminAuthenticated : isUserAuthenticated;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} replace />;
  }

  if (requiredRole && !hasRole(requiredRole, targetPortal)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredRoles && !hasAnyRole(requiredRoles, targetPortal)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;