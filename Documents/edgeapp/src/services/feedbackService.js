import { supabase } from './supabaseClient';

export class FeedbackService {
  static async giveFeedback(recipientId, feedbackType, message, category = 'general', isAnonymous = false) {
    const { data, error } = await supabase.rpc('give_peer_feedback', {
      p_recipient_id: recipientId,
      p_feedback_type: feedbackType,
      p_message: message,
      p_category: category,
      p_is_anonymous: isAnonymous
    });
    if (error) throw error;
    return data;
  }

  static async getEmployeesForFeedback() {
    const { data, error } = await supabase.rpc('get_employees_for_feedback');
    if (error) throw error;
    return data || [];
  }

  static async getFeedbackWall(limit = 50, feedbackType = null) {
    const { data, error } = await supabase.rpc('get_feedback_wall', {
      p_limit: limit,
      p_feedback_type: feedbackType
    });
    if (error) throw error;
    return data || [];
  }

  static async getMyFeedbackReceived(limit = 20) {
    const { data, error } = await supabase.rpc('get_my_feedback_received', {
      p_limit: limit
    });
    if (error) {
      console.error('API Error:', error);
      throw error;
    }
    return data || [];
  }

  static async getMyFeedbackGiven(limit = 20) {
    const { data, error } = await supabase.rpc('get_my_feedback_given', {
      p_limit: limit
    });
    if (error) throw error;
    return data || [];
  }

  static async markFeedbackHelpful(feedbackId) {
    const { data, error } = await supabase.rpc('mark_feedback_helpful', {
      p_feedback_id: feedbackId
    });
    if (error) throw error;
    return data;
  }
}