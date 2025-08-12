// DIRECT EMPLOYEE CREATION - Simplified approach for immediate fix
// This bypasses all complex logic and goes directly to Edge Function with validation

import { supabase } from './supabaseClient';
import logger from '../utils/secureLogger';

export class DirectEmployeeCreation {
  
  static getVersion() {
    console.log('🔍 DirectEmployeeCreation Version: DIRECT_FIX_v1.0 - August 12, 2025');
    return 'DIRECT_FIX_v1.0';
  }

  // Direct call to Edge Function with proper validation
  static async createEmployeeWithAuthUser(employeeData) {
    console.log('🎯 DIRECT EMPLOYEE CREATION - Starting process...');
    DirectEmployeeCreation.getVersion();
    
    const { name, email, role, password, jobTitle, department, managerId } = employeeData;
    
    // Basic validation
    if (!name || !email || !role) {
      throw new Error('Missing required fields: name, email, role');
    }

    console.log('📧 Creating employee:', email);
    console.log('🎭 Role:', role);
    
    try {
      // Call Edge Function directly with detailed logging
      console.log('🚀 Calling admin-operations Edge Function directly...');
      
      const { data: result, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          action: 'create_user',
          data: {
            name: name,
            email: email,
            role: role,
            job_title: jobTitle || 'Staff',
            department: department || null,
            manager_id: managerId || null,
            temp_password: password || 'TempPass123!'
          }
        }
      });

      console.log('📡 Edge Function raw response:', result);
      console.log('❌ Edge Function error (if any):', error);

      if (error) {
        console.error('💥 Edge Function call failed:', error);
        throw new Error(`Edge Function error: ${error.message}`);
      }
      
      if (result?.error) {
        console.error('💥 Edge Function returned error:', result.error);
        throw new Error(`Edge Function result error: ${result.error}`);
      }

      if (!result?.success) {
        console.error('💥 Edge Function returned non-success:', result);
        throw new Error('Edge Function did not return success');
      }

      // CRITICAL VALIDATION - Check that auth user was created
      if (!result.user?.id) {
        console.error('💥 CRITICAL: Edge Function succeeded but NO AUTH USER CREATED');
        console.error('💥 Result:', JSON.stringify(result, null, 2));
        throw new Error('CRITICAL ERROR: Edge Function did not create auth user (user_id is null)');
      }

      // Success!
      console.log('✅ SUCCESS: Employee created with auth user!');
      console.log('👤 Auth User ID:', result.user.id);
      console.log('👥 Employee ID:', result.employee?.id);

      logger.logUserAction('direct_create_employee_success', null, { 
        user_id: result.user.id,
        employee_id: result.employee?.id,
        role: role,
        approach: 'direct_edge_function'
      });

      return {
        success: true,
        user_id: result.user.id,
        employee_id: result.employee?.id,
        message: 'Employee created successfully with auth user!',
        debug: {
          approach: 'direct_edge_function',
          auth_user_confirmed: true,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('💥 Direct employee creation failed:', error);
      
      logger.logError(error, { 
        action: 'direct_create_employee', 
        email: email,
        role: role 
      });
      
      throw new Error(`Direct employee creation failed: ${error.message}`);
    }
  }
}

export default DirectEmployeeCreation;