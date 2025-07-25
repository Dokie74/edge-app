// AdminService.js - Service for admin employee management operations
import { supabase } from './supabaseClient';
import { validateEmployeeForm, validateReviewCycleForm } from '../utils/validation';
import logger from '../utils/secureLogger';
import csrfProtection from '../utils/csrfProtection';

export class AdminService {
  // Get all employees for admin management
  static async getAllEmployees() {
    try {
      const { data, error } = await supabase.rpc('get_all_employees_for_admin');
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw new Error(`Failed to fetch employees: ${error.message}`);
    }
  }

  // Get potential managers for dropdown
  static async getPotentialManagers() {
    try {
      const { data, error } = await supabase.rpc('get_potential_managers');
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching potential managers:', error);
      throw new Error(`Failed to fetch managers: ${error.message}`);
    }
  }

  // Create new employee with security validation
  static async createEmployee(employeeData) {
    try {
      // Input validation and sanitization
      const validation = validateEmployeeForm(employeeData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
      }

      // Use validated and sanitized data
      const secureData = validation.data;

      // Log security event
      logger.logUserAction('create_employee_attempt', null, { role: secureData.role });

      // Use secure RPC call with CSRF protection
      const result = await csrfProtection.secureRPC('create_employee', {
        p_name: secureData.name,
        p_email: secureData.email,
        p_job_title: secureData.jobTitle,
        p_role: secureData.role,
        p_manager_id: secureData.managerId || null,
        p_temp_password: secureData.tempPassword || null
      });
      
      if (result?.error) {
        logger.logSecurity('employee_creation_failed', 'warn', { error: result.error });
        throw new Error(result.error);
      }

      logger.logUserAction('create_employee_success', null, { 
        employee_id: result.employee_id,
        role: secureData.role 
      });
      
      return result;
    } catch (error) {
      logger.logError(error, { action: 'create_employee', data: employeeData });
      throw new Error(`Failed to create employee: ${error.message}`);
    }
  }

  // Update existing employee
  static async updateEmployee(employeeId, updates) {
    try {
      const { data, error } = await supabase.rpc('update_employee', {
        p_employee_id: employeeId,
        p_name: updates.name || null,
        p_email: updates.email || null,
        p_job_title: updates.jobTitle || null,
        p_role: updates.role || null,
        p_manager_id: updates.managerId || null,
        p_is_active: updates.isActive !== undefined ? updates.isActive : null
      });
      
      if (error) throw error;
      
      if (data?.error) {
        throw new Error(data.error);
      }
      
      return data;
    } catch (error) {
      console.error('Error updating employee:', error);
      throw new Error(`Failed to update employee: ${error.message}`);
    }
  }

  // Check current user role for debugging
  static async checkCurrentRole() {
    try {
      const { data, error } = await supabase.rpc('get_my_role');
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error checking role:', error);
      throw new Error(`Failed to check role: ${error.message}`);
    }
  }

  // Get review cycles (for useAdmin compatibility)
  static async getReviewCycles() {
    try {
      const { data, error } = await supabase
        .from('review_cycles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching review cycles:', error);
      throw new Error(`Failed to fetch review cycles: ${error.message}`);
    }
  }

  // Create review cycle with security validation
  static async createReviewCycle(cycleData) {
    try {
      // Input validation and sanitization
      const validation = validateReviewCycleForm(cycleData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
      }

      const secureData = validation.data;

      // Log security event
      logger.logUserAction('create_review_cycle_attempt', null, { name: secureData.name });

      // Use secure RPC call with CSRF protection
      const result = await csrfProtection.secureRPC('create_simple_review_cycle', {
        p_name: secureData.name,
        p_start_date: secureData.startDate,
        p_end_date: secureData.endDate
      });
      
      if (result?.error) {
        logger.logSecurity('review_cycle_creation_failed', 'warn', { error: result.error });
        throw new Error(result.error);
      }

      logger.logUserAction('create_review_cycle_success', null, { 
        cycle_id: result.cycle_id,
        name: secureData.name 
      });
      
      return result;
    } catch (error) {
      logger.logError(error, { action: 'create_review_cycle', data: cycleData });
      throw new Error(`Failed to create review cycle: ${error.message}`);
    }
  }

  // Activate review cycle (for useAdmin compatibility)
  static async activateReviewCycle(cycleId) {
    try {
      const { data, error } = await supabase
        .from('review_cycles')
        .update({ status: 'active' })
        .eq('id', cycleId)
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, message: 'Review cycle activated successfully' };
    } catch (error) {
      console.error('Error activating review cycle:', error);
      throw new Error(`Failed to activate review cycle: ${error.message}`);
    }
  }

  // Generate invitation link/instructions
  static generateInvitationInstructions(employeeData, credentials) {
    const appUrl = window.location.origin;
    return {
      subject: `Welcome to EDGE - Employee Development & Growth Engine`,
      body: `Hi ${employeeData.name},

You've been added to the EDGE (Employee Development & Growth Engine) system as a ${employeeData.role}.

To get started:
1. Go to: ${appUrl}
2. Click "Sign Up" 
3. Use this email: ${employeeData.email}
4. Create your password (minimum 6 characters)

Your role: ${employeeData.role.charAt(0).toUpperCase() + employeeData.role.slice(1)}
${employeeData.managerId ? `Your manager will be available in the system once you log in.` : ''}

If you have any questions, please contact your administrator.

Welcome to the team!`,
      
      copyText: `Email: ${employeeData.email}\nRole: ${employeeData.role}\nApp URL: ${appUrl}`
    };
  }
}

export default AdminService;