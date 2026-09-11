import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore.js';
import { UserRole } from '../../types/index.js';

interface RoleRouteGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const RoleRouteGuard: React.FC<RoleRouteGuardProps> = ({ allowedRoles, children }) => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to user's authorized home dashboard
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'PROJECT_MANAGER') return <Navigate to="/manager/dashboard" replace />;
    return <Navigate to="/developer/dashboard" replace />;
  }

  return <>{children}</>;
};
