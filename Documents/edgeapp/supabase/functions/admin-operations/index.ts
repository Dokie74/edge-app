import { createClient } from 'npm:@supabase/supabase-js@2.43.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://lucerne-edge-app.vercel.app',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
};

Deno.serve(async (req: Request) => {
  // CORS preflight handling
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Debug environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('🔍 Environment check:', {
      url_exists: !!supabaseUrl,
      url_length: supabaseUrl?.length || 0,
      key_exists: !!serviceKey,
      key_length: serviceKey?.length || 0
    });
    
    if (!supabaseUrl || !serviceKey) {
      throw new Error(`Missing environment variables: URL=${!!supabaseUrl}, KEY=${!!serviceKey}`);
    }
    
    // Create Supabase client with service role for elevated permissions
    const supabase = createClient(supabaseUrl, serviceKey);

    // Parse the request body - YOUR APP USES { action, data } format
    const { action, data } = await req.json();

    // Get user from Authorization header
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

    // Verify user is admin in employees table for Lucerne tenant
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('role, is_active')
      .eq('email', user.email)
      .eq('tenant_id', 'lucerne')
      .single();

    if (empError || !employee || employee.role !== 'admin' || !employee.is_active) {
      return new Response(JSON.stringify({ 
        error: 'Admin access required',
        debug: {
          user_email: user.email,
          employee_found: !!employee,
          employee_role: employee?.role,
          employee_active: employee?.is_active,
          emp_error: empError?.message
        }
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Admin operations router - MATCHING YOUR APP'S EXPECTED ACTIONS
    let result;
    switch (action) {
      case 'create_user': {
        console.log('🔨 Starting user creation process...');
        
        // Create new user account - WITH DETAILED LOGGING
        console.log('📧 Creating auth user for:', data.email);
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: data.email,
          password: data.temp_password || 'TempPass123!',
          email_confirm: true,
          user_metadata: {
            name: data.name
          }
        });

        console.log('🎯 Auth user creation result:');
        console.log('  - Success:', !!newUser);
        console.log('  - Error:', createError?.message);
        console.log('  - User ID:', newUser?.user?.id);

        if (createError) {
          console.log('💥 Auth user creation FAILED:', createError);
          throw createError;
        }

        if (!newUser?.user) {
          console.log('💥 No user returned from auth creation');
          throw new Error('No user returned from auth.admin.createUser');
        }

        console.log('✅ Auth user created successfully:', newUser.user.id);

        // Create corresponding employee record
        console.log('🏢 Creating employee record...');
        const { data: newEmployee, error: empError } = await supabase
          .from('employees')
          .insert({
            user_id: newUser.user.id,
            email: data.email,
            // name is a generated column - don't include it
            first_name: data.name.split(' ')[0],
            last_name: data.name.split(' ').slice(1).join(' ') || '',
            role: data.role || 'employee',
            job_title: data.job_title,
            department: data.department,
            manager_id: data.manager_id || null,
            is_active: true,
            tenant_id: 'lucerne'
          })
          .select()
          .single();

        console.log('🎯 Employee creation result:');
        console.log('  - Success:', !!newEmployee);
        console.log('  - Error:', empError?.message);

        if (empError) {
          console.log('💥 Employee creation FAILED, cleaning up auth user...');
          // Cleanup user if employee creation fails
          await supabase.auth.admin.deleteUser(newUser.user.id);
          console.log('🗑️ Auth user cleaned up');
          throw empError;
        }

        console.log('✅ Employee record created successfully:', newEmployee.id);

        result = { 
          success: true, 
          user: newUser.user, 
          employee: newEmployee,
          debug: {
            auth_user_id: newUser.user.id,
            employee_id: newEmployee.id
          }
        };
        break;
      }

      case 'update_employee': {
        const { data: updatedEmployee, error: updateError } = await supabase
          .from('employees')
          .update(data.updates)
          .eq('id', data.employee_id)
          .select()
          .single();

        if (updateError) throw updateError;
        result = { success: true, employee: updatedEmployee };
        break;
      }

      case 'delete_employee': {
        // Soft delete - mark as inactive
        const { error: deleteError } = await supabase
          .from('employees')
          .update({ is_active: false })
          .eq('id', data.employee_id);

        if (deleteError) throw deleteError;
        result = { success: true };
        break;
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 Admin operation error:', error);
    console.error('💥 Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    });
    
    return new Response(JSON.stringify({ 
      error: error.message,
      debug: {
        error_name: error.name,
        error_stack: error.stack?.substring(0, 500), // First 500 chars
        timestamp: new Date().toISOString()
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});