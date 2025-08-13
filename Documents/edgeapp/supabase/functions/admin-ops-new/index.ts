import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// BRAND NEW FUNCTION - DIFFERENT NAME - August 13, 2025
// This should definitely deploy as a new function

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://lucerne-edge-app.vercel.app',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
};

Deno.serve(async (req: Request) => {
  console.log('🚀 NEW FUNCTION admin-ops-new - Version 1.0 - WORKING');
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method === 'GET') {
    return new Response(JSON.stringify({ 
      status: 'NEW FUNCTION WORKING', 
      version: '1.0',
      message: 'admin-ops-new is deployed and working'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('EDGE_SERVICE_ROLE_KEY');
    
    console.log('🔍 NEW FUNCTION Environment:', {
      url_exists: !!supabaseUrl,
      service_key_exists: !!serviceKey
    });
    
    if (!supabaseUrl || !serviceKey) {
      throw new Error('Missing environment variables');
    }
    
    const supabase = createClient(supabaseUrl, serviceKey);
    
    const { action, data } = await req.json();
    
    if (action === 'create_user') {
      console.log('🔨 NEW FUNCTION: Creating user for:', data.email);
      
      // Get auth token
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'No authorization header' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);

      if (userError || !user) {
        return new Response(JSON.stringify({ error: 'Invalid token' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Check admin role
      const { data: employee } = await supabase
        .from('employees')
        .select('role')
        .eq('email', user.email)
        .eq('tenant_id', 'lucerne')
        .single();

      if (!employee || employee.role !== 'admin') {
        return new Response(JSON.stringify({ error: 'Admin access required' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Create auth user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: data.temp_password || 'TempPass123!',
        email_confirm: true,
        user_metadata: { name: data.name }
      });

      if (createError) {
        console.log('❌ NEW FUNCTION: Auth creation failed:', createError);
        return new Response(JSON.stringify({
          error: 'auth_create_failed',
          message: createError.message
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('✅ NEW FUNCTION: Auth user created successfully');

      // Create employee record
      const nameParts = (data.name || '').split(' ');
      const { data: newEmployee, error: empError } = await supabase
        .from('employees')
        .insert({
          user_id: newUser.user.id,
          email: data.email,
          first_name: nameParts[0] || '',
          last_name: nameParts.slice(1).join(' ') || '',
          role: data.role || 'employee',
          job_title: data.job_title || 'Staff',
          is_active: true,
          tenant_id: 'lucerne'
        })
        .select()
        .single();

      if (empError) {
        console.log('❌ NEW FUNCTION: Employee creation failed, cleaning up');
        await supabase.auth.admin.deleteUser(newUser.user.id);
        return new Response(JSON.stringify({
          error: 'employee_insert_failed',
          message: empError.message
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('✅ NEW FUNCTION: Complete success!');
      
      return new Response(JSON.stringify({ 
        success: true, 
        user: newUser.user, 
        employee: newEmployee,
        function_name: 'admin-ops-new'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 NEW FUNCTION Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      function_name: 'admin-ops-new'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});