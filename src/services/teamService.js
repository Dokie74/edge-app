import { supabase } from './supabaseClient';

export class TeamService {
  static async getMyTeam() {
    try {
      console.log('Calling reliable get_my_team function');
      const { data, error } = await supabase.rpc('get_my_team');
      
      if (error) {
        console.error('Error from get_my_team:', error);
        throw error;
      }
      
      console.log('Team data received:', data);
      return data || [];
    } catch (error) {
      console.error('Error in getMyTeam:', error);
      throw error;
    }
  }

  static async getTeamAssessments() {
    try {
      console.log('Calling reliable get_team_assessments function');
      const { data, error } = await supabase.rpc('get_team_assessments');
      
      if (error) {
        console.error('Error from get_team_assessments:', error);
        throw error;
      }
      
      console.log('Team assessments received:', data);
      return data || [];
    } catch (error) {
      console.error('Error in getTeamAssessments:', error);
      throw error;
    }
  }

  static async startReviewCycle(cycleData) {
    try {
      const { data, error } = await supabase.rpc('start_review_cycle', {
        p_cycle_name: cycleData.cycleName,
        p_employee_ids: cycleData.employeeIds,
        p_due_date: cycleData.dueDate
      });
      if (error) {
        if (error.code === 'PGRST202') {
          console.warn('start_review_cycle function not found');
          return { success: false, error: 'Review cycle function not implemented yet' };
        }
        throw error;
      }
      return data;
    } catch (error) {
      if (error.code === 'PGRST202') {
        console.warn('start_review_cycle function not found');
        return { success: false, error: 'Review cycle function not implemented yet' };
      }
      throw error;
    }
  }
}