// SecureAuthService.js - Secure authentication service with server-side validation
import { supabase } from './supabaseClient';

export class SecureAuthService {
  // Get current user session with server-side validation
  static async getCurrentSession() {
    try {
      const { data, error } = await supabase.rpc('get_current_user_session');
      if (error) throw error;
      
      return {
        ...data,
        isAuthenticated: data?.authenticated || false,
        user: data?.authenticated ? {
          id: data.user_id,
          name: data.name,
          email: data.email,
          role: data.role,
          jobTitle: data.job_title
        } : null
      };
    } catch (error) {
      console.error('Session validation failed:', error);
      return {
        isAuthenticated: false,
        user: null,
        error: error.message
      };
    }
  }

  // Get user role with server-side validation
  static async getUserRole() {
    try {
      const { data, error } = await supabase.rpc('get_current_user_role');
      if (error) throw error;
      
      if (!data?.authorized) {
        throw new Error(data?.error || 'Unauthorized access');
      }
      
      return {
        role: data.role,
        permissions: data.permissions || [],
        employeeId: data.employee_id,
        name: data.name
      };
    } catch (error) {
      console.error('Role validation failed:', error);
      throw new Error('Unable to verify user permissions');
    }
  }

  // Check if user has specific permission
  static async checkPermission(permission) {
    try {
      const { data, error } = await supabase.rpc('check_user_permission', {
        required_permission: permission
      });
      
      if (error) throw error;
      return data === true;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }

  // Secure sign in with validation
  static async signIn(email, password) {
    try {
      // Input validation
      const validationError = this.validateCredentials(email, password);
      if (validationError) {
        throw new Error(validationError);
      }

      // Attempt sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: this.sanitizeEmail(email),
        password: password
      });

      if (error) throw error;

      // Validate session server-side
      const session = await this.getCurrentSession();
      if (!session.isAuthenticated) {
        throw new Error('Authentication validation failed');
      }

      // Log successful login
      await this.logSecurityEvent('user_login', 'authentication', true);

      return {
        success: true,
        user: session.user,
        session: data.session
      };
    } catch (error) {
      // Log failed login attempt
      await this.logSecurityEvent('user_login_failed', 'authentication', false);
      
      throw new Error(`Sign in failed: ${error.message}`);
    }
  }

  // Secure sign out
  static async signOut() {
    try {
      // Log logout
      await this.logSecurityEvent('user_logout', 'authentication', true);
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      throw new Error('Sign out failed');
    }
  }

  // Input validation for credentials
  static validateCredentials(email, password) {
    if (!email || !email.trim()) {
      return 'Email is required';
    }

    if (!this.isValidEmail(email)) {
      return 'Invalid email format';
    }

    if (!password) {
      return 'Password is required';
    }

    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }

    return null;
  }

  // Email validation
  static isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim());
  }

  // Email sanitization
  static sanitizeEmail(email) {
    return email.trim().toLowerCase();
  }

  // Log security events (server-side)
  static async logSecurityEvent(action, resource = null, success = true) {
    try {
      await supabase.rpc('log_security_event', {
        p_action: action,
        p_resource: resource,
        p_success: success
      });
    } catch (error) {
      // Don't throw - logging should not break main flow
      console.error('Failed to log security event:', error);
    }
  }

  // Check if user is admin (with server validation)
  static async isAdmin() {
    return await this.checkPermission('admin');
  }

  // Check if user is manager or admin
  static async canManageTeam() {
    return await this.checkPermission('manage_team');
  }

  // Check if user can manage other users
  static async canManageUsers() {
    return await this.checkPermission('manage_users');
  }

  // Get current user's permissions
  static async getUserPermissions() {
    try {
      const roleData = await this.getUserRole();
      return roleData.permissions || [];
    } catch (error) {
      console.error('Failed to get permissions:', error);
      return [];
    }
  }

  // Validate current session periodically
  static async validateSession() {
    try {
      const session = await this.getCurrentSession();
      return session.isAuthenticated;
    } catch (error) {
      console.error('Session validation failed:', error);
      return false;
    }
  }

  // Get secure user data for UI (no sensitive info)
  static async getSecureUserData() {
    try {
      const session = await this.getCurrentSession();
      if (!session.isAuthenticated) {
        return null;
      }

      return {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email.replace(/(.{2}).*@/, '$1***@'), // Mask email for display
        role: session.user.role,
        jobTitle: session.user.jobTitle
      };
    } catch (error) {
      console.error('Failed to get secure user data:', error);
      return null;
    }
  }
}

export default SecureAuthService;