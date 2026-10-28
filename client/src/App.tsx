import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { MenteeDashboard } from './pages/mentee/MenteeDashboard';
import { ProfileWizardPage } from './pages/mentee/ProfileWizardPage';
import { MenteeSessionsPage } from './pages/mentee/MenteeSessionsPage';
import { MenteeRecommendationsPage } from './pages/mentee/MenteeRecommendationsPage';
import { MenteeActionItemsPage } from './pages/mentee/MenteeActionItemsPage';

import { MentorDashboard } from './pages/mentor/MentorDashboard';
import { MenteesListPage } from './pages/mentor/MenteesListPage';
import { MenteeWorkspacePage } from './pages/mentor/MenteeWorkspacePage';

import { HodDashboard } from './pages/hod/HodDashboard';
import { EndorsementsQueuePage } from './pages/hod/EndorsementsQueuePage';
import { MentorAssignmentPage } from './pages/hod/MentorAssignmentPage';
import { UserManagementPage } from './pages/hod/UserManagementPage';
import { ReportsAnalyticsPage } from './pages/hod/ReportsAnalyticsPage';
import { AuditLogsPage } from './pages/hod/AuditLogsPage';

import { MentorDirectoryPage } from './pages/shared/MentorDirectoryPage';
import { SettingsPage } from './pages/shared/SettingsPage';
import { AccessDeniedPage } from './pages/shared/AccessDeniedPage';
import { NotFoundPage } from './pages/shared/NotFoundPage';

// Route Guards
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const RoleRoute: React.FC<{ allowedRoles: string[]; children: React.ReactNode }> = ({
  allowedRoles,
  children,
}) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN' || allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }
  return <Navigate to="/access-denied" replace />;
};

const DefaultRedirect: React.FC = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'STUDENT') return <Navigate to="/mentee/dashboard" replace />;
  if (user.role === 'MENTOR') return <Navigate to="/mentor/dashboard" replace />;
  return <Navigate to="/hod/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Authenticated Application */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DefaultRedirect />} />

        {/* Mentee / Student Routes */}
        <Route
          path="mentee/dashboard"
          element={
            <RoleRoute allowedRoles={['STUDENT']}>
              <MenteeDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="mentee/profile"
          element={
            <RoleRoute allowedRoles={['STUDENT']}>
              <ProfileWizardPage />
            </RoleRoute>
          }
        />
        <Route
          path="mentee/sessions"
          element={
            <RoleRoute allowedRoles={['STUDENT']}>
              <MenteeSessionsPage />
            </RoleRoute>
          }
        />
        <Route
          path="mentee/recommendations"
          element={
            <RoleRoute allowedRoles={['STUDENT']}>
              <MenteeRecommendationsPage />
            </RoleRoute>
          }
        />
        <Route
          path="mentee/action-items"
          element={
            <RoleRoute allowedRoles={['STUDENT']}>
              <MenteeActionItemsPage />
            </RoleRoute>
          }
        />

        {/* Mentor / Faculty Routes */}
        <Route
          path="mentor/dashboard"
          element={
            <RoleRoute allowedRoles={['MENTOR', 'HOD', 'ADMIN']}>
              <MentorDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="mentor/mentees"
          element={
            <RoleRoute allowedRoles={['MENTOR', 'HOD', 'ADMIN']}>
              <MenteesListPage />
            </RoleRoute>
          }
        />
        <Route
          path="mentor/mentee/:id"
          element={
            <RoleRoute allowedRoles={['MENTOR', 'HOD', 'ADMIN']}>
              <MenteeWorkspacePage />
            </RoleRoute>
          }
        />
        <Route
          path="mentor/sessions"
          element={
            <RoleRoute allowedRoles={['MENTOR', 'HOD', 'ADMIN']}>
              <MenteeSessionsPage />
            </RoleRoute>
          }
        />
        <Route
          path="mentor/recommendations"
          element={
            <RoleRoute allowedRoles={['MENTOR', 'HOD', 'ADMIN']}>
              <MenteeRecommendationsPage />
            </RoleRoute>
          }
        />
        <Route
          path="mentor/action-items"
          element={
            <RoleRoute allowedRoles={['MENTOR', 'HOD', 'ADMIN']}>
              <MenteeActionItemsPage />
            </RoleRoute>
          }
        />

        {/* HOD / Department Admin Routes */}
        <Route
          path="hod/dashboard"
          element={
            <RoleRoute allowedRoles={['HOD', 'ADMIN']}>
              <HodDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="hod/approvals"
          element={
            <RoleRoute allowedRoles={['HOD', 'ADMIN']}>
              <EndorsementsQueuePage />
            </RoleRoute>
          }
        />
        <Route
          path="hod/assignments"
          element={
            <RoleRoute allowedRoles={['HOD', 'ADMIN']}>
              <MentorAssignmentPage />
            </RoleRoute>
          }
        />
        <Route
          path="hod/users"
          element={
            <RoleRoute allowedRoles={['HOD', 'ADMIN']}>
              <UserManagementPage />
            </RoleRoute>
          }
        />
        <Route
          path="hod/analytics"
          element={
            <RoleRoute allowedRoles={['HOD', 'ADMIN']}>
              <ReportsAnalyticsPage />
            </RoleRoute>
          }
        />
        <Route
          path="hod/audit-logs"
          element={
            <RoleRoute allowedRoles={['HOD', 'ADMIN']}>
              <AuditLogsPage />
            </RoleRoute>
          }
        />

        {/* Shared Protected Routes */}
        <Route path="mentors" element={<MentorDirectoryPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="access-denied" element={<AccessDeniedPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
export default App;
