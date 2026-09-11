import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout.js';
import { RoleRouteGuard } from '../components/layout/RoleRouteGuard.js';
import { LoginPage } from '../pages/auth/LoginPage.js';
import { useAuthStore } from '../stores/authStore.js';

import { AdminDashboard } from '../pages/admin/AdminDashboard.js';
import { AdminUsers } from '../pages/admin/AdminUsers.js';
import { AdminClients } from '../pages/admin/AdminClients.js';
import { AdminProjects } from '../pages/admin/AdminProjects.js';
import { AdminActivity } from '../pages/admin/AdminActivity.js';

import { ManagerDashboard } from '../pages/manager/ManagerDashboard.js';
import { ManagerProjects } from '../pages/manager/ManagerProjects.js';
import { ManagerProjectDetail } from '../pages/manager/ManagerProjectDetail.js';
import { ManagerTasks } from '../pages/manager/ManagerTasks.js';
import { ManagerActivity } from '../pages/manager/ManagerActivity.js';

import { DeveloperDashboard } from '../pages/developer/DeveloperDashboard.js';
import { DeveloperTasks } from '../pages/developer/DeveloperTasks.js';
import { DeveloperTaskDetail } from '../pages/developer/DeveloperTaskDetail.js';
import { DeveloperActivity } from '../pages/developer/DeveloperActivity.js';

import { NotificationsPage } from '../pages/notifications/NotificationsPage.js';
import { ProfilePage } from '../pages/profile/ProfilePage.js';

const RootRedirect: React.FC = () => {
  const { user, isLoading } = useAuthStore();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'PROJECT_MANAGER') return <Navigate to="/manager/dashboard" replace />;
  return <Navigate to="/developer/dashboard" replace />;
};

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<AppLayout />}>
        <Route path="/" element={<RootRedirect />} />

        <Route
          path="/admin/dashboard"
          element={
            <RoleRouteGuard allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RoleRouteGuard allowedRoles={['ADMIN']}>
              <AdminUsers />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/admin/clients"
          element={
            <RoleRouteGuard allowedRoles={['ADMIN']}>
              <AdminClients />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/admin/projects"
          element={
            <RoleRouteGuard allowedRoles={['ADMIN']}>
              <AdminProjects />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/admin/activity"
          element={
            <RoleRouteGuard allowedRoles={['ADMIN']}>
              <AdminActivity />
            </RoleRouteGuard>
          }
        />

        <Route
          path="/manager/dashboard"
          element={
            <RoleRouteGuard allowedRoles={['PROJECT_MANAGER', 'ADMIN']}>
              <ManagerDashboard />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/manager/projects"
          element={
            <RoleRouteGuard allowedRoles={['PROJECT_MANAGER', 'ADMIN']}>
              <ManagerProjects />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/manager/projects/:id"
          element={
            <RoleRouteGuard allowedRoles={['PROJECT_MANAGER', 'ADMIN']}>
              <ManagerProjectDetail />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/manager/tasks"
          element={
            <RoleRouteGuard allowedRoles={['PROJECT_MANAGER', 'ADMIN']}>
              <ManagerTasks />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/manager/activity"
          element={
            <RoleRouteGuard allowedRoles={['PROJECT_MANAGER', 'ADMIN']}>
              <ManagerActivity />
            </RoleRouteGuard>
          }
        />

        <Route
          path="/developer/dashboard"
          element={
            <RoleRouteGuard allowedRoles={['DEVELOPER']}>
              <DeveloperDashboard />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/developer/tasks"
          element={
            <RoleRouteGuard allowedRoles={['DEVELOPER']}>
              <DeveloperTasks />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/developer/tasks/:id"
          element={
            <RoleRouteGuard allowedRoles={['DEVELOPER']}>
              <DeveloperTaskDetail />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/developer/activity"
          element={
            <RoleRouteGuard allowedRoles={['DEVELOPER']}>
              <DeveloperActivity />
            </RoleRouteGuard>
          }
        />

        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
