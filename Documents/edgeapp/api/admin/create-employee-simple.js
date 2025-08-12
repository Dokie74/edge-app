// Simple JavaScript version of create-employee to isolate TypeScript issues
import { createClient } from '@supabase/supabase-js';

const TENANT_ID = 'lucerne';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('🔍 Simple create-employee called');
  console.log('Environment variables check:');
  
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('SUPABASE_URL:', SUPABASE_URL ? 'SET' : 'MISSING');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING');

  // CRITICAL: Fail fast if environment variables are missing
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('💥 CRITICAL: Missing environment variables');
    return res.status(500).json({ 
      error: 'Server misconfigured: missing environment variables',
      debug: {
        supabase_url: !!SUPABASE_URL,
        service_role_key: !!SUPABASE_SERVICE_ROLE_KEY
      }
    });
  }

  // Parse and validate request body
  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (e) {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }

  const { email, password, full_name, role, job_title, department, manager_id } = body;
  if (!email || !password || !full_name || !role) {
    return res.status(400).json({ error: 'Missing required fields: email, password, full_name, role' });
  }

  // Validate role
  if (!['employee', 'manager', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role. Must be employee, manager, or admin' });
  }

  console.log('🔒 Create Employee Simple JS - Starting user creation for:', email);

  try {
    // Create Supabase client with service role (admin privileges)
    console.log('Creating Supabase admin client...');
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    console.log('Supabase admin client created successfully');

    console.log('📧 Creating auth user...');
    
    // 1) Create Auth user with admin privileges
    const { data: userData, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { 
        role, 
        tenant_id: TENANT_ID 
      },
      user_metadata: { 
        full_name,
        tenant_id: TENANT_ID
      }
    });

    if (createErr || !userData?.user) {
      console.error('💥 Auth user creation failed:', createErr);
      return res.status(400).json({ 
        error: 'Auth user creation failed', 
        detail: createErr?.message,
        code: createErr?.status || 'unknown'
      });
    }

    const authUserId = userData.user.id;
    console.log('✅ Auth user created successfully:', authUserId);

    console.log('🏢 Creating employee record...');

    // 2) Insert employee row (service role bypasses RLS)
    const nameParts = full_name.trim().split(' ');
    const first_name = nameParts[0];
    const last_name = nameParts.slice(1).join(' ') || '';

    const { data: employeeData, error: insertErr } = await supabaseAdmin
      .from('employees')
      .insert([{
        user_id: authUserId,
        email,
        name: full_name,
        first_name,
        last_name,
        role,
        job_title: job_title || 'Staff',
        department: department || null,
        manager_id: manager_id || null,
        tenant_id: TENANT_ID,
        is_active: true
      }])
      .select()
      .single();

    if (insertErr) {
      console.error('💥 Employee insert failed, cleaning up auth user...', insertErr);
      
      // Cleanup auth user if DB insert failed
      try {
        await supabaseAdmin.auth.admin.deleteUser(authUserId);
        console.log('🗑️ Auth user cleaned up successfully');
      } catch (cleanupErr) {
        console.error('⚠️ Failed to cleanup auth user:', cleanupErr);
      }
      
      return res.status(400).json({ 
        error: 'Employee insert failed', 
        detail: insertErr.message 
      });
    }

    console.log('✅ Employee record created successfully:', employeeData.id);

    return res.status(201).json({ 
      success: true, 
      user_id: authUserId,
      employee_id: employeeData.id,
      message: 'Employee created successfully with auth user',
      employee: employeeData,
      login_instructions: {
        email,
        password,
        can_login_immediately: true,
        app_url: process.env.VERCEL_URL || 'https://lucerne-edge-app.vercel.app'
      }
    });

  } catch (error) {
    console.error('💥 Unexpected error in create-employee Simple JS:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      detail: error?.message,
      stack: error?.stack 
    });
  }
};