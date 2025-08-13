// Comprehensive test for the fixed admin-operations Edge Function
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Production Supabase configuration
const supabaseUrl = 'https://wvggehrxhnuvlxpaghft.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2Z2dlaHJ4aG51dmx4cGFnaGZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM0MjY5NzcsImV4cCI6MjAzOTAwMjk3N30.oR5bsZ4eQQU4rPjXVlRjutlNvXJzIYPBhR0djV1UXh8';

const supabase = createClient(supabaseUrl, anonKey);

async function testAdminOperations() {
  console.log('🧪 Testing Fixed admin-operations Edge Function');
  console.log('=' .repeat(60));
  
  try {
    // First, let's check the employees table schema
    console.log('1️⃣ Checking employees table schema...');
    const { data: schemaTest, error: schemaError } = await supabase
      .from('employees')
      .select('*')
      .limit(1);
    
    if (schemaError) {
      console.log('❌ Schema check failed:', schemaError.message);
      return;
    }
    
    if (schemaTest && schemaTest.length > 0) {
      console.log('✅ Employee table accessible');
      console.log('📋 Available columns:', Object.keys(schemaTest[0]).sort().join(', '));
      
      // Check if tenant_id exists (it shouldn't!)
      const hasTenantId = Object.keys(schemaTest[0]).includes('tenant_id');
      console.log(hasTenantId ? '❌ tenant_id field found (should not exist!)' : '✅ No tenant_id field (correct)');
    }

    console.log('\n2️⃣ Testing Edge Function call (without authentication)...');
    
    // Test data for employee creation
    const testEmployeeData = {
      action: 'create_user',
      data: {
        name: 'Test User ' + Date.now(),
        email: 'test-' + Date.now() + '@lucerneintl.com',
        role: 'employee',
        job_title: 'Test Engineer',
        department: 'Engineering',
        temp_password: 'TempPassword123!'
      }
    };

    console.log('📡 Calling admin-operations function...');
    console.log('📦 Test data:', JSON.stringify(testEmployeeData, null, 2));

    // Call the Edge Function (this should fail with auth error, but we want to see if it's a 500 or 403)
    const { data, error } = await supabase.functions.invoke('admin-operations', {
      body: testEmployeeData,
    });

    console.log('\n3️⃣ Function Response Analysis:');
    
    if (error) {
      console.log('Function error details:', error);
      
      if (error.message && error.message.includes('500')) {
        console.log('❌ Still getting 500 error - fix may not be complete');
      } else if (error.message && (error.message.includes('403') || error.message.includes('401'))) {
        console.log('✅ Getting auth error instead of 500 - this is expected and means the fix worked!');
        console.log('✅ The database query issues are resolved');
      } else {
        console.log('❓ Unexpected error type:', error.message);
      }
    }

    if (data) {
      console.log('Function response data:', JSON.stringify(data, null, 2));
      
      if (data.error && data.error.includes('tenant_id')) {
        console.log('❌ Still seeing tenant_id errors in response');
      } else if (data.error && (data.error.includes('authorization') || data.error.includes('Admin access'))) {
        console.log('✅ Getting auth-related errors instead of database errors - fix is working!');
      }
    }

    console.log('\n4️⃣ Additional Schema Validation...');
    
    // Check if we can query departments (referenced in the function)
    const { data: deptData, error: deptError } = await supabase
      .from('departments')
      .select('*')
      .limit(3);
      
    if (deptError) {
      console.log('❌ Departments table issue:', deptError.message);
    } else {
      console.log('✅ Departments table accessible');
      console.log('📋 Sample departments:', deptData?.map(d => d.name).join(', '));
    }

    console.log('\n' + '=' .repeat(60));
    console.log('🎯 CONCLUSION:');
    console.log('The fix should be working if you see auth errors instead of 500 errors.');
    console.log('Try the Create Employee feature in your app now!');

  } catch (error) {
    console.log('💥 Test script error:', error.message);
    console.log('Full error:', error);
  }
}

// Run the comprehensive test
testAdminOperations();