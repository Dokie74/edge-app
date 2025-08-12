// Test the JavaScript API routes to see if TypeScript was the issue
const https = require('https');

console.log('🧪 Testing JavaScript API Routes');
console.log('🕐 Timestamp:', new Date().toISOString());
console.log('='.repeat(60));

// Test 1: Simple JS test route
const testSimpleJS = () => {
  return new Promise((resolve, reject) => {
    console.log('\n🔍 Testing /api/test-simple (JavaScript)...');
    
    const req = https.request('https://lucerne-edge-app.vercel.app/api/test-simple', (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', data.substring(0, 500));
        
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            console.log('✅ JavaScript API route works!');
            console.log('Environment check:', json.environment);
            console.log('Node version:', json.environment?.node_version);
          } catch (e) {
            console.log('Response not JSON but 200 status');
          }
        } else {
          console.log('❌ JavaScript API route failed');
        }
        
        resolve({ status: res.statusCode, body: data });
      });
    });
    
    req.on('error', reject);
    req.end();
  });
};

// Test 2: Simple create-employee JS
const testCreateEmployeeJS = () => {
  return new Promise((resolve, reject) => {
    console.log('\n🔍 Testing /api/admin/create-employee-simple (JavaScript)...');
    
    const postData = JSON.stringify({
      email: 'js-test-' + Date.now() + '@lucerneintl.com',
      password: 'TempPass123!',
      full_name: 'JS Test User',
      role: 'employee',
      job_title: 'Test Position'
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request('https://lucerne-edge-app.vercel.app/api/admin/create-employee-simple', options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response preview:', data.substring(0, 300));
        
        if (res.statusCode === 200 || res.statusCode === 201) {
          try {
            const json = JSON.parse(data);
            console.log('✅ JavaScript create-employee works!');
            if (json.user_id) {
              console.log('✅ Auth user created:', json.user_id);
              console.log('✅ Employee created:', json.employee_id);
            } else {
              console.log('⚠️ No user_id in response');
            }
          } catch (e) {
            console.log('Response not JSON but success status');
          }
        } else {
          console.log('❌ JavaScript create-employee failed');
          if (data.includes('Environment')) {
            console.log('🔍 Environment variables issue detected');
          }
          if (data.includes('FUNCTION_INVOCATION_FAILED')) {
            console.log('🔍 Function invocation still failing');
          }
        }
        
        resolve({ status: res.statusCode, body: data });
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
};

// Test 3: Compare with TypeScript version
const testTypeScriptVersion = () => {
  return new Promise((resolve, reject) => {
    console.log('\n🔍 Testing /api/debug (TypeScript) for comparison...');
    
    const req = https.request('https://lucerne-edge-app.vercel.app/api/debug', (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response preview:', data.substring(0, 200));
        
        if (res.statusCode === 200) {
          console.log('✅ TypeScript API route works too!');
        } else {
          console.log('❌ TypeScript API route still failing');
          if (data.includes('FUNCTION_INVOCATION_FAILED')) {
            console.log('🔍 Still getting FUNCTION_INVOCATION_FAILED');
          }
        }
        
        resolve({ status: res.statusCode, body: data });
      });
    });
    
    req.on('error', reject);
    req.end();
  });
};

// Run all tests
async function runTests() {
  try {
    await testSimpleJS();
    console.log('-'.repeat(40));
    
    await testCreateEmployeeJS();
    console.log('-'.repeat(40));
    
    await testTypeScriptVersion();
    
    console.log('\n' + '='.repeat(60));
    console.log('🏁 All tests completed');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

// Wait a moment for deployment then run tests
setTimeout(runTests, 5000);
console.log('⏳ Waiting 5 seconds for deployment to complete...');