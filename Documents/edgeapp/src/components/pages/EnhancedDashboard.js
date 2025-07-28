// src/components/pages/EnhancedDashboard.js - Enhanced dashboard with progress tracking
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText, 
  Target, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Award,
  Bell,
  Activity
} from 'lucide-react';
import { useApp } from '../../contexts';
import { LoadingSpinner, ErrorMessage, StatusBadge } from '../ui';
import { formatDate } from '../../utils';
import NotificationService from '../../services/NotificationService';

export default function EnhancedDashboard() {
  const { userRole, userName } = useApp();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, [userRole]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await NotificationService.getDashboardStats(userRole);
      console.log('Dashboard stats received:', JSON.stringify(data, null, 2));
      setStats(data);
      
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="lg" message="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorMessage 
          error={error} 
          title="Dashboard Error" 
          onRetry={fetchDashboardStats}
        />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-cyan-400 flex items-center">
            <BarChart3 className="mr-3" size={36} />
            Dashboard
          </h1>
          <p className="text-gray-400 mt-2">
            Welcome back, {userName}! Here's your performance overview.
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchDashboardStats}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Activity className="mr-2" size={16} />
            Refresh Stats
          </button>
          {/* Debug info - temporary */}
          <div className="text-xs text-gray-500 bg-gray-800 px-3 py-2 rounded">
            Role: {userRole} | Data: {stats ? 'loaded' : 'none'} | Pending: {stats?.assessments?.pending || 0}
          </div>
        </div>
      </div>

      {/* Role-specific Dashboard Content */}
      {userRole === 'admin' && <AdminDashboard stats={stats} />}
      {userRole === 'manager' && <ManagerDashboard stats={stats} />}
      {userRole === 'employee' && <EmployeeDashboard stats={stats} />}
    </div>
  );
}

// Admin Dashboard Component
const AdminDashboard = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Employees"
          value={stats.employees?.total || 0}
          icon={Users}
          color="blue"
          subtitle={`${Object.values(stats.employees?.by_role || {}).length} roles`}
        />
        <MetricCard
          title="Active Review Cycles"
          value={stats.review_cycles?.active || 0}
          icon={Calendar}
          color="green"
          subtitle={`${stats.review_cycles?.total || 0} total cycles`}
        />
        <MetricCard
          title="Assessment Completion"
          value={`${stats.assessments?.completion_rate || 0}%`}
          icon={CheckCircle}
          color="cyan"
          subtitle={`${stats.assessments?.completed || 0}/${stats.assessments?.total || 0} completed`}
        />
        <MetricCard
          title="Pending Reviews"
          value={stats.assessments?.manager_reviews_pending || 0}
          icon={Clock}
          color="yellow"
          subtitle="Awaiting manager review"
        />
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Employee Distribution */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Users className="mr-2 text-blue-400" size={20} />
            Employee Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.employees?.by_role || {}).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between">
                <span className="text-gray-300 capitalize">{role}s</span>
                <div className="flex items-center space-x-2">
                  <div className="bg-gray-700 rounded-full h-2 w-24">
                    <div 
                      className="bg-blue-500 rounded-full h-2"
                      style={{ width: `${(count / stats.employees.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-white font-medium w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Development Plans Overview */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Target className="mr-2 text-purple-400" size={20} />
            Development Plans
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">{stats.development_plans?.submitted || 0}</p>
              <p className="text-gray-400 text-sm">Submitted</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-400">{stats.development_plans?.approved || 0}</p>
              <p className="text-gray-400 text-sm">Approved</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-yellow-400">{stats.development_plans?.under_review || 0}</p>
              <p className="text-gray-400 text-sm">Under Review</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-red-400">{stats.development_plans?.needs_revision || 0}</p>
              <p className="text-gray-400 text-sm">Need Revision</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {stats.recent_activity && stats.recent_activity.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Activity className="mr-2 text-green-400" size={20} />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {stats.recent_activity.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-gray-300">{activity.description}</p>
                  <p className="text-gray-500 text-sm">{formatDate(activity.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Manager Dashboard Component
const ManagerDashboard = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Team Members"
          value={stats.team?.total_members || 0}
          icon={Users}
          color="blue"
          subtitle="Direct reports"
        />
        <MetricCard
          title="Pending Reviews"
          value={stats.pending_reviews || 0}
          icon={Clock}
          color="yellow"
          subtitle="Awaiting your review"
        />
        <MetricCard
          title="Team Completion Rate"
          value={`${stats.assessments?.team_completion_rate || 0}%`}
          icon={TrendingUp}
          color="green"
          subtitle="Assessment completion"
        />
        <MetricCard
          title="Development Plans"
          value={stats.development_plans?.pending_review || 0}
          icon={Target}
          color="purple"
          subtitle="Pending review"
        />
      </div>

      {/* Team Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Users className="mr-2 text-blue-400" size={20} />
            Your Team
          </h3>
          {stats.team?.team_members && stats.team.team_members.length > 0 ? (
            <div className="space-y-3">
              {stats.team.team_members.slice(0, 5).map((member) => (
                <div key={member.id} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                  <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{member.name}</p>
                    <p className="text-gray-400 text-sm">{member.job_title}</p>
                  </div>
                </div>
              ))}
              {stats.team.team_members.length > 5 && (
                <p className="text-gray-400 text-sm text-center">
                  ... and {stats.team.team_members.length - 5} more team members
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-400">No team members assigned yet.</p>
          )}
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Target className="mr-2 text-purple-400" size={20} />
            Development Plan Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Pending Review</span>
              <span className="text-yellow-400 font-bold">{stats.development_plans?.pending_review || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Approved</span>
              <span className="text-green-400 font-bold">{stats.development_plans?.approved || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Need Revision</span>
              <span className="text-red-400 font-bold">{stats.development_plans?.needs_revision || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Employee Dashboard Component
const EmployeeDashboard = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Assessments Completed"
          value={stats.assessments?.completed || 0}
          icon={CheckCircle}
          color="green"
          subtitle={`${stats.assessments?.total || 0} total assessments`}
        />
        <MetricCard
          title="Pending Assessments"
          value={stats.assessments?.pending || 0}
          icon={Clock}
          color="yellow"
          subtitle="Action required"
        />
        <MetricCard
          title="Development Plans"
          value={stats.development_plans?.total || 0}
          icon={Target}
          color="purple"
          subtitle={`${stats.development_plans?.approved || 0} approved`}
        />
        <MetricCard
          title="Manager Reviews"
          value={stats.assessments?.manager_reviews_completed || 0}
          icon={Award}
          color="cyan"
          subtitle="Feedback received"
        />
      </div>

      {/* Profile and Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Info */}
        {stats.profile && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Users className="mr-2 text-blue-400" size={20} />
              Your Profile
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {stats.profile.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium">{stats.profile.name}</p>
                  <p className="text-gray-400">{stats.profile.job_title}</p>
                  <p className="text-gray-500 text-sm">{stats.profile.email}</p>
                </div>
              </div>
              {stats.profile.manager_name && (
                <div className="bg-gray-700 rounded-lg p-3">
                  <p className="text-gray-400 text-sm">Reports to</p>
                  <p className="text-white">{stats.profile.manager_name}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Development Progress */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="mr-2 text-green-400" size={20} />
            Development Progress
          </h3>
          <div className="space-y-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300">Development Plans</span>
                <span className="text-white font-bold">{stats.development_plans?.total || 0}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-400">✓ Approved</span>
                  <span className="text-green-400">{stats.development_plans?.approved || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-yellow-400">⏳ Under Review</span>
                  <span className="text-yellow-400">{stats.development_plans?.under_review || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-red-400">⚠ Needs Revision</span>
                  <span className="text-red-400">{stats.development_plans?.needs_revision || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Metric Card Component
const MetricCard = ({ title, value, icon: Icon, color, subtitle }) => {
  const colorClasses = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    red: 'text-red-400',
    purple: 'text-purple-400',
    cyan: 'text-cyan-400'
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center">
        <Icon className={`${colorClasses[color]} mr-3`} size={24} />
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
};