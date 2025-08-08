import { supabase } from './supabaseClient';

export class AuthService {
  static async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  static onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }

  static async getUserRole(userEmail) {
    try {
      // Query the employees table to get the actual role
      const { data: employee, error } = await supabase
        .from('employees')
        .select('role, name')
        .eq('email', userEmail)
        .eq('is_active', true)
        .single();

      if (error || !employee) {
        console.warn('No employee record found for:', userEmail);
        return {
          role: 'employee',
          name: userEmail.split('@')[0]
        };
      }

      return {
        role: employee.role,
        name: employee.name
      };
    } catch (error) {
      console.error('Error getting user role:', error);
      return {
        role: 'employee',
        name: userEmail.split('@')[0]
      };
    }
  }
}