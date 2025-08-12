// Test simple API function - Copy to browser console
console.log('🧪 Testing simple API function...');

fetch('/api/test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ test: 'data' })
})
.then(async response => {
  console.log('📡 Response status:', response.status);
  
  if (response.ok) {
    const result = await response.json();
    console.log('✅ API function working!');
    console.log('📊 Result:', result);
    console.log('🔧 Environment variables set:', result.hasSupabaseUrl && result.hasServiceRoleKey);
  } else {
    const errorText = await response.text();
    console.log('❌ API function error:', errorText);
  }
})
.catch(error => {
  console.error('💥 Network error:', error);
});

console.log('⏳ Testing simple API function...');