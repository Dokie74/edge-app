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
  X,
  BarChart3
} from 'lucide-react';
import { useApp } from '../../contexts';
import { LoadingSpinner, ErrorMessage, Button } from '../ui';
import { QuickHealthCheck } from '../ui/TeamHealthPulse';
import { MetricCard } from '../analytics/ChartComponents';
import { formatDate, calculateAssessmentScore, getAssessmentTrends } from '../../utils';
import RoleBasedAnalyticsService, { EmployeeDashboardData } from '../../services/RoleBasedAnalyticsService';
import { FeedbackService } from '../../services';

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { userName, user } = useApp();
  const [dashboardData, setDashboardData] = useState<EmployeeDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackReceived, setFeedbackReceived] = useState<any[]>([]);
  const [dismissedFeedback, setDismissedFeedback] = useState<Set<number>>(new Set());
  const [assessmentTrends, setAssessmentTrends] = useState<any[]>([]);
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
      
      // Calculate assessment trends if assessments are available
      if (data?.assessments) {
        const trends = getAssessmentTrends(data.assessments);
        setAssessmentTrends(trends);
      }
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
    setDismissedFeedback(prev => new Set([...prev, feedbackId]));
    // Also remove from current display
    setFeedbackReceived(prev => prev.filter(f => f.feedback_id !== feedbackId));
  };

  const getVisibleFeedback = () => {
    return feedbackReceived.filter(f => !dismissedFeedback.has(f.feedback_id));
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

      {/* Quick Stats - Compact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Active Reviews"
          value={dashboardData.personalStats.pendingAssessments}
          icon={Clock}
          color={dashboardData.personalStats.pendingAssessments > 0 ? 'yellow' : 'green'}
        />
        <MetricCard
          title="Recent Feedback"
          value={getVisibleFeedback().length}
          icon={Inbox}
          color="orange"
        />
        <MetricCard
          title="Completed Reviews"
          value={dashboardData.personalStats.completedAssessments}
          icon={CheckCircle}
          color="green"
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
        
        {/* My Tasks & Priorities - Enhanced */}
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
          
          <div className="space-y-4">
            {/* 🎺 TRUMPETED Feedback Wall Notifications */}
            {getVisibleFeedback().map(feedback => (
              <div 
                key={`feedback-${feedback.feedback_id}`}
                className="p-4 rounded-lg border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-900/20 to-orange-800/10 cursor-pointer hover:bg-orange-800/20 transition-all duration-200 shadow-md"
                onClick={() => navigate('/feedback')}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="p-1.5 rounded-full bg-orange-500/20 animate-pulse">
                        <Star size={14} className="text-orange-400" />
                      </div>
                      <span className="text-orange-400 font-medium text-sm">🎺 New Feedback Received!</span>
                      <span className="px-2 py-1 rounded-full text-xs bg-orange-500/20 text-orange-400 font-medium">
                        HIGH PRIORITY
                      </span>
                    </div>
                    <h3 className="text-white font-medium text-sm mb-1">
                      Feedback from {feedback.is_anonymous ? 'Anonymous' : feedback.giver_name}
                    </h3>
                    <p className="text-gray-300 text-sm line-clamp-2 mb-2">{feedback.message}</p>
                    <p className="text-orange-400 text-xs">
                      Click to view on Feedback Wall • {formatDate(feedback.created_at)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDismissFeedback(feedback.feedback_id);
                    }}
                    className="ml-4 text-gray-400 hover:text-white transition-colors p-1"
                    title="Dismiss notification"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}

            {/* Regular Tasks */}
            {dashboardData.myTasks.length === 0 && getVisibleFeedback().length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-300">All caught up!</h3>
                <p className="mt-1 text-sm text-gray-400">You have no pending tasks or feedback right now.</p>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
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


          {/* Assessment Score Trends */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <TrendingUp className="mr-2" size={18} />
                My Assessment Trends
              </h2>
              <button
                onClick={() => navigate('/reviews')}
                className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
              >
                View History
              </button>
            </div>
            
            {assessmentTrends.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-400">
                      {assessmentTrends[assessmentTrends.length - 1]?.selfScore || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-400">Latest Self Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {assessmentTrends[assessmentTrends.length - 1]?.managerScore || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-400">Latest Manager Score</div>
                  </div>
                </div>
                <div className="text-center py-4">
                  <div className="text-sm text-gray-400">
                    📈 Based on {assessmentTrends.length} completed assessment{assessmentTrends.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <BarChart3 className="mx-auto h-8 w-8 text-gray-500" />
                <p className="text-gray-400 text-sm mt-2">Complete assessments to see your trends</p>
              </div>
            )}
          </div>
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