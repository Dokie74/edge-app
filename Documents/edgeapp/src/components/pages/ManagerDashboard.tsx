// src/components/pages/ManagerDashboard.tsx - Team-focused manager dashboard
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users,
  CheckCircle, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  Award,
  Activity,
  ArrowRight,
  Eye,
  FileText,
  Target,
  BarChart3,
  Crown,
  Calendar,
  Inbox,
  MessageSquare,
  Star,
  ThumbsUp,
  X
} from 'lucide-react';
import { useApp } from '../../contexts';
import { LoadingSpinner, ErrorMessage, Button } from '../ui';
import { OrgHealthWidget } from '../ui/TeamHealthPulse';
import TeamHealthAlerts from '../ui/TeamHealthAlerts';
import { QuestionPerformanceCard } from '../analytics/QuestionPerformanceWidget';
import { MetricCard, PerformanceBarChart } from '../analytics/ChartComponents';
import { formatDate } from '../../utils';
import RoleBasedAnalyticsService, { ManagerDashboardData } from '../../services/RoleBasedAnalyticsService';
import { FeedbackService } from '../../services';

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const { userName, user } = useApp();
  const [dashboardData, setDashboardData] = useState<ManagerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [managerId, setManagerId] = useState<string | null>(null);
  const [feedbackReceived, setFeedbackReceived] = useState<any[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchManagerDashboard();
      fetchRecentFeedback();
    }
  }, [user?.id]);

  const fetchManagerDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get manager employee ID for alerts
      const { supabase } = await import('../../services/supabaseClient');
      const { data: manager } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user!.id)
        .single();
      
      if (manager) {
        setManagerId(manager.id);
      }
      
      const data = await RoleBasedAnalyticsService.getManagerDashboard(user!.id);
      setDashboardData(data);
    } catch (err: any) {
      console.error('Error fetching manager dashboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentFeedback = async () => {
    try {
      setFeedbackLoading(true);
      console.log('🔍 ManagerDashboard: Starting to fetch feedback...');
      const data = await FeedbackService.getMyFeedbackReceived(3);
      console.log('📥 ManagerDashboard: Feedback received:', data);
      setFeedbackReceived(data || []);
    } catch (err: any) {
      console.error('❌ ManagerDashboard: Error fetching feedback:', err);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-900/20';
      case 'on_track': return 'text-blue-400 bg-blue-900/20';
      case 'behind': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-700/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-900/10';
      case 'medium': return 'border-l-yellow-500 bg-yellow-900/10';
      default: return 'border-l-blue-500 bg-blue-900/10';
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner message="Loading team dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorMessage
          error={error}
          title="Dashboard Error"
          onRetry={fetchManagerDashboard}
        />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-8">
        <div className="text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-300">No dashboard data</h3>
          <p className="mt-1 text-sm text-gray-400">Unable to load your team dashboard.</p>
        </div>
      </div>
    );
  }

  // Generate chart data for team performance
  const teamChartData = [
    {
      name: 'My Team',
      completed: dashboardData.teamStats.completedReviews,
      pending: dashboardData.teamStats.pendingReviews,
      overdue: dashboardData.teamStats.overdueItems
    }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Manager Header */}
      <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-6 border border-purple-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {getGreeting()}, {userName}! 👔
            </h1>
            <p className="text-purple-400 mt-1">
              Managing {dashboardData.teamStats.teamSize} team members
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Department: {dashboardData.departmentMetrics.departmentName} • 
              Rank: #{dashboardData.peerComparison.myTeamRank} among {dashboardData.departmentMetrics.totalManagers} managers
            </p>
          </div>
          <div className="text-right">
            <div className="text-purple-400 text-2xl font-bold">
              {dashboardData.peerComparison.myTeamCompletion}%
            </div>
            <div className="text-gray-400 text-sm">Team Completion</div>
            <div className="text-xs text-gray-500 mt-1">
              vs {dashboardData.peerComparison.avgManagerCompletion}% avg
            </div>
          </div>
        </div>
      </div>

      {/* Team KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Team Size"
          value={dashboardData.teamStats.teamSize}
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Pending Reviews"
          value={dashboardData.teamStats.pendingReviews}
          icon={Clock}
          color={dashboardData.teamStats.pendingReviews > 0 ? 'yellow' : 'green'}
        />
        <MetricCard
          title="Completed"
          value={dashboardData.teamStats.completedReviews}
          icon={CheckCircle}
          color="green"
        />
        <MetricCard
          title="Team Satisfaction"
          value={dashboardData.teamStats.teamSatisfactionAvg.toFixed(1)}
          icon={Award}
          color="purple"
        />
        <MetricCard
          title="Company Satisfaction"
          value={typeof dashboardData.departmentMetrics.companySatisfaction === 'number' 
            ? dashboardData.departmentMetrics.companySatisfaction.toFixed(1) 
            : '4.2'}
          icon={TrendingUp}
          color="blue"
        />
        <MetricCard
          title="Overdue Items"
          value={dashboardData.teamStats.overdueItems}
          icon={AlertTriangle}
          color={dashboardData.teamStats.overdueItems > 0 ? 'red' : 'green'}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pending Actions - Priority Section */}
        <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <FileText className="mr-2" size={20} />
              Pending Actions ({dashboardData.pendingActions.length})
            </h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/team')}
            >
              View Team
            </Button>
          </div>
          
          {dashboardData.pendingActions.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-300">All caught up!</h3>
              <p className="mt-1 text-sm text-gray-400">No pending team actions right now.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dashboardData.pendingActions.slice(0, 6).map((action) => (
                <div 
                  key={action.id} 
                  className={`p-4 rounded-lg border-l-4 ${getPriorityColor(action.priority)} cursor-pointer hover:bg-gray-700/30 transition-colors`}
                  onClick={() => {
                    if (action.type === 'review') {
                      navigate(`/review?assessmentId=${action.id}&employeeName=${action.employeeName}`);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium text-sm">{action.action}</h3>
                      <p className="text-gray-400 text-sm">
                        <span className="font-medium">{action.employeeName}</span>
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        Due: {formatDate(action.dueDate)}
                      </p>
                      <div className="flex items-center mt-2 space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          action.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          action.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {action.priority.toUpperCase()}
                        </span>
                        <span className="text-gray-500 text-xs capitalize">
                          {action.type}
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

        {/* Team Performance & Peer Comparison */}
        <div className="space-y-6">
          
          {/* Peer Comparison Card */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Crown className="mr-2 text-yellow-500" size={18} />
              Manager Rankings
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">My Team Rank</span>
                  <span className="text-white font-bold text-lg">
                    #{dashboardData.peerComparison.myTeamRank}
                  </span>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">My Completion</span>
                  <span className="text-green-400 font-medium">
                    {dashboardData.peerComparison.myTeamCompletion}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Avg Manager</span>
                  <span className="text-gray-300 font-medium">
                    {dashboardData.peerComparison.avgManagerCompletion}%
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Top performer: {dashboardData.peerComparison.topPerformingManager}
                </div>
              </div>
              
              <div className="pt-2 border-t border-gray-700">
                <div className="text-center">
                  {dashboardData.peerComparison.myTeamCompletion > dashboardData.peerComparison.avgManagerCompletion ? (
                    <div className="text-green-400 text-sm font-medium">
                      🎉 Above Average Performance!
                    </div>
                  ) : (
                    <div className="text-yellow-400 text-sm font-medium">
                      📈 Room for Improvement
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Department Overview */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <BarChart3 className="mr-2" size={18} />
              Department Metrics
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Total Managers</span>
                  <span className="text-white font-medium">
                    {dashboardData.departmentMetrics.totalManagers}
                  </span>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Dept Completion</span>
                  <span className="text-white font-medium">
                    {dashboardData.departmentMetrics.departmentCompletion}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${dashboardData.departmentMetrics.departmentCompletion}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Dept Satisfaction</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-400 font-medium">
                      {typeof dashboardData.departmentMetrics.departmentSatisfaction === 'number' 
                        ? dashboardData.departmentMetrics.departmentSatisfaction.toFixed(1) 
                        : '4.2'}
                    </span>
                    <span className="text-gray-500 text-xs">/5.0</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Org Health Widget - Below Department Metrics */}
            <div className="mt-6">
              <OrgHealthWidget />
            </div>
          </div>
        </div>
      </div>

      {/* Team Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Team Members Performance */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Users className="mr-2" size={20} />
              Team Performance
            </h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/team')}
            >
              <Eye size={14} className="mr-1" />
              Details
            </Button>
          </div>
          
          <div className="space-y-3">
            {dashboardData.teamPerformance.map((member, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30">
                <div>
                  <h3 className="text-white font-medium text-sm">{member.employeeName}</h3>
                  <p className="text-gray-400 text-xs">
                    Last active: {formatDate(member.lastActivity)}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-white font-medium text-sm">
                      {member.completionRate}%
                    </div>
                    <div className="text-xs text-gray-500">completion</div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                    {member.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Statistics Chart */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <BarChart3 className="mr-2" size={20} />
            Team Overview
          </h2>
          <PerformanceBarChart data={teamChartData} height={250} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-6 border border-gray-600">
        <h2 className="text-lg font-semibold text-white mb-4">Manager Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            className="flex flex-col items-center space-y-2 h-16"
            onClick={() => navigate('/team')}
          >
            <Users size={20} />
            <span className="text-sm">My Team</span>
          </Button>
          <Button 
            className="flex flex-col items-center space-y-2 h-16" 
            variant="secondary"
            onClick={() => navigate('/playbook')}
          >
            <FileText size={20} />
            <span className="text-sm">Playbook</span>
          </Button>
          <Button 
            className="flex flex-col items-center space-y-2 h-16" 
            variant="secondary"
            onClick={() => navigate('/reviews')}
          >
            <Calendar size={20} />
            <span className="text-sm">Reviews</span>
          </Button>
          <Button 
            className="flex flex-col items-center space-y-2 h-16" 
            variant="secondary"
            onClick={() => navigate('/help')}
          >
            <FileText size={20} />
            <span className="text-sm">Manager Guide</span>
          </Button>
        </div>
      </div>

      {/* Team Health Alerts Section */}
      {managerId && (
        <TeamHealthAlerts role="manager" managerId={managerId} />
      )}

      {/* Team Question Performance */}
      {managerId && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <QuestionPerformanceCard 
            managerIdFilter={managerId}
            showOnlyTop={true}
            title="Top Team Question"
            className=""
          />
          <QuestionPerformanceCard 
            managerIdFilter={managerId}
            showOnlyTop={false}
            title="Team Area for Improvement"
            className=""
          />
        </div>
      )}

      {/* Recent Feedback Section */}
      {feedbackReceived.length > 0 && (
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
            {feedbackReceived.map(feedback => (
              <ManagerFeedbackCard 
                key={feedback.feedback_id} 
                feedback={feedback} 
                onDismiss={handleDismissFeedback}
              />
            ))}
          </div>
        </div>
      )}

      {/* Manager Guide Section */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Crown className="mr-2" size={20} />
            Manager Quick Guide
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
          {/* Team Management */}
          <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
            <h3 className="text-white font-medium mb-3 flex items-center">
              <Users className="mr-2 text-blue-400" size={16} />
              Team Management
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Monitor team performance metrics</li>
              <li>• Track review cycle progress</li>
              <li>• Address overdue assessments promptly</li>
              <li>• Schedule regular one-on-ones</li>
            </ul>
          </div>

          {/* Review Process */}
          <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
            <h3 className="text-white font-medium mb-3 flex items-center">
              <FileText className="mr-2 text-green-400" size={16} />
              Review Process
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Provide specific, actionable feedback</li>
              <li>• Use examples from recent work</li>
              <li>• Focus on both strengths and growth areas</li>
              <li>• Complete reviews within deadline</li>
            </ul>
          </div>

          {/* Development Planning */}
          <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
            <h3 className="text-white font-medium mb-3 flex items-center">
              <Target className="mr-2 text-purple-400" size={16} />
              Development Planning
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Identify growth opportunities for each team member</li>
              <li>• Create development plans with SMART goals</li>
              <li>• Provide resources and learning opportunities</li>
              <li>• Track progress and adjust as needed</li>
            </ul>
          </div>

          {/* Best Practices */}
          <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
            <h3 className="text-white font-medium mb-3 flex items-center">
              <Award className="mr-2 text-yellow-400" size={16} />
              Best Practices
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Hold effective review meetings</li>
              <li>• Use the manager playbook for guidance</li>
              <li>• Encourage peer feedback and collaboration</li>
              <li>• Document important conversations</li>
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

// Feedback Card Component for ManagerDashboard
const ManagerFeedbackCard = ({ feedback, onDismiss }: { feedback: any, onDismiss: (id: number) => void }) => {
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