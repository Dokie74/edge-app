import { supabase } from './supabaseClient';

export class TeamService {
  static async getMyTeam() {
    try {
      const { data, error } = await supabase.rpc('get_my_team');
      if (error) {
        // If function doesn't exist, return empty array for now
        if (error.code === 'PGRST202') {
          console.warn('get_my_team function not found, returning empty array');
          return [];
        }
        throw error;
      }
      return data || [];
    } catch (error) {
      if (error.code === 'PGRST202') {
        console.warn('get_my_team function not found, returning empty array');
        return [];
      }
      throw error;
    }
  }

  static async getTeamAssessments() {
    try {
      const { data, error } = await supabase.rpc('get_team_assessments');
      if (error) {
        // If function doesn't exist, return empty array for now
        if (error.code === 'PGRST202') {
          console.warn('get_team_assessments function not found, returning empty array');
          return [];
        }
        throw error;
      }
      return data || [];
    } catch (error) {
      if (error.code === 'PGRST202') {
        console.warn('get_team_assessments function not found, returning empty array');
        return [];
      }
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