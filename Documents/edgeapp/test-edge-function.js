// Test the Edge Function directly to see if it's deployed
const https = require('https');

console.log('🧪 Testing Edge Function Directly');
console.log('🕐 Timestamp:', new Date().toISOString());
console.log('='.repeat(60));

// Test 1: Check if Edge Function is deployed (simple ping)
const testEdgeFunctionPing = () => {
  return new Promise((resolve, reject) => {
    console.log('\n🔍 Testing Edge Function deployment...');
    console.log('URL: https://wvggehrxhnuvlxpaghft.supabase.co/functions/v1/admin-operations');
    
    // Try OPTIONS request first (CORS preflight)
    const req = https.request('https://wvggehrxhnuvlxpaghft.supabase.co/functions/v1/admin-operations', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://lucerne-edge-app.vercel.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'authorization, content-type'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log('OPTIONS Status:', res.statusCode);
        console.log('OPTIONS Headers:', res.headers);
        console.log('OPTIONS Response:', data);
        
        if (res.statusCode === 200) {
          console.log('✅ Edge Function is deployed and responding to OPTIONS');
        } else {
          console.log('❌ Edge Function OPTIONS failed');
        }
        
        resolve({ status: res.statusCode, body: data });
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Edge Function test failed:', error);
      reject(error);
    });
    
    req.end();
  });
};

// Test 2: Check if we get proper error without auth
const testEdgeFunctionWithoutAuth = () => {
  return new Promise((resolve, reject) => {
    console.log('\n🔍 Testing Edge Function without auth (should get 403)...');
    
    const postData = JSON.stringify({
      action: 'create_user',
      data: { email: 'test@test.com' }
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://lucerne-edge-app.vercel.app',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request('https://wvggehrxhnuvlxpaghft.supabase.co/functions/v1/admin-operations', options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log('POST Status:', res.statusCode);
        console.log('POST Response:', data);
        
        if (res.statusCode === 403) {
          console.log('✅ Edge Function properly rejects requests without auth');
        } else if (res.statusCode === 404) {
          console.log('❌ Edge Function not deployed (404)');
        } else {
          console.log('⚠️ Unexpected response from Edge Function');
        }
        
        resolve({ status: res.statusCode, body: data });
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
};

// Run tests
async function runEdgeFunctionTests() {
  try {
    await testEdgeFunctionPing();
    console.log('-'.repeat(40));
    await testEdgeFunctionWithoutAuth();
    
    console.log('\n' + '='.repeat(60));
    console.log('🏁 Edge Function tests completed');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Edge Function test suite failed:', error);
  }
}

runEdgeFunctionTests();