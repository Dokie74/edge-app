import { supabase } from './supabaseClient';

export class AdminApprovalService {
  /**
   * Get all assessments pending admin approval
   */
  static async getPendingApprovals() {
    try {
      const { data, error } = await supabase.rpc('get_pending_admin_approvals');
      
      if (error) {
        console.error('Error fetching pending approvals:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getPendingApprovals:', error);
      throw error;
    }
  }

  /**
   * Approve a manager review
   */
  static async approveManagerReview(assessmentId, adminNotes = null) {
    try {
      const { data, error } = await supabase.rpc('approve_manager_review', {
        p_assessment_id: assessmentId,
        p_admin_notes: adminNotes
      });

      if (error) {
        console.error('Error approving manager review:', error);
        throw error;
      }

      // Check if the response indicates an error from the database function
      if (data && typeof data === 'object' && data.error) {
        console.error('Function returned error:', data.error);
        throw new Error(data.error);
      }

      return data;
    } catch (error) {
      console.error('Error in approveManagerReview:', error);
      throw error;
    }
  }

  /**
   * Request revision to a manager review
   */
  static async requestRevision(assessmentId, revisionNotes) {
    try {
      if (!revisionNotes || revisionNotes.trim() === '') {
        throw new Error('Revision notes are required');
      }

      const { data, error } = await supabase.rpc('request_manager_review_revision', {
        p_assessment_id: assessmentId,
        p_revision_notes: revisionNotes.trim()
      });

      if (error) {
        console.error('Error requesting revision:', error);
        throw error;
      }

      // Check if the response indicates an error from the database function
      if (data && typeof data === 'object' && data.error) {
        console.error('Function returned error:', data.error);
        throw new Error(data.error);
      }

      return data;
    } catch (error) {
      console.error('Error in requestRevision:', error);
      throw error;
    }
  }

  /**
   * Get assessment details for admin review
   */
  static async getAssessmentForReview(assessmentId) {
    try {
      const { data, error } = await supabase.rpc('get_assessment_details', {
        p_assessment_id: assessmentId
      });

      if (error) {
        console.error('Error fetching assessment details:', error);
        throw error;
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error in getAssessmentForReview:', error);
      throw error;
    }
  }
}