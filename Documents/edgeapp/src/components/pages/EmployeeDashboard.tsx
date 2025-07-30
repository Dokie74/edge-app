// src/components/pages/EmployeeDashboard.tsx - Personal employee dashboard
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User,
  CheckCircle, 
  Clock, 
  Target, 
  Users,
  Calendar,
  TrendingUp,
  AlertCircle,
  BookOpen,
  Award,
  Activity,
  ArrowRight,
  FileText,
  Inbox,
  MessageSquare,
  Star,
  ThumbsUp,
  X
} from 'lucide-react';
import { useApp } from '../../contexts';
import { LoadingSpinner, ErrorMessage, Button } from '../ui';
import { QuickHealthCheck } from '../ui/TeamHealthPulse';
import { MetricCard } from '../analytics/ChartComponents';
import { formatDate } from '../../utils';
import RoleBasedAnalyticsService, { EmployeeDashboardData } from '../../services/RoleBasedAnalyticsService';
import { FeedbackService } from '../../services';

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { userName, user } = useApp();
  const [dashboardData, setDashboardData] = useState<EmployeeDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackReceived, setFeedbackReceived] = useState<any[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchEmployeeDashboard();
      fetchRecentFeedback();
    }
  }, [user?.id]);

  const fetchEmployeeDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await RoleBasedAnalyticsService.getEmployeeDashboard(user!.id);
      setDashboardData(data);
    } catch (err: any) {
      console.error('Error fetching employee dashboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentFeedback = async () => {
    try {
      setFeedbackLoading(true);
      console.log('🔍 EmployeeDashboard: Starting to fetch feedback...');
      const data = await FeedbackService.getMyFeedbackReceived(3);
      console.log('📥 EmployeeDashboard: Feedback received:', data);
      console.log('📊 EmployeeDashboard: Feedback count:', data?.length || 0);
      if (data && data.length > 0) {
        console.log('📝 EmployeeDashboard: First feedback item:', data[0]);
      }
      setFeedbackReceived(data || []);
    } catch (err: any) {
      console.error('❌ EmployeeDashboard: Error fetching feedback:', err);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleDismissFeedback = (feedbackId: number) => {
    setFeedbackReceived(prev => prev.filter(f => f.feedback_id !== feedbackId));
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getTaskPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-900/10';
      case 'medium': return 'border-l-yellow-500 bg-yellow-900/10';
      default: return 'border-l-blue-500 bg-blue-900/10';
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner message="Loading your dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorMessage
          error={error}
          title="Dashboard Error"
          onRetry={fetchEmployeeDashboard}
        />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-8">
        <div className="text-center">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-300">No dashboard data</h3>
          <p className="mt-1 text-sm text-gray-400">Unable to load your personal dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Personal Header */}
      <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-lg p-6 border border-cyan-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {getGreeting()}, {userName}! 👋
            </h1>
            <p className="text-cyan-400 mt-1">
              Welcome to your personal dashboard
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Department: {dashboardData.departmentInfo.departmentName} • 
              Team Size: {dashboardData.departmentInfo.teamSize} members
            </p>
          </div>
          <div className="text-right">
            <div className="text-cyan-400 text-2xl font-bold">
              {dashboardData.personalStats.goalsProgress}%
            </div>
            <div className="text-gray-400 text-sm">Goals Progress</div>
          </div>
        </div>
      </div>

      {/* Personal KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Pending Tasks"
          value={dashboardData.personalStats.pendingAssessments}
          icon={Clock}
          color={dashboardData.personalStats.pendingAssessments > 0 ? 'yellow' : 'green'}
        />
        <MetricCard
          title="Completed"
          value={dashboardData.personalStats.completedAssessments}
          icon={CheckCircle}
          color="green"
        />
        <MetricCard
          title="Team Satisfaction"
          value={dashboardData.departmentInfo.avgSatisfaction.toFixed(1)}
          icon={Award}
          color="blue"
        />
        <MetricCard
          title="Dept Progress"
          value={`${dashboardData.departmentInfo.departmentGoalsProgress}%`}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Feedback Received KPI - Separate */}
      {feedbackReceived.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Feedback Received</p>
              <p className="text-2xl font-bold text-white mt-1">{feedbackReceived.length}</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-500/10 ring-1 ring-yellow-500/20">
              <Inbox size={24} className="text-yellow-400" />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* My Tasks - Priority Section */}
        <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Target className="mr-2" size={20} />
              My Tasks & Priorities
            </h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/reviews')}
            >
              View All
            </Button>
          </div>
          
          {dashboardData.myTasks.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-300">All caught up!</h3>
              <p className="mt-1 text-sm text-gray-400">You have no pending tasks right now.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dashboardData.myTasks.map((task) => (
                <div 
                  key={task.id} 
                  className={`p-4 rounded-lg border-l-4 ${getTaskPriorityColor(task.priority)} cursor-pointer hover:bg-gray-700/30 transition-colors`}
                  onClick={() => {
                    if (task.type === 'assessment') {
                      navigate(`/assessment/${task.id}`);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium text-sm">{task.title}</h3>
                      <p className="text-gray-400 text-xs mt-1">
                        Due: {formatDate(task.dueDate)}
                      </p>
                      <div className="flex items-center mt-2 space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {task.priority.toUpperCase()}
                        </span>
                        <span className="text-gray-500 text-xs capitalize">
                          {task.type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Department Info & Quick Stats */}
        <div className="space-y-6">
          
          {/* Team Health Check */}
          <QuickHealthCheck />
          
          {/* Department Overview */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Users className="mr-2" size={18} />
              My Department
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Team Size</span>
                  <span className="text-white font-medium">{dashboardData.departmentInfo.teamSize}</span>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Team Goals Progress</span>
                  <span className="text-white font-medium">{dashboardData.departmentInfo.departmentGoalsProgress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${dashboardData.departmentInfo.departmentGoalsProgress}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Avg Satisfaction</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-400 font-medium">
                      {dashboardData.departmentInfo.avgSatisfaction.toFixed(1)}
                    </span>
                    <span className="text-gray-500 text-xs">/5.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Activity className="mr-2" size={18} />
              Recent Activity
            </h2>
            <div className="space-y-3">
              {dashboardData.recentActivity.length === 0 ? (
                <p className="text-gray-400 text-sm">No recent activity</p>
              ) : (
                dashboardData.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2" />
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{activity.action}</p>
                      <p className="text-gray-400 text-xs">{activity.description}</p>
                      <p className="text-gray-500 text-xs mt-1">{formatDate(activity.date)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Debug Section - Temporary */}
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <h3 className="text-red-400 font-medium mb-2">🐛 Debug Info</h3>
            <p className="text-red-300 text-sm">Feedback count: {feedbackReceived.length}</p>
            <p className="text-red-300 text-sm">Loading: {feedbackLoading ? 'Yes' : 'No'}</p>
            <p className="text-red-300 text-sm">Should show section: {feedbackReceived.length > 0 ? 'YES' : 'NO'}</p>
            <p className="text-red-300 text-sm">Array type: {Array.isArray(feedbackReceived) ? 'Array' : typeof feedbackReceived}</p>
            <button 
              onClick={fetchRecentFeedback}
              className="mt-2 bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm"
            >
              Force Refresh
            </button>
          </div>

          {/* Recent Feedback - Always show for debugging */}
          {true && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <Inbox className="mr-2" size={18} />
                  Recent Feedback
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={fetchRecentFeedback}
                    className="text-gray-400 hover:text-white transition-colors"
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
                    <FeedbackCard 
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
          )}
        </div>
      </div>

      {/* Personal Notifications */}
      {dashboardData.notifications.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <AlertCircle className="mr-2" size={18} />
            Personal Notifications
          </h2>
          <div className="space-y-3">
            {dashboardData.notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 rounded-lg border-l-4 ${
                  notification.type === 'warning' 
                    ? 'border-l-yellow-500 bg-yellow-900/10' 
                    : 'border-l-blue-500 bg-blue-900/10'
                }`}
              >
                <h3 className="text-white font-medium text-sm">{notification.title}</h3>
                <p className="text-gray-300 text-sm mt-1">{notification.message}</p>
                <p className="text-gray-500 text-xs mt-2">{formatDate(notification.timestamp)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-6 border border-gray-600">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            className="flex flex-col items-center space-y-2 h-16"
            onClick={() => navigate('/reviews')}
          >
            <Calendar size={20} />
            <span className="text-sm">My Reviews</span>
          </Button>
          <Button 
            className="flex flex-col items-center space-y-2 h-16" 
            variant="secondary"
            onClick={() => navigate('/development')}
          >
            <BookOpen size={20} />
            <span className="text-sm">Development</span>
          </Button>
          <Button 
            className="flex flex-col items-center space-y-2 h-16" 
            variant="secondary"
            onClick={() => navigate('/feedback')}
          >
            <Award size={20} />
            <span className="text-sm">Feedback</span>
          </Button>
          <Button 
            className="flex flex-col items-center space-y-2 h-16" 
            variant="secondary"
            onClick={() => navigate('/help')}
          >
            <BookOpen size={20} />
            <span className="text-sm">Help Guide</span>
          </Button>
        </div>
      </div>

      {/* Employee Guide Section */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <BookOpen className="mr-2" size={20} />
            Employee Quick Guide
          </h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/help')}
          >
            View Full Guide
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Getting Started */}
          <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
            <h3 className="text-white font-medium mb-3 flex items-center">
              <CheckCircle className="mr-2 text-green-400" size={16} />
              Getting Started
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Complete your profile setup</li>
              <li>• Review current assessment cycle</li>
              <li>• Set personal development goals</li>
              <li>• Familiarize yourself with the feedback system</li>
            </ul>
          </div>

          {/* Assessment Tips */}
          <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
            <h3 className="text-white font-medium mb-3 flex items-center">
              <FileText className="mr-2 text-blue-400" size={16} />
              Assessment Tips
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Be specific with examples and metrics</li>
              <li>• Use the STAR method (Situation, Task, Action, Result)</li>
              <li>• Save drafts frequently while working</li>
              <li>• Submit before the deadline</li>
            </ul>
          </div>

          {/* Development Planning */}
          <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
            <h3 className="text-white font-medium mb-3 flex items-center">
              <Target className="mr-2 text-purple-400" size={16} />
              Development Planning
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Identify skill gaps and growth areas</li>
              <li>• Set SMART goals (Specific, Measurable, etc.)</li>
              <li>• Request feedback from peers and manager</li>
              <li>• Track progress regularly</li>
            </ul>
          </div>

          {/* Need Help? */}
          <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
            <h3 className="text-white font-medium mb-3 flex items-center">
              <AlertCircle className="mr-2 text-yellow-400" size={16} />
              Need Help?
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Contact your manager for guidance</li>
              <li>• Use the feedback wall for questions</li>
              <li>• Access the full help guide anytime</li>
              <li>• Check notification center for updates</li>
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

// Feedback Card Component for EmployeeDashboard
const FeedbackCard = ({ feedback, onDismiss }: { feedback: any, onDismiss: (id: number) => void }) => {
  const typeConfig = feedbackTypeConfig[feedback.feedback_type as keyof typeof feedbackTypeConfig] || feedbackTypeConfig.positive;
  const Icon = typeConfig.icon;

  return (
    <div className="bg-gray-700/50 p-3 rounded-lg group hover:bg-gray-700 transition-colors">
      <div className="flex items-start space-x-3">
        <div className={`p-1.5 rounded-lg ${typeConfig.bgColor} bg-opacity-50 flex-shrink-0`}>
          <Icon size={14} className={typeConfig.color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <span className="text-white font-medium text-sm">You</span>
              <span className="text-gray-400 text-xs">received</span>
              <span className={`px-1.5 py-0.5 text-xs rounded ${typeConfig.bgColor} ${typeConfig.color}`}>
                {typeConfig.label}
              </span>
            </div>
            <button
              onClick={() => onDismiss(feedback.feedback_id)}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-all duration-200"
              title="Dismiss"
            >
              <X size={12} />
            </button>
          </div>
          <p className="text-gray-300 text-xs mb-2 line-clamp-2">{feedback.message}</p>
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