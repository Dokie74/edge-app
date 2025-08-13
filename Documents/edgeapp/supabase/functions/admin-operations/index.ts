import { createClient } from 'npm:@supabase/supabase-js@2';

// COMPLETE REBUILD - August 13, 2025 - Version 2.3
// Completely recreated function to force deployment

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://lucerne-edge-app.vercel.app',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'X-Edge-Function-Version': '2.3-complete-rebuild'
};

Deno.serve(async (req: Request) => {
  const timestamp = new Date().toISOString();
  console.log(`🚀 ADMIN-OPERATIONS v2.3 - COMPLETE REBUILD - ${timestamp}`);
  
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Health check - NO AUTH REQUIRED
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ 
      status: 'healthy', 
      version: '2.3-COMPLETE-REBUILD',
      timestamp: timestamp,
      message: 'Edge Function completely rebuilt and redeployed'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // Environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('EDGE_SERVICE_ROLE_KEY');
    
    console.log('🔍 v2.3 Environment check:', {
      url_exists: !!supabaseUrl,
      service_key_exists: !!serviceKey,
      timestamp
    });
    
    if (!supabaseUrl || !serviceKey) {
      throw new Error(`Missing environment variables: URL=${!!supabaseUrl}, SERVICE_KEY=${!!serviceKey}`);
    }
    
    // Create admin client
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Parse request
    const body = await req.json();
    console.log('📦 v2.3 Request body:', body);
    
    const { action, data } = body;

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('🔐 v2.3 Token length:', token.length);
    
    // Validate user with service role client
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('❌ v2.3 Token validation failed:', userError);
      return new Response(JSON.stringify({ 
        error: 'Invalid token',
        debug: { error: userError?.message, version: '2.3' }
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ v2.3 Token validated for user:', user.email);

    // Verify admin role
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('role, is_active')
      .eq('email', user.email)
      .eq('tenant_id', 'lucerne')
      .single();

    if (empError || !employee || employee.role !== 'admin' || !employee.is_active) {
      return new Response(JSON.stringify({ 
        error: 'Admin access required',
        debug: { user_email: user.email, version: '2.3' }
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Handle create_user action
    if (action === 'create_user') {
      console.log('🔨 v2.3 Starting user creation...');
      console.log('📧 v2.3 Creating auth user for:', data.email);
      
      // Create auth user with admin API
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: data.temp_password || 'TempPass123!',
        email_confirm: true,
        user_metadata: {
          name: data.name,
          source: 'admin-create',
          version: '2.3'
        }
      });

      console.log('🎯 v2.3 Auth creation result:', !!newUser, createError?.message);

      if (createError) {
        console.log('💥 v2.3 Auth creation failed:', createError);
        return new Response(JSON.stringify({
          error: 'auth_create_failed',
          auth_error: createError.message,
          version: '2.3'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (!newUser?.user) {
        return new Response(JSON.stringify({
          error: 'no_user_returned',
          version: '2.3'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('✅ v2.3 Auth user created:', newUser.user.id);

      // Create employee record
      const nameParts = (data.name || '').trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Handle department lookup
      let departmentId = null;
      if (data.department) {
        const { data: dept } = await supabase
          .from('departments')
          .select('id')
          .eq('name', data.department)
          .eq('tenant_id', 'lucerne')
          .single();
        
        if (dept) {
          departmentId = dept.id;
        }
      }

      const { data: newEmployee, error: empError } = await supabase
        .from('employees')
        .insert({
          user_id: newUser.user.id,
          email: data.email,
          first_name: firstName,
          last_name: lastName,
          role: data.role || 'employee',
          job_title: data.job_title || 'Staff',
          department_id: departmentId,
          manager_id: data.manager_id || null,
          is_active: true,
          tenant_id: 'lucerne'
        })
        .select()
        .single();

      console.log('🎯 v2.3 Employee creation result:', !!newEmployee, empError?.message);

      if (empError) {
        console.log('💥 v2.3 Employee creation failed, cleaning up...');
        await supabase.auth.admin.deleteUser(newUser.user.id);
        
        return new Response(JSON.stringify({
          error: 'employee_insert_failed',
          postgres_error: empError.message,
          version: '2.3'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('✅ v2.3 Complete success!');
      
      return new Response(JSON.stringify({ 
        success: true, 
        user: newUser.user, 
        employee: newEmployee,
        version: '2.3'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Handle other actions...
    return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 v2.3 Error:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      version: '2.3',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});