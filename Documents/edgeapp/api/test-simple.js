// Simple JavaScript API route to test if TypeScript is the issue

export default async function handler(req, res) {
  try {
    console.log('🧪 Simple JS test function called');
    
    // Test environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('Environment check:');
    console.log('SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', serviceKey ? 'SET' : 'MISSING');
    
    res.status(200).json({
      success: true,
      message: 'Simple JS function works',
      environment: {
        supabase_url: !!supabaseUrl,
        service_key: !!serviceKey,
        node_version: process.version
      },
      method: req.method,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Simple test error:', error);
    res.status(500).json({
      error: 'Simple test failed',
      detail: error.message,
      stack: error.stack
    });
  }
}