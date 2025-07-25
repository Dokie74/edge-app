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
      
      // The function now returns JSON, so we need to parse it
      if (typeof data === 'string') {
        return JSON.parse(data);
      }
      
      // If it's already an array/object, return as is
      return Array.isArray(data) ? data : (data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      
      // Try the backup simple function if the main one fails
      try {
        const { data: backupData, error: backupError } = await supabase.rpc('get_employees_simple');
        if (backupError) throw backupError;
        
        return typeof backupData === 'string' ? JSON.parse(backupData) : (backupData || []);
      } catch (backupErr) {
        console.error('Backup function also failed:', backupErr);
        throw new Error(`Failed to fetch employees: ${error.message}`);
      }
    }
  }

  // Get potential managers for dropdown
  static async getPotentialManagers() {
    try {
      const { data, error } = await supabase.rpc('get_potential_managers');
      if (error) throw error;
      
      console.log('Raw manager data from database:', data);
      console.log('Data type:', typeof data);
      
      // The function now returns JSON, so we need to parse it
      let managers;
      if (typeof data === 'string') {
        managers = JSON.parse(data);
      } else {
        managers = Array.isArray(data) ? data : (data || []);
      }
      
      console.log('Processed managers:', managers);
      console.log('Manager count:', managers.length);
      
      return managers;
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

      // Use direct RPC call (CSRF protection is handled at middleware level)
      const { data: result, error: rpcError } = await supabase.rpc('create_employee', {
        p_name: secureData.name,
        p_email: secureData.email,
        p_job_title: secureData.jobTitle,
        p_role: secureData.role,
        p_manager_id: secureData.managerId || null,
        p_temp_password: secureData.tempPassword || null
      });
      
      if (rpcError) throw rpcError;
      
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

  // Update existing employee with security validation
  static async updateEmployee(employeeId, updates) {
    try {
      // Validate employee ID
      if (!employeeId) {
        throw new Error('Employee ID is required');
      }

      // Validate and sanitize only the fields being updated
      const validatedUpdates = {};
      
      if (updates.name !== undefined) {
        const nameValidation = validateEmployeeForm({ name: updates.name });
        if (!nameValidation.isValid && nameValidation.errors.name) {
          throw new Error(`Name validation failed: ${nameValidation.errors.name}`);
        }
        validatedUpdates.name = nameValidation.data?.name || updates.name;
      }

      if (updates.email !== undefined) {
        const emailValidation = validateEmployeeForm({ email: updates.email });
        if (!emailValidation.isValid && emailValidation.errors.email) {
          throw new Error(`Email validation failed: ${emailValidation.errors.email}`);
        }
        validatedUpdates.email = emailValidation.data?.email || updates.email;
      }

      if (updates.jobTitle !== undefined) {
        const jobTitleValidation = validateEmployeeForm({ jobTitle: updates.jobTitle });
        if (!jobTitleValidation.isValid && jobTitleValidation.errors.jobTitle) {
          throw new Error(`Job title validation failed: ${jobTitleValidation.errors.jobTitle}`);
        }
        validatedUpdates.jobTitle = jobTitleValidation.data?.jobTitle || updates.jobTitle;
      }

      if (updates.role !== undefined) {
        const roleValidation = validateEmployeeForm({ role: updates.role });
        if (!roleValidation.isValid && roleValidation.errors.role) {
          throw new Error(`Role validation failed: ${roleValidation.errors.role}`);
        }
        validatedUpdates.role = roleValidation.data?.role || updates.role;
      }

      if (updates.managerId !== undefined) {
        validatedUpdates.managerId = updates.managerId;
      }

      if (updates.isActive !== undefined) {
        validatedUpdates.isActive = updates.isActive;
      }

      // Log security event
      logger.logUserAction('update_employee_attempt', null, { 
        employee_id: employeeId,
        fields_updated: Object.keys(validatedUpdates)
      });

      // Use direct RPC call (CSRF protection is handled at middleware level)
      const { data: result, error: rpcError } = await supabase.rpc('update_employee', {
        p_employee_id: employeeId,
        p_name: validatedUpdates.name || null,
        p_email: validatedUpdates.email || null,
        p_job_title: validatedUpdates.jobTitle || null,
        p_role: validatedUpdates.role || null,
        p_manager_id: validatedUpdates.managerId || null,
        p_is_active: validatedUpdates.isActive !== undefined ? validatedUpdates.isActive : null
      });
      
      if (rpcError) throw rpcError;
      
      if (result?.error) {
        logger.logSecurity('employee_update_failed', 'warn', { 
          employee_id: employeeId,
          error: result.error 
        });
        throw new Error(result.error);
      }

      logger.logUserAction('update_employee_success', null, { 
        employee_id: employeeId,
        fields_updated: Object.keys(validatedUpdates)
      });
      
      return result;
    } catch (error) {
      logger.logError(error, { 
        action: 'update_employee', 
        employee_id: employeeId,
        updates: Object.keys(updates)
      });
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

  // Get active review cycles with assessment status
  static async getActiveReviewCyclesWithStatus() {
    try {
      const { data, error } = await supabase.rpc('get_active_review_cycles_with_status');
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching active review cycles:', error);
      throw new Error(`Failed to fetch active review cycles: ${error.message}`);
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

  // Activate review cycle with assessment creation
  static async activateReviewCycle(cycleId) {
    try {
      // Log security event
      logger.logUserAction('activate_review_cycle_attempt', null, { cycle_id: cycleId });

      // Use secure RPC call with CSRF protection
      const result = await csrfProtection.secureRPC('activate_review_cycle_with_assessments', {
        p_cycle_id: cycleId
      });
      
      if (result?.error) {
        logger.logSecurity('review_cycle_activation_failed', 'warn', { 
          cycle_id: cycleId,
          error: result.error 
        });
        throw new Error(result.error);
      }

      logger.logUserAction('activate_review_cycle_success', null, { 
        cycle_id: cycleId,
        assessments_created: result.assessments_created,
        cycle_name: result.cycle_name
      });
      
      return {
        success: true,
        message: `Review cycle activated successfully! Created ${result.assessments_created} assessments.`,
        data: result
      };
    } catch (error) {
      logger.logError(error, { action: 'activate_review_cycle', cycle_id: cycleId });
      throw new Error(`Failed to activate review cycle: ${error.message}`);
    }
  }

  // Close review cycle
  static async closeReviewCycle(cycleId) {
    try {
      // Log security event
      logger.logUserAction('close_review_cycle_attempt', null, { cycle_id: cycleId });

      // Use secure RPC call with CSRF protection
      const result = await csrfProtection.secureRPC('close_review_cycle', {
        p_cycle_id: cycleId
      });
      
      if (result?.error) {
        logger.logSecurity('review_cycle_close_failed', 'warn', { 
          cycle_id: cycleId,
          error: result.error 
        });
        throw new Error(result.error);
      }

      logger.logUserAction('close_review_cycle_success', null, { 
        cycle_id: cycleId,
        cycle_name: result.cycle_name,
        total_assessments: result.total_assessments,
        completed_assessments: result.completed_assessments
      });
      
      return {
        success: true,
        message: `Review cycle "${result.cycle_name}" closed successfully! ${result.completed_assessments}/${result.total_assessments} assessments were completed.`,
        data: result
      };
    } catch (error) {
      logger.logError(error, { action: 'close_review_cycle', cycle_id: cycleId });
      throw new Error(`Failed to close review cycle: ${error.message}`);
    }
  }

  // Get detailed review cycle information
  static async getReviewCycleDetails(cycleId) {
    try {
      const result = await csrfProtection.secureRPC('get_review_cycle_details', {
        p_cycle_id: cycleId
      });
      
      if (result?.error) {
        throw new Error(result.error);
      }

      return result;
    } catch (error) {
      logger.logError(error, { action: 'get_review_cycle_details', cycle_id: cycleId });
      throw new Error(`Failed to get review cycle details: ${error.message}`);
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