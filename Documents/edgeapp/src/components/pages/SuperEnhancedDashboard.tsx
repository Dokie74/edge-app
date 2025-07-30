// src/components/pages/SuperEnhancedDashboard.tsx - Advanced analytics dashboard
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
  Activity,
  Zap,
  Eye,
  RefreshCw,
  Download,
  Filter,
  Globe,
  Cpu,
  Timer
} from 'lucide-react';
import { useApp } from '../../contexts';
import { LoadingSpinner, ErrorMessage, Button } from '../ui';
import { formatDate } from '../../utils';
import AnalyticsService, { AnalyticsData } from '../../services/AnalyticsService';
import {
  MetricCard,
  PerformanceBarChart,
  TrendLineChart,
  DepartmentPieChart,
  EngagementAreaChart,
  GoalProgressRadial
} from '../analytics/ChartComponents';

export default function SuperEnhancedDashboard() {
  const { userRole, userName } = useApp();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [realtimeMetrics, setRealtimeMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');

  useEffect(() => {
    fetchDashboardAnalytics();
    // Set up real-time metrics updates
    const interval = setInterval(fetchRealtimeMetrics, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [userRole]);

  const fetchDashboardAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AnalyticsService.getDashboardAnalytics(userRole || 'employee');
      setAnalytics(data);
      await fetchRealtimeMetrics();
    } catch (err: any) {
      console.error('Error fetching dashboard analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRealtimeMetrics = async () => {
    try {
      const metrics = await AnalyticsService.getRealtimeMetrics();
      setRealtimeMetrics(metrics);
    } catch (err) {
      console.warn('Error fetching real-time metrics:', err);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchDashboardAnalytics();
    } finally {
      setRefreshing(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'assessment_completed': return CheckCircle;
      case 'review_submitted': return FileText;
      case 'goal_achieved': return Target;
      case 'feedback_given': return Award;
      default: return Activity;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'border-red-500 bg-red-900/20';
      case 'warning': return 'border-yellow-500 bg-yellow-900/20';
      case 'success': return 'border-green-500 bg-green-900/20';
      default: return 'border-blue-500 bg-blue-900/20';
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner message="Loading advanced analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorMessage
          error={error}
          title="Dashboard Error"
          onRetry={fetchDashboardAnalytics}
        />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-8">
        <div className="text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-300">No analytics data</h3>
          <p className="mt-1 text-sm text-gray-400">Unable to load dashboard analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header with greeting and controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {getGreeting()}, {userName}!
          </h1>
          <p className="text-gray-400 mt-1">
            Here's what's happening with your team today
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="secondary"
            className="flex items-center space-x-2"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </Button>
          <Button
            variant="secondary"
            className="flex items-center space-x-2"
          >
            <Download size={16} />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Real-time metrics banner */}
      {realtimeMetrics && (
        <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-cyan-400 font-medium">Live Metrics</span>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <Globe size={14} className="text-gray-400" />
                <span className="text-white">{realtimeMetrics.activeUsers} active users</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle size={14} className="text-gray-400" />
                <span className="text-white">{realtimeMetrics.completionsToday} completions today</span>
              </div>
              <div className="flex items-center space-x-2">
                <Cpu size={14} className="text-gray-400" />
                <span className="text-white">{realtimeMetrics.systemLoad}% load</span>
              </div>
              <div className="flex items-center space-x-2">
                <Timer size={14} className="text-gray-400" />
                <span className="text-white">{realtimeMetrics.responseTime}ms response</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="Total Employees"
          value={analytics.kpis.totalEmployees}
          change={5.2}
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Active Cycles"
          value={analytics.kpis.activeReviewCycles}
          change={0}
          icon={Calendar}
          color="purple"
        />
        <MetricCard
          title="Completion Rate"
          value={`${analytics.kpis.completionRate}%`}
          change={3.1}
          icon={CheckCircle}
          color="green"
        />
        <MetricCard
          title="Avg Satisfaction"
          value={analytics.kpis.averageSatisfaction.toFixed(1)}
          change={0.3}
          icon={Award}
          color="yellow"
        />
        <MetricCard
          title="Overdue Tasks"
          value={analytics.kpis.overdueTasks}
          change={-12.5}
          icon={AlertTriangle}
          color="red"
        />
        <MetricCard
          title="Engagement Score"
          value={`${analytics.kpis.engagementScore}%`}
          change={2.8}
          icon={TrendingUp}
          color="green"
        />
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Overview */}
        <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <BarChart3 className="mr-2" size={20} />
              Performance Overview
            </h2>
            <Button variant="ghost" size="sm">
              <Eye size={14} className="mr-1" />
              Details
            </Button>
          </div>
          <PerformanceBarChart data={analytics.performanceOverview} height={300} />
        </div>

        {/* Goal Progress */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Target className="mr-2" size={20} />
              Goal Progress
            </h2>
          </div>
          <GoalProgressRadial data={analytics.goalProgress} height={280} />
        </div>
      </div>

      {/* Trend Analysis and Department Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <TrendingUp className="mr-2" size={20} />
              Trend Analysis
            </h2>
          </div>
          <TrendLineChart data={analytics.trendData} height={300} />
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Users className="mr-2" size={20} />
              Department Distribution
            </h2>
          </div>
          <DepartmentPieChart data={analytics.departmentData} height={300} />
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Activity className="mr-2" size={20} />
            Engagement & Satisfaction Trends
          </h2>
        </div>
        <EngagementAreaChart data={analytics.engagementData} height={300} />
      </div>

      {/* Activity Feed and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Activity className="mr-2" size={20} />
              Recent Activity
            </h2>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>
          <div className="space-y-4">
            {analytics.recentActivity.map((activity) => {
              const IconComponent = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-700/50">
                  <div className="p-2 rounded-full bg-cyan-500/10">
                    <IconComponent size={16} className="text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm">{activity.title}</p>
                    <p className="text-gray-400 text-sm">{activity.description}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {formatDate(activity.timestamp)} • {activity.user}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Bell className="mr-2" size={20} />
              System Alerts
            </h2>
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {analytics.alerts.filter(a => !a.read).length}
            </span>
          </div>
          <div className="space-y-3">
            {analytics.alerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-4 rounded-lg border-l-4 ${getAlertColor(alert.type)} ${
                  !alert.read ? 'ring-1 ring-cyan-500/20' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white font-medium text-sm">{alert.title}</h3>
                    <p className="text-gray-300 text-sm mt-1">{alert.message}</p>
                    <p className="text-gray-500 text-xs mt-2">
                      {formatDate(alert.timestamp)}
                    </p>
                  </div>
                  {!alert.read && (
                    <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-6 border border-gray-600">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Zap className="mr-2" size={20} />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button className="flex flex-col items-center space-y-2 h-20">
            <FileText size={20} />
            <span className="text-sm">Start Review</span>
          </Button>
          <Button className="flex flex-col items-center space-y-2 h-20" variant="secondary">
            <Users size={20} />
            <span className="text-sm">Add Employee</span>
          </Button>
          <Button className="flex flex-col items-center space-y-2 h-20" variant="secondary">
            <Target size={20} />
            <span className="text-sm">Set Goals</span>
          </Button>
          <Button className="flex flex-col items-center space-y-2 h-20" variant="secondary">
            <Award size={20} />
            <span className="text-sm">Give Feedback</span>
          </Button>
        </div>
      </div>
    </div>
  );
}