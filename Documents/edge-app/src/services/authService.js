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
    // Simple role assignment logic
    if (userEmail === 'admin@lucerne.com') {
      return { role: 'admin', name: 'Admin' };
    } else if (userEmail === 'manager@lucerne.com') {
      return { role: 'manager', name: 'Manager' };
    } else if (userEmail === 'employee1@lucerne.com') {
      return { role: 'employee', name: 'Employee 1' };
    }
    
    return {
      role: 'employee',
      name: userEmail.split('@')[0]
    };
  }
}