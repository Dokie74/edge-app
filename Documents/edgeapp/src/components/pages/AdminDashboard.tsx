// src/components/pages/AdminDashboard.tsx - System-wide admin dashboard
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield,
  Users,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Activity,
  Database,
  Cpu,
  Clock,
  CheckCircle,
  Globe,
  Settings,
  Eye,
  RefreshCw,
  Download,
  Server,
  Zap,
  Target,
  Award,
  FileText,
  Inbox,
  MessageSquare,
  Star,
  ThumbsUp,
  X,
  ClipboardCheck,
  Check,
  AlertCircle,
  Edit
} from 'lucide-react';
import { useApp } from '../../contexts';
import { LoadingSpinner, ErrorMessage, Button } from '../ui';
import TeamHealthAlerts from '../ui/TeamHealthAlerts';
import { 
  MetricCard, 
  PerformanceBarChart, 
  TrendLineChart, 
  DepartmentPieChart 
} from '../analytics/ChartComponents';
import { formatDate } from '../../utils';
import RoleBasedAnalyticsService, { AdminDashboardData } from '../../services/RoleBasedAnalyticsService';
import { FeedbackService, AdminApprovalService } from '../../services';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { userName } = useApp();
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [realtimeMetrics, setRealtimeMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [feedbackReceived, setFeedbackReceived] = useState<any[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [approvalsLoading, setApprovalsLoading] = useState(true);

  useEffect(() => {
    fetchAdminDashboard();
    fetchRecentFeedback();
    fetchPendingApprovals();
    // Set up real-time metrics updates
    const interval = setInterval(fetchRealtimeMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAdminDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await RoleBasedAnalyticsService.getAdminDashboard();
      setDashboardData(data);
      await fetchRealtimeMetrics();
    } catch (err: any) {
      console.error('Error fetching admin dashboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRealtimeMetrics = async () => {
    try {
      // Mock real-time metrics for admin view
      const metrics = {
        currentLoad: Math.floor(Math.random() * 30) + 40,
        responseTime: Math.floor(Math.random() * 100) + 150,
        activeConnections: Math.floor(Math.random() * 50) + 20,
        memoryUsage: Math.floor(Math.random() * 20) + 60,
        diskUsage: Math.floor(Math.random() * 15) + 45
      };
      setRealtimeMetrics(metrics);
    } catch (err) {
      console.warn('Error fetching real-time metrics:', err);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchAdminDashboard();
    } finally {
      setRefreshing(false);
    }
  };

  const fetchRecentFeedback = async () => {
    try {
      setFeedbackLoading(true);
      console.log('🔍 AdminDashboard: Starting to fetch feedback...');
      const data = await FeedbackService.getMyFeedbackReceived(3);
      console.log('📥 AdminDashboard: Feedback received:', data);
      setFeedbackReceived(data || []);
    } catch (err: any) {
      console.error('❌ AdminDashboard: Error fetching feedback:', err);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleDismissFeedback = (feedbackId: number) => {
    setFeedbackReceived(prev => prev.filter(f => f.feedback_id !== feedbackId));
  };

  const fetchPendingApprovals = async () => {
    try {
      setApprovalsLoading(true);
      console.log('🔍 AdminDashboard: Fetching pending approvals...');
      const data = await AdminApprovalService.getPendingApprovals();
      console.log('📋 AdminDashboard: Pending approvals:', data);
      setPendingApprovals(data || []);
    } catch (err: any) {
      console.error('❌ AdminDashboard: Error fetching pending approvals:', err);
    } finally {
      setApprovalsLoading(false);
    }
  };

  const handleApproveReview = async (assessmentId: number, adminNotes?: string) => {
    try {
      await (AdminApprovalService as any).approveManagerReview(assessmentId, adminNotes);
      // Refresh the pending approvals list
      await fetchPendingApprovals();
      alert('Manager review approved successfully!');
    } catch (err: any) {
      console.error('Error approving review:', err);
      alert('Error approving review: ' + err.message);
    }
  };

  const handleRequestRevision = async (assessmentId: number, revisionNotes: string) => {
    try {
      await AdminApprovalService.requestRevision(assessmentId, revisionNotes);
      // Refresh the pending approvals list
      await fetchPendingApprovals();
      alert('Revision requested successfully! Manager will be notified.');
    } catch (err: any) {
      console.error('Error requesting revision:', err);
      alert('Error requesting revision: ' + err.message);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-l-red-600 bg-red-900/20 text-red-300';
      case 'high': return 'border-l-red-500 bg-red-900/15 text-red-400';
      case 'medium': return 'border-l-yellow-500 bg-yellow-900/15 text-yellow-400';
      default: return 'border-l-blue-500 bg-blue-900/15 text-blue-400';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return AlertTriangle;
      case 'warning': return AlertTriangle;
      default: return Activity;
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner message="Loading system dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorMessage
          error={error}
          title="Dashboard Error"
          onRetry={fetchAdminDashboard}
        />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-8">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-300">No dashboard data</h3>
          <p className="mt-1 text-sm text-gray-400">Unable to load system dashboard.</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const departmentChartData = dashboardData.departmentBreakdown.map(dept => ({
    name: dept.name,
    completed: Math.floor(dept.employeeCount * dept.completionRate / 100),
    pending: Math.floor(dept.employeeCount * (100 - dept.completionRate) / 100),
    overdue: Math.floor(Math.random() * 3)
  }));

  const pieChartData = dashboardData.departmentBreakdown.map((dept, index) => ({
    name: dept.name,
    value: dept.employeeCount,
    color: ['#0891b2', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]
  }));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 rounded-lg p-6 border border-red-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <Shield className="mr-3 text-red-400" size={28} />
              {getGreeting()}, {userName}! ⚡
            </h1>
            <p className="text-red-400 mt-1">
              System Administrator - Full Access
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Managing {dashboardData.systemStats.totalEmployees} employees across {dashboardData.departmentBreakdown.length} departments
            </p>
          </div>
          <div className="flex items-center space-x-4">
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
      </div>

      {/* Real-time System Metrics */}
      {realtimeMetrics && (
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 font-medium">System Health - Live</span>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <Cpu size={14} className="text-gray-400" />
                <span className="text-white">CPU: {realtimeMetrics.currentLoad}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <Database size={14} className="text-gray-400" />
                <span className="text-white">Memory: {realtimeMetrics.memoryUsage}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe size={14} className="text-gray-400" />
                <span className="text-white">{realtimeMetrics.activeConnections} connections</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock size={14} className="text-gray-400" />
                <span className="text-white">{realtimeMetrics.responseTime}ms avg</span>
              </div>
              <div className="flex items-center space-x-2">
                <Server size={14} className="text-gray-400" />
                <span className="text-white">Uptime: {dashboardData.systemStats.systemUptime}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Total Users"
          value={dashboardData.systemStats.totalEmployees}
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Active Users"
          value={dashboardData.systemStats.activeUsers}
          icon={Activity}
          color="green"
        />
        <MetricCard
          title="Completion Rate"
          value={`${dashboardData.organizationMetrics.overallCompletion}%`}
          icon={CheckCircle}
          color="green"
        />
        <MetricCard
          title="Satisfaction"
          value={dashboardData.organizationMetrics.overallSatisfaction.toFixed(1)}
          icon={Award}
          color="yellow"
        />
        <MetricCard
          title="Pending Reviews"
          value={dashboardData.organizationMetrics.pendingReviews}
          icon={Clock}
          color={dashboardData.organizationMetrics.pendingReviews > 0 ? 'yellow' : 'green'}
        />
        <MetricCard
          title="System Alerts"
          value={dashboardData.systemAlerts.length}
          icon={AlertTriangle}
          color={dashboardData.systemAlerts.length > 0 ? 'red' : 'green'}
        />
      </div>

      {/* Pending Manager Review Approvals */}
      {pendingApprovals.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <ClipboardCheck className="mr-2 text-orange-400" size={20} />
              Pending Manager Review Approvals ({pendingApprovals.length})
            </h2>
            <Button
              onClick={fetchPendingApprovals}
              variant="ghost"
              size="sm"
              disabled={approvalsLoading}
            >
              <RefreshCw size={14} className={approvalsLoading ? 'animate-spin' : ''} />
            </Button>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {pendingApprovals.map((approval) => (
              <PendingApprovalCard
                key={approval.assessment_id}
                approval={approval}
                onApprove={handleApproveReview}
                onRequestRevision={handleRequestRevision}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Department Performance Overview */}
        <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <BarChart3 className="mr-2" size={20} />
              Department Performance
            </h2>
            <Button variant="ghost" size="sm">
              <Eye size={14} className="mr-1" />
              Drill Down
            </Button>
          </div>
          <PerformanceBarChart data={departmentChartData} height={300} />
        </div>

        {/* System Alerts */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <AlertTriangle className="mr-2" size={20} />
              System Alerts
            </h2>
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {dashboardData.systemAlerts.filter(a => a.severity === 'high' || a.severity === 'critical').length}
            </span>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {dashboardData.systemAlerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto h-8 w-8 text-green-400" />
                <p className="text-gray-400 text-sm mt-2">All systems normal</p>
              </div>
            ) : (
              dashboardData.systemAlerts.map((alert) => {
                const Icon = getAlertIcon(alert.type);
                return (
                  <div 
                    key={alert.id} 
                    className={`p-3 rounded-lg border-l-4 ${getAlertSeverityColor(alert.severity)}`}
                  >
                    <div className="flex items-start space-x-2">
                      <Icon size={16} className="mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{alert.title}</h3>
                        <p className="text-xs mt-1 opacity-90">{alert.message}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs opacity-70">
                            {formatDate(alert.timestamp)}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            alert.severity === 'critical' ? 'bg-red-600/20 text-red-300' :
                            alert.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                            alert.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {alert.severity.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Organization Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Performance Trends */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <TrendingUp className="mr-2" size={20} />
              Performance Trends
            </h2>
          </div>
          <TrendLineChart 
            data={dashboardData.performanceTrends.map(trend => ({
              date: trend.period,
              assessments: trend.completions,
              reviews: Math.floor(trend.completions * 0.8),
              satisfaction: Math.floor(trend.satisfaction * 20) // Scale to percentage
            }))} 
            height={280} 
          />
        </div>

        {/* Employee Distribution */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Users className="mr-2" size={20} />
              Employee Distribution
            </h2>
          </div>
          <DepartmentPieChart data={pieChartData} height={280} />
        </div>
      </div>

      {/* Department Breakdown Table */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Database className="mr-2" size={20} />
            Department Breakdown
          </h2>
          <Button variant="ghost" size="sm">
            Export Data
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-300">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4">Department</th>
                <th className="text-center py-3 px-4">Employees</th>
                <th className="text-center py-3 px-4">Managers</th>
                <th className="text-center py-3 px-4">Completion Rate</th>
                <th className="text-center py-3 px-4">Satisfaction</th>
                <th className="text-center py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.departmentBreakdown.map((dept, index) => (
                <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="py-3 px-4 font-medium text-white">{dept.name}</td>
                  <td className="py-3 px-4 text-center">{dept.employeeCount}</td>
                  <td className="py-3 px-4 text-center">{dept.managerCount}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${
                      dept.completionRate >= 90 ? 'bg-green-500/20 text-green-400' :
                      dept.completionRate >= 75 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {dept.completionRate}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {dept.satisfactionScore.toFixed(1)}/5.0
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`w-2 h-2 rounded-full inline-block ${
                      dept.completionRate >= 85 ? 'bg-green-400' :
                      dept.completionRate >= 70 ? 'bg-yellow-400' :
                      'bg-red-400'
                    }`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Quick Actions */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-6 border border-gray-600">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Zap className="mr-2" size={20} />
          System Administration
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Button 
            className="flex flex-col items-center space-y-2 h-16"
            onClick={() => navigate('/admin')}
          >
            <Settings size={20} />
            <span className="text-sm">Admin Panel</span>
          </Button>
          <Button 
            className="flex flex-col items-center space-y-2 h-16" 
            variant="secondary"
          >
            <Users size={20} />
            <span className="text-sm">User Mgmt</span>
          </Button>
          <Button 
            className="flex flex-col items-center space-y-2 h-16" 
            variant="secondary"
          >
            <FileText size={20} />
            <span className="text-sm">Reports</span>
          </Button>
          <Button 
            className="flex flex-col items-center space-y-2 h-16" 
            variant="secondary"
          >
            <Database size={20} />
            <span className="text-sm">Database</span>
          </Button>
          <Button 
            className="flex flex-col items-center space-y-2 h-16" 
            variant="secondary"
          >
            <Activity size={20} />
            <span className="text-sm">Monitoring</span>
          </Button>
          <Button 
            className="flex flex-col items-center space-y-2 h-16" 
            variant="secondary"
            onClick={() => navigate('/help')}
          >
            <FileText size={20} />
            <span className="text-sm">Admin Docs</span>
          </Button>
        </div>
      </div>

      {/* Team Health Alerts Section */}
      <TeamHealthAlerts role="admin" />

      {/* Recent Feedback Section */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Inbox className="mr-2" size={20} />
            Recent Feedback
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={fetchRecentFeedback}
              className="text-gray-400 hover:text-white transition-colors text-sm"
              title="Refresh feedback"
            >
              🔄
            </button>
            <button
              onClick={() => navigate('/feedback')}
              className="text-orange-400 hover:text-orange-300 text-sm transition-colors"
            >
              View All
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
          {feedbackReceived.length > 0 ? (
            feedbackReceived.map(feedback => (
              <AdminFeedbackCard 
                key={feedback.feedback_id} 
                feedback={feedback} 
                onDismiss={handleDismissFeedback}
              />
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-400 text-sm">No recent feedback</p>
            </div>
          )}
        </div>
      </div>

      {/* Admin Documentation Section */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Shield className="mr-2" size={20} />
            Admin Documentation Hub
          </h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/help')}
          >
            View Full Documentation
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* API Documentation */}
          <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
            <h3 className="text-white font-medium mb-3 flex items-center">
              <Server className="mr-2 text-blue-400" size={16} />
              API Documentation
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• REST API endpoints and authentication</li>
              <li>• Request/response schemas</li>
              <li>• Rate limiting and error handling</li>
              <li>• Webhook configuration</li>
            </ul>
          </div>

          {/* Developer Guides */}
          <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
            <h3 className="text-white font-medium mb-3 flex items-center">
              <FileText className="mr-2 text-green-400" size={16} />
              Developer Guides
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• System architecture overview</li>
              <li>• Database schema and relationships</li>
              <li>• Component library documentation</li>
              <li>• Deployment and CI/CD guides</li>
            </ul>
          </div>

          {/* Monitoring & Logs */}
          <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
            <h3 className="text-white font-medium mb-3 flex items-center">
              <Activity className="mr-2 text-purple-400" size={16} />
              Monitoring & Logs
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• System health monitoring dashboard</li>
              <li>• Error tracking and alerting</li>
              <li>• Performance metrics and analytics</li>
              <li>• Log aggregation and search</li>
            </ul>
          </div>

          {/* System Management */}
          <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
            <h3 className="text-white font-medium mb-3 flex items-center">
              <Settings className="mr-2 text-yellow-400" size={16} />
              System Management
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• User management and permissions</li>
              <li>• Review cycle configuration</li>
              <li>• System settings and preferences</li>
              <li>• Data backup and recovery</li>
            </ul>
          </div>

          {/* Security & Compliance */}
          <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
            <h3 className="text-white font-medium mb-3 flex items-center">
              <Shield className="mr-2 text-red-400" size={16} />
              Security & Compliance
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Authentication and authorization</li>
              <li>• Data privacy and GDPR compliance</li>
              <li>• Security audit logs</li>
              <li>• Penetration testing reports</li>
            </ul>
          </div>

          {/* Troubleshooting */}
          <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
            <h3 className="text-white font-medium mb-3 flex items-center">
              <AlertTriangle className="mr-2 text-orange-400" size={16} />
              Troubleshooting
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Common issues and solutions</li>
              <li>• Performance optimization tips</li>
              <li>• Database maintenance procedures</li>
              <li>• Emergency response procedures</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Feedback type configuration
const feedbackTypeConfig = {
  positive: { 
    icon: Star, 
    color: 'text-yellow-400', 
    bgColor: 'bg-yellow-900', 
    label: 'Recognition' 
  },
  constructive: { 
    icon: MessageSquare, 
    color: 'text-blue-400', 
    bgColor: 'bg-blue-900', 
    label: 'Growth' 
  },
  appreciation: { 
    icon: ThumbsUp, 
    color: 'text-green-400', 
    bgColor: 'bg-green-900', 
    label: 'Thanks' 
  }
};

// Feedback Card Component for AdminDashboard
const AdminFeedbackCard = ({ feedback, onDismiss }: { feedback: any, onDismiss: (id: number) => void }) => {
  const typeConfig = feedbackTypeConfig[feedback.feedback_type as keyof typeof feedbackTypeConfig] || feedbackTypeConfig.positive;
  const Icon = typeConfig.icon;

  return (
    <div className="bg-gray-700/50 p-4 rounded-lg group hover:bg-gray-700 transition-colors">
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-lg ${typeConfig.bgColor} bg-opacity-50 flex-shrink-0`}>
          <Icon size={16} className={typeConfig.color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-white font-medium text-sm">You</span>
              <span className="text-gray-400 text-xs">received</span>
              <span className={`px-2 py-1 text-xs rounded ${typeConfig.bgColor} ${typeConfig.color}`}>
                {typeConfig.label}
              </span>
            </div>
            <button
              onClick={() => onDismiss(feedback.feedback_id)}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-all duration-200"
              title="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
          <p className="text-gray-300 text-sm mb-2 line-clamp-2">{feedback.message}</p>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-xs">
              from {feedback.is_anonymous ? 'Anonymous' : feedback.giver_name}
            </span>
            <span className="text-gray-500 text-xs">
              {formatDate(feedback.created_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Pending Approval Card Component
const PendingApprovalCard = ({ 
  approval, 
  onApprove, 
  onRequestRevision 
}: { 
  approval: any, 
  onApprove: (id: number, notes?: string) => void,  
  onRequestRevision: (id: number, notes: string) => void 
}) => {
  const [showActions, setShowActions] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [showApprovalForm, setShowApprovalForm] = useState(false);

  const handleApprove = () => {
    onApprove(approval.assessment_id, adminNotes.trim() || undefined);
    setShowApprovalForm(false);
    setAdminNotes('');
  };

  const handleRequestRevision = () => {
    if (revisionNotes.trim()) {
      onRequestRevision(approval.assessment_id, revisionNotes.trim());
      setShowRevisionForm(false);
      setRevisionNotes('');
    }
  };

  return (
    <div className="bg-gray-700/50 rounded-lg p-4 border border-orange-500/20">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-white font-medium">{approval.employee_name}</h3>
          <p className="text-gray-400 text-sm">{approval.review_cycle_name}</p>
          <p className="text-gray-500 text-xs">
            Manager: {approval.manager_name} • Submitted: {formatDate(approval.submitted_date)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-xs font-medium">
            Pending Approval
          </span>
          <button
            onClick={() => setShowActions(!showActions)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Edit size={16} />
          </button>
        </div>
      </div>

      {approval.manager_performance_rating && (
        <div className="mb-3">
          <span className="text-sm text-gray-400">Rating: </span>
          <span className="text-white text-sm font-medium capitalize">
            {approval.manager_performance_rating.replace('_', ' ')}
          </span>
        </div>
      )}

      {approval.manager_summary_comments && (
        <div className="mb-3">
          <p className="text-gray-300 text-sm line-clamp-2">
            {approval.manager_summary_comments}
          </p>
        </div>
      )}

      {showActions && (
        <div className="mt-4 pt-4 border-t border-gray-600">
          <div className="flex space-x-3">
            <Button
              onClick={() => setShowApprovalForm(true)}
              variant="primary"
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Check size={14} className="mr-1" />
              Approve
            </Button>
            <Button
              onClick={() => setShowRevisionForm(true)}
              variant="secondary"
              size="sm"
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              <AlertCircle size={14} className="mr-1" />
              Request Revision
            </Button>
          </div>
        </div>
      )}

      {showApprovalForm && (
        <div className="mt-4 pt-4 border-t border-gray-600">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Admin Notes (Optional)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                rows={2}
                placeholder="Add any notes about this approval..."
              />
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleApprove}
                variant="primary"
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                Confirm Approval
              </Button>
              <Button
                onClick={() => {
                  setShowApprovalForm(false);
                  setAdminNotes('');
                }}
                variant="secondary"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {showRevisionForm && (
        <div className="mt-4 pt-4 border-t border-gray-600">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Revision Notes (Required)
              </label>
              <textarea
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                rows={3}
                placeholder="Explain what needs to be revised..."
                required
              />
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleRequestRevision}
                variant="primary"
                size="sm"
                className="bg-yellow-600 hover:bg-yellow-700"
                disabled={!revisionNotes.trim()}
              >
                Send for Revision
              </Button>
              <Button
                onClick={() => {
                  setShowRevisionForm(false);
                  setRevisionNotes('');
                }}
                variant="secondary"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};