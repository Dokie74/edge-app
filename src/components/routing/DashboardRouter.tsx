// src/components/routing/DashboardRouter.tsx - Role-based dashboard routing
import React from 'react';
import { useApp } from '../../contexts';

// Import role-specific dashboards
import EmployeeDashboard from '../pages/EmployeeDashboard';
import ManagerDashboard from '../pages/ManagerDashboard';
import AdminDashboard from '../pages/AdminDashboard';

// Fallback dashboard for unknown roles
import SuperEnhancedDashboard from '../pages/SuperEnhancedDashboard';

const DashboardRouter: React.FC = () => {
  const { userRole, loading, userDataLoading } = useApp();

  // Show loading state while user role is being determined
  // Check both general loading and user data loading states
  if (loading || userDataLoading || userRole === null) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-400">Loading dashboard...</span>
      </div>
    );
  }

  // Route to appropriate dashboard based on user role
  switch (userRole) {
    case 'employee':
      return <EmployeeDashboard />;
    
    case 'manager':
      return <ManagerDashboard />;
    
    case 'admin':
      return <AdminDashboard />;
    
    default:
      // Only show warning for truly unknown roles (not null/undefined)
      if (userRole && userRole !== 'null' && userRole !== 'undefined') {
        console.warn(`Unknown user role: ${userRole}, falling back to enhanced dashboard`);
      }
      return <SuperEnhancedDashboard />;
  }
};

export default DashboardRouter;