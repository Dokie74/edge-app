import { supabase } from './supabaseClient';

export class AssessmentService {
  static async getMyAssessments() {
    const { data, error } = await supabase.rpc('get_my_assessments');
    if (error) throw error;
    return data || [];
  }

  static async getAssessmentById(assessmentId) {
    const { data, error } = await supabase.rpc('get_assessment_details', {
      p_assessment_id: assessmentId
    });
    if (error) throw error;
    return data;
  }

  static async updateAssessment(assessmentId, updates) {
    const { data, error } = await supabase.rpc('update_assessment', {
      p_assessment_id: assessmentId,
      p_updates: updates
    });
    if (error) throw error;
    return data;
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
}