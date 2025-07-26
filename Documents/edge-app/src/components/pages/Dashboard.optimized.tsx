// Dashboard.optimized.tsx - Performance optimized dashboard with React.memo and lazy loading
import React, { memo, useMemo, Suspense, lazy } from 'react';
import { BarChart3, Users, Calendar } from 'lucide-react';
import { useApp } from '../../contexts';
import { LoadingSpinner } from '../ui';
import { DashboardStats } from '../../types';

// Lazy load heavy components
const AdminDashboard = lazy(() => import('./AdminDashboard'));
const ManagerDashboard = lazy(() => import('./ManagerDashboard'));
const EmployeeDashboard = lazy(() => import('./EmployeeDashboard'));

interface DashboardProps {
  stats?: DashboardStats;
  loading?: boolean;
  error?: string | null;
}

// Memoized metric card component to prevent unnecessary re-renders
const MetricCard = memo<{
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color: string;
  subtitle?: string;
}>(({ title, value, icon: Icon, color, subtitle }) => {
  const colorClasses = useMemo(() => ({
    blue: 'text-blue-400',
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    red: 'text-red-400',
    purple: 'text-purple-400',
    cyan: 'text-cyan-400'
  }), []);

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center">
        <Icon className={`${colorClasses[color as keyof typeof colorClasses]} mr-3`} size={24} />
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          {subtitle && (
            <p className="text-gray-500 text-xs mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
});

MetricCard.displayName = 'MetricCard';

// Memoized header component
const DashboardHeader = memo<{ userName: string | null }>(({ userName }) => (
  <div className="mb-8">
    <h1 className="text-4xl font-bold text-cyan-400 flex items-center">
      <BarChart3 className="mr-3" size={36} />
      Dashboard
    </h1>
    <p className="text-gray-400 mt-2">
      Welcome back, {userName}! Here's your performance overview.
    </p>
  </div>
));

DashboardHeader.displayName = 'DashboardHeader';

// Memoized role-specific dashboard wrapper
const RoleBasedDashboard = memo<{
  userRole: string | null;
  stats: DashboardStats | null;
}>(({ userRole, stats }) => {
  if (!stats) return null;

  return (
    <Suspense fallback={<LoadingSpinner size="lg" message="Loading dashboard..." />}>
      {userRole === 'admin' && <AdminDashboard stats={stats} />}
      {userRole === 'manager' && <ManagerDashboard stats={stats} />}
      {userRole === 'employee' && <EmployeeDashboard stats={stats} />}
    </Suspense>
  );
});

RoleBasedDashboard.displayName = 'RoleBasedDashboard';

// Main dashboard component with performance optimizations
const OptimizedDashboard: React.FC<DashboardProps> = memo(({ 
  stats: propStats, 
  loading: propLoading, 
  error: propError 
}) => {
  const { userRole, userName } = useApp();
  
  // Memoize expensive calculations
  const dashboardMetrics = useMemo(() => {
    if (!propStats) return null;

    return {
      totalEmployees: propStats.employees?.total || 0,
      activeReviews: propStats.review_cycles?.active || 0,
      completionRate: propStats.assessments?.completion_rate || 0,
      pendingReviews: propStats.assessments?.manager_reviews_pending || 0
    };
  }, [propStats]);

  // Early returns for loading and error states
  if (propLoading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="lg" message="Loading dashboard..." />
      </div>
    );
  }

  if (propError) {
    return (
      <div className="p-8">
        <div className="bg-red-900 border border-red-700 rounded-lg p-4">
          <h2 className="text-red-200 font-bold mb-2">Dashboard Error</h2>
          <p className="text-red-300">{propError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <DashboardHeader userName={userName} />
      
      {/* Quick metrics row - only render if we have data */}
      {dashboardMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Employees"
            value={dashboardMetrics.totalEmployees}
            icon={Users}
            color="blue"
          />
          <MetricCard
            title="Active Reviews"
            value={dashboardMetrics.activeReviews}
            icon={Calendar}
            color="green"
          />
          <MetricCard
            title="Completion Rate"
            value={`${dashboardMetrics.completionRate}%`}
            icon={BarChart3}
            color="cyan"
          />
          <MetricCard
            title="Pending Reviews"
            value={dashboardMetrics.pendingReviews}
            icon={Users}
            color="yellow"
          />
        </div>
      )}

      {/* Role-specific dashboard content */}
      <RoleBasedDashboard userRole={userRole} stats={propStats || null} />
    </div>
  );
});

OptimizedDashboard.displayName = 'OptimizedDashboard';

export default OptimizedDashboard;