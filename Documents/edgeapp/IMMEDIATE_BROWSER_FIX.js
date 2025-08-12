// IMMEDIATE BROWSER CONSOLE FIX - Copy and paste this entire script in browser console
// This overrides the broken AdminService.createEmployee method with a working version

console.log('🚨 LOADING IMMEDIATE EMPLOYEE CREATION FIX...');

// Check if supabase is available
if (typeof supabase === 'undefined') {
  console.error('❌ Supabase not found. Make sure you are on the admin dashboard page.');
} else {
  console.log('✅ Supabase client found');
}

// Override the AdminService createEmployee method
if (typeof AdminService !== 'undefined') {
  console.log('✅ AdminService found - overriding createEmployee method');
  
  // Store original method for reference
  AdminService.originalCreateEmployee = AdminService.createEmployee;
  
  // Replace with working implementation
  AdminService.createEmployee = async function(employeeData) {
    console.log('🔧 USING IMMEDIATE FIX VERSION - Browser Console Override');
    console.log('📧 Creating employee:', employeeData.email);
    
    try {
      // Basic validation
      if (!employeeData.name || !employeeData.email || !employeeData.role) {
        throw new Error('Missing required fields: name, email, role');
      }
      
      console.log('🚀 Calling admin-operations Edge Function directly...');
      
      // Call Edge Function directly
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

      // CRITICAL: Check that auth user was actually created
      if (!result.user?.id) {
        console.error('💥 CRITICAL: Edge Function succeeded but NO AUTH USER CREATED');
        console.error('💥 Full result:', JSON.stringify(result, null, 2));
        throw new Error('CRITICAL: Auth user was not created - user_id is null');
      }

      // Success with auth user confirmed!
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

// Instructions
console.log('📋 NEXT STEPS:');
console.log('1. The AdminService.createEmployee method has been overridden');
console.log('2. Try creating an employee now');
console.log('3. You should see detailed debugging logs');
console.log('4. If auth user creation still fails, check the Edge Function logs');
console.log('5. This fix is temporary - you still need to deploy the updated code');

console.log('🚨 IMMEDIATE FIX LOADED SUCCESSFULLY');