// Test the create-employee API route locally
const https = require('https');

const testData = {
  email: 'test-user-' + Date.now() + '@lucerneintl.com',
  password: 'TempPass123!',
  full_name: 'Test User API',
  role: 'employee',
  job_title: 'Test Position',
  department: 'IT',
};

console.log('🧪 Testing Create Employee API Route');
console.log('📧 Test user email:', testData.email);
console.log('🕐 Timestamp:', new Date().toISOString());

// Try the production URL first
const productionUrl = 'https://lucerne-edge-app.vercel.app/api/admin/create-employee';

const postData = JSON.stringify(testData);

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
  },
};

console.log('\n🌐 Testing production API route...');
console.log('URL:', productionUrl);

const req = https.request(productionUrl, options, (res) => {
  let data = '';
  
  console.log('📊 Response status:', res.statusCode);
  console.log('📊 Response headers:', res.headers);
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n📝 Response body:');
    try {
      const jsonResponse = JSON.parse(data);
      console.log(JSON.stringify(jsonResponse, null, 2));
      
      if (jsonResponse.success && jsonResponse.user_id) {
        console.log('\n✅ SUCCESS: Auth user created with ID:', jsonResponse.user_id);
        console.log('✅ Employee ID:', jsonResponse.employee_id);
      } else if (jsonResponse.error) {
        console.log('\n❌ API Error:', jsonResponse.error);
        if (jsonResponse.debug) {
          console.log('🔍 Debug info:', jsonResponse.debug);
        }
      } else {
        console.log('\n⚠️ Unexpected response format');
      }
    } catch (parseError) {
      console.log('Raw response (not JSON):');
      console.log(data);
      
      // Check if it's an HTML error page (500 error)
      if (data.includes('<html>') || data.includes('<!DOCTYPE')) {
        console.log('\n💥 ISSUE IDENTIFIED: API route returning HTML instead of JSON');
        console.log('💡 This likely means environment variables are missing in Vercel');
        console.log('💡 The server is throwing an error and returning a default error page');
      }
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});

req.write(postData);
req.end();