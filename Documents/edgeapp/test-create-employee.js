// Test script to verify the create employee function works locally
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Local Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54321';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, anonKey);

async function testCreateEmployee() {
  console.log('🧪 Testing admin-operations function locally...');
  
  try {
    // Test data
    const testEmployeeData = {
      action: 'create_user',
      data: {
        name: 'Test Employee',
        email: 'test-employee-' + Date.now() + '@lucerneintl.com',
        role: 'employee',
        job_title: 'Software Tester',
        department: 'Engineering',
        temp_password: 'TempPassword123!'
      }
    };

    console.log('📡 Calling local Edge Function...');
    console.log('📦 Data:', JSON.stringify(testEmployeeData, null, 2));

    // Call the local Edge Function
    const { data, error } = await supabase.functions.invoke('admin-operations', {
      body: testEmployeeData,
    });

    if (error) {
      console.log('❌ Function error:', error);
      return;
    }

    console.log('✅ Function response:', JSON.stringify(data, null, 2));

    if (data?.success) {
      console.log('🎉 Employee creation succeeded!');
      console.log('👤 New user ID:', data.user?.id);
      console.log('🏢 New employee ID:', data.employee?.id);
    } else {
      console.log('❌ Employee creation failed:', data?.error);
    }

  } catch (error) {
    console.log('💥 Test error:', error.message);
  }
}

// Run the test
testCreateEmployee();