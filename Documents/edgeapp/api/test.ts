import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🧪 Test function called');
  console.log('Method:', req.method);
  console.log('Body type:', typeof req.body);
  console.log('Body:', req.body);
  
  try {
    // Test environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('SUPABASE_URL set:', !!supabaseUrl);
    console.log('SUPABASE_SERVICE_ROLE_KEY set:', !!serviceRoleKey);
    
    res.status(200).json({
      success: true,
      method: req.method,
      bodyType: typeof req.body,
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceRoleKey: !!serviceRoleKey,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Test function error:', error);
    res.status(500).json({
      error: 'Test function failed',
      detail: error.message,
      stack: error.stack
    });
  }
}