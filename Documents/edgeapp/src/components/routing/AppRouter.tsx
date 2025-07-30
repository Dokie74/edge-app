// src/components/routing/AppRouter.tsx - React Router implementation
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from '../../contexts';

// Import page components
import DashboardRouter from './DashboardRouter';
import MyTeamEnhancedRouter from '../pages/MyTeamEnhancedRouter';
import ManagerReviewRouter from '../pages/ManagerReviewRouter';
import MyReviews from '../pages/MyReviews';
import MyDevelopmentCenterEnhanced from '../pages/MyDevelopmentCenterEnhanced';
import AssessmentRouter from '../pages/AssessmentRouter';
import Admin from '../pages/Admin';
import FeedbackWall from '../pages/FeedbackWall';
import ManagerPlaybook from '../pages/ManagerPlaybook';
import EmployeeHelpPage from '../pages/EmployeeHelpPage';
import ManagerHelpPage from '../pages/ManagerHelpPage';
import AdminHelpPage from '../pages/AdminHelpPage';

// Import shared components
import SidebarRouter from '../shared/SidebarRouter';
import ModalsContainer from './ModalsContainer';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  userRole: string | null;
}

// Protected Route Component
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles, userRole }) => {
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

interface AppRouterProps {}

const AppRouter: React.FC<AppRouterProps> = () => {
  const { userRole } = useApp();

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-gray-100">
        {/* SIDEBAR - Fixed positioned */}
        <SidebarRouter />
        
        {/* MAIN CONTENT - With left margin to account for fixed sidebar */}
        <main className="ml-64 min-h-screen">
          <Routes>
            {/* Dashboard - Role-specific dashboard routing */}
            <Route 
              path="/dashboard" 
              element={<DashboardRouter />} 
            />
            
            {/* My Team - Manager and Admin only */}
            <Route 
              path="/team" 
              element={
                <ProtectedRoute allowedRoles={['manager', 'admin']} userRole={userRole}>
                  <MyTeamEnhancedRouter />
                </ProtectedRoute>
              } 
            />
            
            {/* Manager Playbook - Manager and Admin only */}
            <Route 
              path="/playbook" 
              element={
                <ProtectedRoute allowedRoles={['manager', 'admin']} userRole={userRole}>
                  <ManagerPlaybook />
                </ProtectedRoute>
              } 
            />
            
            {/* Manager Review - Manager and Admin only */}
            <Route 
              path="/review/:employeeId?" 
              element={
                <ProtectedRoute allowedRoles={['manager', 'admin']} userRole={userRole}>
                  <ManagerReviewRouter />
                </ProtectedRoute>
              } 
            />
            
            {/* My Reviews - All authenticated users */}
            <Route 
              path="/reviews" 
              element={<MyReviews />} 
            />
            
            {/* Feedback Wall - All authenticated users */}
            <Route 
              path="/feedback" 
              element={<FeedbackWall />} 
            />
            
            {/* My Development - All authenticated users */}
            <Route 
              path="/development" 
              element={<MyDevelopmentCenterEnhanced />} 
            />
            
            {/* Assessment - All authenticated users */}
            <Route 
              path="/assessment/:assessmentId?" 
              element={<AssessmentRouter />} 
            />
            
            {/* Admin - Admin only */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']} userRole={userRole}>
                  <Admin />
                </ProtectedRoute>
              } 
            />
            
            {/* Help - Role-specific help pages */}
            <Route 
              path="/help" 
              element={
                userRole === 'admin' ? <AdminHelpPage /> :
                userRole === 'manager' ? <ManagerHelpPage /> :
                <EmployeeHelpPage />
              } 
            />
            
            {/* Default redirect to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Catch-all redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>

        {/* Modals Container */}
        <ModalsContainer />

        {/* DEBUG INFO (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-75 text-xs text-gray-400 p-2 border-t border-gray-700">
            Debug: Role: {userRole} | Path: {window.location.pathname}
          </div>
        )}
      </div>
    </Router>
  );
};

export default AppRouter;