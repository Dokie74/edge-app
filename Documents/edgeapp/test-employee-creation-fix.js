#!/usr/bin/env node

/**
 * Test Script: Employee Creation Fix Verification
 * 
 * This script tests the corrected Create Employee functionality:
 * 1. Tests the health check endpoint
 * 2. Tests the server-side API route directly
 * 3. Verifies proper error handling
 * 
 * Usage: node test-employee-creation-fix.js
 */

console.log('🧪 Employee Creation Fix Test Suite');
console.log('=====================================\n');

// Test configuration
const APP_URL = 'https://lucerne-edge-app.vercel.app';
const TEST_EMAIL = 'test.fix.verification@lucerneintl.com';

async function testHealthCheck() {
  console.log('1️⃣ Testing Health Check Endpoint...');
  
  try {
    const response = await fetch(`${APP_URL}/api/admin/health-check`);
    const result = await response.json();
    
    console.log(`📡 Health check status: ${response.status}`);
    console.log(`🔧 Environment status: ${result.status}`);
    
    if (result.status === 'healthy') {
      console.log('✅ Server configuration is correct');
      console.log('   - Supabase URL:', result.environment.supabase_url ? '✅ SET' : '❌ MISSING');
      console.log('   - Service Role Key:', result.environment.service_role_key ? '✅ SET' : '❌ MISSING');
      console.log('   - Admin Functions:', result.supabase_connection?.admin_functions_available?.create_user ? '✅ Available' : '❌ Unavailable');
      return { success: true, result };
    } else {
      console.log('❌ Server configuration has issues:');
      console.log('   Error:', result.error);
      if (result.fix) {
        console.log('   Fix:', result.fix.message);
      }
      return { success: false, result };
    }
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function testEmployeeCreation() {
  console.log('\n2️⃣ Testing Employee Creation API Route...');
  
  const testData = {
    email: TEST_EMAIL,
    password: 'TestPassword123!',
    full_name: 'Test Fix User',
    role: 'employee',
    job_title: 'Test Engineer',
    department: 'Testing'
  };
  
  try {
    console.log(`📧 Creating test employee: ${testData.email}`);
    
    const response = await fetch(`${APP_URL}/api/admin/create-employee`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    
    console.log(`📡 API response status: ${response.status}`);
    console.log(`📋 Response body:`, JSON.stringify(result, null, 2));
    
    if (response.status === 201 && result.user_id) {
      console.log('✅ Employee creation succeeded');
      console.log('   - Auth User ID:', result.user_id);
      console.log('   - Employee ID:', result.employee_id);
      console.log('   - Can Login:', result.login_instructions?.can_login_immediately);
      return { success: true, result, cleanup_user_id: result.user_id };
    } else if (response.status === 500 && result.error?.includes('environment variables')) {
      console.log('❌ Environment configuration error (expected):');
      console.log('   Error:', result.error);
      console.log('   Debug Info:', result.debug);
      return { success: false, result, expected_error: true };
    } else {
      console.log('❌ Employee creation failed:');
      console.log('   Error:', result.error);
      console.log('   Detail:', result.detail);
      return { success: false, result };
    }
  } catch (error) {
    console.log('❌ API request failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function cleanup(userId) {
  if (!userId) return;
  
  console.log('\n3️⃣ Cleaning up test data...');
  console.log(`🗑️ Note: Manual cleanup needed for user ID: ${userId}`);
  console.log('   This is expected - cleanup requires admin privileges');
}

async function runTests() {
  console.log(`🎯 Target URL: ${APP_URL}`);
  console.log(`📧 Test Email: ${TEST_EMAIL}\n`);
  
  const results = {
    health_check: null,
    employee_creation: null,
    overall_success: false
  };
  
  // Test 1: Health Check
  results.health_check = await testHealthCheck();
  
  // Test 2: Employee Creation (even if health check fails, we want to see the specific error)
  results.employee_creation = await testEmployeeCreation();
  
  // Cleanup
  if (results.employee_creation?.cleanup_user_id) {
    await cleanup(results.employee_creation.cleanup_user_id);
  }
  
  // Overall assessment
  console.log('\n🎯 TEST RESULTS SUMMARY');
  console.log('========================');
  
  if (results.health_check?.success && results.employee_creation?.success) {
    console.log('🎉 ALL TESTS PASSED - Employee creation is working correctly');
    results.overall_success = true;
  } else if (results.health_check?.success === false && results.employee_creation?.expected_error) {
    console.log('⚠️  EXPECTED CONFIGURATION ERROR - Environment variables need to be set in Vercel');
    console.log('📋 Next Steps:');
    console.log('   1. Add SUPABASE_URL to Vercel environment variables');
    console.log('   2. Add SUPABASE_SERVICE_ROLE_KEY to Vercel environment variables');
    console.log('   3. Do NOT use REACT_APP_ prefix for these server-side variables');
    console.log('   4. Redeploy and run this test again');
  } else {
    console.log('❌ TESTS FAILED - Unexpected errors occurred');
    if (results.health_check?.success === false) {
      console.log('   Health Check Failed:', results.health_check.error || results.health_check.result?.error);
    }
    if (results.employee_creation?.success === false && !results.employee_creation?.expected_error) {
      console.log('   Employee Creation Failed:', results.employee_creation.error || results.employee_creation.result?.error);
    }
  }
  
  return results;
}

// Run the test suite
runTests().then(results => {
  process.exit(results.overall_success ? 0 : 1);
}).catch(error => {
  console.error('💥 Test suite failed:', error);
  process.exit(1);
});