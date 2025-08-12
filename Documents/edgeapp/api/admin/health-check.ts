// Health check endpoint to verify server-side configuration
import { createClient } from '@supabase/supabase-js';

interface VercelRequest {
  method: string;
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('🔍 Health Check - Environment Variables:');
  console.log('SUPABASE_URL:', SUPABASE_URL ? 'SET' : 'MISSING');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING');

  const healthCheck = {
    timestamp: new Date().toISOString(),
    environment: {
      supabase_url: !!SUPABASE_URL,
      service_role_key: !!SUPABASE_SERVICE_ROLE_KEY,
      supabase_url_value: SUPABASE_URL ? SUPABASE_URL.substring(0, 30) + '...' : 'MISSING',
      service_role_key_length: SUPABASE_SERVICE_ROLE_KEY ? SUPABASE_SERVICE_ROLE_KEY.length : 0
    },
    status: 'unknown'
  };

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    healthCheck.status = 'failed';
    return res.status(500).json({
      ...healthCheck,
      error: 'Missing required environment variables',
      fix: {
        message: 'Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to Vercel environment variables',
        note: 'Do NOT use REACT_APP_ prefix for server-side variables'
      }
    });
  }

  try {
    // Test Supabase connection with service role
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Verify we can access auth admin functions
    const canCreateUser = typeof supabaseAdmin.auth.admin.createUser === 'function';
    const canListUsers = typeof supabaseAdmin.auth.admin.listUsers === 'function';

    healthCheck.status = 'healthy';
    
    return res.status(200).json({
      ...healthCheck,
      supabase_connection: {
        client_created: true,
        admin_functions_available: {
          create_user: canCreateUser,
          list_users: canListUsers
        }
      },
      message: 'Server-side employee creation should work correctly'
    });

  } catch (error: any) {
    healthCheck.status = 'error';
    return res.status(500).json({
      ...healthCheck,
      error: 'Failed to create Supabase client',
      detail: error.message,
      fix: {
        message: 'Check that SUPABASE_SERVICE_ROLE_KEY is the correct service role key from Supabase',
        supabase_settings: 'Project Settings → API → service_role key'
      }
    });
  }
}