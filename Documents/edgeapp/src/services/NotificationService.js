// NotificationService.js - Service for managing user notifications and workflow events
import { supabase } from './supabaseClient';
import logger from '../utils/secureLogger';

export class NotificationService {
  // Get all notifications for current user
  static async getUserNotifications() {
    try {
      const { data, error } = await supabase.rpc('get_user_notifications');
      if (error) throw error;
      
      // Parse JSON response
      if (typeof data === 'string') {
        return JSON.parse(data);
      }
      return Array.isArray(data) ? data : (data || []);
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw new Error(`Failed to fetch notifications: ${error.message}`);
    }
  }

  // Get count of unread notifications
  static async getUnreadCount() {
    try {
      const { data, error } = await supabase.rpc('get_unread_notification_count');
      if (error) throw error;
      return data || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  // Mark a notification as read
  static async markAsRead(notificationId) {
    try {
      if (!notificationId) {
        throw new Error('Notification ID is required');
      }

      const { data, error } = await supabase.rpc('mark_notification_read', {
        p_notification_id: notificationId
      });
      
      if (error) throw error;
      
      if (data?.error) {
        throw new Error(data.error);
      }
      
      return data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  }

  // Mark all notifications as read for current user
  static async markAllAsRead() {
    try {
      const notifications = await this.getUserNotifications();
      const unreadNotifications = notifications.filter(n => !n.is_read);
      
      // Mark each unread notification as read
      const promises = unreadNotifications.map(notification => 
        this.markAsRead(notification.id)
      );
      
      await Promise.all(promises);
      return { success: true, count: unreadNotifications.length };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error(`Failed to mark all notifications as read: ${error.message}`);
    }
  }

  // Submit a development plan
  static async submitDevelopmentPlan(planData) {
    try {
      // Validate required fields
      if (!planData.title?.trim()) {
        throw new Error('Plan title is required');
      }
      if (!planData.goals || planData.goals.length === 0) {
        throw new Error('At least one goal is required');
      }

      logger.logUserAction('submit_development_plan_attempt', null, { 
        title: planData.title 
      });

      const { data: result, error } = await supabase.rpc('submit_development_plan', {
        p_title: planData.title.trim(),
        p_description: planData.description?.trim() || '',
        p_goals: JSON.stringify(planData.goals),
        p_skills_to_develop: JSON.stringify(planData.skills_to_develop || []),
        p_timeline: planData.timeline?.trim() || ''
      });
      
      if (error) throw error;
      
      if (result?.error) {
        logger.logSecurity('development_plan_submit_failed', 'warn', { error: result.error });
        throw new Error(result.error);
      }

      logger.logUserAction('submit_development_plan_success', null, { 
        plan_id: result.plan_id 
      });
      
      return result;
    } catch (error) {
      logger.logError(error, { action: 'submit_development_plan', data: planData });
      throw new Error(`Failed to submit development plan: ${error.message}`);
    }
  }

  // Get development plans for current user
  static async getDevelopmentPlans() {
    try {
      const { data, error } = await supabase.rpc('get_development_plans');
      if (error) throw error;
      
      // Parse JSON response
      if (typeof data === 'string') {
        return JSON.parse(data);
      }
      return Array.isArray(data) ? data : (data || []);
    } catch (error) {
      console.error('Error fetching development plans:', error);
      throw new Error(`Failed to fetch development plans: ${error.message}`);
    }
  }

  // Real-time subscription to notifications
  static subscribeToNotifications(userId, callback) {
    try {
      const subscription = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `recipient_id=eq.${userId}`
          },
          callback
        )
        .subscribe();

      return subscription;
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      return null;
    }
  }

  // Unsubscribe from real-time notifications
  static unsubscribeFromNotifications(subscription) {
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  }

  // Helper function to get notification icon based on type
  static getNotificationIcon(type) {
    const iconMap = {
      'review_cycle_opened': '📋',
      'assessment_submitted': '✅',
      'manager_review_ready': '👨‍💼',
      'manager_review_completed': '🎉',
      'development_plan_submitted': '📈',
      'development_plan_reviewed': '✍️',
      'assessment_overdue': '⚠️',
      'review_reminder': '🔔'
    };
    return iconMap[type] || '📢';
  }

  // Helper function to get notification color based on type
  static getNotificationColor(type) {
    const colorMap = {
      'review_cycle_opened': 'blue',
      'assessment_submitted': 'green',
      'manager_review_ready': 'orange',
      'manager_review_completed': 'green',
      'development_plan_submitted': 'purple',
      'development_plan_reviewed': 'blue',
      'assessment_overdue': 'red',
      'review_reminder': 'yellow'
    };
    return colorMap[type] || 'gray';
  }

  // Get development plans for manager review
  static async getDevelopmentPlansForReview() {
    try {
      const { data, error } = await supabase.rpc('get_development_plans_for_review');
      if (error) throw error;
      
      // Parse JSON response
      if (typeof data === 'string') {
        return JSON.parse(data);
      }
      return Array.isArray(data) ? data : (data || []);
    } catch (error) {
      console.error('Error fetching development plans for review:', error);
      throw new Error(`Failed to fetch development plans for review: ${error.message}`);
    }
  }

  // Review a development plan (manager function)
  static async reviewDevelopmentPlan(planId, status, feedback) {
    try {
      if (!planId) {
        throw new Error('Plan ID is required');
      }
      if (!status || !['approved', 'needs_revision', 'under_review'].includes(status)) {
        throw new Error('Valid status is required (approved, needs_revision, or under_review)');
      }

      logger.logUserAction('review_development_plan_attempt', null, { 
        plan_id: planId,
        status: status 
      });

      const { data: result, error } = await supabase.rpc('review_development_plan', {
        p_plan_id: planId,
        p_status: status,
        p_manager_feedback: feedback || ''
      });
      
      if (error) throw error;
      
      if (result?.error) {
        logger.logSecurity('development_plan_review_failed', 'warn', { error: result.error });
        throw new Error(result.error);
      }

      logger.logUserAction('review_development_plan_success', null, { 
        plan_id: planId,
        status: status
      });
      
      return result;
    } catch (error) {
      logger.logError(error, { action: 'review_development_plan', plan_id: planId });
      throw new Error(`Failed to review development plan: ${error.message}`);
    }
  }

  // Get dashboard statistics using the new unified function
  static async getDashboardStats(userRole) {
    try {
      console.log(`Calling unified get_dashboard_stats for role: ${userRole}`);
      
      const { data, error } = await supabase.rpc('get_dashboard_stats', {
        p_role: userRole
      });
      
      if (error) {
        console.error('Database error from get_dashboard_stats:', error);
        throw error;
      }
      
      console.log('Dashboard stats received:', data);
      return data || {};
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw new Error(`Failed to fetch dashboard statistics: ${error.message}`);
    }
  }



  // Create a notification
  static async createNotification(notificationData) {
    try {
      const { recipient_id, title, message, type = 'info', metadata = {} } = notificationData;
      
      if (!recipient_id || !title || !message) {
        throw new Error('recipient_id, title, and message are required');
      }

      const { data, error } = await supabase.rpc('create_notification', {
        p_recipient_id: recipient_id,
        p_title: title.trim(),
        p_message: message.trim(),
        p_type: type,
        p_metadata: JSON.stringify(metadata)
      });
      
      if (error) throw error;
      
      if (data?.error) {
        throw new Error(data.error);
      }
      
      logger.logUserAction('notification_created', null, { 
        recipient_id,
        type,
        title: title.substring(0, 50)
      });
      
      return data;
    } catch (error) {
      logger.logError(error, { action: 'create_notification', data: notificationData });
      throw new Error(`Failed to create notification: ${error.message}`);
    }
  }

  // Helper function to format notification time
  static formatNotificationTime(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return time.toLocaleDateString();
  }
}

export default NotificationService;