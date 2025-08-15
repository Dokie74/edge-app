import { supabase } from './supabaseClient';

export class AssessmentService {
  static async getMyAssessments() {
    try {
      console.log('Calling reliable get_my_assessments function');
      const { data, error } = await supabase.rpc('get_my_assessments');
      
      if (error) {
        console.error('Error from get_my_assessments:', error);
        throw error;
      }
      
      console.log('Assessments received:', data);
      return data || [];
    } catch (error) {
      console.error('Error in getMyAssessments:', error);
      throw error;
    }
  }

  static async getAssessmentById(assessmentId) {
    const { data, error } = await supabase.rpc('get_assessment_details', {
      p_assessment_id: assessmentId
    });
    if (error) throw error;
    return data;
  }

  static async updateAssessment(assessmentId, updates) {
    try {
      console.log('Updating assessment:', assessmentId, 'with updates:', updates);
      
      const { data, error } = await supabase.rpc('update_assessment', {
        p_assessment_id: assessmentId,
        p_updates: updates
      });
      
      if (error) {
        console.error('Database error updating assessment:', error);
        throw error;
      }
      
      console.log('Update response:', data);
      
      // Check if the response indicates an error from the database function
      if (data && typeof data === 'object' && data.error) {
        console.error('Function returned error:', data.error);
        throw new Error(data.error);
      }
      
      return data;
    } catch (error) {
      console.error('Error in updateAssessment:', error);
      throw error;
    }
  }

  static async submitAssessment(assessmentId) {
    // Direct table update to change status to employee_complete
    const { data, error } = await supabase
      .from('assessments')
      .update({ 
        self_assessment_status: 'employee_complete',
        updated_at: new Date().toISOString()
      })
      .eq('id', assessmentId)
      .select();

    if (error) throw error;
    return data;
  }

  static async submitManagerReview(assessmentId, feedbackData) {
    try {
      console.log('submitManagerReview called for assessment ID:', assessmentId);
      console.log('Submitting manager review with full feedback data:', feedbackData);
      
      // Use the new atomic submit_manager_review function
      const { data, error } = await supabase.rpc('submit_manager_review', {
        p_assessment_id: assessmentId,
        p_feedback: feedbackData
      });

      if (error) {
        console.error('Error in submitManagerReview:', error);
        throw error;
      }
      
      console.log('submitManagerReview success, response:', data);
      
      // Check if the response indicates an error from the database function
      if (data && typeof data === 'object' && data.error) {
        console.error('Function returned error:', data.error);
        throw new Error(data.error);
      }
      
      return data;
    } catch (error) {
      console.error('submitManagerReview failed:', error);
      throw error;
    }
  }

  static async acknowledgeReview(assessmentId) {
    // Direct table update to mark review as acknowledged by employee
    const { data, error } = await supabase
      .from('assessments')
      .update({ 
        employee_acknowledgment: true,
        review_status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', assessmentId)
      .select();

    if (error) throw error;
    return data;
  }
}