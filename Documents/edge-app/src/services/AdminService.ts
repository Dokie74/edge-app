// AdminService.ts - TypeScript version with enhanced type safety
import { supabase } from './supabaseClient';
import logger from '../utils/secureLogger';
import { validateEmployeeForm } from '../utils/validation';
import { 
  Employee, 
  EmployeeFormData, 
  ApiResponse, 
  ServiceResponse,
  UserRole 
} from '../types';

export class AdminService {
  /**
   * Get all employees for admin view
   * @returns Promise with array of employees or error
   */
  static async getAllEmployees(): Promise<Employee[]> {
    try {
      const { data, error } = await supabase.rpc('get_all_employees_for_admin');
      if (error) throw error;
      
      // The function now returns JSON, so we need to parse it
      let employees: Employee[];
      if (typeof data === 'string') {
        employees = JSON.parse(data);
      } else {
        employees = Array.isArray(data) ? data : (data || []);
      }
      
      return employees;
    } catch (error) {
      console.error('Error fetching employees:', error);
      // Fallback to direct table query if RPC fails
      try {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('employees')
          .select('*')
          .order('name');
        
        if (fallbackError) throw fallbackError;
        return fallbackData || [];
      } catch (fallbackErr) {
        console.error('Fallback query also failed:', fallbackErr);
        throw new Error(`Failed to fetch employees: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Get potential managers for employee assignment
   * @returns Promise with array of potential managers
   */
  static async getPotentialManagers(): Promise<Employee[]> {
    try {
      const { data, error } = await supabase.rpc('get_potential_managers');
      if (error) throw error;
      
      // The function now returns JSON, so we need to parse it
      let managers: Employee[];
      if (typeof data === 'string') {
        managers = JSON.parse(data);
      } else {
        managers = Array.isArray(data) ? data : (data || []);
      }
      
      return managers;
    } catch (error) {
      console.error('Error fetching potential managers:', error);
      throw new Error(`Failed to fetch managers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create new employee with security validation
   * @param employeeData - Employee form data
   * @returns Promise with creation result
   */
  static async createEmployee(employeeData: EmployeeFormData): Promise<ApiResponse<{ employee_id: string }>> {
    try {
      // Input validation and sanitization
      const validation = validateEmployeeForm(employeeData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
      }

      // Use validated and sanitized data
      const secureData = validation.data as EmployeeFormData;

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
      
      return {
        success: true,
        data: result,
        message: 'Employee created successfully'
      };
    } catch (error) {
      logger.logError(error, { action: 'create_employee', data: employeeData });
      throw new Error(`Failed to create employee: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update existing employee
   * @param employeeId - Employee ID to update
   * @param updateData - Data to update
   * @returns Promise with update result
   */
  static async updateEmployee(
    employeeId: string, 
    updateData: Partial<EmployeeFormData>
  ): Promise<ApiResponse<{ employee_id: string }>> {
    try {
      // Validate the update data
      const validation = validateEmployeeForm(updateData as EmployeeFormData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
      }

      const secureData = validation.data as Partial<EmployeeFormData>;

      logger.logUserAction('update_employee_attempt', null, { 
        employee_id: employeeId,
        updated_fields: Object.keys(secureData)
      });

      const { data: result, error } = await supabase.rpc('update_employee', {
        p_employee_id: employeeId,
        p_name: secureData.name,
        p_email: secureData.email,
        p_job_title: secureData.jobTitle,
        p_role: secureData.role,
        p_manager_id: secureData.managerId || null,
        p_is_active: secureData.isActive
      });

      if (error) throw error;

      if (result?.error) {
        logger.logSecurity('employee_update_failed', 'warn', { error: result.error });
        throw new Error(result.error);
      }

      logger.logUserAction('update_employee_success', null, { 
        employee_id: employeeId 
      });

      return {
        success: true,
        data: result,
        message: 'Employee updated successfully'
      };
    } catch (error) {
      logger.logError(error, { action: 'update_employee', employee_id: employeeId });
      throw new Error(`Failed to update employee: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete employee (soft delete)
   * @param employeeId - Employee ID to delete
   * @returns Promise with deletion result
   */
  static async deleteEmployee(employeeId: string): Promise<ApiResponse> {
    try {
      logger.logUserAction('delete_employee_attempt', null, { employee_id: employeeId });

      const { data: result, error } = await supabase.rpc('delete_employee', {
        p_employee_id: employeeId
      });

      if (error) throw error;

      if (result?.error) {
        logger.logSecurity('employee_deletion_failed', 'warn', { error: result.error });
        throw new Error(result.error);
      }

      logger.logUserAction('delete_employee_success', null, { employee_id: employeeId });

      return {
        success: true,
        message: 'Employee deleted successfully'
      };
    } catch (error) {
      logger.logError(error, { action: 'delete_employee', employee_id: employeeId });
      throw new Error(`Failed to delete employee: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if current user has admin privileges
   * @returns Promise with admin status
   */
  static async checkAdminAccess(): Promise<{ isAdmin: boolean; role: UserRole | null }> {
    try {
      const { data, error } = await supabase.rpc('check_user_role');
      if (error) throw error;

      const result = typeof data === 'string' ? JSON.parse(data) : data;
      
      return {
        isAdmin: result?.role === 'admin',
        role: result?.role || null
      };
    } catch (error) {
      console.error('Error checking admin access:', error);
      return { isAdmin: false, role: null };
    }
  }

  /**
   * Get employee statistics for admin dashboard
   * @returns Promise with employee statistics
   */
  static async getEmployeeStats(): Promise<{
    total: number;
    by_role: Record<UserRole, number>;
    active: number;
    inactive: number;
  }> {
    try {
      const employees = await this.getAllEmployees();
      
      const stats = {
        total: employees.length,
        by_role: {
          employee: 0,
          manager: 0,
          admin: 0
        } as Record<UserRole, number>,
        active: 0,
        inactive: 0
      };

      employees.forEach(emp => {
        stats.by_role[emp.role as UserRole]++;
        if (emp.is_active) {
          stats.active++;
        } else {
          stats.inactive++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error getting employee stats:', error);
      throw new Error(`Failed to get employee statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default AdminService;