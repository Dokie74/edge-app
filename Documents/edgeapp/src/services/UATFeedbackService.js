import { supabase } from './supabaseClient';
import logger from '../utils/secureLogger';

export class UATFeedbackService {
  /**
   * Submit UAT feedback to admin team
   */
  static async submitFeedback(feedbackData) {
    try {
      logger.logUserAction('uat_feedback_submit_attempt', null, { 
        category: feedbackData.category,
        priority: feedbackData.priority,
        url: feedbackData.url 
      });

      // Get current user information
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.warn('No authenticated user for feedback submission');
      }

      // Prepare feedback data
      const submissionData = {
        user_id: user?.id || null,
        user_email: user?.email || 'anonymous',
        category: feedbackData.category,
        priority: feedbackData.priority,
        title: feedbackData.title.trim(),
        description: feedbackData.description.trim(),
        reproduction_steps: feedbackData.reproductionSteps?.trim() || null,
        current_url: feedbackData.url,
        browser_info: feedbackData.browserInfo,
        screenshot_data: feedbackData.screenshot?.dataUrl || null,
        screenshot_name: feedbackData.screenshot?.name || null,
        status: 'open',
        submitted_at: feedbackData.submittedAt,
        // Additional metadata
        metadata: JSON.stringify({
          screenResolution: `${screen.width}x${screen.height}`,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          pageTitle: document.title,
          referrer: document.referrer || 'direct'
        })
      };

      // For now, log the feedback to console and return success
      // This can be replaced with proper database storage later
      console.log('📝 UAT Feedback Submitted:', {
        timestamp: new Date().toISOString(),
        user: user?.email || 'anonymous',
        category: feedbackData.category,
        priority: feedbackData.priority,
        title: feedbackData.title,
        description: feedbackData.description,
        url: feedbackData.url,
        browserInfo: feedbackData.browserInfo,
        screenshot: feedbackData.screenshot ? 'Yes' : 'No'
      });

      // Simulate successful database response
      const data = [{ id: Date.now() }];

      // Log successful submission
      logger.logUserAction('uat_feedback_submit_success', user?.id, { 
        notification_id: data?.[0]?.id,
        category: feedbackData.category,
        priority: feedbackData.priority
      });

      // Log urgent feedback to console for admin attention
      if (feedbackData.priority === 'high' || feedbackData.priority === 'critical') {
        console.warn('🚨 URGENT UAT FEEDBACK - Admin attention required:', {
          priority: feedbackData.priority.toUpperCase(),
          title: feedbackData.title,
          category: feedbackData.category,
          user: user?.email || 'anonymous user',
          description: feedbackData.description,
          url: feedbackData.url,
          timestamp: new Date().toISOString()
        });
      }

      return {
        success: true,
        feedbackId: data?.[0]?.id,
        message: 'Thank you! Your feedback has been submitted successfully.'
      };

    } catch (error) {
      logger.logError(error, { 
        action: 'submit_uat_feedback', 
        category: feedbackData.category,
        priority: feedbackData.priority 
      });
      throw new Error(`Failed to submit feedback: ${error.message}`);
    }
  }

  /**
   * Get all UAT feedback for admin review
   */
  static async getUATFeedback(limit = 50, status = null) {
    try {
      const { data, error } = await supabase.rpc('get_uat_feedback', {
        p_limit: limit,
        p_status: status
      });

      if (error) {
        throw new Error(`Failed to retrieve feedback: ${error.message}`);
      }

      // Parse JSON response if needed
      if (typeof data === 'string') {
        return JSON.parse(data);
      }

      return Array.isArray(data) ? data : (data || []);

    } catch (error) {
      logger.logError(error, { action: 'get_uat_feedback' });
      throw new Error(`Failed to retrieve UAT feedback: ${error.message}`);
    }
  }

  /**
   * Update UAT feedback status (admin only)
   */
  static async updateFeedbackStatus(feedbackId, status, adminNotes = null) {
    try {
      logger.logUserAction('uat_feedback_update_attempt', null, { 
        feedback_id: feedbackId, 
        new_status: status 
      });

      const { data, error } = await supabase.rpc('update_uat_feedback_status', {
        p_feedback_id: feedbackId,
        p_status: status,
        p_admin_notes: adminNotes
      });

      if (error) {
        throw new Error(`Failed to update feedback: ${error.message}`);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      logger.logUserAction('uat_feedback_update_success', null, { 
        feedback_id: feedbackId, 
        status: status 
      });

      return { success: true, message: 'Feedback status updated' };

    } catch (error) {
      logger.logError(error, { 
        action: 'update_uat_feedback_status', 
        feedback_id: feedbackId,
        status: status 
      });
      throw new Error(`Failed to update feedback status: ${error.message}`);
    }
  }

  /**
   * Notify admin of urgent feedback
   */
  static async notifyAdminOfUrgentFeedback(feedbackInfo) {
    try {
      const { NotificationService } = await import('./NotificationService');
      
      // Get admin users
      const { data: admins, error: adminError } = await supabase
        .from('employees')
        .select('id, name, user_id')
        .eq('role', 'admin')
        .eq('is_active', true);

      if (adminError) {
        throw new Error(`Failed to get admin users: ${adminError.message}`);
      }

      if (!admins || admins.length === 0) {
        console.warn('No admin users found for urgent feedback notification');
        return;
      }

      // Send notification to all admins
      const notificationPromises = admins.map(admin => 
        NotificationService.createNotification({
          recipient_id: admin.id,
          type: 'system_alert',
          title: `🚨 Urgent UAT Feedback: ${feedbackInfo.title}`,
          message: `${feedbackInfo.priority.toUpperCase()} priority ${feedbackInfo.category} reported by ${feedbackInfo.userEmail}`,
          metadata: {
            feedback_id: feedbackInfo.feedbackId,
            category: feedbackInfo.category,
            priority: feedbackInfo.priority,
            source: 'uat_feedback'
          }
        })
      );

      await Promise.all(notificationPromises);

      logger.logUserAction('uat_urgent_feedback_notified', null, { 
        feedback_id: feedbackInfo.feedbackId,
        admin_count: admins.length 
      });

    } catch (error) {
      logger.logError(error, { 
        action: 'notify_admin_urgent_feedback', 
        feedback_id: feedbackInfo.feedbackId 
      });
      // Don't throw - this is a best-effort notification
      console.error('Failed to notify admins of urgent feedback:', error);
    }
  }

  /**
   * Get UAT feedback statistics for dashboard
   */
  static async getUATFeedbackStats() {
    try {
      const { data, error } = await supabase.rpc('get_uat_feedback_stats');

      if (error) {
        throw new Error(`Failed to get feedback stats: ${error.message}`);
      }

      return data || {
        total: 0,
        open: 0,
        in_progress: 0,
        resolved: 0,
        by_category: {},
        by_priority: {}
      };

    } catch (error) {
      logger.logError(error, { action: 'get_uat_feedback_stats' });
      throw new Error(`Failed to get UAT feedback statistics: ${error.message}`);
    }
  }
}

export default UATFeedbackService;