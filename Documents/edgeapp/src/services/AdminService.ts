// SECURE AdminService.ts - TypeScript version with proper types
import { supabase } from './supabaseClient';
import { validateEmployeeForm, validateReviewCycleForm } from '../utils/validation';
import logger from '../utils/secureLogger';
import csrfProtection from '../utils/csrfProtection';
import { 
  Employee, 
  ReviewCycle, 
  EmployeeFormData,
  ReviewCycleFormData,
  ValidationResult, 
  ApiResponse, 
  ServiceResponse 
} from '../types';

interface AdminFunctionResponse {
  success: boolean;
  user?: any;
  employee?: Employee;
  error?: string;
  [key: string]: any;
}

export class AdminService {
  // VERSION CHECK - Updated August 12, 2025 4:56 PM - Edge Function Only approach
  static getVersion() {
    console.log('🔍 AdminService Version: EDGE_FUNCTION_ONLY_v1.3 - August 12, 2025 4:56 PM');
    return 'EDGE_FUNCTION_ONLY_v1.3';
  }
  // Call secure edge function with proper authentication
  static async callAdminFunction(action: string, data: any): Promise<AdminFunctionResponse> {
    try {
      // Get current session to ensure auth headers are included
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log('🔐 Auth session check:', {
        hasSession: !!session,
        hasAccessToken: !!session?.access_token,
        userEmail: session?.user?.email
      });
      
      if (!session?.access_token) {
        throw new Error('User not authenticated - cannot call admin Edge Function');
      }
      
      const { data: result, error } = await supabase.functions.invoke('admin-operations', {
        body: { action, data },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('Edge Function error details:', error);
        throw error;
      }
      
      if (result?.error) {
        console.error('Edge Function result error:', result);
        throw new Error(result.error + (result.debug ? ` | Debug: ${JSON.stringify(result.debug)}` : ''));
      }

      return result as AdminFunctionResponse;
    } catch (error: any) {
      console.error(`Admin operation ${action} failed:`, error);
      throw error;
    }
  }

  // Get all employees for admin management
  static async getAllEmployees(): Promise<Employee[]> {
    try {
      const { data, error } = await supabase.rpc('get_all_employees_for_admin');
      if (error) throw error;
      
      // The function now returns JSON, so we need to parse it
      if (typeof data === 'string') {
        return JSON.parse(data) as Employee[];
      }
      
      // If it's already an array/object, return as is
      return Array.isArray(data) ? data as Employee[] : (data || []);
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      
      // Try the backup simple function if the main one fails
      try {
        const { data: backupData, error: backupError } = await supabase.rpc('get_employees_simple');
        if (backupError) throw backupError;
        
        return typeof backupData === 'string' ? JSON.parse(backupData) as Employee[] : (backupData || []);
      } catch (backupErr) {
        console.error('Backup function also failed:', backupErr);
        throw new Error(`Failed to fetch employees: ${error?.message}`);
      }
    }
  }

  // Get potential managers for dropdown
  static async getPotentialManagers(): Promise<Employee[]> {
    try {
      const { data, error } = await supabase.rpc('get_potential_managers');
      if (error) throw error;
      
      // The function now returns JSON, so we need to parse it
      let managers: Employee[];
      if (typeof data === 'string') {
        managers = JSON.parse(data) as Employee[];
      } else {
        managers = Array.isArray(data) ? data as Employee[] : (data || []);
      }
      
      return managers;
    } catch (error: any) {
      console.error('Error fetching potential managers:', error);
      throw new Error(`Failed to fetch managers: ${error?.message}`);
    }
  }

  // Create new employee with auth user - Edge Function Only approach
  static async createEmployee(employeeData: EmployeeFormData): Promise<ApiResponse> {
    // VERSION CHECK
    AdminService.getVersion();
    console.log('🔥 AdminService.createEmployee called with:', employeeData);
    console.log('🔥 EDGE FUNCTION ONLY version - bypassing broken API routes');
    console.log('🔥 Current timestamp:', new Date().toISOString());
    
    try {
      // Input validation and sanitization
      const validation: ValidationResult = validateEmployeeForm(employeeData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
      }

      // Use validated and sanitized data
      const secureData = validation.data as EmployeeFormData;

      // Log security event
      logger.logUserAction('create_employee_attempt', null, { role: secureData.role });

      console.log('🚀 CALLING EDGE FUNCTION DIRECTLY - bypassing broken API routes');
      
      // Get current session for auth headers
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Admin not authenticated - cannot create users');
      }

      console.log('👤 Admin session found:', session.user.email);

      // Call Edge Function directly with proper auth
      console.log('📡 Invoking admin-operations Edge Function...');
      const { data: result, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          action: 'create_user',
          data: {
            name: secureData.name,
            email: secureData.email,
            role: secureData.role,
            job_title: secureData.jobTitle || 'Staff',
            department: secureData.department,
            manager_id: secureData.managerId || null,
            temp_password: secureData.password || 'TempPass123!'
          }
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('💥 Edge Function error:', error);
        throw error;
      }

      if (result?.error) {
        console.error('💥 Edge Function result error:', result);
        throw new Error(result.error + (result.debug ? ` | Debug: ${JSON.stringify(result.debug)}` : ''));
      }

      // CRITICAL: Verify auth user was created
      if (!result.user?.id) {
        console.error('💥 CRITICAL: Edge Function succeeded but no user_id returned');
        console.error('💥 Full result:', result);
        throw new Error('Edge Function failed: No auth user created');
      }

      console.log('✅ Edge Function succeeded with auth user:', result.user.id);
      console.log('✅ Employee created:', result.employee?.id);
      
      logger.logUserAction('create_employee_success', null, { 
        user_id: result.user.id,
        employee_id: result.employee?.id,
        role: secureData.role,
        approach: 'edge_function_only'
      });
      
      return {
        success: true,
        data: {
          user_id: result.user.id,
          employee_id: result.employee?.id,
          message: 'Employee created successfully with login account!',
          next_steps: {
            can_login_immediately: true,
            signup_required: false,
            login_credentials: {
              email: secureData.email,
              password: secureData.password || 'TempPass123!'
            },
            instructions: `User can log in immediately with email: ${secureData.email} and the provided temporary password.`
          }
        }
      };
    } catch (error: any) {
      logger.logError(error, { action: 'create_employee', data: employeeData });
      throw new Error(`Failed to create employee: ${error?.message}`);
    }
  }

  // Update existing employee with security validation
  static async updateEmployee(employeeId: string, updates: Partial<EmployeeFormData>): Promise<Employee> {
    try {
      // Validate employee ID
      if (!employeeId) {
        throw new Error('Employee ID is required');
      }

      // Validate and sanitize only the fields being updated
      const validatedUpdates: any = {};
      
      if (updates.name !== undefined) {
        const nameValidation = validateEmployeeForm({ name: updates.name });
        if (!nameValidation.isValid && nameValidation.errors.name) {
          throw new Error(`Name validation failed: ${nameValidation.errors.name}`);
        }
        validatedUpdates.name = (nameValidation.data as any)?.name || updates.name;
      }

      if (updates.email !== undefined) {
        const emailValidation = validateEmployeeForm({ email: updates.email });
        if (!emailValidation.isValid && emailValidation.errors.email) {
          throw new Error(`Email validation failed: ${emailValidation.errors.email}`);
        }
        validatedUpdates.email = (emailValidation.data as any)?.email || updates.email;
      }

      if (updates.jobTitle !== undefined) {
        const jobTitleValidation = validateEmployeeForm({ jobTitle: updates.jobTitle });
        if (!jobTitleValidation.isValid && jobTitleValidation.errors.jobTitle) {
          throw new Error(`Job title validation failed: ${jobTitleValidation.errors.jobTitle}`);
        }
        validatedUpdates.jobTitle = (jobTitleValidation.data as any)?.jobTitle || updates.jobTitle;
      }

      if (updates.role !== undefined) {
        const roleValidation = validateEmployeeForm({ role: updates.role });
        if (!roleValidation.isValid && roleValidation.errors.role) {
          throw new Error(`Role validation failed: ${roleValidation.errors.role}`);
        }
        validatedUpdates.role = (roleValidation.data as any)?.role || updates.role;
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
    } catch (error: any) {
      logger.logError(error, { 
        action: 'update_employee', 
        employee_id: employeeId,
        updates: Object.keys(updates)
      });
      throw new Error(`Failed to update employee: ${error?.message || 'Unknown error'}`);
    }
  }

  // Check current user role for debugging
  static async checkCurrentRole() {
    try {
      // Use standardized auth role service (session-derived only)
      const { getMyRole } = await import('./authRole');
      return await getMyRole();
    } catch (error: any) {
      console.error('Error checking role:', error);
      throw new Error(`Failed to check role: ${error?.message || 'Unknown error'}`);
    }
  }

  // Get review cycles (for useAdmin compatibility)
  static async getReviewCycles(): Promise<ReviewCycle[]> {
    try {
      const { data, error } = await supabase
        .from('review_cycles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Add time-based status computation
      const cyclesWithComputedStatus = (data || []).map(cycle => {
        const now = new Date();
        const startDate = new Date(cycle.start_date);
        const endDate = new Date(cycle.end_date);
        
        let computedStatus = cycle.status; // Default to database status
        
        // Override status based on dates if the cycle is not manually closed
        if (cycle.status !== 'closed') {
          if (now < startDate) {
            computedStatus = 'upcoming';
          } else if (now >= startDate && now <= endDate) {
            computedStatus = 'active';
          } else if (now > endDate) {
            computedStatus = 'closed';
          }
        }
        
        // Log status changes for debugging
        if (computedStatus !== cycle.status) {
          console.log(`📅 Auto-status change for "${cycle.name}": ${cycle.status} → ${computedStatus} (dates: ${startDate.toDateString()} - ${endDate.toDateString()})`);
        }
        
        return {
          ...cycle,
          status: computedStatus,
          _original_status: cycle.status, // Keep original for reference
          _is_auto_status: computedStatus !== cycle.status // Flag for debugging
        };
      });
      
      return cyclesWithComputedStatus;
    } catch (error: any) {
      console.error('Error fetching review cycles:', error);
      throw new Error(`Failed to fetch review cycles: ${error?.message || 'Unknown error'}`);
    }
  }

  // Get active review cycles with assessment status
  static async getActiveReviewCyclesWithStatus() {
    try {
      const { data, error } = await supabase.rpc('get_active_review_cycles_with_status');
      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching active review cycles:', error);
      throw new Error(`Failed to fetch active review cycles: ${error?.message || 'Unknown error'}`);
    }
  }

  // Create review cycle with security validation
  static async createReviewCycle(cycleData: ReviewCycleFormData): Promise<ApiResponse> {
    try {
      // Input validation and sanitization
      const validation = validateReviewCycleForm(cycleData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
      }

      const secureData = validation.data as ReviewCycleFormData;

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
    } catch (error: any) {
      logger.logError(error, { action: 'create_review_cycle', data: cycleData });
      throw new Error(`Failed to create review cycle: ${error?.message || 'Unknown error'}`);
    }
  }


  // Close review cycle
  static async closeReviewCycle(cycleId: string) {
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
    } catch (error: any) {
      logger.logError(error, { action: 'close_review_cycle', cycle_id: cycleId });
      throw new Error(`Failed to close review cycle: ${error?.message || 'Unknown error'}`);
    }
  }

  // Get detailed review cycle information
  static async getReviewCycleDetails(cycleId: string) {
    try {
      const result = await csrfProtection.secureRPC('get_review_cycle_details', {
        p_cycle_id: cycleId
      });
      
      if (result?.error) {
        throw new Error(result.error);
      }

      return result;
    } catch (error: any) {
      logger.logError(error, { action: 'get_review_cycle_details', cycle_id: cycleId });
      throw new Error(`Failed to get review cycle details: ${error?.message || 'Unknown error'}`);
    }
  }

  // Cleanup test users while preserving admin user
  static async cleanupTestUsers(testEmails?: string[]): Promise<ApiResponse> {
    try {
      const defaultTestEmails = [
        'employee1@lucerne.com',
        'manager1@lucerne.com'
      ];

      // Log security event
      logger.logUserAction('cleanup_test_users_attempt', null, { 
        test_emails: testEmails || defaultTestEmails 
      });

      // Call secure Edge Function for cleanup
      const result = await this.callAdminFunction('cleanup_test_users', {
        test_emails: testEmails || defaultTestEmails
      });

      logger.logUserAction('cleanup_test_users_success', null, { 
        summary: result.summary,
        admin_preserved: result.admin_preserved
      });
      
      return {
        success: true,
        data: result,
        message: result.message || 'Test users cleanup completed successfully'
      };
    } catch (error: any) {
      logger.logError(error, { action: 'cleanup_test_users', test_emails: testEmails });
      throw new Error(`Failed to cleanup test users: ${error?.message}`);
    }
  }

  // Generate invitation link/instructions
  static generateInvitationInstructions(employeeData: EmployeeFormData, credentials: any) {
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