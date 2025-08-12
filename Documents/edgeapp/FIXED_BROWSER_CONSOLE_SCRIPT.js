console.log('🚨 LOADING IMMEDIATE EMPLOYEE CREATION FIX...');

if (typeof supabase === 'undefined') {
  console.error('❌ Supabase not found. Make sure you are on the admin dashboard page.');
} else {
  console.log('✅ Supabase client found');
}

if (typeof AdminService !== 'undefined') {
  console.log('✅ AdminService found - overriding createEmployee method');
  
  AdminService.originalCreateEmployee = AdminService.createEmployee;
  
  AdminService.createEmployee = async function(employeeData) {
    console.log('🔧 USING IMMEDIATE FIX VERSION - Browser Console Override');
    console.log('📧 Creating employee:', employeeData.email);
    
    try {
      if (!employeeData.name || !employeeData.email || !employeeData.role) {
        throw new Error('Missing required fields: name, email, role');
      }
      
      console.log('🚀 Calling admin-operations Edge Function directly...');
      
      const { data: result, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          action: 'create_user',
          data: {
            name: employeeData.name,
            email: employeeData.email,
            role: employeeData.role,
            job_title: employeeData.jobTitle || 'Staff',
            department: employeeData.department || null,
            manager_id: employeeData.managerId || null,
            temp_password: employeeData.password || 'TempPass123!'
          }
        }
      });

      console.log('📡 Edge Function Response:', result);
      console.log('❌ Edge Function Error:', error);

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

      if (!result.user?.id) {
        console.error('💥 CRITICAL: Edge Function succeeded but NO AUTH USER CREATED');
        console.error('💥 Full result:', JSON.stringify(result, null, 2));
        throw new Error('CRITICAL: Auth user was not created - user_id is null');
      }

      console.log('✅ SUCCESS: Auth user created!');
      console.log('👤 Auth User ID:', result.user.id);
      console.log('👥 Employee ID:', result.employee?.id);

      return {
        success: true,
        data: {
          user_id: result.user.id,
          employee_id: result.employee?.id,
          message: 'Employee created successfully with auth user!',
          next_steps: {
            can_login_immediately: true,
            signup_required: false,
            login_credentials: {
              email: employeeData.email,
              password: employeeData.password || 'TempPass123!'
            }
          }
        }
      };

    } catch (error) {
      console.error('💥 Employee creation failed:', error);
      throw new Error(`Failed to create employee: ${error.message}`);
    }
  };
  
  console.log('✅ AdminService.createEmployee method overridden successfully');
  console.log('🎯 Now try creating an employee - you should see detailed logs');
  
} else {
  console.error('❌ AdminService not found. Make sure you are on the admin dashboard page.');
}

console.log('🚨 IMMEDIATE FIX LOADED SUCCESSFULLY');