// src/services/AnalyticsService.ts - Advanced analytics and dashboard data service
import { supabase } from './supabaseClient';
import { DashboardStats } from '../types';

export interface AnalyticsData {
  // Performance metrics
  performanceOverview: Array<{
    name: string;
    completed: number;
    pending: number;
    overdue: number;
  }>;
  
  // Trend analysis
  trendData: Array<{
    date: string;
    assessments: number;
    reviews: number;
    satisfaction: number;
  }>;
  
  // Department distribution
  departmentData: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  
  // Engagement metrics
  engagementData: Array<{
    month: string;
    engagement: number;
    satisfaction: number;
    participation: number;
  }>;
  
  // Goal progress
  goalProgress: Array<{
    name: string;
    value: number;
    fill: string;
  }>;
  
  // Key performance indicators
  kpis: {
    totalEmployees: number;
    activeReviewCycles: number;
    completionRate: number;
    averageSatisfaction: number;
    overdueTasks: number;
    engagementScore: number;
  };
  
  // Recent activity
  recentActivity: Array<{
    id: string;
    type: 'assessment_completed' | 'review_submitted' | 'goal_achieved' | 'feedback_given';
    title: string;
    description: string;
    timestamp: string;
    user: string;
    avatar?: string;
  }>;
  
  // Notifications and alerts
  alerts: Array<{
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
  }>;
}

class AnalyticsService {
  // Get comprehensive dashboard analytics
  static async getDashboardAnalytics(userRole: string): Promise<AnalyticsData> {
    try {
      console.log('🔍 Fetching dashboard analytics for role:', userRole);
      
      // Fetch basic dashboard stats first
      const basicStats = await this.getBasicDashboardStats(userRole);
      
      // Generate mock analytics data (in production, this would come from your database)
      const analytics: AnalyticsData = {
        performanceOverview: await this.getPerformanceOverview(userRole),
        trendData: await this.getTrendAnalysis(),
        departmentData: await this.getDepartmentDistribution(),
        engagementData: await this.getEngagementMetrics(),
        goalProgress: await this.getGoalProgress(userRole),
        kpis: await this.getKPIs(userRole, basicStats),
        recentActivity: await this.getRecentActivity(userRole),
        alerts: await this.getAlerts(userRole)
      };
      
      console.log('📊 Dashboard analytics loaded:', analytics);
      return analytics;
      
    } catch (error: any) {
      console.error('❌ Error fetching dashboard analytics:', error);
      throw new Error(`Failed to load dashboard analytics: ${error?.message || 'Unknown error'}`);
    }
  }
  
  // Get basic dashboard stats from existing service
  private static async getBasicDashboardStats(userRole: string): Promise<DashboardStats> {
    try {
      // This would typically call your existing dashboard stats RPC
      const { data, error } = await supabase.rpc('get_dashboard_stats_enhanced', {
        p_user_role: userRole
      });
      
      if (error) {
        console.warn('Basic stats RPC failed, using fallback data');
        // Return fallback data structure
        return {
          employees: { total: 0, by_role: {} },
          review_cycles: { total: 0, active: 0, upcoming: 0, closed: 0 },
          assessments: { total: 0, completed: 0, pending: 0, manager_reviews_pending: 0, manager_reviews_completed: 0, completion_rate: 0 },
          development_plans: { total: 0, submitted: 0, under_review: 0, approved: 0, needs_revision: 0 },
          notifications: { total_sent: 0, unread: 0 }
        };
      }
      
      return data;
    } catch (error) {
      console.warn('Error fetching basic stats, using fallback');
      return {
        employees: { total: 25, by_role: { employee: 18, manager: 5, admin: 2 } },
        review_cycles: { total: 4, active: 1, upcoming: 1, closed: 2 },
        assessments: { total: 50, completed: 35, pending: 15, manager_reviews_pending: 8, manager_reviews_completed: 27, completion_rate: 70 },
        development_plans: { total: 20, submitted: 15, under_review: 3, approved: 12, needs_revision: 2 },
        notifications: { total_sent: 150, unread: 5 }
      };
    }
  }
  
  // Performance overview by department/team
  private static async getPerformanceOverview(userRole: string) {
    // In production, this would query actual database
    const mockData = [
      { name: 'Engineering', completed: 28, pending: 5, overdue: 2 },
      { name: 'Sales', completed: 22, pending: 8, overdue: 1 },
      { name: 'Marketing', completed: 18, pending: 6, overdue: 3 },
      { name: 'HR', completed: 15, pending: 3, overdue: 0 },
      { name: 'Finance', completed: 12, pending: 4, overdue: 1 }
    ];
    
    return mockData;
  }
  
  // Trend analysis over time
  private static async getTrendAnalysis() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const mockData = months.map((month, index) => ({
      date: month,
      assessments: 15 + Math.floor(Math.random() * 10) + index * 2,
      reviews: 12 + Math.floor(Math.random() * 8) + index * 1.5,
      satisfaction: 75 + Math.floor(Math.random() * 15) + index * 2
    }));
    
    return mockData;
  }
  
  // Department distribution
  private static async getDepartmentDistribution() {
    return [
      { name: 'Engineering', value: 35, color: '#0891b2' },
      { name: 'Sales', value: 25, color: '#10b981' },
      { name: 'Marketing', value: 20, color: '#f59e0b' },
      { name: 'HR', value: 12, color: '#ef4444' },
      { name: 'Finance', value: 8, color: '#8b5cf6' }
    ];
  }
  
  // Engagement metrics over time
  private static async getEngagementMetrics() {
    const months = ['Q1', 'Q2', 'Q3', 'Q4'];
    return months.map((month, index) => ({
      month,
      engagement: 70 + Math.floor(Math.random() * 20) + index * 3,
      satisfaction: 75 + Math.floor(Math.random() * 15) + index * 2,
      participation: 80 + Math.floor(Math.random() * 15) + index * 1
    }));
  }
  
  // Goal progress tracking
  private static async getGoalProgress(userRole: string) {
    if (userRole === 'admin') {
      return [
        { name: 'Performance Reviews', value: 85, fill: '#0891b2' },
        { name: 'Development Plans', value: 72, fill: '#10b981' },
        { name: 'Team Engagement', value: 90, fill: '#f59e0b' },
        { name: 'Skill Development', value: 68, fill: '#ef4444' }
      ];
    } else if (userRole === 'manager') {
      return [
        { name: 'Team Reviews', value: 78, fill: '#0891b2' },
        { name: 'One-on-Ones', value: 85, fill: '#10b981' },
        { name: 'Goal Setting', value: 70, fill: '#f59e0b' }
      ];
    } else {
      return [
        { name: 'Self Assessment', value: 100, fill: '#10b981' },
        { name: 'Goals Progress', value: 65, fill: '#0891b2' },
        { name: 'Skill Building', value: 80, fill: '#f59e0b' }
      ];
    }
  }
  
  // Key Performance Indicators
  private static async getKPIs(userRole: string, basicStats: DashboardStats) {
    return {
      totalEmployees: basicStats.employees?.total || 25,
      activeReviewCycles: basicStats.review_cycles?.active || 1,
      completionRate: basicStats.assessments?.completion_rate || 85,
      averageSatisfaction: 4.2,
      overdueTasks: 8,
      engagementScore: 87
    };
  }
  
  // Recent activity feed
  private static async getRecentActivity(userRole: string) {
    const activities = [
      {
        id: '1',
        type: 'assessment_completed' as const,
        title: 'Self Assessment Completed',
        description: 'John Smith completed Q2 2024 self-assessment',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
        user: 'John Smith'
      },
      {
        id: '2',
        type: 'review_submitted' as const,
        title: 'Manager Review Submitted',
        description: 'Sarah Johnson submitted review for team member',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        user: 'Sarah Johnson'
      },
      {
        id: '3',
        type: 'goal_achieved' as const,
        title: 'Goal Achievement',
        description: 'Mike Davis achieved quarterly sales target',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
        user: 'Mike Davis'
      },
      {
        id: '4',
        type: 'feedback_given' as const,
        title: 'Peer Feedback',
        description: 'Lisa Wong gave positive feedback to team member',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
        user: 'Lisa Wong'
      }
    ];
    
    return activities.slice(0, userRole === 'admin' ? 6 : 4);
  }
  
  // System alerts and notifications
  private static async getAlerts(userRole: string) {
    const alerts = [
      {
        id: '1',
        type: 'warning' as const,
        title: 'Review Cycle Deadline',
        message: 'Q2 2024 review cycle ends in 3 days',
        timestamp: new Date().toISOString(),
        read: false
      },
      {
        id: '2',
        type: 'info' as const,
        title: 'New Feature Available',
        message: 'Enhanced dashboard analytics are now live',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        read: false
      },
      {
        id: '3',
        type: 'success' as const,
        title: 'Goal Milestone',
        message: 'Team achieved 90% completion rate this month',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        read: true
      }
    ];
    
    return alerts.slice(0, 5);
  }
  
  // Real-time metrics update
  static async getRealtimeMetrics() {
    // This would connect to a real-time data source
    return {
      activeUsers: Math.floor(Math.random() * 50) + 10,
      completionsToday: Math.floor(Math.random() * 20) + 5,
      systemLoad: Math.floor(Math.random() * 30) + 40,
      responseTime: Math.floor(Math.random() * 100) + 150
    };
  }
}

export default AnalyticsService;