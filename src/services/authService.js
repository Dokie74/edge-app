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

      console.log('⚠️ User not found in employees table, using fallback logic');
      
      // Fallback to hardcoded logic for existing test users
      if (userEmail === 'admin@lucerne.com') {
        return { role: 'admin', name: 'Admin' };
      } else if (userEmail === 'manager@lucerne.com') {
        return { role: 'manager', name: 'Manager' };
      } else if (userEmail === 'employee1@lucerne.com') {
        return { role: 'employee', name: 'Employee 1' };
      }
      
      // Default fallback
      return {
        role: 'employee',
        name: userEmail.split('@')[0]
      };
    } catch (err) {
      console.error('❌ Error fetching user role:', err);
      // Fallback on error
      return {
        role: 'employee',
        name: userEmail.split('@')[0]
      };
    }
  }
}