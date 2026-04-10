import { type UserRole } from '../contexts/AuthContext';
import type { ComponentType } from 'react';

export interface RouteConfig {
  path: string;
  component: ComponentType;
  requiredRole?: UserRole;
  requiredRoles?: UserRole[];
  allowUnauthenticated?: boolean;
}

// Route definitions for role-based access control
export const ROLE_BASED_ROUTES = {
  // Public routes
  PUBLIC: [
    '/',
    '/login',
    '/unauthorized',
  ],
  
  // User routes (USER role)
  USER: [
    '/dashboard/my-tickets',
    '/dashboard/tickets/new',
    '/dashboard/tickets/:ticketId',
  ],
  
  // Technician routes (TECHNICIAN role)
  TECHNICIAN: [
    '/dashboard/technician/tickets',
    '/dashboard/technician/tickets/:ticketId',
  ],
  
  // Admin routes (ADMIN role)
  ADMIN: [
    '/dashboard/admin/tickets',
  ],
  
  // Shared routes (multiple roles)
  SHARED: [
    '/dashboard/notifications',
  ],
};

export const getAccessibleRoutes = (userRole: UserRole | null): string[] => {
  const routes: string[] = [];
  
  // Always add public routes
  routes.push(...ROLE_BASED_ROUTES.PUBLIC);
  
  if (!userRole) return routes;
  
  // Add role-specific routes
  routes.push(...ROLE_BASED_ROUTES[userRole]);
  
  // Add shared routes
  routes.push(...ROLE_BASED_ROUTES.SHARED);
  
  return routes;
};

export const canAccessRoute = (userRole: UserRole | null, routePath: string): boolean => {
  // Check public routes
  if (ROLE_BASED_ROUTES.PUBLIC.some(route => route === routePath)) {
    return true;
  }
  
  // Check shared routes
  if (ROLE_BASED_ROUTES.SHARED.some(route => route === routePath)) {
    return !!userRole; // Any authenticated user can access shared routes
  }
  
  // Check role-specific routes
  if (!userRole) return false;
  
  return ROLE_BASED_ROUTES[userRole]?.some(route => route === routePath) || false;
};

export const getDefaultRouteForRole = (role: UserRole): string => {
  switch (role) {
    case 'USER':
      return '/dashboard/my-tickets';
    case 'TECHNICIAN':
      return '/dashboard/technician/tickets';
    case 'ADMIN':
      return '/dashboard/admin/tickets';
    default:
      return '/dashboard/my-tickets';
  }
};
