import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://lucerne-edge-app.vercel.app',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
};

Deno.serve(async (req: Request) => {
  
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('EDGE_SERVICE_ROLE_KEY');
    
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
    const { action, data } = await req.json();

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Validate user with service role client
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ 
        error: 'Invalid token'
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify admin role
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('role, is_active')
      .eq('email', user.email)
      .eq('tenant_id', 'lucerne')
      .single();

    if (empError || !employee || employee.role !== 'admin' || !employee.is_active) {
      return new Response(JSON.stringify({ 
        error: 'Admin access required'
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Handle create_user action
    if (action === 'create_user') {
      // Create auth user with admin API
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: data.temp_password || 'TempPass123!',
        email_confirm: true,
        user_metadata: {
          name: data.name,
          source: 'admin-create'
        }
      });

      if (createError) {
        return new Response(JSON.stringify({
          error: 'auth_create_failed',
          auth_error: createError.message
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (!newUser?.user) {
        return new Response(JSON.stringify({
          error: 'no_user_returned'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

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

      if (empError) {
        await supabase.auth.admin.deleteUser(newUser.user.id);
        
        return new Response(JSON.stringify({
          error: 'employee_insert_failed',
          postgres_error: empError.message
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        user: newUser.user, 
        employee: newEmployee
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
    return new Response(JSON.stringify({ 
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});