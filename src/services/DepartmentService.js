// src/services/DepartmentService.js - Department management service
import { supabase } from './supabaseClient';

class DepartmentService {
  
  /**
   * Get all active departments
   */
  static async getAllDepartments() {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
  }

  /**
   * Get employee's department assignments
   */
  static async getEmployeeDepartments(employeeId) {
    try {
      const { data, error } = await supabase
        .from('employee_departments')
        .select(`
          *,
          department:departments(*)
        `)
        .eq('employee_id', employeeId)
        .order('is_primary', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching employee departments:', error);
      throw error;
    }
  }

  /**
   * Get employee's primary department
   */
  static async getEmployeePrimaryDepartment(employeeId) {
    try {
      const { data, error } = await supabase
        .rpc('get_employee_primary_department', { emp_id: employeeId });
      
      if (error) throw error;
      return data?.[0] || { dept_name: 'General', dept_id: null };
    } catch (error) {
      console.error('Error fetching employee primary department:', error);
      return { dept_name: 'General', dept_id: null };
    }
  }

  /**
   * Assign primary department to employee
   */
  static async assignPrimaryDepartment(employeeId, departmentId, assignedById = null) {
    try {
      const { data, error } = await supabase
        .rpc('assign_primary_department', { 
          emp_id: employeeId, 
          dept_id: parseInt(departmentId),
          assigned_by_id: assignedById 
        });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error assigning primary department:', error);
      throw error;
    }
  }

  /**
   * Add secondary department to employee
   */
  static async addSecondaryDepartment(employeeId, departmentId, assignedById = null) {
    try {
      const { data, error } = await supabase
        .from('employee_departments')
        .insert({
          employee_id: employeeId,
          department_id: parseInt(departmentId),
          is_primary: false,
          assigned_by: assignedById
        })
        .select();
      
      if (error) throw error;
      return data?.[0];
    } catch (error) {
      console.error('Error adding secondary department:', error);
      throw error;
    }
  }

  /**
   * Remove department assignment from employee
   */
  static async removeDepartmentAssignment(employeeId, departmentId) {
    try {
      // Don't allow removing primary department without replacement
      const { data: assignment } = await supabase
        .from('employee_departments')
        .select('is_primary')
        .eq('employee_id', employeeId)
        .eq('department_id', departmentId)
        .single();

      if (assignment?.is_primary) {
        throw new Error('Cannot remove primary department. Assign a new primary department first.');
      }

      const { error } = await supabase
        .from('employee_departments')
        .delete()
        .eq('employee_id', employeeId)
        .eq('department_id', departmentId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing department assignment:', error);
      throw error;
    }
  }

  /**
   * Get all employees in a department
   */
  static async getDepartmentEmployees(departmentId, primaryOnly = false) {
    try {
      let query = supabase
        .from('employee_departments')
        .select(`
          *,
          employee:employees(id, name, email, job_title, role)
        `)
        .eq('department_id', departmentId);

      if (primaryOnly) {
        query = query.eq('is_primary', true);
      }

      const { data, error } = await query.order('assigned_at');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching department employees:', error);
      throw error;
    }
  }

  /**
   * Create new department (admin only)
   */
  static async createDepartment(departmentData) {
    try {
      const { data, error } = await supabase
        .from('departments')
        .insert({
          name: departmentData.name,
          code: departmentData.code.toUpperCase(),
          description: departmentData.description || null
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating department:', error);
      throw error;
    }
  }

  /**
   * Update department (admin only)
   */
  static async updateDepartment(departmentId, updates) {
    try {
      const { data, error } = await supabase
        .from('departments')
        .update(updates)
        .eq('id', departmentId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating department:', error);
      throw error;
    }
  }

  /**
   * Deactivate department (admin only)
   */
  static async deactivateDepartment(departmentId) {
    try {
      // Check if department has employees
      const { data: employees } = await supabase
        .from('employee_departments')
        .select('employee_id')
        .eq('department_id', departmentId)
        .limit(1);

      if (employees && employees.length > 0) {
        throw new Error('Cannot deactivate department with assigned employees. Reassign employees first.');
      }

      const { data, error } = await supabase
        .from('departments')
        .update({ is_active: false })
        .eq('id', departmentId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error deactivating department:', error);
      throw error;
    }
  }

  /**
   * Get department statistics
   */
  static async getDepartmentStats() {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select(`
          id,
          name,
          code,
          employee_departments!inner(
            employee_id,
            is_primary
          )
        `)
        .eq('is_active', true);
      
      if (error) throw error;
      
      return data.map(dept => ({
        id: dept.id,
        name: dept.name,
        code: dept.code,
        totalEmployees: dept.employee_departments.length,
        primaryEmployees: dept.employee_departments.filter(ed => ed.is_primary).length,
        secondaryEmployees: dept.employee_departments.filter(ed => !ed.is_primary).length
      }));
    } catch (error) {
      console.error('Error fetching department stats:', error);
      throw error;
    }
  }

  /**
   * Search departments by name or code
   */
  static async searchDepartments(searchTerm) {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%`)
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching departments:', error);
      throw error;
    }
  }
}

export default DepartmentService;