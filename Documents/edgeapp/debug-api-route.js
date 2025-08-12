// Debug the actual API route to see what's failing
const https = require('https');

// First, let's test a simple health check endpoint
console.log('🔍 Testing API route diagnostics...');

// Test 1: Check if API routes are working at all
const testHealthCheck = () => {
  return new Promise((resolve, reject) => {
    const req = https.request('https://lucerne-edge-app.vercel.app/api/debug', (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log('\n📊 /api/debug response:');
        console.log('Status:', res.statusCode);
        console.log('Headers:', res.headers);
        console.log('Body:', data);
        resolve({ status: res.statusCode, body: data });
      });
    });
    
    req.on('error', (error) => {
      console.error('Request failed:', error);
      reject(error);
    });
    
    req.end();
  });
};

// Test 2: Check what the create-employee endpoint actually returns
const testCreateEmployee = () => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: 'debug-test@test.com',
      password: 'test123',
      full_name: 'Debug Test',
      role: 'employee'
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request('https://lucerne-edge-app.vercel.app/api/admin/create-employee', options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log('\n📊 /api/admin/create-employee response:');
        console.log('Status:', res.statusCode);
        console.log('Headers:', res.headers);
        console.log('Content-Type:', res.headers['content-type']);
        console.log('Body length:', data.length);
        console.log('Body preview:', data.substring(0, 200));
        
        // Try to identify the actual error
        if (data.includes('Error:')) {
          console.log('🔍 Found Error in response');
        }
        if (data.includes('SUPABASE')) {
          console.log('🔍 Supabase mentioned in error');
        }
        if (data.includes('undefined')) {
          console.log('🔍 Found undefined values in response');
        }
        
        resolve({ status: res.statusCode, body: data });
      });
    });
    
    req.on('error', (error) => {
      console.error('Request failed:', error);
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
};

// Run both tests
async function runDiagnostics() {
  try {
    console.log('='.repeat(50));
    console.log('🚀 Starting API Route Diagnostics');
    console.log('='.repeat(50));
    
    // Test basic API functionality
    await testHealthCheck();
    
    console.log('\n' + '-'.repeat(30));
    
    // Test the problematic endpoint
    await testCreateEmployee();
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ Diagnostics completed');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
  }
}

runDiagnostics();