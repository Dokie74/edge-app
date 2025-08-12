// FINAL TEST SCRIPT - Paste this in browser console
// This will test the new FINAL_EDGE_ONLY_v2.0 version

console.log('🧪 FINAL CREATE EMPLOYEE TEST - v2.0');
console.log('=====================================');

// Step 1: Check if the new code is loaded
console.log('📋 Step 1: Checking AdminService version...');
if (typeof AdminService !== 'undefined') {
  AdminService.getVersion();
} else {
  console.error('❌ AdminService not found - check if page loaded correctly');
}

// Step 2: Check session
console.log('📋 Step 2: Checking authentication session...');
const { data: { session } } = await supabase.auth.getSession();
console.log('Session exists:', !!session);
console.log('User email:', session?.user?.email);
console.log('Token exists:', !!session?.access_token);
console.log('Token length:', session?.access_token?.length || 0);

if (!session?.access_token) {
  console.error('❌ No auth token found - please log in first');
} else {
  console.log('✅ Authentication looks good');
}

// Step 3: Test Edge Function directly (bypass UI)
console.log('📋 Step 3: Testing Edge Function directly...');

const testEmployeeData = {
  name: 'Final Test User ' + Date.now(),
  email: `finaltest${Date.now()}@lucerneintl.com`,
  role: 'employee',
  job_title: 'Test Position',
  department: 'IT'
};

console.log('🧪 Testing with employee data:', testEmployeeData);

try {
  console.log('📡 Calling Edge Function admin-operations...');
  
  const response = await fetch('https://wvggehrxhnuvlxpaghft.supabase.co/functions/v1/admin-operations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'create_user',
      data: testEmployeeData
    })
  });
  
  console.log('📊 Response status:', response.status);
  console.log('📊 Response headers:', Object.fromEntries(response.headers));
  
  const result = await response.json();
  console.log('📊 Response body:', result);
  
  if (response.status === 200 && result.success) {
    console.log('🎉 SUCCESS! Edge Function working correctly');
    console.log('✅ Auth user created:', result.user?.id);
    console.log('✅ Employee created:', result.employee?.id);
    
    if (result.user?.id && result.employee?.id) {
      console.log('✅ PERFECT: Both auth user and employee record created');
      console.log('🔐 Login credentials:', {
        email: testEmployeeData.email,
        password: 'TempPass123!',
        canLoginNow: true
      });
    } else {
      console.warn('⚠️ Partial success - missing user_id or employee_id');
    }
  } else {
    console.error('❌ Edge Function failed');
    console.error('Status:', response.status);
    console.error('Error:', result.error);
    console.error('Debug info:', result.debug);
  }
  
} catch (error) {
  console.error('💥 Test failed with error:', error);
  if (error.message.includes('403')) {
    console.error('🔍 403 error suggests auth token issues');
    console.error('🔧 Try logging out and back in');
  }
  if (error.message.includes('network')) {
    console.error('🔍 Network error - check connection');
  }
}

// Step 4: Test AdminService method (if available)
console.log('📋 Step 4: Testing AdminService.createEmployee method...');

if (typeof AdminService !== 'undefined') {
  try {
    const serviceTestData = {
      name: 'Service Test User ' + Date.now(),
      email: `servicetest${Date.now()}@lucerneintl.com`,
      role: 'employee',
      jobTitle: 'Service Test Position'
    };
    
    console.log('🧪 Calling AdminService.createEmployee...');
    const serviceResult = await AdminService.createEmployee(serviceTestData);
    
    console.log('🎉 AdminService SUCCESS:', serviceResult);
    
    if (serviceResult.success && serviceResult.data.user_id) {
      console.log('✅ PERFECT: AdminService working correctly');
      console.log('✅ Auth user:', serviceResult.data.user_id);
      console.log('✅ Employee:', serviceResult.data.employee_id);
    }
    
  } catch (serviceError) {
    console.error('💥 AdminService failed:', serviceError.message);
  }
} else {
  console.warn('⚠️ AdminService not available - page may need refresh');
}

console.log('=====================================');
console.log('🏁 TEST COMPLETED');
console.log('✅ Check above for SUCCESS messages');
console.log('❌ Check above for any ERROR messages');
console.log('=====================================');