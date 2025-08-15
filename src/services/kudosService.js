import { supabase } from './supabaseClient';

export class KudosService {
  static async getKudosWall() {
    const { data, error } = await supabase.rpc('get_kudos_wall');
    if (error) throw error;
    return data || [];
  }

  static async giveKudos(kudosData) {
    const { data, error } = await supabase.rpc('give_kudos', {
      p_recipient_id: kudosData.recipientId,
      p_core_value: kudosData.coreValue,
      p_message: kudosData.message
    });
    if (error) throw error;
    return data;
  }

  static async getKudosForEmployee(employeeId) {
    const { data, error } = await supabase.rpc('get_employee_kudos', {
      p_employee_id: employeeId
    });
    if (error) throw error;
    return data || [];
  }
}