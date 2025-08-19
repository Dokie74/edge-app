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

      // Prepare metadata
      const metadata = {
        screenResolution: `${screen.width}x${screen.height}`,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        pageTitle: document.title,
        referrer: document.referrer || 'direct'
      };

      // Submit feedback using database function
      const { data, error } = await supabase.rpc('submit_uat_feedback', {
        p_user_id: user?.id || null,
        p_user_email: user?.email || 'anonymous',
        p_category: feedbackData.category,
        p_priority: feedbackData.priority,
        p_title: feedbackData.title.trim(),
        p_description: feedbackData.description.trim(),
        p_reproduction_steps: feedbackData.reproductionSteps?.trim() || null,
        p_current_url: feedbackData.url,
        p_browser_info: feedbackData.browserInfo,
        p_screenshot_data: feedbackData.screenshot?.dataUrl || null,
        p_screenshot_name: feedbackData.screenshot?.name || null,
        p_metadata: metadata
      });

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to submit feedback');
      }

      // Log successful submission
      logger.logUserAction('uat_feedback_submit_success', user?.id, { 
        feedback_id: data.feedback_id,
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
          feedback_id: data.feedback_id,
          timestamp: new Date().toISOString()
        });

        // Notify admins if urgent
        this.notifyAdminOfUrgentFeedback({
          feedbackId: data.feedback_id,
          title: feedbackData.title,
          category: feedbackData.category,
          priority: feedbackData.priority,
          userEmail: user?.email || 'anonymous'
        });
      }

      return {
        success: true,
        feedbackId: data.feedback_id,
        message: data.message || 'Thank you! Your feedback has been submitted successfully.'
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

      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase.rpc('update_uat_feedback_status', {
        p_feedback_id: feedbackId,
        p_status: status,
        p_admin_notes: adminNotes,
        p_admin_user_id: user?.id
      });

      if (error) {
        throw new Error(`Failed to update feedback: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Update failed');
      }

      logger.logUserAction('uat_feedback_update_success', user?.id, { 
        feedback_id: feedbackId, 
        status: status 
      });

      return { success: true, message: data.message || 'Feedback status updated' };

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
   * Add admin response to UAT feedback that user will see on their dashboard
   */
  static async addAdminResponse(feedbackId, responseMessage, responseType = 'response') {
    try {
      logger.logUserAction('uat_admin_response_attempt', null, { 
        feedback_id: feedbackId,
        response_type: responseType
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Authentication required');
      }

      // Get the original feedback to find the recipient
      const { data: feedbackData, error: fetchError } = await supabase
        .from('uat_feedback')
        .select('user_id, title, category, priority')
        .eq('id', feedbackId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to find feedback: ${fetchError.message}`);
      }

      if (!feedbackData?.user_id) {
        throw new Error('Cannot send response - original feedback has no associated user');
      }

      // Add admin response using database function
      const { data, error } = await supabase.rpc('add_admin_feedback_response', {
        p_uat_feedback_id: feedbackId,
        p_admin_user_id: user.id,
        p_recipient_user_id: feedbackData.user_id,
        p_response_message: responseMessage,
        p_response_type: responseType
      });

      if (error) {
        throw new Error(`Failed to add response: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Response failed');
      }

      logger.logUserAction('uat_admin_response_success', user.id, { 
        feedback_id: feedbackId,
        response_id: data.response_id,
        response_type: responseType
      });

      return { 
        success: true, 
        responseId: data.response_id,
        message: data.message || 'Response sent successfully'
      };

    } catch (error) {
      logger.logError(error, { 
        action: 'add_uat_admin_response', 
        feedback_id: feedbackId,
        response_type: responseType
      });
      throw new Error(`Failed to add admin response: ${error.message}`);
    }
  }

  /**
   * Get admin responses for a user's dashboard
   */
  static async getUserAdminResponses(userId = null, limit = 10, includeDismissed = false) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;

      if (!targetUserId) {
        throw new Error('User ID required');
      }

      const { data, error } = await supabase.rpc('get_user_admin_responses', {
        p_user_id: targetUserId,
        p_limit: limit,
        p_include_dismissed: includeDismissed
      });

      if (error) {
        throw new Error(`Failed to get responses: ${error.message}`);
      }

      return Array.isArray(data) ? data : (data || []);

    } catch (error) {
      logger.logError(error, { 
        action: 'get_user_admin_responses',
        user_id: userId
      });
      throw new Error(`Failed to get admin responses: ${error.message}`);
    }
  }

  /**
   * Dismiss feedback or response (bidirectional)
   */
  static async dismissFeedbackItem(feedbackId, responseId, dismissedBy = 'user') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.rpc('dismiss_uat_feedback', {
        p_feedback_id: feedbackId,
        p_response_id: responseId,
        p_user_id: user?.id,
        p_dismissed_by: dismissedBy
      });

      if (error) {
        throw new Error(`Failed to dismiss: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Dismiss failed');
      }

      logger.logUserAction('uat_feedback_dismissed', user?.id, { 
        feedback_id: feedbackId,
        response_id: responseId,
        dismissed_by: dismissedBy
      });

      return { success: true, message: data.message || 'Dismissed successfully' };

    } catch (error) {
      logger.logError(error, { 
        action: 'dismiss_uat_feedback_item',
        feedback_id: feedbackId,
        response_id: responseId,
        dismissed_by: dismissedBy
      });
      throw new Error(`Failed to dismiss: ${error.message}`);
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