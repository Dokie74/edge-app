// AdminService.test.ts - Tests for AdminService
import { AdminService } from './AdminService';
import { supabase } from './supabaseClient';
import { Employee, EmployeeFormData } from '../types';

// Mock the supabase client
jest.mock('./supabaseClient');
const mockSupabase = supabase as jest.Mocked<typeof supabase>;

// Mock validation utility
jest.mock('../utils/validation', () => ({
  validateEmployeeForm: jest.fn(() => ({
    isValid: true,
    errors: {},
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      jobTitle: 'Developer',
      role: 'employee',
      isActive: true
    }
  }))
}));

// Mock logger
jest.mock('../utils/secureLogger', () => ({
  logUserAction: jest.fn(),
  logSecurity: jest.fn(),
  logError: jest.fn()
}));

describe('AdminService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllEmployees', () => {
    it('should return employees when RPC call succeeds', async () => {
      const mockEmployees: Employee[] = [
        {
          id: '1',
          user_id: 'user1',
          name: 'John Doe',
          email: 'john@example.com',
          job_title: 'Developer',
          role: 'employee',
          is_active: true,
          created_at: '2023-01-01',
          updated_at: '2023-01-01'
        }
      ];

      mockSupabase.rpc.mockResolvedValueOnce({
        data: JSON.stringify(mockEmployees),
        error: null
      });

      const result = await AdminService.getAllEmployees();
      expect(result).toEqual(mockEmployees);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_all_employees_for_admin');
    });

    it('should fallback to direct query when RPC fails', async () => {
      const mockEmployees: Employee[] = [
        {
          id: '1',
          user_id: 'user1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'employee',
          is_active: true,
          created_at: '2023-01-01',
          updated_at: '2023-01-01'
        }
      ];

      // Mock RPC failure
      mockSupabase.rpc.mockRejectedValueOnce(new Error('RPC failed'));
      
      // Mock successful fallback
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          order: jest.fn().mockResolvedValueOnce({
            data: mockEmployees,
            error: null
          })
        })
      } as any);

      const result = await AdminService.getAllEmployees();
      expect(result).toEqual(mockEmployees);
    });

    it('should throw error when both RPC and fallback fail', async () => {
      mockSupabase.rpc.mockRejectedValueOnce(new Error('RPC failed'));
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          order: jest.fn().mockResolvedValueOnce({
            data: null,
            error: new Error('Fallback failed')
          })
        })
      } as any);

      await expect(AdminService.getAllEmployees()).rejects.toThrow('Failed to fetch employees');
    });
  });

  describe('createEmployee', () => {
    const mockEmployeeData: EmployeeFormData = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      jobTitle: 'Manager',
      role: 'manager',
      isActive: true
    };

    it('should create employee successfully', async () => {
      const mockResult = {
        success: true,
        employee_id: 'new-employee-id'
      };

      mockSupabase.rpc.mockResolvedValueOnce({
        data: mockResult,
        error: null
      });

      const result = await AdminService.createEmployee(mockEmployeeData);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('create_employee', {
        p_name: mockEmployeeData.name,
        p_email: mockEmployeeData.email,
        p_job_title: mockEmployeeData.jobTitle,
        p_role: mockEmployeeData.role,
        p_manager_id: null,
        p_temp_password: null
      });
    });

    it('should throw error when RPC fails', async () => {
      mockSupabase.rpc.mockRejectedValueOnce(new Error('Database error'));

      await expect(AdminService.createEmployee(mockEmployeeData))
        .rejects.toThrow('Failed to create employee');
    });

    it('should throw error when result contains error', async () => {
      mockSupabase.rpc.mockResolvedValueOnce({
        data: { error: 'Validation failed' },
        error: null
      });

      await expect(AdminService.createEmployee(mockEmployeeData))
        .rejects.toThrow('Validation failed');
    });
  });

  describe('checkAdminAccess', () => {
    it('should return admin status for admin user', async () => {
      mockSupabase.rpc.mockResolvedValueOnce({
        data: { role: 'admin' },
        error: null
      });

      const result = await AdminService.checkAdminAccess();
      expect(result.isAdmin).toBe(true);
      expect(result.role).toBe('admin');
    });

    it('should return non-admin status for regular user', async () => {
      mockSupabase.rpc.mockResolvedValueOnce({
        data: { role: 'employee' },
        error: null
      });

      const result = await AdminService.checkAdminAccess();
      expect(result.isAdmin).toBe(false);
      expect(result.role).toBe('employee');
    });

    it('should handle errors gracefully', async () => {
      mockSupabase.rpc.mockRejectedValueOnce(new Error('Auth error'));

      const result = await AdminService.checkAdminAccess();
      expect(result.isAdmin).toBe(false);
      expect(result.role).toBeNull();
    });
  });
});