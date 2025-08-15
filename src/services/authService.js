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
      console.log('🔍 Looking up user role for:', userEmail);
      
      // First try to get role from employees table
      const { data: employee, error } = await supabase
        .from('employees')
        .select('role, name')
        .eq('email', userEmail.toLowerCase())
        .single();

      if (employee && !error) {
        console.log('✅ Found user in employees table:', employee);
        return {
          role: employee.role,
          name: employee.name
        };
      }

      console.log('⚠️ User not found in employees table');
      
      // No role assignment without database record for security
      throw new Error('User not found in employees table. Please contact your administrator.');
    } catch (err) {
      console.error('❌ Error fetching user role:', err);
      // Re-throw error instead of fallback for security
      throw err;
    }
  }
}