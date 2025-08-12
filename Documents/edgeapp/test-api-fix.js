// Test API Route - Copy and paste in browser console
// This will properly handle both success and error responses

console.log('🧪 Testing API route fix...');

fetch('/api/admin/create-employee', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test-fix@lucerneintl.com',
    password: 'TempPass123!',
    full_name: 'API Fix Test',
    role: 'employee'
  })
})
.then(async response => {
  console.log('📡 Response status:', response.status);
  
  if (response.status === 500) {
    const errorText = await response.text();
    console.log('💥 500 Error (environment variables not set):');
    console.log(errorText);
    console.log('');
    console.log('🔧 SOLUTION: Add these environment variables in Vercel dashboard:');
    console.log('   SUPABASE_URL = https://wvggehrxhnuvlxpaghft.supabase.co');
    console.log('   SUPABASE_SERVICE_ROLE_KEY = [get from Supabase project settings]');
    console.log('');
    console.log('📍 Go to: https://vercel.com/dashboard → lucerne-edge-app → Settings → Environment Variables');
    return;
  }
  
  if (response.ok) {
    const result = await response.json();
    console.log('✅ SUCCESS: API route working!');
    console.log('📊 Result:', result);
    
    if (result.user_id) {
      console.log('🎉 CONFIRMED: Auth user created with ID:', result.user_id);
      console.log('👥 Employee ID:', result.employee_id);
    } else {
      console.log('⚠️ WARNING: Response successful but no user_id');
    }
  } else {
    const errorResult = await response.json();
    console.log('❌ API route error:', response.status);
    console.log('📋 Error details:', errorResult);
  }
})
.catch(error => {
  console.error('💥 Network error:', error);
});

console.log('⏳ Testing in progress...');